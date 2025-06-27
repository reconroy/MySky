import { users, weatherData, hourlyForecast, dailyForecast, type User, type InsertUser, type WeatherData, type InsertWeatherData, type HourlyForecast, type InsertHourlyForecast, type DailyForecast, type InsertDailyForecast } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getWeatherData(city: string): Promise<WeatherData | undefined>;
  createOrUpdateWeatherData(data: InsertWeatherData): Promise<WeatherData>;
  
  getHourlyForecast(city: string): Promise<HourlyForecast[]>;
  createHourlyForecast(forecasts: InsertHourlyForecast[]): Promise<HourlyForecast[]>;
  clearHourlyForecast(city: string): Promise<void>;
  
  getDailyForecast(city: string): Promise<DailyForecast[]>;
  createDailyForecast(forecasts: InsertDailyForecast[]): Promise<DailyForecast[]>;
  clearDailyForecast(city: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private weatherDataMap: Map<string, WeatherData>;
  private hourlyForecastMap: Map<string, HourlyForecast[]>;
  private dailyForecastMap: Map<string, DailyForecast[]>;
  private currentUserId: number;
  private currentWeatherId: number;
  private currentHourlyId: number;
  private currentDailyId: number;

  constructor() {
    this.users = new Map();
    this.weatherDataMap = new Map();
    this.hourlyForecastMap = new Map();
    this.dailyForecastMap = new Map();
    this.currentUserId = 1;
    this.currentWeatherId = 1;
    this.currentHourlyId = 1;
    this.currentDailyId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getWeatherData(city: string): Promise<WeatherData | undefined> {
    return this.weatherDataMap.get(city.toLowerCase());
  }

  async createOrUpdateWeatherData(data: InsertWeatherData): Promise<WeatherData> {
    const key = data.city.toLowerCase();
    const existing = this.weatherDataMap.get(key);
    
    if (existing) {
      const updated: WeatherData = {
        ...data,
        id: existing.id,
        lastUpdated: new Date(),
      };
      this.weatherDataMap.set(key, updated);
      return updated;
    } else {
      const id = this.currentWeatherId++;
      const newWeatherData: WeatherData = {
        ...data,
        id,
        lastUpdated: new Date(),
      };
      this.weatherDataMap.set(key, newWeatherData);
      return newWeatherData;
    }
  }

  async getHourlyForecast(city: string): Promise<HourlyForecast[]> {
    return this.hourlyForecastMap.get(city.toLowerCase()) || [];
  }

  async createHourlyForecast(forecasts: InsertHourlyForecast[]): Promise<HourlyForecast[]> {
    const result: HourlyForecast[] = [];
    
    for (const forecast of forecasts) {
      const id = this.currentHourlyId++;
      const newForecast: HourlyForecast = {
        ...forecast,
        id,
        lastUpdated: new Date(),
      };
      result.push(newForecast);
    }
    
    if (result.length > 0) {
      const city = result[0].city.toLowerCase();
      this.hourlyForecastMap.set(city, result);
    }
    
    return result;
  }

  async clearHourlyForecast(city: string): Promise<void> {
    this.hourlyForecastMap.delete(city.toLowerCase());
  }

  async getDailyForecast(city: string): Promise<DailyForecast[]> {
    return this.dailyForecastMap.get(city.toLowerCase()) || [];
  }

  async createDailyForecast(forecasts: InsertDailyForecast[]): Promise<DailyForecast[]> {
    const result: DailyForecast[] = [];
    
    for (const forecast of forecasts) {
      const id = this.currentDailyId++;
      const newForecast: DailyForecast = {
        ...forecast,
        id,
        lastUpdated: new Date(),
      };
      result.push(newForecast);
    }
    
    if (result.length > 0) {
      const city = result[0].city.toLowerCase();
      this.dailyForecastMap.set(city, result);
    }
    
    return result;
  }

  async clearDailyForecast(city: string): Promise<void> {
    this.dailyForecastMap.delete(city.toLowerCase());
  }
}

export const storage = new MemStorage();
