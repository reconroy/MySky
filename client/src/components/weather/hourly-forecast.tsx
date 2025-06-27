import { motion } from "framer-motion";
import { getWeatherIcon } from "@/lib/weather-themes";
import type { HourlyForecast } from "@shared/schema";

interface HourlyForecastProps {
  forecast: HourlyForecast[];
}

export default function HourlyForecast({ forecast }: HourlyForecastProps) {
  return (
    <div className="w-full max-w-4xl mb-8">
      <motion.h3
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="text-white text-lg font-semibold mb-4 px-2"
      >
        Hourly Forecast
      </motion.h3>
      
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {forecast.map((hour, index) => {
          const iconClass = getWeatherIcon(hour.weatherMain, hour.weatherIcon);
          const time = new Date(hour.dateTime).toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true,
          });

          return (
            <motion.div
              key={`${hour.dateTime}-${index}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (index * 0.1), duration: 0.6 }}
              className="glassmorphism rounded-2xl p-4 min-w-[100px] text-center slide-up hover:bg-white/20 transition-all duration-300 flex-shrink-0"
            >
              <p className="text-white/70 text-sm mb-2">{time}</p>
              <i className={`${iconClass} text-2xl mb-2`} />
              <p className="text-white font-semibold">
                {Math.round(hour.temperature)}°
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
