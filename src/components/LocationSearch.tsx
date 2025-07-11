import React, { useState, useEffect } from 'react';
import { MapPin, Search } from 'lucide-react';

interface LocationSearchProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
  placeholder?: string;
  className?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ 
  onLocationSelect, 
  placeholder = "Search for location...",
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get user's current location
  const getCurrentLocation = () => {
    setIsLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Reverse geocoding to get address
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`
            );
            const data = await response.json();
            
            const address = data.results[0]?.formatted || `${latitude}, ${longitude}`;
            
            onLocationSelect({ latitude, longitude, address });
            setSearchQuery(address);
          } catch (error) {
            console.error('Reverse geocoding error:', error);
            onLocationSelect({ 
              latitude, 
              longitude, 
              address: `${latitude}, ${longitude}` 
            });
            setSearchQuery(`${latitude}, ${longitude}`);
          }
          
          setIsLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsLoading(false);
          alert('Unable to get your location. Please search manually.');
        }
      );
    } else {
      setIsLoading(false);
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Search for locations (using a simple Ghana cities list for demo)
  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    // Demo Ghana locations - in production, use a proper geocoding service
    const ghanaLocations = [
      { name: 'Accra', region: 'Greater Accra', lat: 5.6037, lng: -0.1870 },
      { name: 'Kumasi', region: 'Ashanti', lat: 6.6885, lng: -1.6244 },
      { name: 'Tamale', region: 'Northern', lat: 9.4034, lng: -0.8424 },
      { name: 'Cape Coast', region: 'Central', lat: 5.1053, lng: -1.2466 },
      { name: 'Sekondi-Takoradi', region: 'Western', lat: 4.9344, lng: -1.7133 },
      { name: 'Ho', region: 'Volta', lat: 6.6111, lng: 0.4708 },
      { name: 'Koforidua', region: 'Eastern', lat: 6.0940, lng: -0.2571 },
      { name: 'Sunyani', region: 'Brong Ahafo', lat: 7.3392, lng: -2.3265 },
      { name: 'Wa', region: 'Upper West', lat: 10.0601, lng: -2.5057 },
      { name: 'Bolgatanga', region: 'Upper East', lat: 10.7856, lng: -0.8513 },
      { name: 'Tema', region: 'Greater Accra', lat: 5.6698, lng: 0.0166 },
      { name: 'Madina', region: 'Greater Accra', lat: 5.6837, lng: -0.1676 },
      { name: 'Kasoa', region: 'Central', lat: 5.5320, lng: -0.4170 },
      { name: 'Obuasi', region: 'Ashanti', lat: 6.2027, lng: -1.6665 },
      { name: 'Techiman', region: 'Brong Ahafo', lat: 7.5931, lng: -1.9303 }
    ];

    const filtered = ghanaLocations.filter(location =>
      location.name.toLowerCase().includes(query.toLowerCase()) ||
      location.region.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(filtered.slice(0, 5));
    setShowSuggestions(true);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocations(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSuggestionClick = (suggestion: any) => {
    const address = `${suggestion.name}, ${suggestion.region}`;
    setSearchQuery(address);
    setShowSuggestions(false);
    onLocationSelect({
      latitude: suggestion.lat,
      longitude: suggestion.lng,
      address
    });
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-10 pr-12 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-blue-600 hover:text-blue-700 disabled:opacity-50"
          title="Use current location"
        >
          <MapPin className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900">{suggestion.name}</div>
                  <div className="text-sm text-gray-500">{suggestion.region} Region</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;