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
}

export default function CalorieTracker() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalorieAnalysisResult | null>(null);
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
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
    setImageFile(null);
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
    
    // Try to find food items and calories
    const itemRegex = /(\d+)\s*calories/gi;
    const matches = aiText.match(itemRegex) || [];
    
    // Extract total calories (look for phrases like "total: X calories" or "total calories: X")
    let totalCalories = 0;
    const totalCalorieRegex = /total(?:\s*calories)?(?:\s*:)?\s*(\d+)/i;
    const totalMatch = aiText.match(totalCalorieRegex);
    if (totalMatch && totalMatch[1]) {
      totalCalories = parseInt(totalMatch[1], 10);
    }
    
    // If we can't find structured data, we'll just use the raw text
    return {
      foodItems,
      totalCalories: totalCalories || 0,
      analysis: aiText
    };
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
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
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
                  <p className="text-gray-500 mb-2">Drag and drop an image here or click to browse</p>
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
            <div className="space-y-4">
              {/* Total Calories (Prominently Displayed) */}
              <div className="bg-blue-50 p-4 rounded-lg text-center mb-6">
                <h3 className="text-gray-600 text-lg">Total Calories</h3>
                <p className="text-3xl font-bold text-blue-700">{result.totalCalories}</p>
              </div>
              
              {/* Detailed Analysis */}
              <div className="bg-white rounded-lg shadow-sm p-4 border">
                <h3 className="font-semibold text-lg border-b pb-2 mb-3">Detailed Analysis</h3>
                <div className="whitespace-pre-wrap text-gray-700">
                  {result.analysis}
                </div>
              </div>
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