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