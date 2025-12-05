import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Building2, Map } from "lucide-react";

interface AddressSearchProps {
  onAddressSelect: (address: string, coordinates: [number, number]) => void;
  initialAddress?: string;
}

interface GeocodeFeature {
  id: string;
  place_name: string;
  center: [number, number];
  place_type: string[];
  properties?: {
    category?: string;
    landmark?: boolean;
  };
  text: string;
  context?: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
}

export default function AddressSearch({
  onAddressSelect,
  initialAddress = "",
}: AddressSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<GeocodeFeature[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced autocomplete search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery, true);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const performSearch = async (query: string, isAutocomplete = false) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

      if (!MAPBOX_TOKEN) {
        alert(
          "Mapbox token is missing. Please set VITE_MAPBOX_TOKEN in your .env file"
        );
        setIsSearching(false);
        return;
      }

      // Extract potential POI name from query (e.g., "Starmall" from "Starmall San Jose Del Monte")
      const queryLower = query.toLowerCase();
      const poiKeywords = [
        "mall",
        "starmall",
        "sm",
        "robinsons",
        "ayala",
        "store",
        "restaurant",
        "hotel",
        "market",
        "center",
        "plaza",
      ];
      const hasPOIKeyword = poiKeywords.some((keyword) =>
        queryLower.includes(keyword)
      );

      // Try multiple query variations for better POI discovery
      const queryVariations: string[] = [query];

      if (hasPOIKeyword) {
        // Extract just the POI name (first word or words before location)
        const words = query.split(/\s+/);
        const locationIndicators = [
          "san",
          "jose",
          "del",
          "monte",
          "city",
          "bulacan",
          "philippines",
          "ph",
          "manila",
          "quezon",
        ];
        const poiNameWords: string[] = [];

        for (const word of words) {
          if (locationIndicators.includes(word.toLowerCase())) break;
          poiNameWords.push(word);
        }

        if (poiNameWords.length > 0 && poiNameWords.join(" ") !== query) {
          queryVariations.push(poiNameWords.join(" "));
        }

        // Also try with just the first significant word (often the POI name)
        if (words.length > 0 && words[0].length > 2) {
          queryVariations.push(words[0]);
        }
      }

      // Try Geocoding API with multiple query variations for better POI coverage
      let bestResults: GeocodeFeature[] = [];

      for (const searchQuery of queryVariations) {
        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json`;

        const geocodeParams = new URLSearchParams({
          access_token: MAPBOX_TOKEN,
          limit: "10",
          types: "poi,poi.landmark,address,place",
          proximity: "121.0,14.6", // Bias towards Philippines but don't restrict
          language: "en",
        });

        // For POI searches, don't restrict country to get better results
        // Only add country restriction if query explicitly mentions Philippines
        if (
          searchQuery.toLowerCase().includes("philippines") ||
          searchQuery.toLowerCase().includes(" ph")
        ) {
          geocodeParams.append("country", "PH");
        }

        const geocodeResponse = await fetch(
          `${geocodeUrl}?${geocodeParams.toString()}`
        );

        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();

          if (geocodeData.features && geocodeData.features.length > 0) {
            // Check if we have POI results
            // Also check if the name/text matches common POI keywords (mall, store, etc.)
            const poiResults = geocodeData.features.filter((f: any) => {
              const isPOI =
                f.place_type?.some((t: string) => t.includes("poi")) ||
                f.properties?.category;
              const hasPOIKeywords =
                f.text &&
                /mall|store|restaurant|hotel|market|center|plaza|establishment|shop|starmall|sm|robinsons|ayala/i.test(
                  f.text
                );
              const queryHasPOIKeywords =
                /mall|store|restaurant|hotel|market|center|plaza|establishment|shop|starmall|sm|robinsons|ayala/i.test(
                  query
                );

              // If query has POI keywords, prioritize results that match
              if (queryHasPOIKeywords) {
                return isPOI || hasPOIKeywords;
              }
              return isPOI;
            });

            // Convert to our format
            const features: GeocodeFeature[] = (
              poiResults.length > 0 ? poiResults : geocodeData.features
            ).map((feature: any) => {
              return {
                id: feature.id || `feature-${Date.now()}-${Math.random()}`,
                place_name: feature.place_name || "",
                center: feature.center || feature.geometry.coordinates,
                place_type: feature.place_type || ["place"],
                text: feature.text || feature.properties?.name || "",
                context: feature.context,
                properties: {
                  category: feature.properties?.category || "",
                  landmark:
                    feature.place_type?.includes("poi.landmark") || false,
                },
              };
            });

            // If this query variation found POIs, use it
            if (poiResults.length > 0) {
              bestResults = features;
              break; // Found POIs, stop trying other variations
            } else if (bestResults.length === 0) {
              // Keep first non-POI results as fallback
              bestResults = features;
            }
          }
        }
      }

      // If we found POI results, use them
      if (bestResults.length > 0) {
        // Sort by relevance: POIs first
        const sortedFeatures = bestResults.sort(
          (a: GeocodeFeature, b: GeocodeFeature) => {
            const getPriority = (feature: GeocodeFeature) => {
              if (feature.place_type.some((t) => t.includes("poi"))) return 1;
              if (feature.place_type.some((t) => t.includes("address")))
                return 2;
              if (feature.place_type.some((t) => t.includes("place"))) return 3;
              return 4;
            };
            return getPriority(a) - getPriority(b);
          }
        );

        setResults(sortedFeatures);
        setShowResults(true);
        setSelectedIndex(-1);
        setIsSearching(false);
        return;
      }

      // Fallback to Search Box API if Geocoding API doesn't return good POI results
      const baseUrl = "https://api.mapbox.com/search/searchbox/v1";

      // Build query parameters - remove country restriction for better POI discovery
      const params = new URLSearchParams({
        access_token: MAPBOX_TOKEN,
        q: query,
        limit: "10",
        types: "poi,poi.landmark,address,place", // Prioritize POIs and landmarks first
        language: "en",
      });

      // Add proximity and country if query seems location-specific
      if (
        query.toLowerCase().includes("philippines") ||
        query.toLowerCase().includes("ph")
      ) {
        params.append("country", "PH");
        params.append("proximity", "121.0,14.6");
      } else {
        // For general POI searches, use proximity to Philippines but don't restrict country
        params.append("proximity", "121.0,14.6");
      }

      const response = await fetch(`${baseUrl}/suggest?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Search Box API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Handle Search Box API response format
      if (data.suggestions && data.suggestions.length > 0) {
        // Convert Search Box API format to our GeocodeFeature format
        // Always retrieve full features for POIs to get accurate coordinates and addresses
        const features: GeocodeFeature[] = await Promise.all(
          data.suggestions.map(async (suggestion: any) => {
            let coordinates: [number, number] = [0, 0];
            let fullAddress = "";
            let featureType = suggestion.feature_type ||
              suggestion.place_type || ["place"];
            let featureName =
              suggestion.name || suggestion.text || suggestion.place_name || "";

            // For POIs, always retrieve the full feature to get accurate coordinates
            // The suggest endpoint may not always include coordinates
            if (suggestion.mapbox_id && data.session_token) {
              try {
                const retrieveParams = new URLSearchParams({
                  access_token: MAPBOX_TOKEN,
                  session_token: data.session_token,
                });
                const retrieveResponse = await fetch(
                  `${baseUrl}/retrieve/${
                    suggestion.mapbox_id
                  }?${retrieveParams.toString()}`
                );

                if (retrieveResponse.ok) {
                  const retrieveData = await retrieveResponse.json();
                  if (
                    retrieveData.features &&
                    retrieveData.features.length > 0
                  ) {
                    const feature = retrieveData.features[0];
                    coordinates = [
                      feature.geometry.coordinates[0],
                      feature.geometry.coordinates[1],
                    ];
                    fullAddress =
                      feature.properties?.full_address ||
                      feature.properties?.address ||
                      feature.place_name ||
                      feature.properties?.name ||
                      "";
                    featureType = feature.properties?.feature_type
                      ? [feature.properties.feature_type]
                      : feature.place_type || featureType;
                    featureName =
                      feature.properties?.name || feature.text || featureName;
                  }
                }
              } catch (retrieveError) {
                // Fallback to suggestion data if retrieve fails
                console.warn("Failed to retrieve full feature:", retrieveError);
              }
            }

            // Fallback to suggestion coordinates if retrieve didn't work
            if (coordinates[0] === 0 && coordinates[1] === 0) {
              if (suggestion.coordinates) {
                coordinates = Array.isArray(suggestion.coordinates)
                  ? [suggestion.coordinates[0], suggestion.coordinates[1]]
                  : [
                      suggestion.coordinates.longitude || 0,
                      suggestion.coordinates.latitude || 0,
                    ];
              } else if (suggestion.geometry?.coordinates) {
                coordinates = [
                  suggestion.geometry.coordinates[0],
                  suggestion.geometry.coordinates[1],
                ];
              }
            }

            // Fallback to suggestion address if retrieve didn't provide it
            if (!fullAddress) {
              fullAddress =
                suggestion.full_address ||
                suggestion.address ||
                suggestion.name ||
                suggestion.place_name ||
                "";
            }

            return {
              id:
                suggestion.mapbox_id ||
                suggestion.id ||
                `suggestion-${Date.now()}-${Math.random()}`,
              place_name: fullAddress,
              center: coordinates,
              place_type: Array.isArray(featureType)
                ? featureType
                : [featureType],
              text: featureName,
              context: suggestion.context,
              properties: {
                category:
                  suggestion.category?.[0] ||
                  suggestion.properties?.category ||
                  "",
                landmark:
                  featureType.includes("poi.landmark") ||
                  suggestion.feature_type === "poi.landmark" ||
                  suggestion.properties?.landmark ||
                  false,
              },
            };
          })
        );

        // Filter out results with invalid coordinates
        const validFeatures = features.filter(
          (f) => f.center[0] !== 0 && f.center[1] !== 0
        );

        // Sort results by relevance: POIs first, then addresses, then places
        const sortedFeatures = validFeatures.sort(
          (a: GeocodeFeature, b: GeocodeFeature) => {
            const getPriority = (feature: GeocodeFeature) => {
              // Prioritize POIs and landmarks
              if (feature.place_type.some((t) => t.includes("poi"))) return 1;
              if (feature.place_type.some((t) => t.includes("address")))
                return 2;
              if (feature.place_type.some((t) => t.includes("place"))) return 3;
              return 4;
            };
            return getPriority(a) - getPriority(b);
          }
        );

        if (sortedFeatures.length > 0) {
          setResults(sortedFeatures);
          setShowResults(true);
          setSelectedIndex(-1);
        } else {
          // If no valid features, try fallback
          throw new Error("No valid features found");
        }
      } else {
        setResults([]);
        if (!isAutocomplete) {
          alert("Address not found. Please try a different search.");
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      // Final fallback to Geocoding API if all else fails
      try {
        const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";
        const fallbackUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json`;
        const fallbackParams = new URLSearchParams({
          access_token: MAPBOX_TOKEN,
          limit: "10",
          types: "poi,poi.landmark,address,place",
          proximity: "121.0,14.6",
          language: "en",
        });

        // Only restrict to PH if query seems location-specific
        if (
          !query.toLowerCase().includes("philippines") &&
          !query.toLowerCase().includes("ph")
        ) {
          // Don't restrict country for better POI discovery
        } else {
          fallbackParams.append("country", "PH");
        }

        const fallbackResponse = await fetch(
          `${fallbackUrl}?${fallbackParams.toString()}`
        );
        const fallbackData = await fallbackResponse.json();

        if (fallbackData.features && fallbackData.features.length > 0) {
          // Prioritize POIs in fallback results
          const poiResults = fallbackData.features.filter(
            (f: any) =>
              f.place_type?.some((t: string) => t.includes("poi")) ||
              f.properties?.category
          );

          const featuresToUse =
            poiResults.length > 0 ? poiResults : fallbackData.features;

          const sortedFeatures = featuresToUse
            .map((feature: any) => ({
              id: feature.id || `feature-${Date.now()}-${Math.random()}`,
              place_name: feature.place_name || "",
              center: feature.center || feature.geometry.coordinates,
              place_type: feature.place_type || ["place"],
              text: feature.text || feature.properties?.name || "",
              context: feature.context,
              properties: {
                category: feature.properties?.category || "",
                landmark: feature.place_type?.includes("poi.landmark") || false,
              },
            }))
            .sort((a: GeocodeFeature, b: GeocodeFeature) => {
              const getPriority = (feature: GeocodeFeature) => {
                if (feature.place_type.some((t) => t.includes("poi"))) return 1;
                if (feature.place_type.some((t) => t.includes("address")))
                  return 2;
                if (feature.place_type.some((t) => t.includes("place")))
                  return 3;
                return 4;
              };
              return getPriority(a) - getPriority(b);
            });

          setResults(sortedFeatures);
          setShowResults(true);
          setSelectedIndex(-1);
        } else {
          setResults([]);
          if (!isAutocomplete) {
            alert("Address not found. Please try a different search.");
          }
        }
      } catch (fallbackError) {
        console.error("Fallback search error:", fallbackError);
        if (!isAutocomplete) {
          alert("Error searching for address. Please try again.");
        }
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    performSearch(searchQuery, false);
  };

  const handleSelectResult = (feature: GeocodeFeature) => {
    const [lng, lat] = feature.center;
    onAddressSelect(feature.place_name, [lng, lat]);
    setSearchQuery(feature.place_name);
    setShowResults(false);
    setResults([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelectResult(results[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setShowResults(false);
    }
  };

  const getResultIcon = (feature: GeocodeFeature) => {
    if (feature.place_type.includes("poi")) {
      return <Building2 className="w-4 h-4" />;
    }
    if (feature.place_type.includes("address")) {
      return <MapPin className="w-4 h-4" />;
    }
    return <Map className="w-4 h-4" />;
  };

  const getResultTypeLabel = (feature: GeocodeFeature) => {
    if (feature.place_type.includes("poi")) {
      return "Place";
    }
    if (feature.place_type.includes("address")) {
      return "Address";
    }
    if (feature.place_type.includes("place")) {
      return "City/Area";
    }
    return "Location";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Address Search
        </h3>
      </div>
      <div className="relative" ref={containerRef}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => {
                if (results.length > 0) {
                  setShowResults(true);
                }
              }}
              placeholder="Search for malls, addresses, places..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Results Dropdown */}
        {showResults && results.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-96 overflow-y-auto">
            {results.map((feature, index) => (
              <button
                key={feature.id}
                onClick={() => handleSelectResult(feature)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
                  selectedIndex === index
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-blue-500 flex-shrink-0">
                    {getResultIcon(feature)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {feature.text}
                      </p>
                      <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                        {getResultTypeLabel(feature)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                      {feature.place_name.replace(feature.text + ", ", "")}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Search for malls, buildings, addresses, or places in the Philippines.
        {results.length > 0 &&
          !results.some((r) => r.place_type.some((t) => t.includes("poi"))) && (
            <span className="block mt-1 text-amber-600 dark:text-amber-400">
              💡 Tip: If a specific POI isn't found, try searching for a nearby
              address or street name, then manually adjust the marker on the
              map.
            </span>
          )}
      </p>
    </div>
  );
}
