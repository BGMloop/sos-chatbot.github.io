# News API Setup Guide

This guide walks you through setting up the News API integration for the SOS Chatbot.

## Getting Your API Key

1. **Register for an API Key**:
   - Visit [newsapi.org/register](https://newsapi.org/register)
   - Fill out the registration form with your information
   - Verify your email address

2. **Access Your API Key**:
   - After registration and verification, log in to your News API account
   - Your API key will be displayed on your account dashboard
   - Copy this key for use in the next step

## Adding the API Key to Your Project

1. **Environment Variables**:
   - Open or create your `.env.local` file in the root of your project
   - Add the following line, replacing `38fba47105a14e27b8af82f32f60bbeb` with your actual API key:
     ```
     NEWS_API_KEY=your_api_key_here
     ```
   - Save the file

2. **Verify Setup**:
   - Run the test script to ensure your API key is working correctly:
     ```bash
     node scripts/test-news-api.js
     ```
   - If successful, you should see news articles displayed in your console
   - If you encounter any errors, check that your API key is correct and properly formatted

## Using the News API in the Chatbot

The News API integration supports two main query types:

1. **Topic-based Search**:
   - Query: `news(topic: "your topic")`
   - This searches for news about a specific topic across all sources
   - Example: "Show me news about technology"

2. **Top Headlines**:
   - Query: `news_headlines(country: "us", category: "business")`
   - This retrieves top headlines for a specific country and optional category
   - Example: "Show me top headlines in the US"

## API Limitations

Be aware of the following limitations when using the News API:

- **Developer Plan Limits**:
  - 100 requests per day
  - No historical data (articles up to 1 month old)
  - Rate limit: 50 requests per 12-hour period

- **Content Availability**:
  - Not all news sources are available
  - Some content may be truncated

## Troubleshooting

If you encounter issues:

1. **Check API Key**: Verify your API key is correctly set in the `.env.local` file
2. **Quota Limits**: Ensure you haven't exceeded your daily request quota
3. **Request Format**: Check that your query parameters are valid (country codes, category names, etc.)
4. **Network Issues**: Ensure your server has internet access to reach the News API endpoints

## Further Resources

- [News API Documentation](https://newsapi.org/docs)
- [Available Endpoints](https://newsapi.org/docs/endpoints)
- [Response Formats](https://newsapi.org/docs/endpoints/everything) 