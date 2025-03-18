// Implementation of Open-Meteo weather tool

// Map weather codes to descriptions
const weatherCodes = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
};

// Handle the open_meteo_weather query
export default async function openMeteoWeather({ location }) {
  try {
    // Step 1: Geocode the location to get coordinates
    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();
    
    if (!geocodeData.results || geocodeData.results.length === 0) {
      return {
        error: `Location not found: ${location}`
      };
    }
    
    const { latitude, longitude, name, country } = geocodeData.results[0];
    const fullLocation = `${name}, ${country}`;
    
    // Step 2: Get weather data using the coordinates
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();
    
    if (!weatherData || !weatherData.current) {
      return {
        error: `Failed to get weather data for ${fullLocation}`
      };
    }
    
    // Step 3: Format and return the data
    return {
      location: fullLocation,
      current: {
        temperature: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: weatherData.current.wind_speed_10m,
        precipitation: 0, // Not available in current
        weatherCode: weatherData.current.weather_code,
        weatherDescription: weatherCodes[weatherData.current.weather_code] || 'Unknown',
        time: weatherData.current.time
      },
      forecast: {
        daily: weatherData.daily.time.map((date, i) => ({
          date,
          maxTemperature: weatherData.daily.temperature_2m_max[i],
          minTemperature: weatherData.daily.temperature_2m_min[i],
          precipitationSum: weatherData.daily.precipitation_sum[i],
          weatherCode: weatherData.daily.weather_code[i],
          weatherDescription: weatherCodes[weatherData.daily.weather_code[i]] || 'Unknown'
        })),
        hourly: [] // We're not including hourly forecast for simplicity
      }
    };
  } catch (error) {
    console.error(`Error in OpenMeteo weather:`, error);
    return {
      error: `Error getting weather: ${error.message}`
    };
  }
} 