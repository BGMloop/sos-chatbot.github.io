// Google Books tool implementation using wxflows

// Import required tools
const { executeGraphQL } = require('../../lib/graphql-client');

/**
 * Google Books search tool
 * @param {Object} params - Parameters for the book search
 * @param {string} params.query - Search query term
 * @param {string} params.title - Book title to search for
 * @param {string} params.author - Author name to search for
 * @param {string} params.isbn - ISBN to search for
 * @param {number} params.limit - Maximum number of results to return (optional, default 5)
 * @returns {Object} - Result object with book data
 */
async function googleBooksSearch(params) {
  try {
    // Extract parameters and build search query
    const { query, title, author, isbn, limit = 5 } = params;
    
    // Build the search query string based on provided parameters
    let searchQuery = '';
    
    if (query) {
      searchQuery = query;
    } else {
      const terms = [];
      if (title) terms.push(`intitle:${title}`);
      if (author) terms.push(`inauthor:${author}`);
      if (isbn) terms.push(`isbn:${isbn}`);
      
      if (terms.length === 0) {
        return {
          error: "Missing search criteria: Please provide a query, title, author, or ISBN",
          status: "error"
        };
      }
      
      searchQuery = terms.join(' ');
    }
    
    // Execute the GraphQL query
    const result = await executeGraphQL({
      query: `
        query SearchBooks($query: String!, $limit: Int) {
          googleBooks(query: $query, limit: $limit) {
            items {
              id
              volumeInfo {
                title
                subtitle
                authors
                publisher
                publishedDate
                description
                pageCount
                categories
                imageLinks {
                  thumbnail
                }
                language
                previewLink
                infoLink
                canonicalVolumeLink
              }
              searchInfo {
                textSnippet
              }
            }
            totalItems
          }
        }
      `,
      variables: { 
        query: searchQuery,
        limit: parseInt(limit) 
      }
    });
    
    // Handle potential errors
    if (!result || !result.googleBooks) {
      throw new Error('Failed to get book search results');
    }
    
    // Process and format the results
    const books = result.googleBooks.items.map(item => ({
      id: item.id,
      title: item.volumeInfo.title,
      subtitle: item.volumeInfo.subtitle,
      authors: item.volumeInfo.authors || [],
      publisher: item.volumeInfo.publisher,
      publishedDate: item.volumeInfo.publishedDate,
      description: item.volumeInfo.description,
      pageCount: item.volumeInfo.pageCount,
      categories: item.volumeInfo.categories || [],
      thumbnail: item.volumeInfo.imageLinks?.thumbnail,
      language: item.volumeInfo.language,
      previewLink: item.volumeInfo.previewLink,
      infoLink: item.volumeInfo.infoLink,
      textSnippet: item.searchInfo?.textSnippet
    }));
    
    return {
      result: {
        books,
        query: searchQuery,
        totalItems: result.googleBooks.totalItems
      },
      status: "success"
    };
  } catch (error) {
    console.error("Google Books search error:", error);
    
    try {
      // Fallback to direct Google Books API if wxflows fails
      return await fallbackGoogleBooksSearch(params);
    } catch (fallbackError) {
      // If fallback also fails, return the original error
      return {
        error: error.message || "An error occurred while searching for books",
        status: "error"
      };
    }
  }
}

/**
 * Fallback function to search Google Books API directly
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} - Search results
 */
async function fallbackGoogleBooksSearch(params) {
  const { query, title, author, isbn, limit = 5 } = params;
  
  // Build the search query string
  let searchQuery = '';
  if (query) {
    searchQuery = query;
  } else {
    const terms = [];
    if (title) terms.push(`intitle:${title}`);
    if (author) terms.push(`inauthor:${author}`);
    if (isbn) terms.push(`isbn:${isbn}`);
    searchQuery = terms.join(' ');
  }
  
  // Call Google Books API directly
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=${limit}`
  );
  
  if (!response.ok) {
    throw new Error(`Google Books API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Process and format the results
  const books = (data.items || []).map(item => ({
    id: item.id,
    title: item.volumeInfo.title,
    subtitle: item.volumeInfo.subtitle,
    authors: item.volumeInfo.authors || [],
    publisher: item.volumeInfo.publisher,
    publishedDate: item.volumeInfo.publishedDate,
    description: item.volumeInfo.description,
    pageCount: item.volumeInfo.pageCount,
    categories: item.volumeInfo.categories || [],
    thumbnail: item.volumeInfo.imageLinks?.thumbnail,
    language: item.volumeInfo.language,
    previewLink: item.volumeInfo.previewLink,
    infoLink: item.volumeInfo.infoLink,
    textSnippet: item.searchInfo?.textSnippet
  }));
  
  return {
    result: {
      books,
      query: searchQuery,
      totalItems: data.totalItems,
      source: "fallback"
    },
    status: "success"
  };
}

// Export the default function
module.exports = googleBooksSearch;
module.exports.default = googleBooksSearch; 