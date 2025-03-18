import { request } from 'graphql-request';
import { NEWS_API_ENDPOINT } from '../config.js';

// Check if API key is available
const API_KEY = process.env.NEWS_API_KEY;
if (!API_KEY) {
  console.warn('Warning: NEWS_API_KEY environment variable is not set.');
}

// Format news articles for consistent output
function formatArticles(articles) {
  if (!articles || !Array.isArray(articles)) return [];
  
  return articles.slice(0, 5).map(article => ({
    title: article.title,
    url: article.url,
    source: article.source?.name || 'Unknown',
    publishedAt: article.publishedAt,
    description: article.description || '',
    summary: article.content ? article.content.substring(0, 200) + '...' : article.description || ''
  }));
}

// Handler for topic-based news search
export async function news({ topic, language = 'en', sortBy = 'publishedAt' }) {
  try {
    console.log(`[News API] Searching for news about: ${topic}`);
    
    if (!API_KEY) {
      return {
        headlines: [],
        totalResults: 0,
        query: topic,
        error: 'NEWS_API_KEY is not configured',
        status: 'error'
      };
    }

    // Direct call to News API
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&language=${language}&sortBy=${sortBy}&pageSize=5&apiKey=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'ok') {
      console.error(`[News API] Error: ${data.code} - ${data.message}`);
      return {
        headlines: [],
        totalResults: 0,
        query: topic,
        error: data.message || 'Failed to fetch news',
        status: 'error'
      };
    }
    
    return {
      headlines: formatArticles(data.articles),
      totalResults: data.totalResults,
      query: topic,
      status: 'success'
    };
  } catch (error) {
    console.error('[News API] Error fetching news:', error);
    return {
      headlines: [],
      totalResults: 0,
      query: topic,
      error: error.message,
      status: 'error'
    };
  }
}

// Handler for top headlines
export async function news_headlines({ country = 'us', category = '', query = '' }) {
  try {
    console.log(`[News API] Fetching headlines for country: ${country}${category ? `, category: ${category}` : ''}${query ? `, query: ${query}` : ''}`);
    
    if (!API_KEY) {
      return {
        headlines: [],
        totalResults: 0,
        query: `Top headlines for ${country}`,
        error: 'NEWS_API_KEY is not configured',
        status: 'error'
      };
    }

    // Build query parameters
    let params = `country=${country}&pageSize=5`;
    if (category) params += `&category=${category}`;
    if (query) params += `&q=${encodeURIComponent(query)}`;
    
    // Direct call to News API
    const url = `https://newsapi.org/v2/top-headlines?${params}&apiKey=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'ok') {
      console.error(`[News API] Error: ${data.code} - ${data.message}`);
      return {
        headlines: [],
        totalResults: 0,
        query: `Top headlines for ${country}`,
        error: data.message || 'Failed to fetch headlines',
        status: 'error'
      };
    }
    
    return {
      headlines: formatArticles(data.articles),
      totalResults: data.totalResults,
      query: `Top headlines for ${country}${category ? ` in ${category}` : ''}${query ? ` about ${query}` : ''}`,
      status: 'success'
    };
  } catch (error) {
    console.error('[News API] Error fetching headlines:', error);
    return {
      headlines: [],
      totalResults: 0,
      query: `Top headlines for ${country}`,
      error: error.message,
      status: 'error'
    };
  }
} 