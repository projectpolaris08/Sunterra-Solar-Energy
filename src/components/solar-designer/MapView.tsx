import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { RoofPolygon } from "../../types/solar-design";

interface MapViewProps {
  coordinates: [number, number]; // [lng, lat]
  onCoordinatesChange: (coords: [number, number]) => void;
  roofPolygons: RoofPolygon[];
  onRoofPolygonsChange: (polygons: RoofPolygon[]) => void;
  isDrawing: boolean;
  onDrawingChange: (drawing: boolean) => void;
  onMapReady?: (map: mapboxgl.Map) => void;
  address?: string; // Address label to display on marker
}

// Mapbox token - set VITE_MAPBOX_TOKEN in your .env file
// Get your token from: https://account.mapbox.com/access-tokens/
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

export default function MapView({
  coordinates,
  onCoordinatesChange,
  roofPolygons,
  onRoofPolygonsChange,
  isDrawing,
  onDrawingChange,
  onMapReady,
  address,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const currentPolygon = useRef<RoofPolygon | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const popup = useRef<mapboxgl.Popup | null>(null);
  const [pointCount, setPointCount] = useState<number>(0);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!MAPBOX_TOKEN) {
      console.error(
        "Mapbox token is missing. Please set VITE_MAPBOX_TOKEN in your .env file"
      );
      return;
    }

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/satellite-v9",
        center: coordinates,
        zoom: 18,
      });

      // Wait for map to load
      map.current.on("load", () => {
        // Notify parent that map is ready
        if (onMapReady && map.current) {
          onMapReady(map.current);
        }

        // Add navigation controls
        if (!map.current?.hasControl(new mapboxgl.NavigationControl())) {
          map.current?.addControl(
            new mapboxgl.NavigationControl(),
            "top-right"
          );
        }

        // Add marker for center point with popup
        const marker = new mapboxgl.Marker({
          draggable: true,
          color: "#3b82f6", // Blue color for better visibility
        })
          .setLngLat(coordinates)
          .addTo(map.current!);

        // Create popup for the marker
        if (address) {
          popup.current = new mapboxgl.Popup({ offset: 25 })
            .setHTML(
              `<div class="p-2"><strong class="text-sm font-semibold">${address}</strong></div>`
            )
            .setLngLat(coordinates)
            .addTo(map.current!);

          marker.setPopup(popup.current);
        }

        marker.on("dragend", () => {
          const lngLat = marker.getLngLat();
          onCoordinatesChange([lngLat.lng, lngLat.lat]);
          // Update popup position if it exists
          if (popup.current) {
            popup.current.setLngLat([lngLat.lng, lngLat.lat]);
          }
        });

        markers.current.push(marker);
      });

      // Handle map errors
      map.current.on("error", (e) => {
        console.error("Mapbox error:", e);
      });
    } catch (error) {
      console.error("Failed to initialize map:", error);
    }

    return () => {
      // Clean up popup
      if (popup.current) {
        popup.current.remove();
        popup.current = null;
      }
      // Clean up markers
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
      // Clean up map
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map center when coordinates change
  useEffect(() => {
    if (map.current && coordinates && map.current.loaded()) {
      map.current.flyTo({
        center: coordinates,
        zoom: 18,
      });
      if (markers.current[0]) {
        markers.current[0].setLngLat(coordinates);
      }
      // Update popup position
      if (popup.current) {
        popup.current.setLngLat(coordinates);
      }
    } else if (map.current && coordinates) {
      // If map not loaded yet, wait for it
      map.current.once("load", () => {
        if (map.current) {
          map.current.flyTo({
            center: coordinates,
            zoom: 18,
          });
          if (markers.current[0]) {
            markers.current[0].setLngLat(coordinates);
          }
          // Update popup position
          if (popup.current) {
            popup.current.setLngLat(coordinates);
          }
        }
      });
    }
  }, [coordinates]);

  // Update popup content when address changes
  useEffect(() => {
    if (map.current && map.current.loaded() && markers.current[0]) {
      if (address) {
        // Remove existing popup if any
        if (popup.current) {
          popup.current.remove();
        }
        // Create new popup with address
        popup.current = new mapboxgl.Popup({ offset: 25 })
          .setHTML(
            `<div class="p-2"><strong class="text-sm font-semibold">${address}</strong></div>`
          )
          .setLngLat(coordinates)
          .addTo(map.current!);

        markers.current[0].setPopup(popup.current);
      } else {
        // Remove popup if no address
        if (popup.current) {
          popup.current.remove();
          popup.current = null;
        }
        markers.current[0].setPopup(null);
      }
    }
  }, [address, coordinates]);

  // Update polygons on map
  const updatePolygonsOnMap = () => {
    if (!map.current || !map.current.loaded()) return;

    // Remove existing polygon layers and sources
    const existingPolygons = roofPolygons.concat(
      currentPolygon.current ? [currentPolygon.current] : []
    );

    // Remove old sources and layers (including points)
    existingPolygons.forEach((polygon) => {
      const sourceId = `source-${polygon.id}`;
      const layerId = `layer-${polygon.id}`;
      const pointsSourceId = `points-${polygon.id}`;
      const pointsLayerId = `points-${polygon.id}`;

      if (map.current?.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
      if (map.current?.getLayer(`${layerId}-outline`)) {
        map.current.removeLayer(`${layerId}-outline`);
      }
      if (map.current?.getLayer(pointsLayerId)) {
        map.current.removeLayer(pointsLayerId);
      }
      if (map.current?.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
      if (map.current?.getSource(pointsSourceId)) {
        map.current.removeSource(pointsSourceId);
      }
    });

    // Add polygons to map
    existingPolygons.forEach((polygon) => {
      if (polygon.coordinates.length < 1) return;

      const sourceId = `source-${polygon.id}`;
      const layerId = `layer-${polygon.id}`;
      const pointsSourceId = `points-${polygon.id}`;
      const pointsLayerId = `points-${polygon.id}`;

      // Show points for polygons being drawn (less than 3 points)
      if (polygon.coordinates.length < 3) {
        // Add points as markers
        const pointsFeature: GeoJSON.Feature = {
          type: "Feature",
          properties: {},
          geometry: {
            type: "MultiPoint",
            coordinates: polygon.coordinates,
          },
        };

        map.current?.addSource(pointsSourceId, {
          type: "geojson",
          data: pointsFeature,
        });

        map.current?.addLayer({
          id: pointsLayerId,
          type: "circle",
          source: pointsSourceId,
          paint: {
            "circle-radius": 8,
            "circle-color": "#3b82f6",
            "circle-stroke-width": 3,
            "circle-stroke-color": "#ffffff",
          },
        });

        // Draw line connecting points if more than 1 point
        if (polygon.coordinates.length > 1) {
          const lineFeature: GeoJSON.Feature = {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: polygon.coordinates,
            },
          };

          map.current?.addSource(sourceId, {
            type: "geojson",
            data: lineFeature,
          });

          map.current?.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            paint: {
              "line-color": "#3b82f6",
              "line-width": 3,
              "line-opacity": 0.8,
            },
          });
        }
      } else {
        // Full polygon (3+ points)
        const closedCoords = [...polygon.coordinates, polygon.coordinates[0]];

        const geoJsonFeature: GeoJSON.Feature = {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [closedCoords],
          },
        };

        map.current?.addSource(sourceId, {
          type: "geojson",
          data: geoJsonFeature,
        });

        map.current?.addLayer({
          id: layerId,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": "#3b82f6",
            "fill-opacity": 0.3,
          },
        });

        map.current?.addLayer({
          id: `${layerId}-outline`,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": "#2563eb",
            "line-width": 2,
          },
        });
      }
    });
  };

  // Handle map click for drawing - separate effect that updates with isDrawing
  useEffect(() => {
    if (!map.current) return;

    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      // Only handle clicks when actively drawing
      // This allows PanelPlacer to handle clicks when not drawing
      if (isDrawing && map.current) {
        // Stop propagation to prevent PanelPlacer from handling this click
        e.preventDefault?.();
        if (e.originalEvent) {
          e.originalEvent.stopPropagation();
        }

        const point: [number, number] = [e.lngLat.lng, e.lngLat.lat];

        if (!currentPolygon.current) {
          // Start new polygon
          currentPolygon.current = {
            id: `polygon-${Date.now()}`,
            coordinates: [point],
          };
          setPointCount(1);
        } else {
          // Add point to current polygon
          currentPolygon.current.coordinates.push(point);
          setPointCount(currentPolygon.current.coordinates.length);
        }

        // Update map to show the new point/polygon
        updatePolygonsOnMap();
      }
    };

    // Handle keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        isDrawing &&
        (e.ctrlKey || e.metaKey) &&
        e.key === "z" &&
        !e.shiftKey
      ) {
        e.preventDefault();
        if (
          currentPolygon.current &&
          currentPolygon.current.coordinates.length > 0
        ) {
          currentPolygon.current.coordinates.pop();
          setPointCount(currentPolygon.current.coordinates.length);
          updatePolygonsOnMap();
        }
      }
    };

    // Use capture phase to handle drawing clicks first, but only when isDrawing is true
    map.current.on("click", handleMapClick);
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      if (map.current) {
        map.current.off("click", handleMapClick);
      }
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isDrawing]);

  useEffect(() => {
    updatePolygonsOnMap();
  }, [roofPolygons, currentPolygon.current]);

  const finishDrawing = () => {
    if (
      currentPolygon.current &&
      currentPolygon.current.coordinates.length >= 2
    ) {
      // Allow finishing with 2+ points (can be a line or polygon)
      // If only 2 points, it's a line (area will be 0)
      // If 3+ points, calculate area as polygon
      let area = 0;
      if (currentPolygon.current.coordinates.length >= 3) {
        area = calculatePolygonArea(currentPolygon.current.coordinates);
      }
      currentPolygon.current.area = area;

      onRoofPolygonsChange([...roofPolygons, currentPolygon.current]);
      currentPolygon.current = null;
      setPointCount(0);
      // Keep drawing mode active so user can draw more roof sections
    } else if (
      currentPolygon.current &&
      currentPolygon.current.coordinates.length === 1
    ) {
      // Can't finish with just 1 point
      alert(
        "Please add at least 2 points to create a line, or 3+ points for a polygon."
      );
    }
  };

  const undoLastPoint = () => {
    if (
      currentPolygon.current &&
      currentPolygon.current.coordinates.length > 0
    ) {
      currentPolygon.current.coordinates.pop();
      setPointCount(currentPolygon.current.coordinates.length);
      updatePolygonsOnMap();
    }
  };

  const clearCurrentPolygon = () => {
    currentPolygon.current = null;
    setPointCount(0);
    updatePolygonsOnMap();
  };

  const cancelDrawing = () => {
    currentPolygon.current = null;
    onDrawingChange(false);
    updatePolygonsOnMap();
  };

  const deletePolygon = (id: string) => {
    const polygon = roofPolygons.find((p) => p.id === id);
    if (polygon) {
      const confirmed = window.confirm(
        `Delete roof section with area ${
          polygon.area?.toFixed(1) || "unknown"
        } m²?`
      );
      if (confirmed) {
        onRoofPolygonsChange(roofPolygons.filter((p) => p.id !== id));
      }
    }
  };

  // Calculate polygon area using shoelace formula (approximate for small areas)
  const calculatePolygonArea = (coords: [number, number][]): number => {
    if (coords.length < 3) return 0;

    // Convert lat/lng to meters (rough approximation)
    // This is a simplified calculation - for production, use proper geodesic calculations
    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      area += coords[i][0] * coords[j][1];
      area -= coords[j][0] * coords[i][1];
    }
    area = Math.abs(area) / 2;

    // Convert to square meters (rough approximation for Philippines)
    // 1 degree lat ≈ 111km, 1 degree lng ≈ 111km * cos(lat)
    const lat = coords[0][1];
    const metersPerDegreeLat = 111000;
    const metersPerDegreeLng = 111000 * Math.cos((lat * Math.PI) / 180);

    return area * metersPerDegreeLat * metersPerDegreeLng;
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center p-8">
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Mapbox Token Required
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Please set VITE_MAPBOX_TOKEN in your .env file
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Get your token from:{" "}
            <a
              href="https://account.mapbox.com/access-tokens/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              https://account.mapbox.com/access-tokens/
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[600px]">
      <div
        ref={mapContainer}
        className="w-full h-full rounded-lg"
        style={{ minHeight: "600px" }}
      />

      {/* Drawing controls */}
      {isDrawing && (
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-10">
          <p className="text-sm font-medium mb-2">Drawing Mode</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            Click on the map to add points. Lines connect automatically.
          </p>
          {pointCount > 0 ? (
            <div className="mb-3">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Points: {pointCount}
                {pointCount >= 3 && " (Polygon)"}
                {pointCount === 2 && " (Line)"}
              </p>
              {pointCount < 2 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Add 1 more point to create a line
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-green-600 dark:text-green-400 mb-3 font-medium">
              ✓ Ready - Click on the map to start drawing
            </p>
          )}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={undoLastPoint}
              disabled={pointCount === 0}
              className="px-4 py-1.5 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              title="Remove last point (Ctrl+Z)"
            >
              ↶ Undo
            </button>
            {pointCount > 0 && (
              <button
                onClick={clearCurrentPolygon}
                className="px-3 py-1.5 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                title="Clear current polygon and start over"
              >
                Clear
              </button>
            )}
            <button
              onClick={finishDrawing}
              disabled={pointCount < 2}
              className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Finish {pointCount >= 3 && "Polygon"}
              {pointCount === 2 && "Line"}
            </button>
            <button
              onClick={cancelDrawing}
              className="px-3 py-1.5 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Exit Drawing
            </button>
          </div>
        </div>
      )}

      {/* Polygon list */}
      {roofPolygons.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-10 max-w-xs border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Roof Sections
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
              {roofPolygons.length}
            </span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {roofPolygons.map((polygon, index) => (
              <div
                key={polygon.id}
                className="group flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Section {index + 1}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {polygon.area
                        ? `${polygon.area.toFixed(1)} m²`
                        : "Calculating..."}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deletePolygon(polygon.id)}
                  className="ml-2 p-1.5 text-red-500 hover:text-white hover:bg-red-500 rounded transition-all duration-200 opacity-0 group-hover:opacity-100"
                  title="Delete this roof section"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          {roofPolygons.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 Hover over a section to delete it
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
