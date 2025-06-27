import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWeatherDataSchema, insertHourlyForecastSchema, insertDailyForecastSchema } from "@shared/schema";
import { z } from "zod";

// Using Open-Meteo - a free, no API key required weather service
const OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1";
const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1";

// Weather condition mapping for Open-Meteo weather codes
function getWeatherCondition(weatherCode: number, isDay: boolean) {
  const weatherConditions: Record<number, { main: string; description: string; iconDay: string; iconNight: string }> = {
    0: { main: "Clear", description: "clear sky", iconDay: "01d", iconNight: "01n" },
    1: { main: "Clear", description: "mainly clear", iconDay: "01d", iconNight: "01n" },
    2: { main: "Clouds", description: "partly cloudy", iconDay: "02d", iconNight: "02n" },
    3: { main: "Clouds", description: "overcast", iconDay: "03d", iconNight: "03n" },
    45: { main: "Fog", description: "fog", iconDay: "50d", iconNight: "50n" },
    48: { main: "Fog", description: "depositing rime fog", iconDay: "50d", iconNight: "50n" },
    51: { main: "Drizzle", description: "light drizzle", iconDay: "09d", iconNight: "09n" },
    53: { main: "Drizzle", description: "moderate drizzle", iconDay: "09d", iconNight: "09n" },
    55: { main: "Drizzle", description: "dense drizzle", iconDay: "09d", iconNight: "09n" },
    61: { main: "Rain", description: "slight rain", iconDay: "10d", iconNight: "10n" },
    63: { main: "Rain", description: "moderate rain", iconDay: "10d", iconNight: "10n" },
    65: { main: "Rain", description: "heavy rain", iconDay: "10d", iconNight: "10n" },
    71: { main: "Snow", description: "slight snow fall", iconDay: "13d", iconNight: "13n" },
    73: { main: "Snow", description: "moderate snow fall", iconDay: "13d", iconNight: "13n" },
    75: { main: "Snow", description: "heavy snow fall", iconDay: "13d", iconNight: "13n" },
    80: { main: "Rain", description: "slight rain showers", iconDay: "09d", iconNight: "09n" },
    81: { main: "Rain", description: "moderate rain showers", iconDay: "09d", iconNight: "09n" },
    82: { main: "Rain", description: "violent rain showers", iconDay: "09d", iconNight: "09n" },
    95: { main: "Thunderstorm", description: "thunderstorm", iconDay: "11d", iconNight: "11n" },
    96: { main: "Thunderstorm", description: "thunderstorm with slight hail", iconDay: "11d", iconNight: "11n" },
    99: { main: "Thunderstorm", description: "thunderstorm with heavy hail", iconDay: "11d", iconNight: "11n" },
  };

  const condition = weatherConditions[weatherCode] || weatherConditions[0];
  return {
    main: condition.main,
    description: condition.description,
    icon: isDay ? condition.iconDay : condition.iconNight,
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get weather data for a location using Open-Meteo
  app.get("/api/weather", async (req, res) => {
    try {
      const { lat, lon, city } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }
      
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      
      // Check if we have cached data for this city
      const cityName = city as string || `${latitude},${longitude}`;
      const cachedWeather = await storage.getWeatherData(cityName);
      
      // If we have recent data (less than 10 minutes old), return it
      if (cachedWeather && cachedWeather.lastUpdated && 
          (Date.now() - cachedWeather.lastUpdated.getTime()) < 10 * 60 * 1000) {
        return res.json(cachedWeather);
      }
      
      // Fetch current weather from Open-Meteo
      const weatherUrl = `${OPEN_METEO_BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m&timezone=auto`;
      const weatherResponse = await fetch(weatherUrl);
      
      if (!weatherResponse.ok) {
        throw new Error(`Weather API error: ${weatherResponse.status}`);
      }
      
      const weatherData = await weatherResponse.json();
      
      // Get location name and country using reverse geocoding
      let locationName = cityName;
      let countryName = "";
      try {
        // Try reverse geocoding with a different approach
        const reverseGeocodeUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
        const reverseResponse = await fetch(reverseGeocodeUrl);
        if (reverseResponse.ok) {
          const reverseData = await reverseResponse.json();
          if (reverseData.city || reverseData.locality) {
            locationName = reverseData.city || reverseData.locality || cityName;
            countryName = reverseData.countryName || reverseData.country || "";
          }
        }
      } catch (geocodeError) {
        // Fallback to Open-Meteo geocoding
        try {
          const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
          const geocodeResponse = await fetch(geocodeUrl);
          if (geocodeResponse.ok) {
            const geocodeData = await geocodeResponse.json();
            if (geocodeData.results && geocodeData.results.length > 0) {
              const result = geocodeData.results[0];
              locationName = result.name || result.admin1 || cityName;
              countryName = result.country || "";
            }
          }
        } catch (fallbackError) {
          console.log("All geocoding attempts failed, using provided city name");
        }
      }
      
      // Map weather codes to conditions
      const weatherCode = weatherData.current.weather_code;
      const { main, description, icon } = getWeatherCondition(weatherCode, weatherData.current.is_day);
      
      // Calculate sunrise/sunset (approximate)
      const now = new Date();
      const sunrise = new Date(now);
      sunrise.setHours(6, 0, 0, 0);
      const sunset = new Date(now);
      sunset.setHours(18, 0, 0, 0);
      
      // Transform API response to our schema
      const transformedWeatherData = {
        city: locationName,
        country: countryName || "",
        latitude,
        longitude,
        temperature: weatherData.current.temperature_2m,
        feelsLike: weatherData.current.apparent_temperature,
        humidity: weatherData.current.relative_humidity_2m,
        pressure: Math.round(weatherData.current.surface_pressure),
        visibility: 10, // Open-Meteo doesn't provide visibility
        windSpeed: weatherData.current.wind_speed_10m,
        windDirection: weatherData.current.wind_direction_10m,
        weatherMain: main,
        weatherDescription: description,
        weatherIcon: icon,
        cloudiness: weatherData.current.cloud_cover,
        sunrise,
        sunset,
        timezone: 0, // Will be handled by timezone parameter
      };
      
      // Validate and store the data
      const validatedData = insertWeatherDataSchema.parse(transformedWeatherData);
      const savedWeather = await storage.createOrUpdateWeatherData(validatedData);
      
      res.json(savedWeather);
    } catch (error) {
      console.error("Weather API error:", error);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });
  
  // Get hourly forecast using Open-Meteo
  app.get("/api/weather/hourly", async (req, res) => {
    try {
      const { lat, lon, city } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }
      
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      const cityName = city as string || `${latitude},${longitude}`;
      
      // Check for cached hourly forecast
      const cachedForecast = await storage.getHourlyForecast(cityName);
      if (cachedForecast.length > 0 && cachedForecast[0].lastUpdated &&
          (Date.now() - cachedForecast[0].lastUpdated.getTime()) < 60 * 60 * 1000) { // 1 hour cache
        return res.json(cachedForecast);
      }
      
      // Fetch hourly forecast data from Open-Meteo
      const forecastUrl = `${OPEN_METEO_BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,weather_code,is_day,wind_speed_10m&timezone=auto&forecast_days=2`;
      const forecastResponse = await fetch(forecastUrl);
      
      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.status}`);
      }
      
      const forecastData = await forecastResponse.json();
      
      // Transform hourly forecast data (take next 24 hours)
      const hourlyForecasts = forecastData.hourly.time.slice(0, 24).map((time: string, index: number) => {
        const weatherCode = forecastData.hourly.weather_code[index];
        const isDay = forecastData.hourly.is_day[index];
        const { main, description, icon } = getWeatherCondition(weatherCode, isDay);
        
        return {
          city: cityName,
          dateTime: new Date(time),
          temperature: forecastData.hourly.temperature_2m[index],
          weatherMain: main,
          weatherDescription: description,
          weatherIcon: icon,
          humidity: forecastData.hourly.relative_humidity_2m[index],
          windSpeed: forecastData.hourly.wind_speed_10m[index],
        };
      });
      
      // Clear old forecast and save new one
      await storage.clearHourlyForecast(cityName);
      const savedForecast = await storage.createHourlyForecast(hourlyForecasts);
      
      res.json(savedForecast);
    } catch (error) {
      console.error("Hourly forecast API error:", error);
      res.status(500).json({ error: "Failed to fetch hourly forecast" });
    }
  });
  
  // Get daily forecast using Open-Meteo
  app.get("/api/weather/daily", async (req, res) => {
    try {
      const { lat, lon, city } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }
      
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      const cityName = city as string || `${latitude},${longitude}`;
      
      // Check for cached daily forecast
      const cachedForecast = await storage.getDailyForecast(cityName);
      if (cachedForecast.length > 0 && cachedForecast[0].lastUpdated &&
          (Date.now() - cachedForecast[0].lastUpdated.getTime()) < 6 * 60 * 60 * 1000) { // 6 hour cache
        return res.json(cachedForecast);
      }
      
      // Fetch daily forecast data from Open-Meteo
      const forecastUrl = `${OPEN_METEO_BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max&timezone=auto&forecast_days=7`;
      const forecastResponse = await fetch(forecastUrl);
      
      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.status}`);
      }
      
      const forecastData = await forecastResponse.json();
      
      // Transform daily forecast data
      const dailyForecasts = forecastData.daily.time.map((time: string, index: number) => {
        const weatherCode = forecastData.daily.weather_code[index];
        const { main, description, icon } = getWeatherCondition(weatherCode, true); // Use day version for daily forecast
        
        return {
          city: cityName,
          date: new Date(time),
          tempMin: forecastData.daily.temperature_2m_min[index],
          tempMax: forecastData.daily.temperature_2m_max[index],
          weatherMain: main,
          weatherDescription: description,
          weatherIcon: icon,
          humidity: 50, // Default humidity as Open-Meteo daily doesn't provide this easily
          windSpeed: forecastData.daily.wind_speed_10m_max[index],
        };
      });
      
      // Clear old forecast and save new one
      await storage.clearDailyForecast(cityName);
      const savedForecast = await storage.createDailyForecast(dailyForecasts);
      
      res.json(savedForecast);
    } catch (error) {
      console.error("Daily forecast API error:", error);
      res.status(500).json({ error: "Failed to fetch daily forecast" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
