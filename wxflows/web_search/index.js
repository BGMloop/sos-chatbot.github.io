/**
 * Web Search Tool using DuckDuckGo
 * 
 * This tool performs web searches using the DuckDuckGo API
 * and returns structured results.
 */

/**
 * Format the DuckDuckGo results into a more usable structure
 */
function formatResults(data) {
  const results = [];
  
  // Process RelatedTopics which contain the actual search results
  if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
    for (const topic of data.RelatedTopics) {
      // Skip topics without Text or FirstURL
      if (!topic.Text || !topic.FirstURL) continue;
      
      // Some topics have subtopics in the Topics array
      if (topic.Topics && Array.isArray(topic.Topics)) {
        for (const subtopic of topic.Topics) {
          if (!subtopic.Text || !subtopic.FirstURL) continue;
          
          results.push({
            title: subtopic.Text,
            url: subtopic.FirstURL,
            snippet: subtopic.Text
          });
        }
      } else {
        // Extract the title from the Text field - it's usually the first part
        const title = topic.Text.split(' - ')[0] || topic.Text;
        
        results.push({
          title: title,
          url: topic.FirstURL,
          snippet: topic.Text
        });
      }
    }
  }
  
  // Also check if there's an Abstract result
  if (data.Abstract && data.AbstractURL) {
    results.unshift({
      title: data.Heading || "Top Result",
      url: data.AbstractURL,
      snippet: data.Abstract,
      isTopResult: true
    });
  }
  
  return results;
}

/**
 * Perform a web search using DuckDuckGo
 */
export default async function webSearch({ query, region = "us-en", time = "month", num_results = 5 }) {
  try {
    console.log(`Performing web search for: "${query}"`);
    
    // Format the DuckDuckGo API URL
    // Note: DuckDuckGo doesn't have official parameters for region and time
    // but we'll include them for future compatibility
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;
    
    // Fetch the search results
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Search request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    const results = formatResults(data);
    
    // Limit the number of results based on the num_results parameter
    const limitedResults = results.slice(0, num_results);
    
    // Return the formatted results
    return {
      query,
      results: limitedResults,
      total_results: results.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Web search error:', error);
    return {
      error: error.message || 'Failed to perform web search',
      status: 'error'
    };
  }
}

// Web search tool implementation using free search APIs

/**
 * Web search tool
 * @param {Object} params - Parameters for the web search
 * @param {string} params.query - Search term
 * @param {number} params.limit - Maximum number of results (optional, default 5)
 * @returns {Object} - Result object with search results
 */
async function webSearchTool(params) {
  try {
    // Extract search parameters
    const { query, limit = 5 } = params;
    
    if (!query) {
      return {
        error: "Missing required parameter: query",
        status: "error"
      };
    }
    
    // Try multiple search APIs in sequence until one works
    try {
      // Try Google Programmable Search Engine if API key is available
      if (process.env.GOOGLE_CSE_ID && process.env.GOOGLE_API_KEY) {
        return await googleSearch(query, limit);
      }
    } catch (error) {
      console.error("Google search failed:", error);
      // Continue to next option
    }
    
    try {
      // Try Bing Search if API key is available
      if (process.env.BING_SEARCH_API_KEY) {
        return await bingSearch(query, limit);
      }
    } catch (error) {
      console.error("Bing search failed:", error);
      // Continue to next option
    }
    
    // Fallback to a free search API - DuckDuckGo
    return await duckDuckGoSearch(query, limit);
    
  } catch (error) {
    console.error("Web search error:", error);
    return {
      error: error.message || "An error occurred while performing web search",
      status: "error"
    };
  }
}

/**
 * Search using Google Custom Search Engine
 * @param {string} query - Search query
 * @param {number} limit - Maximum results
 * @returns {Object} - Search results
 */
async function googleSearch(query, limit) {
  const cseId = process.env.GOOGLE_CSE_ID;
  const apiKey = process.env.GOOGLE_API_KEY;
  
  const response = await fetch(
    `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=${Math.min(limit, 10)}`
  );
  
  if (!response.ok) {
    throw new Error(`Google search API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data.items || data.items.length === 0) {
    return {
      result: {
        results: [],
        query
      },
      status: "success"
    };
  }
  
  const results = data.items.map(item => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet,
    displayLink: item.displayLink,
    source: "google"
  }));
  
  return {
    result: {
      results,
      query
    },
    status: "success"
  };
}

/**
 * Search using Bing Search API
 * @param {string} query - Search query
 * @param {number} limit - Maximum results
 * @returns {Object} - Search results
 */
async function bingSearch(query, limit) {
  const apiKey = process.env.BING_SEARCH_API_KEY;
  
  const response = await fetch(
    `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=${Math.min(limit, 50)}`,
    {
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`Bing search API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data.webPages || !data.webPages.value || data.webPages.value.length === 0) {
    return {
      result: {
        results: [],
        query
      },
      status: "success"
    };
  }
  
  const results = data.webPages.value.map(item => ({
    title: item.name,
    link: item.url,
    snippet: item.snippet,
    displayLink: new URL(item.url).hostname,
    source: "bing"
  }));
  
  return {
    result: {
      results,
      query
    },
    status: "success"
  };
}

/**
 * Search using DuckDuckGo API (unofficial)
 * @param {string} query - Search query
 * @param {number} limit - Maximum results
 * @returns {Object} - Search results
 */
async function duckDuckGoSearch(query, limit) {
  // Use the DuckDuckGo text search API (no key required)
  const response = await fetch(
    `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
    { headers: { 'User-Agent': 'Mozilla/5.0' } }
  );
  
  if (!response.ok) {
    throw new Error(`DuckDuckGo API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Combine all results
  const results = [];
  
  // Add the abstract text if relevant
  if (data.Abstract && data.AbstractURL) {
    results.push({
      title: data.Heading || query,
      link: data.AbstractURL,
      snippet: data.Abstract,
      displayLink: new URL(data.AbstractURL).hostname,
      source: "duckduckgo"
    });
  }
  
  // Add related topics
  if (data.RelatedTopics && data.RelatedTopics.length) {
    data.RelatedTopics.slice(0, limit - results.length).forEach(topic => {
      if (topic.Result && topic.FirstURL) {
        // Extract text from HTML
        const titleMatch = topic.Result.match(/<a[^>]*>(.*?)<\/a>/);
        const title = titleMatch ? titleMatch[1] : 'Related Topic';
        
        // Extract snippet by removing HTML tags
        const snippet = topic.Text || topic.Result.replace(/<[^>]*>/g, '');
        
        results.push({
          title,
          link: topic.FirstURL,
          snippet,
          displayLink: new URL(topic.FirstURL).hostname,
          source: "duckduckgo"
        });
      }
    });
  }
  
  return {
    result: {
      results: results.slice(0, limit),
      query
    },
    status: "success"
  };
}

// Export the default function
module.exports = webSearchTool;
module.exports.default = webSearchTool; 