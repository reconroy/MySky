import { useQuery } from "@tanstack/react-query";
import type { WeatherData, HourlyForecast, DailyForecast } from "@shared/schema";

export function useWeather(latitude?: number, longitude?: number, city?: string) {
  const weatherQuery = useQuery<WeatherData>({
    queryKey: ["/api/weather", { lat: latitude, lon: longitude, city }],
    enabled: !!(latitude && longitude),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  const hourlyQuery = useQuery<HourlyForecast[]>({
    queryKey: ["/api/weather/hourly", { lat: latitude, lon: longitude, city }],
    enabled: !!(latitude && longitude),
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: 60 * 60 * 1000, // Refetch every hour
  });

  const dailyQuery = useQuery<DailyForecast[]>({
    queryKey: ["/api/weather/daily", { lat: latitude, lon: longitude, city }],
    enabled: !!(latitude && longitude),
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
    refetchInterval: 6 * 60 * 60 * 1000, // Refetch every 6 hours
  });

  const refetch = () => {
    weatherQuery.refetch();
    hourlyQuery.refetch();
    dailyQuery.refetch();
  };

  return {
    currentWeather: weatherQuery.data,
    hourlyForecast: hourlyQuery.data,
    dailyForecast: dailyQuery.data,
    isLoading: weatherQuery.isLoading || hourlyQuery.isLoading || dailyQuery.isLoading,
    error: weatherQuery.error || hourlyQuery.error || dailyQuery.error,
    refetch,
  };
}
