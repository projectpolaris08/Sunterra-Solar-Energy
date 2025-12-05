import { useState } from "react";
import AdminLayout from "../components/dashboard/AdminLayout";
import AddressSearch from "../components/solar-designer/AddressSearch";
import MapView from "../components/solar-designer/MapView";
import SystemCalculator from "../components/solar-designer/SystemCalculator";
import PanelPlacer from "../components/solar-designer/PanelPlacer";
import {
  RoofPolygon,
  SolarProject,
  SystemCalculation,
  SolarPanel,
} from "../types/solar-design";
import { Ruler, Save, Plus, X } from "lucide-react";
import { supabase } from "../lib/supabase";

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
  const [panels, setPanels] = useState<SolarPanel[]>([]);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const [isManualPanelMode, setIsManualPanelMode] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isAddressConfirmModalOpen, setIsAddressConfirmModalOpen] =
    useState(false);
  const [projectName, setProjectName] = useState<string>("");
  const [projectDescription, setProjectDescription] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

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
    if (roofPolygons.length === 0) {
      alert("Please draw at least one roof section before saving.");
      return;
    }

    // If no address is set, show confirmation modal
    if (!address) {
      setIsAddressConfirmModalOpen(true);
      return;
    }

    // Open save modal to get project name
    setIsSaveModalOpen(true);
  };

  const handleConfirmUseCoordinates = () => {
    setIsAddressConfirmModalOpen(false);
    // Open save modal to get project name
    setIsSaveModalOpen(true);
  };

  const handleCancelUseCoordinates = () => {
    setIsAddressConfirmModalOpen(false);
  };

  const handleConfirmSave = async () => {
    if (!projectName.trim()) {
      alert("Please enter a project name.");
      return;
    }

    setIsSaving(true);

    try {
      const project: SolarProject = {
        name: projectName.trim(),
        description: projectDescription.trim() || undefined,
        address:
          address ||
          `Coordinates: ${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(
            6
          )}`,
        coordinates,
        roofPolygons,
        panels,
        systemSizeKw: calculation?.systemSizeKw,
        estimatedProduction: calculation
          ? {
              daily: calculation.estimatedDailyProduction,
              monthly: calculation.estimatedMonthlyProduction,
              yearly: calculation.estimatedYearlyProduction,
            }
          : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Try to save to Supabase if configured
      if (supabase) {
        try {
          const { error } = await supabase
            .from("solar_projects")
            .insert({
              name: project.name,
              description: project.description || null,
              address: project.address,
              coordinates: project.coordinates,
              roof_polygons: project.roofPolygons, // JSONB accepts objects directly
              panels: project.panels || [], // JSONB accepts arrays directly
              system_size_kw: project.systemSizeKw || null,
              estimated_production: project.estimatedProduction || null, // JSONB accepts objects directly
              created_at: project.createdAt,
              updated_at: project.updatedAt,
            })
            .select()
            .single();

          if (error) throw error;

          alert(`Project "${project.name}" saved successfully!`);
          setIsSaveModalOpen(false);
          setProjectName("");
          setProjectDescription("");
          return;
        } catch (error) {
          console.error("Failed to save to Supabase:", error);
          // Fall through to localStorage fallback
        }
      }

      // Fallback to localStorage
      const savedProjects = JSON.parse(
        localStorage.getItem("solar_projects") || "[]"
      );
      const newProject = {
        ...project,
        id: `local_${Date.now()}`,
      };
      savedProjects.push(newProject);
      localStorage.setItem("solar_projects", JSON.stringify(savedProjects));

      alert(`Project "${project.name}" saved to local storage!`);
      setIsSaveModalOpen(false);
      setProjectName("");
      setProjectDescription("");
    } catch (error) {
      console.error("Failed to save project:", error);
      alert("Failed to save project. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSave = () => {
    setIsSaveModalOpen(false);
    setProjectName("");
    setProjectDescription("");
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
              disabled={roofPolygons.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={
                roofPolygons.length === 0
                  ? "Please draw at least one roof section to save"
                  : "Save your solar project"
              }
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                  onMapReady={setMapInstance}
                  address={address}
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

          {/* Panel Placer - Takes 1 column */}
          <div className="lg:col-span-1">
            <PanelPlacer
              roofPolygons={roofPolygons}
              panels={panels}
              onPanelsChange={setPanels}
              map={mapInstance}
              isManualMode={isManualPanelMode}
              onManualModeChange={setIsManualPanelMode}
            />
          </div>

          {/* System Calculator - Takes 1 column */}
          <div className="lg:col-span-1">
            <SystemCalculator
              roofPolygons={roofPolygons}
              coordinates={coordinates}
              onCalculationChange={setCalculation}
              panels={panels}
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

      {/* Address Confirmation Modal */}
      {isAddressConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  No Address Selected
                </h3>
                <button
                  onClick={handleCancelUseCoordinates}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  No address has been selected for this project. Would you like
                  to save using the current map location coordinates?
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Current Location:
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-mono">
                    {coordinates[1].toFixed(6)}, {coordinates[0].toFixed(6)}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                    (Latitude, Longitude)
                  </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    💡 You can add an address later by editing the project.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={handleCancelUseCoordinates}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUseCoordinates}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
                >
                  Continue with Coordinates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Project Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Save Project
                </h3>
                <button
                  onClick={handleCancelSave}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g., Residential Solar System - Manila"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Add notes about this project..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Project Summary:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>
                      Address:{" "}
                      {address ||
                        `Coordinates: ${coordinates[1].toFixed(
                          6
                        )}, ${coordinates[0].toFixed(6)}`}
                    </li>
                    <li>Roof Sections: {roofPolygons.length}</li>
                    <li>Panels: {panels.length}</li>
                    <li>
                      System Size:{" "}
                      {calculation?.systemSizeKw?.toFixed(1) || "N/A"} kW
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={handleCancelSave}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSave}
                  disabled={isSaving || !projectName.trim()}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
