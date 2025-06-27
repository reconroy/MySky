import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const weatherData = pgTable("weather_data", {
  id: serial("id").primaryKey(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  temperature: real("temperature").notNull(),
  feelsLike: real("feels_like").notNull(),
  humidity: integer("humidity").notNull(),
  pressure: integer("pressure").notNull(),
  visibility: real("visibility").notNull(),
  windSpeed: real("wind_speed").notNull(),
  windDirection: integer("wind_direction").notNull(),
  weatherMain: text("weather_main").notNull(),
  weatherDescription: text("weather_description").notNull(),
  weatherIcon: text("weather_icon").notNull(),
  cloudiness: integer("cloudiness").notNull(),
  sunrise: timestamp("sunrise").notNull(),
  sunset: timestamp("sunset").notNull(),
  timezone: integer("timezone").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const hourlyForecast = pgTable("hourly_forecast", {
  id: serial("id").primaryKey(),
  city: text("city").notNull(),
  dateTime: timestamp("date_time").notNull(),
  temperature: real("temperature").notNull(),
  weatherMain: text("weather_main").notNull(),
  weatherDescription: text("weather_description").notNull(),
  weatherIcon: text("weather_icon").notNull(),
  humidity: integer("humidity").notNull(),
  windSpeed: real("wind_speed").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const dailyForecast = pgTable("daily_forecast", {
  id: serial("id").primaryKey(),
  city: text("city").notNull(),
  date: timestamp("date").notNull(),
  tempMin: real("temp_min").notNull(),
  tempMax: real("temp_max").notNull(),
  weatherMain: text("weather_main").notNull(),
  weatherDescription: text("weather_description").notNull(),
  weatherIcon: text("weather_icon").notNull(),
  humidity: integer("humidity").notNull(),
  windSpeed: real("wind_speed").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWeatherDataSchema = createInsertSchema(weatherData).omit({
  id: true,
  lastUpdated: true,
});

export const insertHourlyForecastSchema = createInsertSchema(hourlyForecast).omit({
  id: true,
  lastUpdated: true,
});

export const insertDailyForecastSchema = createInsertSchema(dailyForecast).omit({
  id: true,
  lastUpdated: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type WeatherData = typeof weatherData.$inferSelect;
export type InsertWeatherData = z.infer<typeof insertWeatherDataSchema>;
export type HourlyForecast = typeof hourlyForecast.$inferSelect;
export type InsertHourlyForecast = z.infer<typeof insertHourlyForecastSchema>;
export type DailyForecast = typeof dailyForecast.$inferSelect;
export type InsertDailyForecast = z.infer<typeof insertDailyForecastSchema>;
