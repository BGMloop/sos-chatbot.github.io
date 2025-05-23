var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import { createWorkflow } from "@/lib/langgraph";
import { NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { TextEncoder } from "util";
import { v4 as uuidv4 } from 'uuid';
import { processContent } from "@/lib/document-utils";
// Configure route handling
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
// Handle GET requests (not allowed)
export async function GET() {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
export async function POST(req) {
    try {
        // Create a TransformStream for proper streaming
        const encoder = new TextEncoder();
        const stream = new TransformStream();
        const writer = stream.writable.getWriter();
        // Process in background to avoid blocking the response
        (async () => {
            var _a, e_1, _b, _c;
            try {
                // Parse form data - only do this once to avoid locking issues
                const formData = await req.formData();
                const userMessage = formData.get('message') || '';
                const file = formData.get('file');
                const chatId = formData.get('chatId') || uuidv4();
                console.log('Processing file upload with message:', userMessage.substring(0, 50));
                // Validate that we have either a message with content or a file
                const hasMessage = userMessage && userMessage.trim().length > 0;
                const hasFile = file && file.size > 0;
                if (!hasMessage && !hasFile) {
                    console.error("No message or file provided");
                    await writer.write(encoder.encode(`data: ${JSON.stringify({
                        type: 'error',
                        error: 'Please provide a message or upload a file'
                    })}\n\n`));
                    await writer.close();
                    return;
                }
                // Process file contents if present
                let fileContent = '';
                if (hasFile) {
                    try {
                        const fileBuffer = Buffer.from(await file.arrayBuffer());
                        fileContent = await processContent(file.name, fileBuffer);
                        console.log(`Processed file: ${file.name}, content length: ${fileContent.length}`);
                        // Validate file content
                        if (!fileContent || fileContent.trim().length === 0) {
                            console.warn("File processed but no content extracted");
                        }
                    }
                    catch (fileErr) {
                        console.error('Error processing file:', fileErr);
                        await writer.write(encoder.encode(`data: ${JSON.stringify({
                            type: 'error',
                            error: 'Failed to process file'
                        })}\n\n`));
                        return;
                    }
                }
                // If we have no message and no file content, return error
                if (!hasMessage && (!fileContent || fileContent.trim().length === 0)) {
                    console.error("No usable content found in request");
                    await writer.write(encoder.encode(`data: ${JSON.stringify({
                        type: 'error',
                        error: 'No usable content found in your request'
                    })}\n\n`));
                    await writer.close();
                    return;
                }
                // Prepare messages
                const combinedMessage = fileContent
                    ? `${userMessage}\n\nDocument Content:\n${fileContent}`
                    : userMessage;
                // Create message format for LangChain
                const messages = [
                    new HumanMessage({ content: combinedMessage })
                ];
                // Create workflow and get the chain
                const workflow = await createWorkflow();
                const chain = workflow.processMessages;
                // Process messages and get event stream
                const eventStream = await chain(messages);
                try {
                    // Process events from the stream
                    for (var _d = true, eventStream_1 = __asyncValues(eventStream), eventStream_1_1; eventStream_1_1 = await eventStream_1.next(), _a = eventStream_1_1.done, !_a; _d = true) {
                        _c = eventStream_1_1.value;
                        _d = false;
                        const chunk = _c;
                        // With Gemini/LangChain, we're getting AIMessageChunk objects directly
                        // instead of the event-based format from LangGraph
                        if (chunk.content) {
                            const content = typeof chunk.content === 'string'
                                ? chunk.content
                                : JSON.stringify(chunk.content);
                            if (content) {
                                const tokenData = JSON.stringify({ type: 'token', token: content });
                                await writer.write(encoder.encode(`data: ${tokenData}\n\n`));
                            }
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = eventStream_1.return)) await _b.call(eventStream_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                // Signal the end of the stream
                const doneData = JSON.stringify({ type: 'done' });
                await writer.write(encoder.encode(`data: ${doneData}\n\n`));
            }
            catch (error) {
                console.error('Streaming error:', error);
                // Send error to client
                const errorData = JSON.stringify({
                    type: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error occurred'
                });
                await writer.write(encoder.encode(`data: ${errorData}\n\n`));
            }
            finally {
                // Always close the writer when done
                await writer.close();
            }
        })().catch(error => {
            console.error('Background processing error:', error);
        });
        // Return the readable stream immediately
        return new Response(stream.readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        });
    }
    catch (error) {
        console.error('Initial stream setup error:', error);
        return new Response(JSON.stringify({ error: 'Failed to initialize streaming response' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
