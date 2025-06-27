import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWeather } from "@/hooks/use-weather";
import { useGeolocation } from "@/hooks/use-geolocation";
import { getWeatherTheme } from "@/lib/weather-themes";
import ThreeBackground from "@/components/weather/three-background";
import WeatherDisplay from "@/components/weather/weather-display";
import WeatherCards from "@/components/weather/weather-cards";
import HourlyForecast from "@/components/weather/hourly-forecast";
import WeeklyForecast from "@/components/weather/weekly-forecast";
import LoadingOverlay from "@/components/weather/loading-overlay";
import { RefreshCw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WeatherPage() {
  const [weatherTheme, setWeatherTheme] = useState("sunny");
  const { location, error: locationError, loading: locationLoading } = useGeolocation();
  
  const {
    currentWeather,
    hourlyForecast,
    dailyForecast,
    isLoading,
    error,
    refetch,
  } = useWeather(location?.latitude, location?.longitude, location?.city);

  // Update theme based on weather conditions
  useEffect(() => {
    if (currentWeather) {
      const theme = getWeatherTheme(currentWeather.weatherMain, currentWeather.weatherIcon);
      setWeatherTheme(theme);
      
      // Update body class for background gradient
      document.body.className = `min-h-screen weather-gradient-${theme} relative overflow-x-hidden font-sans antialiased`;
    }
  }, [currentWeather]);

  const isInitialLoading = locationLoading || (isLoading && !currentWeather);

  const handleRefresh = () => {
    refetch();
  };

  if (locationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold mb-4">Location Access Required</h1>
          <p className="text-gray-300 mb-4">
            Please enable location access to get weather information for your area.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold mb-4">Weather Service Unavailable</h1>
          <p className="text-gray-300 mb-4">
            Unable to fetch weather data. Please check your connection and try again.
          </p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen">
      <ThreeBackground weatherTheme={weatherTheme} />
      
      {/* Weather Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`weather-particle w-${i % 3 + 1} h-${i % 3 + 1} bg-yellow-300 opacity-60`}
            style={{
              top: `${20 + (i * 15)}%`,
              left: `${15 + (i * 20)}%`,
              animationDelay: `${i * -1}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center p-6"
        >
          <div className="flex items-center space-x-3">
            <div className="glassmorphism rounded-full p-2">
              <i className="fas fa-location-dot text-white text-lg" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg">
                {currentWeather?.city || "Loading..."}
              </h1>
              <p className="text-white/70 text-sm">
                {currentWeather?.country || "Getting location..."}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="glassmorphism rounded-full p-3 hover:bg-white/20 transition-all duration-300 text-white border-0"
              disabled={isLoading}
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="glassmorphism rounded-full p-3 hover:bg-white/20 transition-all duration-300 text-white border-0"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-6">
          {currentWeather && (
            <>
              <WeatherDisplay weather={currentWeather} />
              <WeatherCards weather={currentWeather} />
              {hourlyForecast && hourlyForecast.length > 0 && (
                <HourlyForecast forecast={hourlyForecast} />
              )}
              {dailyForecast && dailyForecast.length > 0 && (
                <WeeklyForecast forecast={dailyForecast} />
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center p-6"
        >
          <p className="text-white/60 text-sm">
            Last updated: {currentWeather?.lastUpdated ? 
              new Date(currentWeather.lastUpdated).toLocaleTimeString() : 
              "Loading..."
            }
          </p>
          <p className="text-white/40 text-xs mt-1">
            Weather data provided by OpenWeatherMap
          </p>
        </motion.footer>
      </div>

      <LoadingOverlay isVisible={isInitialLoading} />
    </div>
  );
}
