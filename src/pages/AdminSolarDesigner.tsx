import { useState } from "react";
import AdminLayout from "../components/dashboard/AdminLayout";
import AddressSearch from "../components/solar-designer/AddressSearch";
import MapView from "../components/solar-designer/MapView";
import SystemCalculator from "../components/solar-designer/SystemCalculator";
import {
  RoofPolygon,
  SolarProject,
  SystemCalculation,
} from "../types/solar-design";
import { Ruler, Save, Plus, X } from "lucide-react";

interface AdminSolarDesignerProps {
  onNavigate: (page: string) => void;
  currentPage?: string;
}

export default function AdminSolarDesigner({
  onNavigate,
  currentPage = "admin-solar-designer",
}: AdminSolarDesignerProps) {
  const [address, setAddress] = useState<string>("");
  const [coordinates, setCoordinates] = useState<[number, number]>([
    120.9842, 14.5995,
  ]); // Default to Manila, Philippines
  const [roofPolygons, setRoofPolygons] = useState<RoofPolygon[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [calculation, setCalculation] = useState<SystemCalculation | null>(
    null
  );

  const handleAddressSelect = (
    selectedAddress: string,
    coords: [number, number]
  ) => {
    setAddress(selectedAddress);
    setCoordinates(coords);
    // Reset polygons when address changes
    setRoofPolygons([]);
    setCalculation(null);
  };

  const handleStartDrawing = () => {
    setIsDrawing(true);
  };

  const handleSaveProject = async () => {
    if (!address || roofPolygons.length === 0) {
      alert("Please add an address and draw at least one roof section.");
      return;
    }

    const project: SolarProject = {
      address,
      coordinates,
      roofPolygons,
      systemSizeKw: calculation?.systemSizeKw,
      estimatedProduction: calculation
        ? {
            daily: calculation.estimatedDailyProduction,
            monthly: calculation.estimatedMonthlyProduction,
            yearly: calculation.estimatedYearlyProduction,
          }
        : undefined,
      createdAt: new Date().toISOString(),
    };

    // TODO: Save to Supabase
    console.log("Saving project:", project);
    alert("Project saved! (Database integration coming soon)");
  };

  const totalRoofArea = roofPolygons.reduce(
    (sum, polygon) => sum + (polygon.area || 0),
    0
  );

  return (
    <AdminLayout currentPage={currentPage} onNavigate={onNavigate}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Ruler className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Solar Designer
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Design solar systems by drawing roof sections on satellite imagery
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveProject}
              disabled={!address || roofPolygons.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-5 h-5" />
              Save Project
            </button>
          </div>
        </div>

        {/* Address Search */}
        <AddressSearch
          onAddressSelect={handleAddressSelect}
          initialAddress={address}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map View - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            {/* Map Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Satellite View
                </h3>
                <div className="flex gap-2">
                  {!isDrawing ? (
                    <button
                      onClick={handleStartDrawing}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Draw Roof
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsDrawing(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                      Cancel Drawing
                    </button>
                  )}
                </div>
              </div>

              {/* Map Container */}
              <div className="h-[600px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
                <MapView
                  coordinates={coordinates}
                  onCoordinatesChange={setCoordinates}
                  roofPolygons={roofPolygons}
                  onRoofPolygonsChange={setRoofPolygons}
                  isDrawing={isDrawing}
                  onDrawingChange={setIsDrawing}
                />
              </div>

              {/* Roof Summary */}
              {totalRoofArea > 0 && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Roof Area:{" "}
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      {totalRoofArea.toFixed(1)} m²
                    </span>
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {roofPolygons.length} roof section
                    {roofPolygons.length !== 1 ? "s" : ""} drawn
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* System Calculator - Takes 1 column */}
          <div className="lg:col-span-1">
            <SystemCalculator
              roofPolygons={roofPolygons}
              coordinates={coordinates}
              onCalculationChange={setCalculation}
            />
          </div>
        </div>

        {/* Instructions */}
        {roofPolygons.length === 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              How to Use
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-200">
              <li>Search for an address in the Philippines</li>
              <li>Click "Draw Roof" to start drawing roof sections</li>
              <li>Click on the map to add points and create a polygon</li>
              <li>Click "Finish" when done with a roof section</li>
              <li>Repeat to add multiple roof sections</li>
              <li>View system calculations and save your project</li>
            </ol>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
