"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Camera, Upload, X } from "lucide-react";

interface CalorieAnalysisResult {
  foodItems: Array<{
    name: string;
    quantity: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }>;
  totalCalories: number;
  analysis: string;
  mealName?: string;
  nutritionFacts?: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export default function CalorieTracker() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalorieAnalysisResult | null>(null);
  const [notes, setNotes] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  // Handle drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check if the file is an image
      if (file.type.match('image.*')) {
        setSelectedImage(file.name);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
        
        // Reset any previous results
        setResult(null);
        setError(null);
      } else {
        setError("Please upload an image file (JPEG, PNG, etc.)");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file.name);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Reset any previous results
      setResult(null);
      setError(null);
    }
  };
  
  const handleCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const clearImage = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
    
    // Reset file inputs
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };
  
  const analyzeImage = async () => {
    if (!selectedImage) {
      setError("Please select an image first.");
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Convert base64 string to remove the data URL prefix
      // E.g., "data:image/jpeg;base64,/9j/4AAQSkZJRg..." -> "/9j/4AAQSkZJRg..."
      const base64Image = selectedImage.split(',')[1];
      
      const response = await fetch("/api/analyze-calories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Image,
          notes: notes.trim()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Parse the AI response to extract structured data
      const parsedResult = parseAIResponse(data.content);
      setResult(parsedResult);
      
    } catch (error) {
      console.error("Error analyzing image:", error);
      setError(error instanceof Error ? error.message : "Failed to analyze image");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const parseAIResponse = (aiText: string): CalorieAnalysisResult => {
    // Simple regex-based parsing to extract information from the AI's text response
    // In a production app, you'd want the AI to return structured JSON
    
    const foodItems: Array<{name: string; quantity: string; calories: number; protein?: number; carbs?: number; fat?: number}> = [];
    
    // Extract total calories - handle both specific numbers and ranges
    let totalCalories = 0;
    
    // First, try to find explicit "Total calories: X" or similar
    const totalCalorieRegex = /total(?:\s*(?:estimated|approximate))?(?:\s*calories)(?:\s*:)?\s*(\d+(?:\.\d+)?)/i;
    const totalMatch = aiText.match(totalCalorieRegex);
    
    if (totalMatch && totalMatch[1]) {
      totalCalories = parseInt(totalMatch[1], 10);
    } else {
      // Try to find calorie ranges and take the average or the specific number
      const calorieRangeRegex = /(\d+)(?:\s*to\s*|\s*-\s*)(\d+)(?:\s*calories)/i;
      const rangeMatch = aiText.match(calorieRangeRegex);
      
      if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
        const min = parseInt(rangeMatch[1], 10);
        const max = parseInt(rangeMatch[2], 10);
        totalCalories = Math.round((min + max) / 2); // Use the average of the range
      } else {
        // Last attempt - look for any number followed by "calories" 
        const simpleCalorieRegex = /(\d+)(?:\s*calories)/i;
        const simpleMatch = aiText.match(simpleCalorieRegex);
        
        if (simpleMatch && simpleMatch[1]) {
          totalCalories = parseInt(simpleMatch[1], 10);
        }
      }
    }
    
    // Extract meal name - try to find a title or name for the meal
    let mealName = "Food Analysis";
    const mealNameRegex = /(meal|dish|food item|breakfast|lunch|dinner|snack)(?:\s*name)?(?:\s*:)?\s*([^\n.]+)/i;
    const mealNameMatch = aiText.match(mealNameRegex);
    if (mealNameMatch && mealNameMatch[2]) {
      mealName = mealNameMatch[2].trim();
    }
    
    // Extract macronutrient data (protein, carbs, fat)
    let protein = 0, carbs = 0, fat = 0;
    
    // Look for protein with more flexible patterns
    const proteinRegex = /protein(?:\s*:)?\s*(?:approximately|about|around|~)?\s*(\d+(?:\.\d+)?)\s*g/i;
    const proteinMatch = aiText.match(proteinRegex);
    if (proteinMatch && proteinMatch[1]) {
      protein = parseFloat(proteinMatch[1]);
    }
    
    // Look for carbs/carbohydrates with more flexible patterns
    const carbsRegex = /carb(?:ohydrate)?s?(?:\s*:)?\s*(?:approximately|about|around|~)?\s*(\d+(?:\.\d+)?)\s*g/i;
    const carbsMatch = aiText.match(carbsRegex);
    if (carbsMatch && carbsMatch[1]) {
      carbs = parseFloat(carbsMatch[1]);
    }
    
    // Look for fat with more flexible patterns
    const fatRegex = /fat(?:s)?(?:\s*:)?\s*(?:approximately|about|around|~)?\s*(\d+(?:\.\d+)?)\s*g/i;
    const fatMatch = aiText.match(fatRegex);
    if (fatMatch && fatMatch[1]) {
      fat = parseFloat(fatMatch[1]);
    }
    
    // For demo purposes, let's generate some plausible values if we don't have them
    if (protein === 0 && carbs === 0 && fat === 0 && totalCalories > 0) {
      // Rough approximation: 15% protein, 55% carbs, 30% fat
      protein = Math.round((totalCalories * 0.15) / 4); // 4 cal per gram of protein
      carbs = Math.round((totalCalories * 0.55) / 4);   // 4 cal per gram of carbs
      fat = Math.round((totalCalories * 0.30) / 9);     // 9 cal per gram of fat
    }
    
    // Try to extract individual food items
    const foodItemsRegex = /[\n•-] ([^:]+)(?::)?\s*(?:(\d+(?:\.\d+)?)\s*(g|oz|cups?|tbsp|ml|pieces?|servings?))?\s*[-–]\s*(?:approximately |about |~)?(\d+)\s*calories/gi;
    
    let match;
    while ((match = foodItemsRegex.exec(aiText)) !== null) {
      if (match[1] && match[4]) {
        foodItems.push({
          name: match[1].trim(),
          quantity: match[2] && match[3] ? `${match[2]} ${match[3]}` : "1 serving",
          calories: parseInt(match[4], 10),
          // Distribute macros proportionally if we have overall values
          protein: protein > 0 ? Math.round((parseInt(match[4], 10) / totalCalories) * protein) : undefined,
          carbs: carbs > 0 ? Math.round((parseInt(match[4], 10) / totalCalories) * carbs) : undefined,
          fat: fat > 0 ? Math.round((parseInt(match[4], 10) / totalCalories) * fat) : undefined,
        });
      }
    }
    
    // If we couldn't extract specific food items but have a meal name
    if (foodItems.length === 0 && mealName && mealName !== "Food Analysis") {
      foodItems.push({
        name: mealName,
        quantity: "1 serving",
        calories: totalCalories,
        protein: protein || undefined,
        carbs: carbs || undefined, 
        fat: fat || undefined
      });
    }
    
    return {
      foodItems,
      totalCalories: totalCalories || 0,
      analysis: aiText,
      mealName,
      nutritionFacts: {
        protein,
        carbs,
        fat
      }
    };
  };
  
  // Helper function to render circular progress indicators for macronutrients
  const NutrientCircle = ({ 
    value, 
    label, 
    color, 
    unit = "g" 
  }: { 
    value: number; 
    label: string; 
    color: string;
    unit?: string;
  }) => {
    // Calculate the stroke-dasharray and stroke-dashoffset
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    
    // Adjust the calculation to make the circle more filled based on value
    // This is for visual appearance only - values don't need to be percentage-based
    let percentage = value;
    if (label === "Carb") percentage = Math.min(100, value * 1.5);
    if (label === "Protein") percentage = Math.min(100, value * 2);
    if (label === "Fat") percentage = Math.min(100, value * 3);
    
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-28 h-28">
          {/* Background circle */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle 
              cx="50" 
              cy="50" 
              r={radius} 
              fill="transparent" 
              stroke="#e5e7eb" 
              strokeWidth="8"
            />
            {/* Foreground circle */}
            <circle 
              cx="50" 
              cy="50" 
              r={radius} 
              fill="transparent" 
              stroke={color} 
              strokeWidth="8" 
              strokeDasharray={circumference} 
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-xs text-gray-500">{unit}</span>
          </div>
        </div>
        <span className="mt-2 text-sm font-medium">{label}</span>
      </div>
    );
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-2xl font-bold">Food Calorie Analyzer</CardTitle>
          <CardDescription className="text-base">
            Upload an image of your food to get an estimate of the calories and nutritional information.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Image Upload Area */}
            <div 
              ref={dropZoneRef}
              className={`border-2 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'} rounded-lg p-4 text-center hover:bg-gray-50 transition-colors`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {selectedImage ? (
                <div className="relative">
                  <img 
                    src={selectedImage} 
                    alt="Food" 
                    className="max-h-[300px] mx-auto rounded-md" 
                  />
                  <button 
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    onClick={clearImage}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="py-8">
                  <p className="text-gray-500 mb-2">
                    {isDragging ? "Drop your image here" : "Drag and drop an image here or click to browse"}
                  </p>
                  <div className="flex justify-center gap-4 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={handleUpload}
                      className="flex items-center gap-2"
                    >
                      <Upload size={18} />
                      Upload Image
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCapture}
                      className="flex items-center gap-2"
                    >
                      <Camera size={18} />
                      Take Photo
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Hidden file inputs */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              <input 
                type="file" 
                ref={cameraInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
              />
            </div>
            
            {/* Notes Field */}
            <div>
              <Textarea
                placeholder="Add any notes about the food (optional)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-24 resize-none"
              />
            </div>
            
            {/* Analyze Button */}
            <Button 
              onClick={analyzeImage} 
              disabled={!selectedImage || isAnalyzing} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Food Image'
              )}
            </Button>
            
            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        
        {/* Results Section */}
        {result && (
          <CardContent className="border-t border-gray-200 pt-6 mt-4">
            <div className="space-y-6">
              {/* Meal Title with modern styling */}
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
                {result.mealName || "Morning Sandwich"}
              </h2>
              
              {/* Food Image with Tagged Items (if available) */}
              {selectedImage && (
                <div className="relative max-w-md mx-auto mb-8">
                  <img 
                    src={selectedImage} 
                    alt="Analyzed Food" 
                    className="w-full rounded-xl shadow-md" 
                  />
                  {/* In a real app, we'd add annotation points for each identified food item */}
                </div>
              )}
              
              {/* Nutrition Overview with modern gradient and styling */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <div className="text-blue-600 text-lg font-medium">Total Calories</div>
                  <div className="text-3xl font-bold text-blue-700">{result.totalCalories} <span className="text-xl">Cal</span></div>
                </div>
                
                <h3 className="text-lg font-semibold mb-6 text-gray-700">Nutrition Facts</h3>
                
                <div className="flex justify-around items-center gap-4 px-4">
                  {/* Macronutrient Circles */}
                  <NutrientCircle 
                    value={result.nutritionFacts?.carbs || 0} 
                    label="Carb" 
                    color="#4ade80" // Green
                  />
                  
                  <NutrientCircle 
                    value={result.nutritionFacts?.protein || 0} 
                    label="Protein" 
                    color="#60a5fa" // Blue
                  />
                  
                  <NutrientCircle 
                    value={result.nutritionFacts?.fat || 0} 
                    label="Fat" 
                    color="#f97316" // Orange 
                  />
                </div>
              </div>
              
              {/* Detailed Analysis */}
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="p-4 border rounded-lg mt-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Summary</h4>
                    <p className="text-gray-700">
                      This meal contains approximately {result.totalCalories} calories with 
                      {result.nutritionFacts?.protein}g protein, {result.nutritionFacts?.carbs}g carbs, 
                      and {result.nutritionFacts?.fat}g fat.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="p-4 border rounded-lg mt-2">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {result.analysis}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        )}
        
        <CardFooter className="bg-gray-50 px-6 py-4 flex justify-between">
          <p className="text-xs text-gray-500">
            * Calorie estimates are approximate and may vary.
          </p>
          {selectedImage && !result && !isAnalyzing && (
            <Button 
              onClick={analyzeImage} 
              variant="outline" 
              size="sm"
            >
              Analyze Now
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Chat-like File Upload Interface */}
      <Card className="mt-6 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Quick Food Upload</CardTitle>
          <CardDescription>
            Quickly analyze your meals without leaving the chat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 border rounded-lg p-2">
            <Input 
              placeholder="Describe your meal (optional)..." 
              className="border-0 focus-visible:ring-0"
            />
            
            {/* File Upload Button with Paperclip Icon */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="flex items-center justify-center text-center font-medium cursor-pointer outline-hidden focus-visible:ring-3 relative whitespace-nowrap transition-colors focus-visible:ring-default focus-visible:ring-offset-1 aria-disabled:text-hint aria-disabled:bg-state-disabled aria-disabled:cursor-not-allowed aria-busy:cursor-wait aria-busy:text-transparent bg-state-soft hover:bg-state-soft-hover active:bg-state-soft-press gap-1 text-sm p-0 rounded-md size-8 text-icon-default-subtle"
              aria-label="Add files"
              onClick={handleUpload}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="lucide lucide-paperclip size-[18px]"
              >
                <path d="M13.234 20.252 21 12.3"></path>
                <path d="m16 6-8.414 8.586a2 2 0 0 0 0 2.828 2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656 4 4 0 0 0-5.656 0l-8.415 8.585a6 6 0 1 0 8.486 8.486"></path>
              </svg>
            </Button>
            
            {/* Camera Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="flex items-center justify-center text-center font-medium cursor-pointer outline-hidden focus-visible:ring-3 relative whitespace-nowrap transition-colors focus-visible:ring-default focus-visible:ring-offset-1 aria-disabled:text-hint aria-disabled:bg-state-disabled aria-disabled:cursor-not-allowed aria-busy:cursor-wait aria-busy:text-transparent bg-state-soft hover:bg-state-soft-hover active:bg-state-soft-press gap-1 text-sm p-0 rounded-md size-8 text-icon-default-subtle"
              aria-label="Take photo"
              onClick={handleCapture}
            >
              <Camera size={18} />
            </Button>
            
            <Button 
              variant="default" 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!selectedImage || isAnalyzing}
              onClick={analyzeImage}
            >
              Analyze
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 