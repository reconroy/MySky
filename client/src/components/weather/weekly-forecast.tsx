import { motion } from "framer-motion";
import { getWeatherIcon } from "@/lib/weather-themes";
import type { DailyForecast } from "@shared/schema";

interface WeeklyForecastProps {
  forecast: DailyForecast[];
}

export default function WeeklyForecast({ forecast }: WeeklyForecastProps) {
  const getDayName = (date: Date, index: number) => {
    if (index === 0) return "Today";
    if (index === 1) return "Tomorrow";
    
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getTempProgress = (min: number, max: number, globalMin: number, globalMax: number) => {
    const range = globalMax - globalMin;
    if (range === 0) return 75; // Default if all temps are the same
    return ((max - globalMin) / range) * 100;
  };

  // Calculate global min/max for progress bars
  const globalMin = Math.min(...forecast.map(day => day.tempMin));
  const globalMax = Math.max(...forecast.map(day => day.tempMax));

  return (
    <div className="w-full max-w-4xl">
      <motion.h3
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.0 }}
        className="text-white text-base sm:text-lg font-semibold mb-3 sm:mb-4 px-2"
      >
        7-Day Forecast
      </motion.h3>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="glassmorphism rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 slide-up"
      >
        {forecast.map((day, index) => {
          const iconClass = getWeatherIcon(day.weatherMain, day.weatherIcon);
          const dayName = getDayName(new Date(day.date), index);
          const tempProgress = getTempProgress(day.tempMin, day.tempMax, globalMin, globalMax);

          return (
            <motion.div
              key={`${day.date}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + (index * 0.1) }}
              className="flex items-center justify-between py-2 sm:py-3 border-b border-white/10 last:border-b-0 hover:bg-white/5 rounded-lg px-1 sm:px-2 transition-all duration-200"
            >
              {/* Left section - Day and Weather */}
              <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-1 min-w-0">
                <p className="text-white font-medium text-xs sm:text-sm lg:text-base w-12 sm:w-16 lg:w-20 text-left truncate">
                  {dayName}
                </p>
                <i className={`${iconClass} text-sm sm:text-lg lg:text-xl w-4 sm:w-5 lg:w-6 text-center flex-shrink-0`} />
                <p className="text-white/70 capitalize text-xs sm:text-sm lg:text-base flex-1 truncate min-w-0">
                  {day.weatherDescription}
                </p>
              </div>
              
              {/* Right section - Temperature display */}
              <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
                {/* Min temperature */}
                <span className="text-white/70 text-xs sm:text-sm lg:text-base w-6 sm:w-7 lg:w-8 text-right">
                  {Math.round(day.tempMin)}°
                </span>
                
                {/* Temperature progress bar */}
                <div className="w-12 sm:w-16 lg:w-20 h-1.5 sm:h-2 bg-white/20 rounded-full overflow-hidden flex-shrink-0">
                  <div 
                    className="h-full bg-white/60 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(10, Math.min(100, tempProgress))}%` }}
                  />
                </div>
                
                {/* Max temperature */}
                <span className="text-white font-semibold text-xs sm:text-sm lg:text-base w-6 sm:w-7 lg:w-8 text-left">
                  {Math.round(day.tempMax)}°
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
