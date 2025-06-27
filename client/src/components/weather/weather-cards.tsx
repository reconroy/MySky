import { motion } from "framer-motion";
import { Eye, Droplets, Wind, Thermometer } from "lucide-react";
import type { WeatherData } from "@shared/schema";

interface WeatherCardsProps {
  weather: WeatherData;
}

export default function WeatherCards({ weather }: WeatherCardsProps) {
  const cards = [
    {
      icon: Eye,
      label: "Visibility",
      value: `${weather.visibility} km`,
      delay: 0.1,
    },
    {
      icon: Droplets,
      label: "Humidity",
      value: `${weather.humidity}%`,
      delay: 0.2,
    },
    {
      icon: Wind,
      label: "Wind Speed",
      value: `${Math.round(weather.windSpeed)} km/h`,
      delay: 0.3,
    },
    {
      icon: Thermometer,
      label: "Feels Like",
      value: `${Math.round(weather.feelsLike)}°C`,
      delay: 0.4,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: card.delay, duration: 0.6 }}
          className="glassmorphism rounded-2xl p-4 text-center slide-up hover:bg-white/20 transition-all duration-300"
        >
          <card.icon className="w-6 h-6 text-white/70 mx-auto mb-2" />
          <p className="text-white/70 text-sm">{card.label}</p>
          <p className="text-white text-lg font-semibold">{card.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
