import { useState, useEffect } from "react";

interface GeolocationState {
  latitude?: number;
  longitude?: number;
  city?: string;
}

export function useGeolocation() {
  const [location, setLocation] = useState<GeolocationState>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  const getLocationWithFallback = async () => {
    // First, try to get user's location
    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false, // Use lower accuracy for faster response
            timeout: 10000,
            maximumAge: 10 * 60 * 1000, // 10 minutes
          });
        });

        const { latitude, longitude } = position.coords;
        
        try {
          // Get city name from reverse geocoding
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          
          if (response.ok) {
            const data = await response.json();
            setLocation({
              latitude,
              longitude,
              city: data.city || data.locality || data.countryName || "Your Location",
            });
          } else {
            setLocation({ latitude, longitude, city: "Your Location" });
          }
        } catch (geocodeError) {
          setLocation({ latitude, longitude, city: "Your Location" });
        }
      } catch (geoError) {
        // If geolocation fails, try IP-based location as fallback
        console.log("Geolocation failed, trying IP-based location...");
        await getLocationFromIP();
      }
    } else {
      // Browser doesn't support geolocation, use IP-based location
      await getLocationFromIP();
    }
    
    setLoading(false);
  };

  const getLocationFromIP = async () => {
    try {
      // Use IP geolocation as fallback
      const response = await fetch('https://ipapi.co/json/');
      
      if (response.ok) {
        const data = await response.json();
        if (data.latitude && data.longitude) {
          setLocation({
            latitude: data.latitude,
            longitude: data.longitude,
            city: data.city || data.region || data.country_name || "Demo Location",
          });
          return;
        }
      }
    } catch (ipError) {
      console.log("IP-based location failed, using demo location");
    }
    
    // Final fallback - use a demo location (New York City)
    setLocation({
      latitude: 40.7128,
      longitude: -74.0060,
      city: "New York City",
    });
  };

  useEffect(() => {
    getLocationWithFallback();
  }, []);

  const retry = () => {
    setError(undefined);
    setLoading(true);
    getLocationWithFallback();
  };

  return { location, error, loading, retry };
}
