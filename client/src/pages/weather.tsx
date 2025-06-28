import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWeather } from "@/hooks/use-weather";
import { useGeolocation } from "@/hooks/use-geolocation";
import { getWeatherTheme } from "@/lib/weather-themes";
import WeatherVideoBackground from "@/components/weather/weather-video-background";
import WeatherDisplay from "@/components/weather/weather-display";
import WeatherCards from "@/components/weather/weather-cards";
import HourlyForecast from "@/components/weather/hourly-forecast";
import WeeklyForecast from "@/components/weather/weekly-forecast";
import LoadingOverlay from "@/components/weather/loading-overlay";
import LocationSelector from "@/components/weather/location-selector";
import WeatherParticles from "@/components/weather/weather-particles";
import { RefreshCw, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WeatherPage() {
  const [weatherTheme, setWeatherTheme] = useState("sunny");
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);
  const [customLocation, setCustomLocation] = useState<{ lat: number; lon: number; city: string } | null>(null);
  
  const { location, error: locationError, loading: locationLoading } = useGeolocation();

  // Use custom location if selected, otherwise use detected location
  const activeLocation = customLocation || location;
  
  // Extract coordinates properly from either format
  const lat = customLocation?.lat || location?.latitude;
  const lon = customLocation?.lon || location?.longitude;
  const city = customLocation?.city || location?.city;
  
  const {
    currentWeather,
    hourlyForecast,
    dailyForecast,
    isLoading,
    error,
    refetch,
  } = useWeather(lat, lon, city);

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

  const handleLocationSelect = (lat: number, lon: number, city: string) => {
    setCustomLocation({ lat, lon, city });
    refetch();
  };

  const handleLocationReset = () => {
    setCustomLocation(null);
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
      <WeatherVideoBackground weatherTheme={weatherTheme} />
      <WeatherParticles weatherTheme={weatherTheme} />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center p-6"
        >
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLocationReset}
              className="text-white hover:text-white/80 transition-colors duration-200"
              title="Return to current location"
            >
              <i className="fas fa-location-dot text-xl" />
            </button>
            <div>
              <h1 className="text-white font-semibold text-lg">
                {currentWeather?.city || "Loading..."}
              </h1>
              <p className="text-white/70 text-sm">
                {currentWeather?.country && currentWeather.country.trim() 
                  ? currentWeather.country 
                  : "Current Location"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <h2 className="text-white font-bold text-xl tracking-wide">
                Mysky
              </h2>
              <p className="text-white/60 text-xs font-medium">
                Weather App
              </p>
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
                onClick={() => setIsLocationSelectorOpen(true)}
                className="glassmorphism rounded-full p-3 hover:bg-white/20 transition-all duration-300 text-white border-0"
              >
                <MapPin className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col items-center justify-start min-h-full px-6 py-6">
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
          </div>
        </main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center p-4 mt-auto"
        >
          <div className="space-y-1">
            <p className="text-white/50 text-xs">
              Weather data provided by Open-Meteo
            </p>
            <p className="text-white/40 text-xs">
              Version 1.0.0 • Built with React & TypeScript
            </p>
            <p className="text-white/30 text-xs">
              Last updated: {currentWeather?.lastUpdated ? 
                new Date(currentWeather.lastUpdated).toLocaleTimeString() : 
                "Loading..."
              }
            </p>
            <p className="text-white/40 text-xs">
              Created by{" "}
              <a 
                href="https://jayantroy.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors duration-200 underline decoration-white/30 hover:decoration-white/60"
              >
                Jayant Roy
              </a>
            </p>
          </div>
        </motion.footer>
      </div>

      <LoadingOverlay isVisible={isInitialLoading} />
      
      <LocationSelector
        isOpen={isLocationSelectorOpen}
        onClose={() => setIsLocationSelectorOpen(false)}
        onLocationSelect={handleLocationSelect}
      />
    </div>
  );
}
