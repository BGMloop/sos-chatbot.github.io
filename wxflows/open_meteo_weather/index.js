// Weather tool implementation using Open-Meteo API

/**
 * Get weather information for a location
 * @param {Object} params - Parameters for the weather request
 * @param {string} params.location - Location name (e.g., "New York", "London")
 * @returns {Object} - Result object with weather data
 */
async function weatherTool(params) {
  try {
    // Extract location from parameters
    const { location } = params;
    
    if (!location) {
      return {
        error: "Missing required parameter: location",
        status: "error"
      };
    }

    // First, geocode the location to get coordinates
    const geocodingResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`
    );
    
    if (!geocodingResponse.ok) {
      throw new Error(`Geocoding API error: ${geocodingResponse.statusText}`);
    }
    
    const geocodingData = await geocodingResponse.json();
    
    if (!geocodingData.results || geocodingData.results.length === 0) {
      return {
        error: `Location not found: ${location}`,
        status: "error"
      };
    }
    
    const { latitude, longitude, name, country, admin1 } = geocodingData.results[0];
    
    // Now fetch the weather data using the coordinates
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
    );
    
    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.statusText}`);
    }
    
    const weatherData = await weatherResponse.json();
    
    return {
      result: {
        location: {
          name,
          country,
          region: admin1,
          latitude,
          longitude
        },
        current: weatherData.current,
        daily: weatherData.daily,
        units: {
          temperature: weatherData.current_units?.temperature_2m || "°C",
          precipitation: weatherData.current_units?.precipitation || "mm",
          windSpeed: weatherData.current_units?.wind_speed_10m || "km/h"
        }
      },
      status: "success"
    };
  } catch (error) {
    console.error("Weather tool error:", error);
    return {
      error: error.message || "An error occurred while fetching weather data",
      status: "error"
    };
  }
}

// Export the default function
module.exports = weatherTool;
module.exports.default = weatherTool; 