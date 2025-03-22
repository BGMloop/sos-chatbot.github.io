"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

// Import tool schemas from a client-safe file
import { TOOL_SCHEMAS } from "@/lib/tool-schemas"; 

type ToolType = 'math' | 'exchange' | 'open_meteo_weather' | 'news' | 'news_headlines';

// Define status type
type ToolStatus = {
  status: 'available' | 'unavailable' | 'unknown';
  error: string | null;
  duration: number | null;
  lastTested: string | null;
  sampleResult: string | null;
};

export default function ToolsTestPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  
  // Initialize all state variables unconditionally
  const [selectedTool, setSelectedTool] = useState<ToolType>("math");
  const [input, setInput] = useState("");
  const [mathInput, setMathInput] = useState("2+2");
  const [currencyFrom, setCurrencyFrom] = useState("USD");
  const [currencyTo, setCurrencyTo] = useState("EUR");
  const [currencyAmount, setCurrencyAmount] = useState("100");
  const [weatherLocation, setWeatherLocation] = useState("New York");
  const [newsTopic, setNewsTopic] = useState("technology");
  const [newsCountry, setNewsCountry] = useState("us");
  const [newsCategory, setNewsCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toolStatus, setToolStatus] = useState<Record<ToolType, ToolStatus>>({} as Record<ToolType, ToolStatus>);
  
  // Fetch tool status on load - MOVED BEFORE ANY CONDITIONALS
  useEffect(() => {
    async function loadToolStatus() {
      try {
        const response = await fetch('/tool-status.json');
        if (response.ok) {
          const data = await response.json();
          const statusMap = {} as Record<ToolType, ToolStatus>;
          
          // Map tool status from file
          Object.entries(data.results).forEach(([id, info]: [string, any]) => {
            if (['math', 'exchange', 'open_meteo_weather', 'news', 'news_headlines'].includes(id)) {
              statusMap[id as ToolType] = {
                status: info.status === 'available' ? 'available' : 'unavailable',
                error: info.message !== 'Tool is working correctly' ? info.message : null,
                duration: info.responseTime,
                lastTested: info.lastTested,
                sampleResult: null
              };
            }
          });
          
          setToolStatus(statusMap);
        }
      } catch (e) {
        console.error('Failed to load tool status:', e);
      }
    }
    
    // Only load tool status if user is loaded
    if (isUserLoaded) {
      loadToolStatus();
    }
  }, [isUserLoaded]); // Add isUserLoaded as a dependency
  
  // Redirect if not authenticated
  if (isUserLoaded && !user) {
    redirect("/");
    return null; // Return null after redirect
  }
  
  // Show loading state while auth is loading
  if (!isUserLoaded) {
    return (
      <div className="container py-10">
        <div className="h-10 w-40 bg-gray-200 animate-pulse rounded-md mb-4"></div>
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  // Handle tool execution
  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Prepare parameters based on selected tool
      let params: Record<string, string | number> = {};
      
      switch (selectedTool) {
        case 'math':
          params = { input: mathInput };
          break;
        case 'exchange':
          params = { from: currencyFrom, to: currencyTo, amount: currencyAmount };
          break;
        case 'open_meteo_weather':
          params = { location: weatherLocation };
          break;
        case 'news':
          params = { topic: newsTopic };
          break;
        case 'news_headlines':
          params = { country: newsCountry, category: newsCategory };
          break;
      }
      
      // Call the API
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: selectedTool, params })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'An unknown error occurred');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to execute tool');
    } finally {
      setLoading(false);
    }
  };

  // Render form fields based on selected tool
  const renderToolForm = () => {
    switch (selectedTool) {
      case 'math':
        return (
          <div className="grid gap-4">
            <Label htmlFor="math-input">Math Expression</Label>
            <Textarea 
              id="math-input" 
              value={mathInput} 
              onChange={(e) => setMathInput(e.target.value)}
              placeholder="Enter a math expression or question (e.g., 2+2 or solve x^2 + 2x + 1 = 0)"
              className="min-h-[100px]"
            />
          </div>
        );
      case 'exchange':
        return (
          <div className="grid gap-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="currency-from">From Currency</Label>
                <Input 
                  id="currency-from" 
                  value={currencyFrom} 
                  onChange={(e) => setCurrencyFrom(e.target.value)}
                  placeholder="USD"
                />
              </div>
              <div>
                <Label htmlFor="currency-to">To Currency</Label>
                <Input 
                  id="currency-to" 
                  value={currencyTo} 
                  onChange={(e) => setCurrencyTo(e.target.value)}
                  placeholder="EUR" 
                />
              </div>
              <div>
                <Label htmlFor="currency-amount">Amount (Optional)</Label>
                <Input 
                  id="currency-amount" 
                  value={currencyAmount} 
                  onChange={(e) => setCurrencyAmount(e.target.value)}
                  placeholder="100" 
                  type="number"
                />
              </div>
            </div>
          </div>
        );
      case 'open_meteo_weather':
        return (
          <div className="grid gap-4">
            <Label htmlFor="weather-location">Location</Label>
            <Input 
              id="weather-location" 
              value={weatherLocation} 
              onChange={(e) => setWeatherLocation(e.target.value)}
              placeholder="Enter a city or location (e.g., New York, London, Tokyo)"
            />
          </div>
        );
      case 'news':
        return (
          <div className="grid gap-4">
            <Label htmlFor="news-topic">Topic</Label>
            <Input 
              id="news-topic" 
              value={newsTopic} 
              onChange={(e) => setNewsTopic(e.target.value)}
              placeholder="Enter a news topic (e.g., technology, climate change, sports)"
            />
          </div>
        );
      case 'news_headlines':
        return (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="news-country">Country Code</Label>
                <Input 
                  id="news-country" 
                  value={newsCountry} 
                  onChange={(e) => setNewsCountry(e.target.value)}
                  placeholder="us"
                />
                <p className="text-xs text-slate-500 mt-1">Two-letter country code (us, gb, jp, etc.)</p>
              </div>
              <div>
                <Label htmlFor="news-category">Category (Optional)</Label>
                <Select value={newsCategory} onValueChange={setNewsCategory}>
                  <SelectTrigger id="news-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Render pretty result based on the tool
  const renderResult = () => {
    if (!result) return null;
    
    return (
      <div className="mt-4 space-y-4">
        <pre className="p-4 rounded-md bg-slate-950 text-slate-50 overflow-auto text-sm max-h-[500px]">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  };

  // Render status badge for a tool
  const getStatusBadge = (toolId: ToolType) => {
    const status = toolStatus[toolId]?.status || 'unknown';
    
    if (status === 'available') {
      return <Badge variant="success" className="ml-2"><CheckCircle className="w-3 h-3 mr-1" /> Available</Badge>;
    } else if (status === 'unavailable') {
      return <Badge variant="destructive" className="ml-2"><AlertCircle className="w-3 h-3 mr-1" /> Unavailable</Badge>;
    } else {
      return <Badge variant="outline" className="ml-2"><Clock className="w-3 h-3 mr-1" /> Unknown</Badge>;
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Test Tools</h1>
          <p className="text-slate-500 mt-1">Test individual tools and see their responses</p>
        </div>
        <div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/tools/docs">View Documentation</Link>
          </Button>
          <Button variant="outline" className="ml-2" asChild>
            <Link href="/dashboard/tools/status">View Status</Link>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tool Tester</CardTitle>
          <CardDescription>Select a tool and provide input parameters to test it</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div>
              <Label htmlFor="tool-select">Select Tool</Label>
              <Select value={selectedTool} onValueChange={(value) => setSelectedTool(value as ToolType)}>
                <SelectTrigger id="tool-select" className="w-full">
                  <SelectValue placeholder="Select a tool" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math">
                    Math Calculator {getStatusBadge('math')}
                  </SelectItem>
                  <SelectItem value="exchange">
                    Currency Exchange {getStatusBadge('exchange')}
                  </SelectItem>
                  <SelectItem value="open_meteo_weather">
                    Weather {getStatusBadge('open_meteo_weather')}
                  </SelectItem>
                  <SelectItem value="news">
                    News Search {getStatusBadge('news')}
                  </SelectItem>
                  <SelectItem value="news_headlines">
                    News Headlines {getStatusBadge('news_headlines')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {renderToolForm()}
            
            {error && (
              <div className="p-4 rounded-md bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reset
          </Button>
          <Button onClick={handleExecute} disabled={loading}>
            {loading ? 'Running...' : 'Execute Tool'}
          </Button>
        </CardFooter>
      </Card>
      
      {renderResult()}
    </div>
  );
} 