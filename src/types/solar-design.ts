export interface RoofPolygon {
  id: string;
  coordinates: [number, number][]; // [lng, lat]
  area?: number; // in square meters
}

export interface SolarProject {
  id?: string;
  userId?: string;
  address: string;
  coordinates: [number, number]; // [lng, lat]
  roofPolygons: RoofPolygon[];
  systemSizeKw?: number;
  estimatedProduction?: {
    daily: number; // kWh/day
    monthly: number; // kWh/month
    yearly: number; // kWh/year
  };
  proposalData?: ProposalData;
  createdAt?: string;
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
