export function getWeatherTheme(weatherMain: string, weatherIcon: string): string {
  const isNight = weatherIcon.endsWith('n');
  
  if (isNight) {
    return 'night';
  }
  
  switch (weatherMain.toLowerCase()) {
    case 'clear':
      return 'sunny';
    case 'rain':
    case 'drizzle':
      return 'rainy';
    case 'clouds':
      return 'cloudy';
    case 'thunderstorm':
      return 'stormy';
    case 'snow':
      return 'cloudy'; // Use cloudy theme for snow
    case 'mist':
    case 'fog':
    case 'haze':
      return 'cloudy';
    default:
      return 'sunny';
  }
}

export function getWeatherIcon(weatherMain: string, weatherIcon: string): string {
  const isNight = weatherIcon.endsWith('n');
  
  switch (weatherMain.toLowerCase()) {
    case 'clear':
      return isNight ? 'fas fa-moon text-blue-200' : 'fas fa-sun text-yellow-300';
    case 'clouds':
      return isNight ? 'fas fa-cloud text-gray-300' : 'fas fa-cloud-sun text-yellow-200';
    case 'rain':
      return 'fas fa-cloud-rain text-blue-300';
    case 'drizzle':
      return 'fas fa-cloud-drizzle text-blue-200';
    case 'thunderstorm':
      return 'fas fa-bolt text-yellow-400';
    case 'snow':
      return 'fas fa-snowflake text-blue-100';
    case 'mist':
    case 'fog':
    case 'haze':
      return 'fas fa-smog text-gray-400';
    default:
      return isNight ? 'fas fa-moon text-blue-200' : 'fas fa-sun text-yellow-300';
  }
}

export const weatherThemes = {
  sunny: {
    name: 'Sunny',
    gradient: 'weather-gradient-sunny',
    particleColor: [1, 0.9, 0.3],
    particleCount: 400,
  },
  rainy: {
    name: 'Rainy',
    gradient: 'weather-gradient-rainy',
    particleColor: [0.3, 0.6, 0.9],
    particleCount: 600,
  },
  cloudy: {
    name: 'Cloudy',
    gradient: 'weather-gradient-cloudy',
    particleColor: [0.7, 0.7, 0.8],
    particleCount: 300,
  },
  stormy: {
    name: 'Stormy',
    gradient: 'weather-gradient-stormy',
    particleColor: [0.2, 0.2, 0.4],
    particleCount: 800,
  },
  night: {
    name: 'Night',
    gradient: 'weather-gradient-night',
    particleColor: [0.1, 0.1, 0.3],
    particleCount: 200,
  },
};
