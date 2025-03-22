import { NextResponse } from "next/server";
import { openRouterClient } from "@/lib/openrouter-client";
export const maxDuration = 60; // Allow up to 60 seconds for image analysis
export const dynamic = 'force-dynamic'; // Ensure route is not cached
export async function POST(req) {
    var _a;
    try {
        // Validate request content type
        const contentType = req.headers.get('content-type');
        if (!(contentType === null || contentType === void 0 ? void 0 : contentType.includes('application/json'))) {
            return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
        }
        // Parse request body
        let body;
        try {
            body = await req.json();
        }
        catch (error) {
            return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
        }
        // Validate required fields
        if (!body.image) {
            return NextResponse.json({ error: "Image data is required" }, { status: 400 });
        }
        // Validate image format
        if (!body.image.match(/^[A-Za-z0-9+/=]+$/)) {
            return NextResponse.json({ error: "Invalid image data format. Expected base64 encoded string." }, { status: 400 });
        }
        // Check image size (base64 encoded data should be less than ~10MB)
        if (body.image.length > 10 * 1024 * 1024) {
            return NextResponse.json({ error: "Image is too large. Maximum size is 10MB." }, { status: 413 });
        }
        // Optional notes validation
        const notes = ((_a = body.notes) === null || _a === void 0 ? void 0 : _a.trim()) || "";
        if (notes.length > 500) {
            return NextResponse.json({ error: "Notes are too long. Maximum length is 500 characters." }, { status: 400 });
        }
        // Call the estimateCalories method from our OpenRouter client
        try {
            const analysis = await openRouterClient.estimateCalories(body.image, notes);
            return NextResponse.json({
                success: true,
                content: analysis
            });
        }
        catch (error) {
            console.error("Error in OpenRouter client:", error);
            // Handle specific known errors
            if (error instanceof Error) {
                if (error.message.includes('timeout')) {
                    return NextResponse.json({ error: "Analysis timed out. Please try again with a clearer image." }, { status: 504 });
                }
                if (error.message.includes('rate limit')) {
                    return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
                }
            }
            // Generic error
            return NextResponse.json({
                error: "Failed to analyze the image",
                details: error instanceof Error ? error.message : "Unknown error"
            }, { status: 500 });
        }
    }
    catch (_) {
        console.error("Unexpected error analyzing calories:", _);
        return NextResponse.json({
            error: "An unexpected error occurred",
            details: _ instanceof Error ? _.message : "Unknown error"
        }, { status: 500 });
    }
}
