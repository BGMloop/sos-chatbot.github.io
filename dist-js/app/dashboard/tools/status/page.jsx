"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertCircle, Clock, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function ToolStatusPage() {
    const [toolStatus, setToolStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        async function loadToolStatus() {
            try {
                // Try to fetch the tool status file
                const response = await fetch('/tool-status.json');
                if (!response.ok) {
                    throw new Error(`Failed to load tool status: ${response.statusText}`);
                }
                const data = await response.json();
                setToolStatus(data);
            }
            catch (err) {
                console.error('Error loading tool status:', err);
                setError(err instanceof Error ? err.message : 'Failed to load tool status');
            }
            finally {
                setLoading(false);
            }
        }
        loadToolStatus();
    }, []);
    // Format the last tested date
    const formatDateTime = (dateString) => {
        if (!dateString)
            return 'Never';
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        }
        catch (e) {
            return 'Invalid date';
        }
    };
    // Display loading state
    if (loading) {
        return (<div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Tool Status</h1>
        <p>Loading tool status...</p>
      </div>);
    }
    // Display error state
    if (error) {
        return (<div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Tool Status</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4"/>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <p>Tool status information is not available. This could be because:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>The application has not run tool tests yet</li>
            <li>The tests failed to complete successfully</li>
            <li>The status file was not created correctly</li>
          </ul>
          <p className="mt-4">
            Try running the tool tests manually:
          </p>
          <div className="mt-2 p-3 bg-gray-100 rounded-md">
            <code>npm run test-all-tools</code>
          </div>
        </div>
      </div>);
    }
    // No data available
    if (!toolStatus) {
        return (<div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Tool Status</h1>
        <p>No tool status data available.</p>
      </div>);
    }
    // Calculate status counts and sort tools by status
    const toolEntries = Object.entries(toolStatus.results);
    const availableTools = toolEntries.filter(([_, tool]) => tool.status === 'available');
    const errorTools = toolEntries.filter(([_, tool]) => tool.status === 'error');
    const unknownTools = toolEntries.filter(([_, tool]) => tool.status === 'unknown');
    // Sort tools by name within each category
    const sortTools = (a, b) => a[1].name.localeCompare(b[1].name);
    availableTools.sort(sortTools);
    errorTools.sort(sortTools);
    unknownTools.sort(sortTools);
    return (<div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tool Status Dashboard</h1>
        <Button asChild>
          <Link href="/dashboard/tools">View Tools Documentation</Link>
        </Button>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-green-600 flex items-center">
              <CheckCircle className="mr-2 h-5 w-5"/>
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{availableTools.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-red-600 flex items-center">
              <XCircle className="mr-2 h-5 w-5"/>
              Unavailable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{errorTools.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-600 flex items-center">
              <Clock className="mr-2 h-5 w-5"/>
              Last Updated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{formatDateTime(toolStatus.summary.lastUpdated)}</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/tools/refresh">Refresh Tests</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Available tools section */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <CheckCircle className="text-green-600 mr-2 h-5 w-5"/>
          Available Tools
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableTools.map(([id, tool]) => (<Card key={id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{tool.name}</CardTitle>
                  <Badge variant="outline" className="bg-green-100">Available</Badge>
                </div>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm pb-2">
                <div className="flex flex-col space-y-1 text-gray-500">
                  <div>Last tested: {formatDateTime(tool.lastTested)}</div>
                  {tool.responseTime && (<div>Response time: {tool.responseTime}ms</div>)}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button size="sm" variant="outline" className="mt-2" asChild>
                  <Link href={`/dashboard/tools?tool=${id}`}>
                    Test Tool <ArrowUpRight className="ml-1 h-3 w-3"/>
                  </Link>
                </Button>
              </CardFooter>
            </Card>))}
          
          {availableTools.length === 0 && (<div className="col-span-full text-center py-8 text-gray-500">
              No available tools found.
            </div>)}
        </div>
      </div>
      
      {/* Unavailable tools section */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <XCircle className="text-red-600 mr-2 h-5 w-5"/>
          Unavailable Tools
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {errorTools.map(([id, tool]) => (<Card key={id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{tool.name}</CardTitle>
                  <Badge variant="outline" className="bg-red-100">Unavailable</Badge>
                </div>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4"/>
                  <AlertDescription className="text-xs">
                    {tool.message || "Tool is currently unavailable"}
                  </AlertDescription>
                </Alert>
                <div className="mt-2 text-xs text-gray-500">
                  Last tested: {formatDateTime(tool.lastTested)}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/dashboard/tools/docs?tool=${id}`}>
                    View Documentation <ArrowUpRight className="ml-1 h-3 w-3"/>
                  </Link>
                </Button>
              </CardFooter>
            </Card>))}
          
          {errorTools.length === 0 && (<div className="col-span-full text-center py-8 text-gray-500">
              No unavailable tools found.
            </div>)}
        </div>
      </div>
    </div>);
}
