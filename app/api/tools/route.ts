import { NextRequest } from "next/server";
import { executeTool } from "@/lib/langgraph";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tool, parameters } = body;

    if (!tool) {
      return Response.json(
        { error: "Tool name is required" },
        { status: 400 }
      );
    }

    console.log(`Executing tool: ${tool}`, parameters);
    
    // Execute the tool
    const result = await executeTool(tool, parameters || {});
    
    // Return the result
    if (result.error) {
      return Response.json(
        { error: result.error, status: result.status },
        { status: 400 }
      );
    }
    
    return Response.json(result);
  } catch (error: any) {
    console.error(`Error executing tool:`, error);
    return Response.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}