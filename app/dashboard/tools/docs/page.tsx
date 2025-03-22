"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ToolsDocsPage() {
  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tools Documentation</h1>
          <p className="text-slate-500 mt-1">Information about available tools and how to use them</p>
        </div>
        <div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/tools">Test Tools</Link>
          </Button>
          <Button variant="outline" className="ml-2" asChild>
            <Link href="/dashboard/tools/status">View Status</Link>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="math">
        <TabsList className="mb-4">
          <TabsTrigger value="math">Math</TabsTrigger>
          <TabsTrigger value="exchange">Currency Exchange</TabsTrigger>
          <TabsTrigger value="open_meteo_weather">Weather</TabsTrigger>
          <TabsTrigger value="news">News Search</TabsTrigger>
          <TabsTrigger value="news_headlines">News Headlines</TabsTrigger>
        </TabsList>
        
        <TabsContent value="math" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Math Calculator (Wolfram Alpha)</CardTitle>
              <CardDescription>Solve mathematical problems and equations using Wolfram Alpha</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Parameters</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parameter</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Required</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>input</TableCell>
                      <TableCell>string</TableCell>
                      <TableCell>Mathematical expression or question to solve</TableCell>
                      <TableCell>Yes</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Expected Results</h3>
                <p>The tool returns a structured answer with the solution to the mathematical problem.</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>&quot;2+2&quot; → &quot;4&quot;</li>
                  <li>&quot;solve x^2 + 2x + 1 = 0&quot; → &quot;x = -1&quot;</li>
                  <li>Calculus operations (derivatives, integrals)</li>
                  <li>Probability calculations</li>
                  <li>Unit conversions</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Usage in Chat</h3>
                <p>You can ask the chatbot to solve math problems using phrases like:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>&quot;Calculate the square root of 144&quot;</li>
                  <li>&quot;Solve the equation 3x + 5 = 20&quot;</li>
                  <li>&quot;What is the derivative of x^2 sin(x)?&quot;</li>
                  <li>&quot;Convert 5 kilometers to miles&quot;</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="exchange" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Currency Exchange</CardTitle>
              <CardDescription>Get current exchange rates between currencies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Parameters</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parameter</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Required</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>from</TableCell>
                      <TableCell>string</TableCell>
                      <TableCell>Base currency code (e.g., USD, EUR, GBP)</TableCell>
                      <TableCell>Yes</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>to</TableCell>
                      <TableCell>string</TableCell>
                      <TableCell>Target currency code (e.g., USD, EUR, GBP)</TableCell>
                      <TableCell>Yes</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>amount</TableCell>
                      <TableCell>number</TableCell>
                      <TableCell>Amount to convert (defaults to 1)</TableCell>
                      <TableCell>No</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Common Currency Codes</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">USD (US Dollar)</Badge>
                  <Badge variant="outline">EUR (Euro)</Badge>
                  <Badge variant="outline">GBP (British Pound)</Badge>
                  <Badge variant="outline">JPY (Japanese Yen)</Badge>
                  <Badge variant="outline">CAD (Canadian Dollar)</Badge>
                  <Badge variant="outline">AUD (Australian Dollar)</Badge>
                  <Badge variant="outline">CHF (Swiss Franc)</Badge>
                  <Badge variant="outline">CNY (Chinese Yuan)</Badge>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Expected Results</h3>
                <p>The tool returns the exchange rate between the specified currencies, including:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>The base currency</li>
                  <li>The target currency</li>
                  <li>The exchange rate</li>
                  <li>The date of the rate</li>
                  <li>Optionally, the converted amount if specified</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Usage in Chat</h3>
                <p>You can ask the chatbot about currency conversions using phrases like:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>&quot;What's the exchange rate from USD to EUR?&quot;</li>
                  <li>&quot;Convert 100 USD to GBP&quot;</li>
                  <li>&quot;How much is 50 euros in Japanese yen?&quot;</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="open_meteo_weather" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weather (Open Meteo)</CardTitle>
              <CardDescription>Get detailed weather information for a location using Open Meteo API (no API key required)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Parameters</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parameter</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Required</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>location</TableCell>
                      <TableCell>string</TableCell>
                      <TableCell>City or location name</TableCell>
                      <TableCell>Yes</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Expected Results</h3>
                <p>The tool returns detailed weather information, including:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Current temperature and feels-like temperature</li>
                  <li>Weather conditions (clear, cloudy, rain, etc.)</li>
                  <li>Wind speed and direction</li>
                  <li>Humidity and precipitation</li>
                  <li>Sunrise and sunset times</li>
                  <li>Short-term forecast</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Usage in Chat</h3>
                <p>You can ask the chatbot about weather using phrases like:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>&quot;What's the weather like in New York?&quot;</li>
                  <li>&quot;Get me the current temperature in London&quot;</li>
                  <li>&quot;Will it rain today in Tokyo?&quot;</li>
                  <li>&quot;What's the forecast for Paris?&quot;</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Notes</h3>
                <p>
                  This tool uses the Open Meteo API, which is a free weather service that doesn't require an API key.
                  It provides accurate weather data for locations worldwide. The results include both current conditions
                  and a short-term forecast.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="news" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>News Search</CardTitle>
              <CardDescription>Search for news articles by topic using News API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Parameters</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parameter</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Required</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>topic</TableCell>
                      <TableCell>string</TableCell>
                      <TableCell>Topic or keyword to search for in news articles</TableCell>
                      <TableCell>Yes</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Expected Results</h3>
                <p>The tool returns a list of news articles related to the specified topic, including:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Article titles</li>
                  <li>Source information</li>
                  <li>Publication dates</li>
                  <li>Brief descriptions</li>
                  <li>URLs to the full articles</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Usage in Chat</h3>
                <p>You can ask the chatbot to search for news using phrases like:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>&quot;Show me news about technology&quot;</li>
                  <li>&quot;Find recent articles about climate change&quot;</li>
                  <li>&quot;What's the latest news on artificial intelligence?&quot;</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Limitations</h3>
                <p>
                  This tool uses the News API which has the following limitations on the developer plan:
                </p>
                <ul className="list-disc pl-6 mt-2">
                  <li>100 requests per day</li>
                  <li>No historical data beyond 1 month</li>
                  <li>Rate limit: 50 requests per 12-hour period</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="news_headlines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>News Headlines</CardTitle>
              <CardDescription>Get top headlines by country and category using News API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Parameters</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parameter</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Required</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>country</TableCell>
                      <TableCell>string</TableCell>
                      <TableCell>Two-letter country code (e.g., us, gb, jp)</TableCell>
                      <TableCell>Yes</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>category</TableCell>
                      <TableCell>string</TableCell>
                      <TableCell>News category (business, entertainment, health, science, sports, technology, etc.)</TableCell>
                      <TableCell>No</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Country Codes</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">us (United States)</Badge>
                  <Badge variant="outline">gb (United Kingdom)</Badge>
                  <Badge variant="outline">ca (Canada)</Badge>
                  <Badge variant="outline">au (Australia)</Badge>
                  <Badge variant="outline">in (India)</Badge>
                  <Badge variant="outline">jp (Japan)</Badge>
                  <Badge variant="outline">de (Germany)</Badge>
                  <Badge variant="outline">fr (France)</Badge>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Categories</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">business</Badge>
                  <Badge variant="outline">entertainment</Badge>
                  <Badge variant="outline">general</Badge>
                  <Badge variant="outline">health</Badge>
                  <Badge variant="outline">science</Badge>
                  <Badge variant="outline">sports</Badge>
                  <Badge variant="outline">technology</Badge>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Expected Results</h3>
                <p>The tool returns a list of top headlines for the specified country and category, including:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Headline titles</li>
                  <li>Source information</li>
                  <li>Publication dates</li>
                  <li>Brief descriptions</li>
                  <li>URLs to the full articles</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Usage in Chat</h3>
                <p>You can ask the chatbot for news headlines using phrases like:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>&quot;Show me top headlines in the US&quot;</li>
                  <li>&quot;What are the latest business headlines in the UK?&quot;</li>
                  <li>&quot;Get today's technology news headlines&quot;</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Limitations</h3>
                <p>
                  This tool uses the News API which has the following limitations on the developer plan:
                </p>
                <ul className="list-disc pl-6 mt-2">
                  <li>100 requests per day</li>
                  <li>No historical data beyond 1 month</li>
                  <li>Rate limit: 50 requests per 12-hour period</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 