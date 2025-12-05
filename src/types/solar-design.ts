export interface RoofPolygon {
  id: string;
  coordinates: [number, number][]; // [lng, lat]
  area?: number; // in square meters
}

export interface SolarProject {
  id?: string;
  userId?: string;
  name?: string; // Project name
  description?: string; // Project description
  address: string;
  coordinates: [number, number]; // [lng, lat]
  roofPolygons: RoofPolygon[];
  panels?: SolarPanel[]; // Solar panels placed on the roof
  systemSizeKw?: number;
  estimatedProduction?: {
    daily: number; // kWh/day
    monthly: number; // kWh/month
    yearly: number; // kWh/year
  };
  proposalData?: ProposalData;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProposalData {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  systemSize: number;
  panelCount: number;
  inverterType: string;
  estimatedCost: number;
  estimatedSavings: number;
  paybackPeriod: number;
  roofArea: number;
}

export interface SystemCalculation {
  roofArea: number; // square meters
  systemSizeKw: number;
  panelCount: number;
  estimatedDailyProduction: number; // kWh
  estimatedMonthlyProduction: number; // kWh
  estimatedYearlyProduction: number; // kWh
}

export interface SolarPanel {
  id: string;
  position: [number, number]; // Center point [lng, lat]
  length: number; // 2.382 meters (2382mm)
  width: number; // 1.134 meters (1134mm)
  rotation: number; // degrees (0° or 90°)
  power: number; // 0.62 kW (620W)
  corners: [number, number][]; // 4 corners for rendering [lng, lat]
}

export interface PanelPlacementSettings {
  spacing: number; // meters between panels (0.5m)
  edgeBuffer: number; // meters from roof edges (0.5m)
  orientation: number; // degrees (auto-detected)
  allowRotation: boolean; // allow 90° rotation
  numberOfStrings?: number; // Number of strings (rows) to organize panels into
}
