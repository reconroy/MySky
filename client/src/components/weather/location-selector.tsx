import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (lat: number, lon: number, city: string) => void;
}

interface SearchResult {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  admin1?: string;
}

export default function LocationSelector({ isOpen, onClose, onLocationSelect }: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      }
    } catch (error) {
      console.error("Location search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchLocations(query);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  const handleLocationSelect = (result: SearchResult) => {
    onLocationSelect(result.latitude, result.longitude, result.name);
    setSearchQuery("");
    setSearchResults([]);
    onClose();
  };

  const popularCities = [
    { name: "New York City", country: "United States", latitude: 40.7128, longitude: -74.0060 },
    { name: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278 },
    { name: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503 },
    { name: "Paris", country: "France", latitude: 48.8566, longitude: 2.3522 },
    { name: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093 },
    { name: "Dubai", country: "United Arab Emirates", latitude: 25.2048, longitude: 55.2708 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="glassmorphism rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-semibold">Select Location</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
              <Input
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search for a city..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-xl"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {searchQuery && searchResults.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-white/80 text-sm font-medium mb-3">Search Results</h3>
                  <div className="space-y-2">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => handleLocationSelect(result)}
                        className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-white/60 mr-3" />
                          <div>
                            <p className="text-white font-medium">{result.name}</p>
                            <p className="text-white/60 text-sm">
                              {result.admin1 && `${result.admin1}, `}{result.country}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!searchQuery && (
                <div>
                  <h3 className="text-white/80 text-sm font-medium mb-3">Popular Cities</h3>
                  <div className="space-y-2">
                    {popularCities.map((city, index) => (
                      <button
                        key={index}
                        onClick={() => handleLocationSelect(city)}
                        className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-white/60 mr-3" />
                          <div>
                            <p className="text-white font-medium">{city.name}</p>
                            <p className="text-white/60 text-sm">{city.country}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isSearching && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                  <span className="text-white/70 ml-3">Searching...</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}