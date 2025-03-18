// Test script for News API integration
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

const API_KEY = process.env.NEWS_API_KEY;

if (!API_KEY) {
  console.error('ERROR: NEWS_API_KEY environment variable is not set.');
  console.log('Please add your News API key to your .env file:');
  console.log('NEWS_API_KEY=your_api_key_here');
  process.exit(1);
}

async function testNewsAPI() {
  try {
    console.log('Testing News API integration...');
    
    // Test topic search
    const topic = 'technology';
    const topicUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&language=en&pageSize=2&apiKey=${API_KEY}`;
    
    console.log(`\nFetching news about "${topic}"...`);
    const topicResponse = await fetch(topicUrl);
    const topicData = await topicResponse.json();
    
    if (topicData.status === 'ok') {
      console.log('✅ Topic search successful!');
      console.log(`Found ${topicData.totalResults} articles about "${topic}"`);
      console.log('\nSample articles:');
      topicData.articles.slice(0, 2).forEach((article, i) => {
        console.log(`${i+1}. ${article.title} (${article.source.name})`);
        console.log(`   URL: ${article.url}`);
      });
    } else {
      console.error('❌ Topic search failed:', topicData.message);
    }
    
    // Test headlines
    const country = 'us';
    const headlinesUrl = `https://newsapi.org/v2/top-headlines?country=${country}&pageSize=2&apiKey=${API_KEY}`;
    
    console.log(`\nFetching top headlines for "${country}"...`);
    const headlinesResponse = await fetch(headlinesUrl);
    const headlinesData = await headlinesResponse.json();
    
    if (headlinesData.status === 'ok') {
      console.log('✅ Headlines search successful!');
      console.log(`Found ${headlinesData.totalResults} top headlines for "${country}"`);
      console.log('\nSample headlines:');
      headlinesData.articles.slice(0, 2).forEach((article, i) => {
        console.log(`${i+1}. ${article.title} (${article.source.name})`);
        console.log(`   URL: ${article.url}`);
      });
    } else {
      console.error('❌ Headlines search failed:', headlinesData.message);
    }
    
    console.log('\nTest completed!');
  } catch (error) {
    console.error('Error during test:', error);
    process.exit(1);
  }
}

testNewsAPI(); 