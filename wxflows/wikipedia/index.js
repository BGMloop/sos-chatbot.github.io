// Wikipedia search tool implementation using wxflows

// Import required tools
const { executeGraphQL } = require('../../lib/graphql-client');

/**
 * Wikipedia search tool
 * @param {Object} params - Parameters for the Wikipedia search
 * @param {string} params.query - Search term
 * @param {number} params.limit - Maximum number of results (optional, default 3)
 * @returns {Object} - Result object with Wikipedia data
 */
async function wikipediaSearch(params) {
  try {
    // Extract search parameters
    const { query, limit = 3 } = params;
    
    if (!query) {
      return {
        error: "Missing required parameter: query",
        status: "error"
      };
    }
    
    // Execute the GraphQL query
    const result = await executeGraphQL({
      query: `
        query SearchWikipedia($query: String!, $limit: Int) {
          wikipedia(query: $query, limit: $limit) {
            search {
              title
              pageid
              snippet
              wordcount
            }
            pages {
              pageid
              title
              extract
              url
              thumbnail {
                source
              }
            }
          }
        }
      `,
      variables: { 
        query,
        limit: parseInt(limit) 
      }
    });
    
    // Handle potential errors
    if (!result || !result.wikipedia) {
      throw new Error('Failed to get Wikipedia search results');
    }
    
    return {
      result: {
        search: result.wikipedia.search,
        pages: result.wikipedia.pages,
        query
      },
      status: "success"
    };
  } catch (error) {
    console.error("Wikipedia search error:", error);
    
    try {
      // Fallback to direct Wikipedia API if wxflows fails
      return await fallbackWikipediaSearch(params);
    } catch (fallbackError) {
      // If fallback also fails, return the original error
      return {
        error: error.message || "An error occurred while searching Wikipedia",
        status: "error"
      };
    }
  }
}

/**
 * Fallback function to search Wikipedia API directly
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} - Search results
 */
async function fallbackWikipediaSearch(params) {
  const { query, limit = 3 } = params;
  
  // First search for matching articles
  const searchResponse = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=${limit}`
  );
  
  if (!searchResponse.ok) {
    throw new Error(`Wikipedia search API error: ${searchResponse.statusText}`);
  }
  
  const searchData = await searchResponse.json();
  const searchResults = searchData.query.search;
  
  if (searchResults.length === 0) {
    return {
      result: {
        search: [],
        pages: [],
        query
      },
      status: "success"
    };
  }
  
  // Get page IDs for detailed content
  const pageIds = searchResults.map(result => result.pageid);
  
  // Get detailed page content
  const pageResponse = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageIds.join('|')}&prop=extracts|info|pageimages&exintro=1&inprop=url&format=json&origin=*&pithumbsize=300`
  );
  
  if (!pageResponse.ok) {
    throw new Error(`Wikipedia page API error: ${pageResponse.statusText}`);
  }
  
  const pageData = await pageResponse.json();
  const pages = Object.values(pageData.query.pages).map(page => ({
    pageid: page.pageid,
    title: page.title,
    extract: page.extract,
    url: page.fullurl,
    thumbnail: page.thumbnail ? { source: page.thumbnail.source } : null
  }));
  
  return {
    result: {
      search: searchResults.map(result => ({
        title: result.title,
        pageid: result.pageid,
        snippet: result.snippet,
        wordcount: result.wordcount
      })),
      pages,
      query,
      source: "fallback"
    },
    status: "success"
  };
}

// Export the default function
module.exports = wikipediaSearch;
module.exports.default = wikipediaSearch; 