import { useEffect, useState } from 'react';

interface WeatherVideoBackgroundProps {
  weatherTheme: string;
}

export default function WeatherVideoBackground({ weatherTheme }: WeatherVideoBackgroundProps) {
  const [hasVideo, setHasVideo] = useState(false);

  // Video slots - add your video files to the public/videos/ folder
  const getVideoSrc = (theme: string): string | null => {
    const videoMap: Record<string, string> = {
      'sunny': '/videos/sunny.mp4',
      'cloudy': '/videos/cloudy.mp4', 
      'rainy': '/videos/rainy.mp4',
      'snowy': '/videos/snowy.mp4',
      'stormy': '/videos/stormy.mp4',
      'foggy': '/videos/foggy.mp4',
      'windy': '/videos/windy.mp4',
      'clear-night': '/videos/clear-night.mp4',
      'partly-cloudy': '/videos/partly-cloudy.mp4',
      'thunderstorm': '/videos/thunderstorm.mp4',
      'drizzle': '/videos/drizzle.mp4',
      'mist': '/videos/mist.mp4'
    };
    
    return videoMap[theme] || null;
  };

  // Fallback gradient colors for each weather condition
  const getBackgroundGradient = (theme: string): string => {
    const gradientMap: Record<string, string> = {
      'sunny': 'linear-gradient(135deg, #FFB347 0%, #FF8C42 50%, #FF6B35 100%)',
      'cloudy': 'linear-gradient(135deg, #95A5A6 0%, #7F8C8D 50%, #5D6D7E 100%)',
      'rainy': 'linear-gradient(135deg, #4A90E2 0%, #357ABD 50%, #2E86AB 100%)',
      'snowy': 'linear-gradient(135deg, #E8F4FD 0%, #D6EAF8 50%, #AED6F1 100%)',
      'stormy': 'linear-gradient(135deg, #566573 0%, #34495E 50%, #2C3E50 100%)',
      'foggy': 'linear-gradient(135deg, #BDC3C7 0%, #95A5A6 50%, #7F8C8D 100%)',
      'windy': 'linear-gradient(135deg, #85C1E9 0%, #5DADE2 50%, #3498DB 100%)',
      'clear-night': 'linear-gradient(135deg, #2C3E50 0%, #34495E 50%, #1A252F 100%)',
      'partly-cloudy': 'linear-gradient(135deg, #F7DC6F 0%, #F4D03F 50%, #F1C40F 100%)',
      'thunderstorm': 'linear-gradient(135deg, #5D6D7E 0%, #34495E 50%, #212F3D 100%)',
      'drizzle': 'linear-gradient(135deg, #7FB3D3 0%, #5DADE2 50%, #3498DB 100%)',
      'mist': 'linear-gradient(135deg, #D5DBDB 0%, #AEB6BF 50%, #85929E 100%)'
    };
    
    return gradientMap[theme] || gradientMap['sunny'];
  };

  const videoSrc = getVideoSrc(weatherTheme);
  const backgroundGradient = getBackgroundGradient(weatherTheme);

  useEffect(() => {
    if (videoSrc) {
      // Check if video file exists by attempting to load it
      const checkVideo = async () => {
        try {
          const response = await fetch(videoSrc, { method: 'HEAD' });
          setHasVideo(response.ok);
        } catch {
          setHasVideo(false);
        }
      };
      checkVideo();
    } else {
      setHasVideo(false);
    }
  }, [videoSrc]);

  return (
    <div className="fixed inset-0 w-full h-full -z-10">
      {hasVideo && videoSrc ? (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
        />
      ) : (
        <div
          className="absolute inset-0 w-full h-full"
          style={{ background: backgroundGradient }}
        />
      )}
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
}