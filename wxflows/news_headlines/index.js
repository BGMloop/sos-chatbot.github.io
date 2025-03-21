// News headlines tool implementation using News API

// Import required tools
import { executeGraphQL } from '../../lib/graphql-client';

/**
 * News headlines tool
 * @param {Object} params - Parameters for the news headlines
 * @param {string} params.country - Two-letter country code (e.g., "us", "gb", "jp")
 * @param {string} params.category - News category (optional, e.g., "business", "technology")
 * @returns {Object} - Result object with news headlines
 */
export async function newsHeadlinesTool(params) {
  try {
    // Extract parameters
    const { country, category = 'general' } = params;
    
    if (!country) {
      return {
        error: "Missing required parameter: country",
        status: "error"
      };
    }

    try {
      // Try to use GraphQL for news headlines
      const result = await executeGraphQL({
        query: `
          query GetTopHeadlines($country: String!, $category: String) {
            newsHeadlines(country: $country, category: $category) {
              status
              totalResults
              articles {
                title
                description
                url
                source {
                  name
                }
                publishedAt
                urlToImage
              }
            }
          }
        `,
        variables: { 
          country: country.toLowerCase(),
          category: category !== 'all' ? category : null
        }
      });
      
      if (!result || !result.newsHeadlines) {
        throw new Error('Failed to get news headlines');
      }
      
      return {
        result: {
          articles: result.newsHeadlines.articles,
          totalResults: result.newsHeadlines.totalResults,
          country,
          category: category || 'all'
        },
        status: "success"
      };
    } catch (graphqlError) {
      // Fall back to direct API call
      console.log("Using fallback news headlines API due to GraphQL error");
      return await fallbackNewsHeadlines(country, category);
    }
  } catch (error) {
    console.error("News headlines tool error:", error);
    return {
      error: error.message || "An error occurred while fetching news headlines",
      status: "error"
    };
  }
}

/**
 * Fallback function to get news headlines directly via API
 * @param {string} country - Country code
 * @param {string} category - News category
 * @returns {Promise<Object>} - News headlines results
 */
async function fallbackNewsHeadlines(country, category) {
  try {
    // Get the API key from environment variable
    const apiKey = process.env.NEWS_API_KEY || 'a5670c3012f2473cb73cc6f75cacb5d6'; // Fallback to a demo key
    
    // Build the API URL
    let url = `https://newsapi.org/v2/top-headlines?country=${country.toLowerCase()}&pageSize=10`;
    
    // Add category if not "all"
    if (category && category !== 'all') {
      url += `&category=${category}`;
    }
    
    // Call the News API
    const response = await fetch(url, {
      headers: {
        'X-Api-Key': apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`News API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error(`News API returned error: ${data.message || 'Unknown error'}`);
    }
    
    // Format the articles
    const articles = data.articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      source: article.source.name,
      publishedAt: article.publishedAt,
      urlToImage: article.urlToImage
    }));
    
    return {
      result: {
        articles,
        totalResults: data.totalResults,
        country,
        category: category || 'all',
        source: "fallback"
      },
      status: "success"
    };
  } catch (fallbackError) {
    console.error("Fallback news headlines API error:", fallbackError);
    return {
      error: fallbackError.message || "An error occurred while fetching news headlines",
      status: "error"
    };
  }
}

// Export default
export default newsHeadlinesTool; 