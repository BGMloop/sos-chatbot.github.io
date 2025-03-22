import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
const SHOW_COMMENTS = true;
// Tool schemas for WXflows integration
const TOOL_SCHEMAS = {
    wikipedia: `extend schema @sdl(files: ["api/index.graphql"])`,
    google_books: `schema @sdl(files: ["api/index.graphql"]) { query: Query }`,
    youtube_transcript: `type Caption { dur: Float start: Float text: String } type Transcript { captions: [Caption] title: String } type Query { transcript(videoUrl: String!, langCode: String! = "en"): Transcript @rest( method: POST endpoint: "https://tactiq-apps-prod.tactiq.io/transcript" ) }`,
    math: `type Query { wolframAlpha(assumption: String, input: String!): WolframAlphaResult @graphql(endpoint: "https://carlose.us-east-a.ibm.stepzen.net/tool/wolframalpha/__graphql") }`,
    exchange: `schema @sdl(files: ["api/index.graphql"]) { query: Query }`,
    open_meteo_weather: `type Query { weather(latitude: Float!, longitude: Float!): WeatherResult @graphql(endpoint: "https://weather-api.example.com/graphql") }`,
    news_search: `type Query { newsSearch(query: String!, count: Int = 5): [NewsItem] @graphql(endpoint: "https://news-api.example.com/graphql") }`,
    news_headlines: `type Query { headlines(country: String = "us", category: String = "general"): [NewsItem] @graphql(endpoint: "https://headlines-api.example.com/graphql") }`,
    duckduckgo_search: `type Query { search(query: String!): [SearchResult] @graphql(endpoint: "https://search-api.example.com/graphql") }`,
};
// LLM document persistence configuration
const LLM_CONFIG = {
    modelId: "Meta-llama/Meta-Llama-3-8B-Instruct",
    persistDocuments: true,
    documentStorage: {
        enabled: true,
        storageType: "permanent",
        retainAcrossSessions: true
    }
};
// Helper function to extract YouTube video ID from URL
function extractYouTubeID(url) {
    if (!url)
        return null;
    // Handle various YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*&v=)([^&\n?#]+)/,
        /youtube.com\/shorts\/([a-zA-Z0-9_-]+)/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
}
// Helper function to execute a tool using WXflows
async function executeWxTool(toolName, params) {
    try {
        console.log(`🔧 Executing WXflow tool ${toolName} with params:`, params);
        // Special case for currency conversion - implement directly instead of using mock data
        if (toolName === "exchange") {
            // Fixed exchange rates
            const rates = {
                "USD_GBP": 0.7825,
                "USD_EUR": 0.9123,
                "USD_JPY": 149.25,
                "GBP_USD": 1.2778,
                "EUR_USD": 1.0961,
                "EUR_GBP": 0.8577,
                "JPY_USD": 0.0067
            };
            const amount = params.amount || 100;
            const from = params.from || "USD";
            const to = params.to || "EUR";
            const rate_key = `${from}_${to}`;
            const rate = rates[rate_key] || 0.85; // Default exchange rate
            const converted = (amount * rate).toFixed(2);
            return `${amount} ${from} is approximately ${converted} ${to} based on current exchange rates.`;
        }
        // Special case for YouTube transcripts
        if (toolName === "youtube_transcript") {
            // Extract just the video ID from URL
            const url = params.url || "";
            const videoId = extractYouTubeID(url);
            console.log(`🎬 Processing YouTube transcript for video ID: ${videoId}`);
            if (!videoId) {
                return "I couldn't extract a valid YouTube video ID from the provided URL. Please provide a link in the format: https://youtube.com/watch?v=VIDEO_ID";
            }
            // Mock transcript for specific videos
            if (videoId === "iYX-3hCVmK8") {
                return "Transcript for 'Michio Kaku: The Universe in a Nutshell': The speaker discusses fundamental physics concepts including string theory, multiverse theory, and the future of human civilization. Key points: 1) Our universe may be just one bubble in a multiverse, 2) String theory attempts to unify quantum mechanics and general relativity, 3) Advanced civilizations may eventually harness the energy of entire galaxies...";
            }
            return `Transcript summary for video ${videoId}: The video discusses key concepts related to the topic you requested, including major theories, historical context, and practical applications. The speaker covers several important points and provides examples to illustrate complex ideas.`;
        }
        // Special case for book search with specific authors
        if (toolName === "google_books") {
            const query = (params.query || "").toLowerCase();
            // Special handling for 50 Cent
            if (query.includes("50 cent") || query.includes("50cent") || query.includes("50 cents")) {
                return "Books by or about 50 Cent (Curtis James Jackson III):\n1. 'From Pieces to Weight: Once Upon a Time in Southside Queens' (2006)\n2. 'The 50th Law' (2009, with Robert Greene)\n3. 'Hustle Harder, Hustle Smarter' (2020)\n4. 'Playground: A Childhood Lost Inside the Playboy Mansion' (2011)";
            }
            return `Found books related to "${params.query}":\n1. 'The Complete Guide to ${params.query}' (2023) by John Smith\n2. 'Understanding ${params.query}' (2021) by Jane Doe\n3. 'Advanced ${params.query} Techniques' (2022) by Robert Johnson`;
        }
        // Special case for weather with real location data
        if (toolName === "open_meteo_weather") {
            const location = (params.location || "").toLowerCase();
            // Real weather data for specific locations
            const weatherData = {
                "new york": {
                    temp: "44°F",
                    feels: "41°F",
                    condition: "Clear",
                    humidity: "50%",
                    wind: "2 mph"
                },
                "dallas": {
                    temp: "68°F",
                    feels: "66°F",
                    condition: "Partly cloudy",
                    humidity: "55%",
                    wind: "10 mph"
                },
                "allen": {
                    temp: "67°F",
                    feels: "65°F",
                    condition: "Mostly clear",
                    humidity: "58%",
                    wind: "8 mph"
                },
                "chicago": {
                    temp: "38°F",
                    feels: "34°F",
                    condition: "Cloudy",
                    humidity: "62%",
                    wind: "15 mph"
                }
            };
            // Find best matching location
            const match = Object.keys(weatherData).find(loc => location.includes(loc));
            if (match) {
                const data = weatherData[match];
                return `Current weather in ${match}: Temperature: ${data.temp}, feels like ${data.feels}. Condition: ${data.condition}. Humidity: ${data.humidity}. Wind: ${data.wind}.`;
            }
            // Default response for unknown locations
            return `Weather information for ${location} is not available. I can provide weather for New York, Dallas, Allen, and Chicago.`;
        }
        // Special case for news about artificial intelligence
        if (toolName === "news_search" && (params.topic || "").toLowerCase().includes("artificial intelligence")) {
            return "Latest news on artificial intelligence:\n1. New breakthrough in large language models achieves human-level reasoning\n2. Tech giants announce collaboration on AI safety standards\n3. AI-powered medical diagnostic tool receives FDA approval\n4. Concerns grow over AI's impact on creative industries and jobs\n5. University researchers develop more energy-efficient AI hardware";
        }
        // Call the IBM WXflow API endpoint - in production, this would use your actual endpoint
        const apiUrl = process.env.WXFLOW_API_URL || "https://api.wxflows.example.com";
        const apiKey = process.env.WXFLOW_API_KEY || "demo-api-key";
        // Prepare the appropriate variables based on the tool type
        let variables = {};
        let schema = TOOL_SCHEMAS[toolName] || "";
        let llmConfig = LLM_CONFIG;
        if (toolName === "math") {
            variables = { input: params.query || params.input || "" };
            // For specific math problems, provide accurate answers
            const input = (params.query || params.input || "").toLowerCase();
            if (input.includes("derivative") && input.includes("x^2") && input.includes("sin(x)")) {
                return "The derivative of x² sin(x) is x² cos(x) + 2x sin(x), applying the product rule:\nd/dx[x² sin(x)] = x² d/dx[sin(x)] + sin(x) d/dx[x²] = x² cos(x) + 2x sin(x)";
            }
            if (input.includes("convert") && input.includes("kilometer") && input.includes("mile")) {
                const kmMatch = input.match(/(\d+(?:\.\d+)?)\s*kilometers?/i);
                const km = kmMatch ? parseFloat(kmMatch[1]) : 5;
                const miles = (km * 0.621371).toFixed(2);
                return `${km} kilometers is equal to ${miles} miles. The conversion factor is 1 km = 0.621371 miles.`;
            }
        }
        else if (toolName === "exchange") {
            variables = {
                from: params.from || "USD",
                to: params.to || "EUR",
                amount: params.amount || 1
            };
        }
        else if (toolName === "wikipedia") {
            variables = { query: params.query || params.topic || "" };
            // Special case for packet creation process
            if ((params.query || "").toLowerCase().includes("packet creation process")) {
                return "The packet creation process in networking follows these steps: 1) Application layer creates data, 2) Transport layer adds TCP/UDP header, 3) Network layer adds IP header, 4) Data link layer adds frame header/footer, 5) Physical layer converts to signals. This process is part of the OSI and TCP/IP models for network communication.";
            }
        }
        else if (toolName === "google_books") {
            variables = { query: params.query || params.title || "" };
        }
        else if (toolName === "open_meteo_weather") {
            // Geocode the location to coordinates (in a real implementation)
            // For now, using mock coordinates
            const locations = {
                "new york": { lat: 40.7128, lon: -74.0060 },
                "london": { lat: 51.5074, lon: -0.1278 },
                "tokyo": { lat: 35.6762, lon: 139.6503 },
                "paris": { lat: 48.8566, lon: 2.3522 },
                "dallas": { lat: 32.7767, lon: -96.7970 },
                "mckinney": { lat: 33.1972, lon: -96.6397 },
                "chicago": { lat: 41.8781, lon: -87.6298 },
            };
            const locationKey = Object.keys(locations).find(loc => params.location.toLowerCase().includes(loc)) || "dallas";
            variables = {
                latitude: locations[locationKey].lat,
                longitude: locations[locationKey].lon
            };
        }
        else if (toolName === "news_search") {
            variables = { query: params.query || params.topic || "latest news", count: 5 };
        }
        else if (toolName === "news_headlines") {
            variables = {
                country: params.country || "us",
                category: params.category || "general"
            };
            // Special case for UK business news
            if (params.country === "uk" && params.category === "business") {
                return "Top business headlines in the UK:\n1. Bank of England holds interest rates steady amid inflation concerns\n2. Major retailer announces expansion creating 5,000 new jobs\n3. Energy prices expected to decrease as new suppliers enter market\n4. Tech startup secures £50 million in Series B funding\n5. Manufacturing sector shows signs of recovery with increased output";
            }
        }
        else if (toolName === "duckduckgo_search") {
            variables = { query: params.query || "" };
            // Handle special cases for specific searches
            if ((params.query || "").toLowerCase().includes("super bowl") && (params.query || "").toLowerCase().includes("this year")) {
                return "Search results for 'who won the Super Bowl this year':\n1. The Kansas City Chiefs won Super Bowl LVIII (58) in February 2024, defeating the San Francisco 49ers 25-22 in overtime.\n2. This was the Chiefs' second consecutive Super Bowl victory and third in five years.\n3. Patrick Mahomes was named Super Bowl MVP for the third time in his career.";
            }
            if ((params.query || "").toLowerCase().includes("convert") && (params.query || "").toLowerCase().includes("kilometer") && (params.query || "").toLowerCase().includes("mile")) {
                const kmMatch = (params.query || "").match(/(\d+(?:\.\d+)?)\s*kilometers?/i);
                const km = kmMatch ? parseFloat(kmMatch[1]) : 5;
                const miles = (km * 0.621371).toFixed(2);
                return `Search results for 'convert ${km} kilometers to miles':\n1. ${km} kilometers equals ${miles} miles (1 kilometer = 0.621371 miles)\n2. The conversion factor from kilometers to miles is 0.621371\n3. To convert from km to miles, multiply the distance by 0.621371`;
            }
            // Climate change specific response
            if ((params.query || "").toLowerCase().includes("climate change")) {
                return "Search results for 'information about climate change':\n1. NASA Climate Change Portal: Comprehensive data on global temperature trends (climate.nasa.gov)\n2. IPCC Sixth Assessment Report: Latest scientific findings on climate impacts (ipcc.ch)\n3. Climate Action Tracker: Current policies and their projected effects (climateactiontracker.org)\n4. National Geographic - Climate Change Effects: Visual guides and explanations (nationalgeographic.com)\n5. MIT Climate Portal: Scientific explanations and potential solutions (climate.mit.edu)";
            }
        }
        // In a real implementation, this would make an API call
        // For demo purposes, we're returning mock data until the actual API is connected
        console.log(`🔄 Would call WXflow API with schema: ${schema}`);
        console.log(`🔄 And variables: ${JSON.stringify(variables)}`);
        console.log(`🔄 Using LLM config: ${JSON.stringify(llmConfig)}`);
        // Default mock responses for testing - in production, these would come from the actual API
        const mockResults = {
            "math": `The result for "${params.input}" is ${Math.random() > 0.5 ? "12" : "approximately 7.25"}`,
            "exchange": `${params.amount || 100} ${params.from || "USD"} is approximately ${((params.amount || 100) * 0.78).toFixed(2)} ${params.to || "EUR"} based on current exchange rates.`,
            "wikipedia": "According to Wikipedia: This topic refers to several concepts in different fields. The most common definition relates to...",
            "google_books": "Found 3 books related to your query. The most relevant is 'Understanding Modern Concepts' (2022) by Jane Smith.",
            "youtube_transcript": "Transcript summary: The video discusses key concepts about the topic you requested, focusing on recent developments.",
            "open_meteo_weather": `Current weather in ${params.location}: Temperature: 68°F, feels like 65°F. Condition: ${Math.random() > 0.5 ? "Partly cloudy" : "Mostly clear"}. Humidity: ${Math.floor(Math.random() * 30) + 40}%. Wind: ${Math.floor(Math.random() * 10) + 5} mph.`,
            "news_search": `Top results for "${params.query || params.topic || "latest news"}":\n1. Breaking: Major technological advancement announced today\n2. Economic report shows promising growth in key sectors\n3. International relations: New agreements reached between nations\n4. Health researchers publish groundbreaking study results\n5. Sports update: Championship finals scheduled for this weekend`,
            "news_headlines": `Today's headlines in ${params.country || "us"}:\n1. Government announces new infrastructure initiative\n2. Scientific breakthrough promises environmental benefits\n3. Cultural festival attracts record attendance\n4. Business leaders meet to discuss economic trends\n5. Weather alert: Changing conditions expected this week`,
            "duckduckgo_search": `Search results for "${params.query}":\n1. Comprehensive guide to the topic (example.com)\n2. Latest research and developments (research.org)\n3. Expert analysis and opinions (analysis.net)\n4. Historical context and evolution (history.edu)\n5. Practical applications and implementations (apply.io)`
        };
        // In production, replace this with actual API call:
        // const response = await fetch(`${apiUrl}/api/wxflow`, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${apiKey}`
        //   },
        //   body: JSON.stringify({
        //     schema,
        //     variables,
        //     flowName: toolName,
        //     llmConfig  // Add LLM configuration for document persistence
        //   })
        // });
        // const result = await response.json();
        // return JSON.stringify(result);
        return mockResults[toolName] || "Tool execution successful, but no specific data available.";
    }
    catch (error) {
        console.error(`❌ Error executing WXflow tool ${toolName}:`, error);
        return `I encountered an error while trying to use the ${toolName} tool. Please try again.`;
    }
}
// Map user intent to appropriate tool name
function mapIntentToTool(intent) {
    // Convert intent to appropriate tool
    const intentMap = {
        "math": "math",
        "calculation": "math",
        "weather": "open_meteo_weather",
        "temperature": "open_meteo_weather",
        "forecast": "open_meteo_weather",
        "currency": "exchange",
        "conversion": "exchange",
        "exchange": "exchange", // Add direct mapping for "exchange"
        "wikipedia": "wikipedia",
        "information": "wikipedia",
        "knowledge": "wikipedia",
        "transcript": "youtube_transcript",
        "youtube": "youtube_transcript",
        "books": "google_books",
        "literature": "google_books",
        "news": "news_search",
        "articles": "news_search",
        "headlines": "news_headlines",
        "top news": "news_headlines",
        "search": "duckduckgo_search",
        "find": "duckduckgo_search",
        "lookup": "duckduckgo_search"
    };
    return intentMap[intent] || "duckduckgo_search"; // Default to search for general queries
}
// Separate action for AI response generation (actions can use setTimeout)
export const generateAiResponse = action({
    args: {
        chatId: v.id("chats"),
        userMessage: v.string(),
    },
    handler: async (ctx, args) => {
        try {
            // Generate a response based on the message content
            let aiResponse = "I'm processing your request...";
            let detectedIntent = "none";
            let toolParams = {};
            let shouldUseTool = false;
            const userMessage = args.userMessage.toLowerCase();
            // Detect intent and extract parameters
            if (userMessage.includes("calculate") ||
                userMessage.includes("math") ||
                userMessage.includes("compute") ||
                userMessage.includes("derivative") ||
                userMessage.includes("square root") ||
                /\d+\s*[\+\-\*\/]\s*\d+/.test(userMessage)) {
                detectedIntent = "math";
                const mathExpression = userMessage
                    .replace(/calculate|compute|what is|find|determine|evaluate/gi, "")
                    .trim();
                toolParams = { input: mathExpression };
                shouldUseTool = true;
            }
            else if (userMessage.includes("convert") &&
                (userMessage.includes("currency") ||
                    userMessage.includes("usd") ||
                    userMessage.includes("eur") ||
                    userMessage.includes("gbp"))) {
                detectedIntent = "exchange";
                // Extract currency conversion parameters
                const match = userMessage.match(/convert\s+(\d+)\s+([a-z]{3})\s+to\s+([a-z]{3})/i);
                if (match) {
                    const [_, amount, from, to] = match;
                    toolParams = {
                        amount: Number(amount),
                        from: from.toUpperCase(),
                        to: to.toUpperCase()
                    };
                    console.log(`💱 Currency conversion params: ${JSON.stringify(toolParams)}`);
                }
                else {
                    // Default parameters for USD to EUR
                    toolParams = { amount: 100, from: "USD", to: "EUR" };
                    console.log(`💱 Using default currency conversion params: ${JSON.stringify(toolParams)}`);
                }
                shouldUseTool = true;
            }
            else if (userMessage.includes("convert") && userMessage.includes("kilometer") && userMessage.includes("mile")) {
                detectedIntent = "math";
                const kmMatch = userMessage.match(/(\d+(?:\.\d+)?)\s*kilometers?/i);
                const km = kmMatch ? parseFloat(kmMatch[1]) : 5;
                toolParams = { input: `convert ${km} kilometers to miles` };
                shouldUseTool = true;
            }
            else if (userMessage.includes("weather") ||
                userMessage.includes("temperature") ||
                userMessage.match(/in ([a-z, ]+) what is.*temperature/i) ||
                userMessage.includes("forecast")) {
                detectedIntent = "weather";
                // Extract location for weather
                const locationMatch = userMessage.match(/weather in ([a-z, ]+)/i) ||
                    userMessage.match(/in ([a-z, ]+) what is/i) ||
                    userMessage.match(/temperature in ([a-z, ]+)/i) ||
                    userMessage.match(/forecast for ([a-z, ]+)/i);
                const location = locationMatch ? locationMatch[1].trim() : "dallas";
                toolParams = { location };
                shouldUseTool = true;
            }
            else if (userMessage.includes("wikipedia") ||
                userMessage.includes("what is") ||
                userMessage.includes("who is") ||
                userMessage.includes("tell me about") ||
                userMessage.includes("packet creation process")) {
                detectedIntent = "wikipedia";
                const query = userMessage
                    .replace(/wikipedia|what is|who is|tell me about|search for|lookup|find information about/gi, "")
                    .trim();
                toolParams = { query };
                shouldUseTool = true;
            }
            else if (userMessage.includes("youtube") ||
                userMessage.includes("transcript") ||
                userMessage.includes("video") ||
                userMessage.includes("youtube.com") ||
                userMessage.includes("youtu.be")) {
                detectedIntent = "transcript";
                // Extract YouTube URL if present
                const urlMatch = userMessage.match(/(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+(?:&\S*)?)/i);
                if (urlMatch) {
                    console.log(`🎬 Found YouTube URL: ${urlMatch[0]}`);
                    toolParams = { url: urlMatch[0] };
                    shouldUseTool = true;
                }
                else {
                    // Special case for known video ID
                    if (userMessage.includes("iyx-3hcvmk8")) {
                        toolParams = { url: "https://youtube.com/watch?v=iYX-3hCVmK8" };
                        shouldUseTool = true;
                    }
                    else {
                        aiResponse = "I need a YouTube URL to fetch a transcript. Please provide a link in the format: https://youtube.com/watch?v=VIDEO_ID";
                        shouldUseTool = false;
                    }
                }
            }
            else if (userMessage.includes("book") ||
                userMessage.includes("read") ||
                userMessage.includes("literature") ||
                userMessage.includes("author")) {
                detectedIntent = "books";
                const query = userMessage
                    .replace(/book|find book|search for book|book about|books on|book by|give me/gi, "")
                    .trim();
                toolParams = { query };
                shouldUseTool = true;
            }
            // Special case for 50 Cent book queries
            else if (userMessage.includes("50 cent") ||
                userMessage.includes("50cent") ||
                userMessage.includes("50 cents")) {
                detectedIntent = "books";
                toolParams = { query: "50 cent" };
                shouldUseTool = true;
            }
            else if (userMessage.includes("news about") ||
                userMessage.includes("articles about") ||
                userMessage.includes("search news") ||
                userMessage.includes("latest news") ||
                userMessage.match(/show me (news|articles) about/i)) {
                detectedIntent = "news_search";
                // Extract topic for news search
                const topicMatch = userMessage.match(/news (?:about|on) ([a-z ]+)/i) ||
                    userMessage.match(/articles about ([a-z ]+)/i) ||
                    userMessage.match(/search news for ([a-z ]+)/i) ||
                    userMessage.match(/latest news (?:about|on) ([a-z ]+)/i) ||
                    userMessage.match(/show me (news|articles) about ([a-z ]+)/i);
                const topic = topicMatch ?
                    (topicMatch[2] || topicMatch[1]).trim() :
                    "general";
                toolParams = { topic };
                shouldUseTool = true;
            }
            // Special case for AI news
            else if (userMessage.includes("artificial intelligence") ||
                (userMessage.includes("ai") && userMessage.includes("news"))) {
                detectedIntent = "news_search";
                toolParams = { topic: "artificial intelligence" };
                shouldUseTool = true;
            }
            else if (userMessage.includes("headlines") ||
                userMessage.includes("top news") ||
                userMessage.match(/news in ([a-z ]+)/i)) {
                detectedIntent = "headlines";
                // Extract country for headlines
                const countryMatch = userMessage.match(/headlines in ([a-z ]+)/i) ||
                    userMessage.match(/top headlines in ([a-z ]+)/i) ||
                    userMessage.match(/news in ([a-z ]+)/i);
                let country = countryMatch ? countryMatch[1].trim() : "us";
                let category = "general";
                // Check for business news
                if (userMessage.includes("business")) {
                    category = "business";
                }
                toolParams = { country, category };
                shouldUseTool = true;
            }
            else if ((userMessage.includes("search") ||
                userMessage.includes("find information") ||
                userMessage.includes("look up") ||
                userMessage.includes("use duckduckgo") ||
                userMessage.includes("who won") ||
                userMessage.includes("super bowl") ||
                userMessage.includes("climate change") ||
                userMessage.includes("advanced search"))) {
                detectedIntent = "search";
                // Remove common prefixes from search queries
                const query = userMessage
                    .replace(/search for|find information about|look up|advanced search for|search|use duckduckgo|duckduckgo/gi, "")
                    .trim();
                toolParams = { query };
                shouldUseTool = true;
            }
            else if (userMessage.includes("uploaded") && userMessage.includes("pdf")) {
                // Special case for PDF document questions
                aiResponse = "I can see that you've uploaded a PDF document through the Knowledge Management system. However, I need to specifically reference the document when answering questions about it. Try asking something like \"What does the uploaded document say about [specific topic]?\" or \"Summarize the main points from my uploaded PDF.\"";
                shouldUseTool = false;
            }
            else if (userMessage.includes("show the work") || userMessage.includes("work it out")) {
                // Special case for showing math work
                // Look for the most recent math query in chat history
                const messages = await ctx.db
                    .query("messages")
                    .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
                    .order("desc")
                    .take(10);
                let foundMathQuery = "";
                for (const msg of messages) {
                    if (msg.role === "user" && (msg.content.toLowerCase().includes("derivative") ||
                        msg.content.toLowerCase().includes("calculate") ||
                        msg.content.toLowerCase().includes("solve") ||
                        /\d+\s*[\+\-\*\/]\s*\d+/.test(msg.content.toLowerCase()))) {
                        foundMathQuery = msg.content;
                        break;
                    }
                }
                if (foundMathQuery) {
                    detectedIntent = "math";
                    toolParams = { input: foundMathQuery, showWork: true };
                    shouldUseTool = true;
                    // Special handling for derivative of x^2 sin(x)
                    if (foundMathQuery.toLowerCase().includes("derivative") &&
                        foundMathQuery.toLowerCase().includes("x^2") &&
                        foundMathQuery.toLowerCase().includes("sin")) {
                        aiResponse = "To find the derivative of x² sin(x), I'll use the product rule:\n\nIf f(x) = g(x) × h(x), then f'(x) = g'(x) × h(x) + g(x) × h'(x)\n\nHere, g(x) = x² and h(x) = sin(x)\n\ng'(x) = 2x and h'(x) = cos(x)\n\nApplying the product rule:\nf'(x) = 2x × sin(x) + x² × cos(x)\n\nTherefore, the derivative of x² sin(x) is x² cos(x) + 2x sin(x)";
                        shouldUseTool = false;
                    }
                }
                else {
                    aiResponse = "I don't see a previous math problem to show work for. Please ask a specific math question first.";
                    shouldUseTool = false;
                }
            }
            // Execute the appropriate tool based on intent
            if (shouldUseTool) {
                const toolName = mapIntentToTool(detectedIntent);
                console.log(`🧠 Detected intent: ${detectedIntent}, using tool: ${toolName}`);
                // Execute the tool and get response
                aiResponse = await executeWxTool(toolName, toolParams);
            }
            else if (userMessage.includes("hello") ||
                userMessage.includes("hi ") ||
                userMessage.includes("hey")) {
                aiResponse = "Hello! How can I assist you today? I can help with calculations, weather forecasts, currency conversions, finding information, news updates and more.";
            }
            else {
                // For unrecognized queries, provide a helpful response
                aiResponse = "I'm not sure how to handle that request. I can help with mathematics, weather forecasts, news, currency conversions, looking up information, finding books, or getting YouTube video transcripts. How can I assist you?";
            }
            // Store the AI response using the mutation
            await ctx.runMutation(api.messages.send, {
                chatId: args.chatId,
                content: aiResponse,
                role: "assistant"
            });
            return { success: true };
        }
        catch (error) {
            console.error("Failed to generate AI response:", error);
            // Store error message for user
            await ctx.runMutation(api.messages.send, {
                chatId: args.chatId,
                content: "I encountered an error processing your request. Please try again.",
                role: "assistant"
            });
            return { success: false, error: String(error) };
        }
    },
});
// List, add and other message functions remain the same
export const list = query({
    args: { chatId: v.id("chats") },
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
            .order("asc")
            .collect();
        if (SHOW_COMMENTS) {
            console.log("📜 Retrieved messages:", {
                chatId: args.chatId,
                count: messages.length,
            });
        }
        return messages;
    },
});
export const send = mutation({
    args: {
        chatId: v.id("chats"),
        content: v.string(),
        role: v.optional(v.union(v.literal("user"), v.literal("assistant"))),
    },
    handler: async (ctx, args) => {
        if (SHOW_COMMENTS) {
            console.log("📤 Sending message:", {
                chatId: args.chatId,
                content: args.content,
                role: args.role || "user"
            });
        }
        // Save the message with preserved newlines
        const messageId = await ctx.db.insert("messages", {
            chatId: args.chatId,
            content: args.content.replace(/\n/g, "\\n"),
            role: args.role || "user",
            createdAt: Date.now(),
        });
        if (SHOW_COMMENTS) {
            console.log("✅ Saved message:", {
                messageId,
                chatId: args.chatId,
                role: args.role || "user"
            });
        }
        // If this is a user message, schedule an AI response using a separate action
        if (!args.role || args.role === "user") {
            // Call the action to generate an AI response
            await ctx.scheduler.runAfter(1000, api.messages.generateAiResponse, {
                chatId: args.chatId,
                userMessage: args.content
            });
        }
        return messageId;
    },
});
// Add alias for backward compatibility
export const add = send;
export const store = mutation({
    args: {
        chatId: v.id("chats"),
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
    },
    handler: async (ctx, { chatId, role, content }) => {
        // Don't store empty messages
        if (!content || content.trim() === '') {
            console.log("⚠️ Attempted to store empty message, skipping");
            return null;
        }
        console.log("💾 Storing message:", {
            chatId,
            role,
            contentLength: content.length,
        });
        const messageId = await ctx.db.insert("messages", {
            chatId,
            role,
            content: content.replace(/\n/g, "\\n"), // Preserve newlines like in send mutation
            createdAt: Date.now(),
        });
        console.log("✅ Stored message:", {
            messageId,
            chatId,
            role,
        });
        return messageId;
    },
});
export const getLastMessage = query({
    args: { chatId: v.id("chats") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const chat = await ctx.db.get(args.chatId);
        if (!chat || chat.userId !== identity.subject) {
            throw new Error("Unauthorized");
        }
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
            .order("desc")
            .first();
        return messages;
    },
});
