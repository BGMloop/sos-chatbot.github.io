var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import { submitQuestion } from "@/lib/langgraph";
import { api } from "@/convex/_generated/api";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { getConvexClient } from "@/lib/convex";
import { StreamMessageType, SSE_DATA_PREFIX, SSE_LINE_DELIMITER, } from "@/lib/types";
export const runtime = "edge";
function sendSSEMessage(writer, data) {
    const encoder = new TextEncoder();
    return writer.write(encoder.encode(`${SSE_DATA_PREFIX}${JSON.stringify(data)}${SSE_LINE_DELIMITER}`));
}
export async function POST(req) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new Response("Unauthorized", { status: 401 });
        }
        const { messages, newMessage, chatId } = (await req.json());
        const convex = getConvexClient();
        // Create stream with larger queue strategy for better performance
        const stream = new TransformStream({}, { highWaterMark: 1024 });
        const writer = stream.writable.getWriter();
        const response = new Response(stream.readable, {
            headers: {
                "Content-Type": "text/event-stream",
                // "Cache-Control": "no-cache, no-transform",
                Connection: "keep-alive",
                "X-Accel-Buffering": "no", // Disable buffering for nginx which is required for SSE to work properly
            },
        });
        // Handle the streaming response
        (async () => {
            var _a, e_1, _b, _c;
            try {
                // Send initial connection established message
                await sendSSEMessage(writer, { type: StreamMessageType.Connected });
                // Send user message to Convex
                await convex.mutation(api.messages.send, {
                    chatId,
                    content: newMessage,
                });
                // Convert messages to LangChain format
                const langChainMessages = [
                    ...messages.map((msg) => msg.role === "user"
                        ? new HumanMessage(msg.content)
                        : new AIMessage(msg.content)),
                    new HumanMessage(newMessage),
                ];
                try {
                    // Create the event stream
                    const eventStream = await submitQuestion(langChainMessages, chatId, userId);
                    try {
                        // Process the events
                        for (var _d = true, eventStream_1 = __asyncValues(eventStream), eventStream_1_1; eventStream_1_1 = await eventStream_1.next(), _a = eventStream_1_1.done, !_a; _d = true) {
                            _c = eventStream_1_1.value;
                            _d = false;
                            const chunk = _c;
                            // The stream now returns AIMessageChunk objects directly, not event objects
                            if (chunk.content) {
                                // Access the content from the AIMessageChunk
                                const content = typeof chunk.content === 'string'
                                    ? chunk.content
                                    : Array.isArray(chunk.content) && chunk.content.length > 0
                                        ? (chunk.content[0] && 'text' in chunk.content[0] ? chunk.content[0].text : JSON.stringify(chunk.content))
                                        : JSON.stringify(chunk.content);
                                if (content) {
                                    await sendSSEMessage(writer, {
                                        type: StreamMessageType.Token,
                                        token: content,
                                    });
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
                    // Send completion message without storing the response
                    await sendSSEMessage(writer, { type: StreamMessageType.Done });
                }
                catch (streamError) {
                    console.error("Error in event stream:", streamError);
                    await sendSSEMessage(writer, {
                        type: StreamMessageType.Error,
                        error: streamError instanceof Error
                            ? streamError.message
                            : "Stream processing failed",
                    });
                }
            }
            catch (error) {
                console.error("Error in stream:", error);
                await sendSSEMessage(writer, {
                    type: StreamMessageType.Error,
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
            finally {
                try {
                    await writer.close();
                }
                catch (closeError) {
                    console.error("Error closing writer:", closeError);
                }
            }
        })();
        return response;
    }
    catch (error) {
        console.error("Error in chat API:", error);
        return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 });
    }
}
