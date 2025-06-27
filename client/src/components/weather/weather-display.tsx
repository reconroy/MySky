import { motion } from "framer-motion";
import { getWeatherIcon } from "@/lib/weather-themes";
import type { WeatherData } from "@shared/schema";

interface WeatherDisplayProps {
  weather: WeatherData;
}

export default function WeatherDisplay({ weather }: WeatherDisplayProps) {
  const iconClass = getWeatherIcon(weather.weatherMain, weather.weatherIcon);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="text-center mb-8 slide-up"
    >
      {/* Large Weather Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mb-6 pulse-glow"
      >
        <i className={`${iconClass} text-9xl text-white weather-icon-large`} />
      </motion.div>
      
      {/* Temperature Display */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-4"
      >
        <span className="text-8xl font-light text-white">
          {Math.round(weather.temperature)}
        </span>
        <span className="text-4xl font-light text-white/80">°C</span>
      </motion.div>
      
      {/* Weather Description */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-2xl text-white/90 font-medium mb-2 capitalize">
          {weather.weatherDescription}
        </p>
        <p className="text-lg text-white/70">
          {getWeatherDetails(weather.weatherMain)}
        </p>
      </motion.div>
    </motion.div>
  );
}

function getWeatherDetails(weatherMain: string): string {
  const details: Record<string, string> = {
    Clear: "Clear skies with bright sunshine",
    Clouds: "Cloudy skies with scattered clouds",
    Rain: "Rainy weather with precipitation",
    Drizzle: "Light rain with gentle drizzle",
    Thunderstorm: "Stormy weather with thunder and lightning",
    Snow: "Snowy conditions with falling snow",
    Mist: "Misty conditions with reduced visibility",
    Fog: "Foggy weather with low visibility",
    Haze: "Hazy conditions with atmospheric haze",
  };
  
  return details[weatherMain] || "Current weather conditions";
}
