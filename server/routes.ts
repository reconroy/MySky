import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWeatherDataSchema, insertHourlyForecastSchema, insertDailyForecastSchema } from "@shared/schema";
import { z } from "zod";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY || "demo_key";
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";
const OPENWEATHER_ONECALL_URL = "https://api.openweathermap.org/data/3.0/onecall";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get weather data for a location
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
      
      // Fetch current weather from OpenWeatherMap
      const weatherUrl = `${OPENWEATHER_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;
      const weatherResponse = await fetch(weatherUrl);
      
      if (!weatherResponse.ok) {
        throw new Error(`Weather API error: ${weatherResponse.status}`);
      }
      
      const weatherData = await weatherResponse.json();
      
      // Transform API response to our schema
      const transformedWeatherData = {
        city: weatherData.name || cityName,
        country: weatherData.sys?.country || "Unknown",
        latitude,
        longitude,
        temperature: weatherData.main.temp,
        feelsLike: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility ? weatherData.visibility / 1000 : 10, // Convert to km
        windSpeed: weatherData.wind?.speed || 0,
        windDirection: weatherData.wind?.deg || 0,
        weatherMain: weatherData.weather[0].main,
        weatherDescription: weatherData.weather[0].description,
        weatherIcon: weatherData.weather[0].icon,
        cloudiness: weatherData.clouds.all,
        sunrise: new Date(weatherData.sys.sunrise * 1000),
        sunset: new Date(weatherData.sys.sunset * 1000),
        timezone: weatherData.timezone,
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
  
  // Get hourly forecast
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
      
      // Fetch forecast data from OpenWeatherMap
      const forecastUrl = `${OPENWEATHER_BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;
      const forecastResponse = await fetch(forecastUrl);
      
      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.status}`);
      }
      
      const forecastData = await forecastResponse.json();
      
      // Transform hourly forecast data (take first 24 hours)
      const hourlyForecasts = forecastData.list.slice(0, 8).map((item: any) => ({
        city: cityName,
        dateTime: new Date(item.dt * 1000),
        temperature: item.main.temp,
        weatherMain: item.weather[0].main,
        weatherDescription: item.weather[0].description,
        weatherIcon: item.weather[0].icon,
        humidity: item.main.humidity,
        windSpeed: item.wind?.speed || 0,
      }));
      
      // Clear old forecast and save new one
      await storage.clearHourlyForecast(cityName);
      const savedForecast = await storage.createHourlyForecast(hourlyForecasts);
      
      res.json(savedForecast);
    } catch (error) {
      console.error("Hourly forecast API error:", error);
      res.status(500).json({ error: "Failed to fetch hourly forecast" });
    }
  });
  
  // Get daily forecast
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
      
      // Fetch forecast data from OpenWeatherMap
      const forecastUrl = `${OPENWEATHER_BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;
      const forecastResponse = await fetch(forecastUrl);
      
      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.status}`);
      }
      
      const forecastData = await forecastResponse.json();
      
      // Group forecast data by day and get daily min/max temperatures
      const dailyMap = new Map();
      
      forecastData.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();
        
        if (!dailyMap.has(dateKey)) {
          dailyMap.set(dateKey, {
            date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            temps: [],
            weather: item.weather[0],
            humidity: item.main.humidity,
            windSpeed: item.wind?.speed || 0,
          });
        }
        
        dailyMap.get(dateKey).temps.push(item.main.temp);
      });
      
      // Transform to daily forecast format (take first 7 days)
      const dailyForecasts = Array.from(dailyMap.values()).slice(0, 7).map((day: any) => ({
        city: cityName,
        date: day.date,
        tempMin: Math.min(...day.temps),
        tempMax: Math.max(...day.temps),
        weatherMain: day.weather.main,
        weatherDescription: day.weather.description,
        weatherIcon: day.weather.icon,
        humidity: day.humidity,
        windSpeed: day.windSpeed,
      }));
      
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
