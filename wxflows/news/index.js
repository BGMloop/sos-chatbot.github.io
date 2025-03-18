// News API handler for SOS Chatbot

// Process news search results
function processNewsResults(response) {
  try {
    // Check for errors
    if (response.status !== 'ok' || !response.articles) {
      return {
        error: response.message || 'Failed to fetch news articles',
        status: 'error'
      };
    }

    // Limit to top 5 articles for readability
    const articles = response.articles.slice(0, 5).map(article => ({
      title: article.title,
      url: article.url,
      source: article.source?.name,
      publishedAt: article.publishedAt,
      description: article.description
    }));

    // Return processed articles
    return {
      headlines: articles,
      totalResults: response.totalResults,
      query: response.query
    };
  } catch (error) {
    console.error('Error processing news:', error);
    return {
      error: error.message || 'Error processing news data',
      status: 'error'
    };
  }
}

// Default handler for "news" tool
export default async function news({ topic }) {
  try {
    // Set default parameters for better results
    const params = {
      q: topic,
      language: 'en',
      sortBy: 'relevancy',
      pageSize: 5,
      page: 1
    };
    
    console.log(`Searching news for topic: ${topic}`);
    
    // Use GraphQL to fetch from News API
    const response = await this.executeGraphQL({
      query: 'query ($q: String!, $language: String, $sortBy: String, $pageSize: Int, $page: Int) { newsApi(q: $q, language: $language, sortBy: $sortBy, pageSize: $pageSize, page: $page) { status totalResults articles { title url source { name } publishedAt description } } }',
      variables: params
    });
    
    // Process and return the results
    return processNewsResults({
      ...response.newsApi,
      query: topic
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return {
      error: `Error fetching news: ${error.message}`,
      status: 'error'
    };
  }
}

// Add specialized handler for top headlines
export async function topHeadlines({ country = 'us', category, query }) {
  try {
    const params = {
      country,
      category: category || undefined,
      q: query || undefined,
      pageSize: 5,
      page: 1
    };
    
    console.log(`Fetching top headlines for: ${country}${category ? ', ' + category : ''}${query ? ', query: ' + query : ''}`);
    
    // Use GraphQL to fetch from News API top headlines
    const response = await this.executeGraphQL({
      query: 'query ($country: String!, $category: String, $q: String, $pageSize: Int, $page: Int) { newsTopHeadlines(country: $country, category: $category, q: $q, pageSize: $pageSize, page: $page) { status totalResults articles { title url source { name } publishedAt description } } }',
      variables: params
    });
    
    // Process and return the results
    return processNewsResults({
      ...response.newsTopHeadlines,
      query: `${country} ${category || ''} ${query || ''}`.trim()
    });
  } catch (error) {
    console.error('Error fetching top headlines:', error);
    return {
      error: `Error fetching top headlines: ${error.message}`,
      status: 'error'
    };
  }
} 