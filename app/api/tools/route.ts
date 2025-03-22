import { NextRequest } from "next/server";
import { executeTool } from "@/lib/langgraph";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tool, parameters, params } = body;

    if (!tool) {
      return Response.json(
        { error: "Tool name is required" },
        { status: 400 }
      );
    }

    console.log(`Executing tool: ${tool}`, parameters || params);
    
    // Execute the tool
    const result = await executeTool(tool, parameters || params || {});
    
    // Return the result
    if (result.error) {
      return Response.json(
        { error: result.error, status: result.status },
        { status: 400 }
      );
    }
    
    return Response.json(result);
  } catch (error: unknown) {
    console.error(`Error executing tool:`, error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}