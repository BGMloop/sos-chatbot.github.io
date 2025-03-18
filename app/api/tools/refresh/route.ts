import { NextResponse } from 'next/server';
import * as toolTester from '@/lib/tool-tester';

export async function GET() {
  try {
    // Run the tool tests
    const results = await toolTester.testAllTools();
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Tool tests refreshed successfully',
      summary: {
        total: Object.keys(results).length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error refreshing tool tests:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error refreshing tool tests'
      }, 
      { status: 500 }
    );
  }
} 