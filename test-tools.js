// Import the executeTool function
const { executeTool } = require('./lib/langgraph');

async function testYouTubeTranscript() {
  console.log('Testing YouTube Transcript tool...');
  
  // Test with a valid YouTube video ID
  const result = await executeTool('youtube_transcript', {
    videoId: 'dQw4w9WgXcQ' // Rick Astley - Never Gonna Give You Up
  });
  
  console.log('YouTube Transcript Result:', JSON.stringify(result, null, 2));
  
  // Test with a YouTube URL
  const urlResult = await executeTool('youtube_transcript', {
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  });
  
  console.log('YouTube Transcript from URL Result:', JSON.stringify(urlResult, null, 2));
}

async function testWikipedia() {
  console.log('Testing Wikipedia tool...');
  
  const result = await executeTool('wikipedia', {
    query: 'Quantum computing'
  });
  
  console.log('Wikipedia Result:', JSON.stringify(result, null, 2));
}

async function testMath() {
  console.log('Testing Math tool...');
  
  const result = await executeTool('math', {
    input: '2+2'
  });
  
  console.log('Math Result:', JSON.stringify(result, null, 2));
}

async function testExchange() {
  console.log('Testing Exchange tool...');
  
  const result = await executeTool('exchange', {
    from: 'USD',
    to: 'EUR'
  });
  
  console.log('Exchange Result:', JSON.stringify(result, null, 2));
}

async function testGoogleBooks() {
  console.log('Testing Google Books tool...');
  
  const result = await executeTool('google_books', {
    query: 'Harry Potter'
  });
  
  console.log('Google Books Result:', JSON.stringify(result, null, 2));
}

async function runTests() {
  try {
    // Test each tool
    await testYouTubeTranscript();
    await testWikipedia();
    await testMath();
    await testExchange();
    await testGoogleBooks();
    
    console.log('All tests completed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the tests
runTests(); 