import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import SYSTEM_MESSAGE from "@/constants/systemMessage";
import { z } from "zod";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { LLAMA_CONFIG, formatKnowledgeContext } from "@/lib/llama-config";

// Define tool schemas for reference
const TOOL_SCHEMAS = {
  wikipedia: `extend schema @sdl(files: ["api/index.graphql"])`,
  google_books: `schema @sdl(files: ["api/index.graphql"]) { query: Query }`,
  youtube_transcript: `type Caption { dur: Float start: Float text: String } type Transcript { captions: [Caption] title: String } type Query { transcript(videoUrl: String!, langCode: String! = "en"): Transcript @rest( method: POST endpoint: "https://tactiq-apps-prod.tactiq.io/transcript" ) }`,
  math: `type Query { wolframAlpha(assumption: String, input: String!): WolframAlphaResult @graphql(endpoint: "https://carlose.us-east-a.ibm.stepzen.net/tool/wolframalpha/__graphql") }`,
  exchange: `schema @sdl(files: ["api/index.graphql"]) { query: Query }`
};

/**
 * Execute a specific tool with the given parameters
 */
export async function executeTool(tool: string, parameters: Record<string, any>) {
  try {
    console.log(`Executing tool ${tool} with parameters:`, parameters);
    
    // Normalize tool name - convert to lowercase and remove spaces/hyphens
    const normalizedToolName = tool.toLowerCase().replace(/[-\s]/g, '_');
    
    // Add additional logging to track execution path
    console.log(`Looking for tool in wxflows/${normalizedToolName}/index.js`);
    
    try {
      // Import the tool dynamically from wxflows directory
      const toolModule = await import(`@/wxflows/${normalizedToolName}/index.js`);
      
      // For ES modules, get the default export
      const toolFunction = toolModule.default;
      
      // If parameters include a specific method and it exists on the tool module, use that instead
      let method = parameters.method;
      if (method && typeof toolModule[method] === 'function') {
        console.log(`Using specific method: ${method}`);
        // Remove method from parameters to avoid passing it to the tool function
        const { method: _, ...cleanParams } = parameters;
        return await toolModule[method].call(toolModule, cleanParams);
      }
    
      // Otherwise use the default export function
      if (typeof toolFunction === 'function') {
        console.log(`Executing default export for tool ${normalizedToolName}`);
        const result = await toolFunction(parameters);
        console.log(`Tool ${normalizedToolName} execution result:`, result);
        return result;
      }
      
      throw new Error(`Tool "${tool}" not found or is not executable`);
    } catch (error: any) {
      console.error(`Error attempting ES import for ${tool}:`, error);
      
      // Attempt to determine if this is a valid tool with an alternative name
      if (error.code === 'MODULE_NOT_FOUND') {
        // Try to map common tool names to their actual implementation paths
        const toolMapping: Record<string, string> = {
          'weather': 'open_meteo_weather',
          'currency': 'exchange',
          'exchange_rates': 'exchange',
          'currency_exchange': 'exchange',
          'books': 'google_books',
          'google_book': 'google_books',
          'news_search': 'news',
          'headlines': 'news_headlines',
          'web': 'web_search',
          'search': 'web_search'
        };
        
        // Check if we have a mapping for this tool
        if (toolMapping[normalizedToolName]) {
          const mappedToolName = toolMapping[normalizedToolName];
          console.log(`Tool name "${normalizedToolName}" mapped to "${mappedToolName}"`);
          
          try {
            // Try to import the mapped tool
            const mappedToolModule = await import(`@/wxflows/${mappedToolName}/index.js`);
            const mappedToolFunction = mappedToolModule.default;
            
            if (typeof mappedToolFunction === 'function') {
              console.log(`Executing mapped tool ${mappedToolName}`);
              const result = await mappedToolFunction(parameters);
              console.log(`Mapped tool ${mappedToolName} execution result:`, result);
              return result;
            }
          } catch (mappedError) {
            console.error(`Error executing mapped tool ${mappedToolName}:`, mappedError);
          }
        }
        
        // If module not found, try CommonJS style require as fallback
        console.log(`ES module import failed, trying CommonJS require for tool ${normalizedToolName}`);
        try {
          // This uses dynamic require which is only available in CommonJS modules
          const toolModule = require(`../wxflows/${normalizedToolName}/index.js`);
          
          if (typeof toolModule === 'function') {
            console.log(`Executing CommonJS function for tool ${normalizedToolName}`);
            return await toolModule(parameters);
          } else if (typeof toolModule.default === 'function') {
            console.log(`Executing CommonJS default export for tool ${normalizedToolName}`);
            return await toolModule.default(parameters);
          } else {
            throw new Error(`Tool "${tool}" does not export a function`);
          }
        } catch (requireError: any) {
          console.error(`CommonJS require also failed:`, requireError);
          throw error; // Throw original error
        }
      } else {
        throw error;
      }
    }
  } catch (error: any) {
    console.error(`Error executing tool ${tool}:`, error);
    return {
      error: error.message || `Failed to execute tool "${tool}"`,
      details: String(error.stack || error),
      status: 'error',
      tool: tool
    };
  }
}

/**
 * Get knowledge context for a user
 */
async function getKnowledgeContext(userId: string) {
  try {
    if (!userId) return "";
    
    const client = getConvexClient();
    const documents = await client.query(api.knowledge.getKnowledgeContext, { userId });
    
    if (!documents || documents.length === 0) {
      return "";
    }
    
    // Use the formatKnowledgeContext function to format the documents
    return formatKnowledgeContext(documents);
  } catch (error) {
    console.error("Error fetching knowledge context:", error);
    return "";
  }
}

/**
 * Process messages and get a response from the AI
 */
export async function submitQuestion(messages: BaseMessage[], chatId: string, userId?: string) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  const model = new ChatGoogleGenerativeAI({
    modelName: "gemini-1.5-flash",
    apiKey,
    maxOutputTokens: 4096,
    temperature: 0.1,
  });
  
  // Get knowledge context if userId is provided
  let systemMessageText = SYSTEM_MESSAGE;
  if (userId && LLAMA_CONFIG.knowledgeBase.enabled) {
    const knowledgeContext = await getKnowledgeContext(userId);
    if (knowledgeContext) {
      // Use the Llama knowledge system message if we have knowledge context
      systemMessageText = `${LLAMA_CONFIG.knowledgeSystemMessage}\n\n${knowledgeContext}`;
    }
  }

  const prompt = ChatPromptTemplate.fromMessages([
    new SystemMessage(systemMessageText),
    new MessagesPlaceholder("messages"),
  ]);

  const chain = RunnableSequence.from([
    {
      messages: (input: { messages: BaseMessage[] }) => input.messages,
    },
    prompt,
    model,
  ]);

  const stream = await chain.stream({
    messages,
  });

  return stream;
}
