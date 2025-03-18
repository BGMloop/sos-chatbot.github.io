import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { processContent } from "@/lib/document-utils";

// Configure route handling
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // Get user info
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const description = formData.get("description") as string || "";

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Check file size (limit to 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 10MB limit" },
        { status: 400 }
      );
    }

    // Process file contents
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const content = await processContent(file.name, fileBuffer);

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract content from file" },
        { status: 400 }
      );
    }

    // Save to Convex database
    const client = getConvexClient();
    const documentId = await client.mutation(api.knowledge.createDocument, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      content,
      userId,
      description,
    });

    return NextResponse.json({
      success: true,
      documentId,
      message: "Document uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading knowledge document:", error);
    return NextResponse.json(
      {
        error: "Failed to upload document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 