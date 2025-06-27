import { useEffect, useState } from "react";

interface WeatherParticlesProps {
  weatherTheme: string;
}

export default function WeatherParticles({ weatherTheme }: WeatherParticlesProps) {
  const [particles, setParticles] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      const particleCount = getParticleCount(weatherTheme);
      const newParticles: JSX.Element[] = [];

      for (let i = 0; i < particleCount; i++) {
        const particle = createParticle(weatherTheme, i);
        if (particle) {
          newParticles.push(particle);
        }
      }

      setParticles(newParticles);
    };

    generateParticles();
  }, [weatherTheme]);

  const getParticleCount = (theme: string): number => {
    switch (theme) {
      case 'rainy':
        return 80;
      case 'stormy':
        return 120;
      case 'sunny':
        return 30;
      case 'cloudy':
        return 40;
      case 'night':
        return 20;
      default:
        return 30;
    }
  };

  const createParticle = (theme: string, index: number): JSX.Element | null => {
    const left = Math.random() * 100;
    const animationDelay = Math.random() * 3;
    const animationDuration = getAnimationDuration(theme);

    const baseStyle = {
      left: `${left}%`,
      animationDelay: `${animationDelay}s`,
      animationDuration: `${animationDuration}s`,
    };

    switch (theme) {
      case 'rainy':
      case 'stormy':
        return (
          <div
            key={`rain-${index}`}
            className="weather-particle rain-drop"
            style={{
              ...baseStyle,
              animationDuration: `${0.5 + Math.random() * 0.5}s`,
            }}
          />
        );

      case 'sunny':
        return (
          <div
            key={`sun-${index}`}
            className="weather-particle sun-particle"
            style={{
              ...baseStyle,
              top: `${10 + Math.random() * 80}%`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        );

      case 'cloudy':
        return (
          <div
            key={`cloud-${index}`}
            className="weather-particle cloud-particle"
            style={{
              ...baseStyle,
              top: `${5 + Math.random() * 30}%`,
              animationDuration: `${6 + Math.random() * 6}s`,
            }}
          />
        );

      case 'night':
        return (
          <div
            key={`star-${index}`}
            className="weather-particle"
            style={{
              ...baseStyle,
              top: `${Math.random() * 50}%`,
              width: '3px',
              height: '3px',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '50%',
              boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
            }}
          />
        );

      default:
        return null;
    }
  };

  const getAnimationDuration = (theme: string): number => {
    switch (theme) {
      case 'rainy':
      case 'stormy':
        return 0.8;
      case 'sunny':
        return 6;
      case 'cloudy':
        return 8;
      case 'night':
        return 3;
      default:
        return 4;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles}
    </div>
  );
}