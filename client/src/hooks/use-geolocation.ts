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

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      setLoading(false);
      return;
    }

    const success = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      
      try {
        // Get city name from reverse geocoding using a public API
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        
        if (response.ok) {
          const data = await response.json();
          setLocation({
            latitude,
            longitude,
            city: data.city || data.locality || data.countryName || "Unknown Location",
          });
        } else {
          setLocation({ latitude, longitude, city: "Unknown Location" });
        }
      } catch (geocodeError) {
        // If reverse geocoding fails, still use the coordinates
        setLocation({ latitude, longitude, city: "Unknown Location" });
      }
      
      setLoading(false);
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = "Unable to get your location";
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location access denied by user";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information is unavailable";
          break;
        case error.TIMEOUT:
          errorMessage = "Location request timed out";
          break;
      }
      
      setError(errorMessage);
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(success, handleError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5 * 60 * 1000, // 5 minutes
    });
  }, []);

  return { location, error, loading };
}
