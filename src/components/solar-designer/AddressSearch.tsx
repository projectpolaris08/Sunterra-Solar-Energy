import { useState } from "react";
import { Search, MapPin } from "lucide-react";

interface AddressSearchProps {
  onAddressSelect: (address: string, coordinates: [number, number]) => void;
  initialAddress?: string;
}

export default function AddressSearch({
  onAddressSelect,
  initialAddress = "",
}: AddressSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Use Mapbox Geocoding API
      const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

      if (!MAPBOX_TOKEN) {
        alert(
          "Mapbox token is missing. Please set VITE_MAPBOX_TOKEN in your .env file"
        );
        setIsSearching(false);
        return;
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${MAPBOX_TOKEN}&country=PH&limit=1`
      );

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center;
        const address = feature.place_name;

        onAddressSelect(address, [lng, lat]);
        setSearchQuery(address);
      } else {
        alert("Address not found. Please try a different search.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert("Error searching for address. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Address Search
        </h3>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter address in Philippines..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSearching ? "Searching..." : "Search"}
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Search for an address in the Philippines to view the location on the map
      </p>
    </div>
  );
}
