import { useState, useEffect } from "react";
import {
  RoofPolygon,
  SystemCalculation,
  SolarPanel,
} from "../../types/solar-design";
import { Calculator, Zap, TrendingUp } from "lucide-react";

interface SystemCalculatorProps {
  roofPolygons: RoofPolygon[];
  coordinates: [number, number];
  onCalculationChange: (calculation: SystemCalculation | null) => void;
  panels?: SolarPanel[];
}

export default function SystemCalculator({
  roofPolygons,
  coordinates,
  onCalculationChange,
  panels = [],
}: SystemCalculatorProps) {
  const [monthlyBill, setMonthlyBill] = useState<number>(5000);
  const [calculation, setCalculation] = useState<SystemCalculation | null>(
    null
  );

  // Calculate total roof area
  const totalRoofArea = roofPolygons.reduce(
    (sum, polygon) => sum + (polygon.area || 0),
    0
  );

  useEffect(() => {
    if (totalRoofArea > 0 || panels.length > 0) {
      calculateSystem();
    } else {
      setCalculation(null);
      onCalculationChange(null);
    }
  }, [totalRoofArea, monthlyBill, coordinates, panels]);

  const calculateSystem = () => {
    // If panels are placed, use actual panel count
    if (panels.length > 0) {
      const actualPanelCount = panels.length;
      const actualSystemSizeKw = actualPanelCount * 0.62; // 620W per panel

      // Estimate production based on Philippines average
      const peakSunHours = 4.3;
      const systemEfficiency = 0.78;

      const estimatedDailyProduction =
        actualSystemSizeKw * peakSunHours * systemEfficiency;
      const estimatedMonthlyProduction = estimatedDailyProduction * 30;
      const estimatedYearlyProduction = estimatedDailyProduction * 365;

      // Calculate savings
      const estimatedMonthlyConsumption = Math.max(monthlyBill / 10, 200);
      const electricityRate = monthlyBill / estimatedMonthlyConsumption;
      const selfConsumptionRate = Math.min(
        estimatedMonthlyProduction / estimatedMonthlyConsumption,
        0.9
      );
      const gridExportRate = 0.8;
      const selfConsumed = estimatedMonthlyProduction * selfConsumptionRate;
      const exported = estimatedMonthlyProduction * (1 - selfConsumptionRate);
      const monthlySavings =
        selfConsumed * electricityRate +
        exported * electricityRate * gridExportRate;
      const systemCost = actualSystemSizeKw * 60000;
      const paybackMonths =
        monthlySavings > 0 ? Math.round(systemCost / monthlySavings) : 0;

      const calc: SystemCalculation = {
        roofArea: totalRoofArea,
        systemSizeKw: Math.round(actualSystemSizeKw * 10) / 10,
        panelCount: actualPanelCount,
        estimatedDailyProduction:
          Math.round(estimatedDailyProduction * 10) / 10,
        estimatedMonthlyProduction: Math.round(estimatedMonthlyProduction),
        estimatedYearlyProduction: Math.round(estimatedYearlyProduction),
      };

      (calc as any).monthlySavings = Math.round(monthlySavings);
      (calc as any).paybackMonths = paybackMonths;
      (calc as any).electricityRate = Math.round(electricityRate * 100) / 100;

      setCalculation(calc);
      onCalculationChange(calc);
      return;
    }

    if (totalRoofArea === 0) return;

    // Modern panel specifications (2024-2025 standards)
    // Average panel size: ~1.8-2.0m² per panel
    // Average panel power: ~450W per panel (modern panels)
    const panelArea = 1.9; // square meters (average of modern panels)
    const panelPower = 0.45; // kW per panel (450W)

    // Calculate how many panels can fit (assuming 80% coverage for spacing and mounting)
    const usableArea = totalRoofArea * 0.8;
    const panelCount = Math.floor(usableArea / panelArea);
    const systemSizeKw = panelCount * panelPower;

    // Estimate production based on Philippines average
    // Philippines average: 4-5 peak sun hours per day (varies by location)
    // System efficiency: ~78% (accounting for inverter, cable, soiling, temperature losses)
    const peakSunHours = 4.3; // Conservative average for Philippines
    const systemEfficiency = 0.78; // More accurate efficiency factor

    const estimatedDailyProduction =
      systemSizeKw * peakSunHours * systemEfficiency;
    const estimatedMonthlyProduction = estimatedDailyProduction * 30;
    const estimatedYearlyProduction = estimatedDailyProduction * 365;

    // Calculate savings based on monthly bill
    // Estimate electricity rate: typical Philippines rate is ₱8-12/kWh
    // Use monthly bill to estimate consumption and rate
    const estimatedMonthlyConsumption = Math.max(monthlyBill / 10, 200); // Assume ₱10/kWh if not specified
    const electricityRate = monthlyBill / estimatedMonthlyConsumption; // Actual rate from bill

    // Self-consumption: how much solar energy is used directly (vs exported)
    const selfConsumptionRate = Math.min(
      estimatedMonthlyProduction / estimatedMonthlyConsumption,
      0.9
    ); // Max 90% self-consumption

    // Net metering: exported energy pays 80% of retail rate
    const gridExportRate = 0.8;

    // Calculate monthly savings
    const selfConsumed = estimatedMonthlyProduction * selfConsumptionRate;
    const exported = estimatedMonthlyProduction * (1 - selfConsumptionRate);
    const monthlySavings =
      selfConsumed * electricityRate +
      exported * electricityRate * gridExportRate;

    // Calculate ROI
    const systemCost = systemSizeKw * 60000; // ₱60,000 per kW
    const paybackMonths =
      monthlySavings > 0 ? Math.round(systemCost / monthlySavings) : 0;

    const calc: SystemCalculation = {
      roofArea: totalRoofArea,
      systemSizeKw: Math.round(systemSizeKw * 10) / 10, // Round to 1 decimal
      panelCount,
      estimatedDailyProduction: Math.round(estimatedDailyProduction * 10) / 10,
      estimatedMonthlyProduction: Math.round(estimatedMonthlyProduction),
      estimatedYearlyProduction: Math.round(estimatedYearlyProduction),
    };

    // Store additional calculation data for display
    (calc as any).monthlySavings = Math.round(monthlySavings);
    (calc as any).paybackMonths = paybackMonths;
    (calc as any).electricityRate = Math.round(electricityRate * 100) / 100;

    setCalculation(calc);
    onCalculationChange(calc);
  };

  if (totalRoofArea === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            System Calculator
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Draw roof sections on the map to calculate system size and production
          estimates.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Calculator className="w-6 h-6 text-blue-500" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          System Calculator
        </h3>
      </div>

      <div className="space-y-4">
        {/* Monthly Bill Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Monthly Electricity Bill (₱)
          </label>
          <input
            type="number"
            value={monthlyBill}
            onChange={(e) => setMonthlyBill(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            min="0"
            step="100"
          />
        </div>

        {/* Calculation Results */}
        {calculation && (
          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Total Roof Area
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {calculation.roofArea.toFixed(1)} m²
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  System Size
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {calculation.systemSizeKw} kW
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Panel Count
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {calculation.panelCount}
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Daily Production
                </p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {calculation.estimatedDailyProduction} kWh
                </p>
              </div>
            </div>

            {/* Production Estimates */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-lg text-white">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5" />
                <h4 className="font-semibold">Estimated Production</h4>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="opacity-80">Monthly</p>
                  <p className="text-xl font-bold">
                    {calculation.estimatedMonthlyProduction} kWh
                  </p>
                </div>
                <div>
                  <p className="opacity-80">Yearly</p>
                  <p className="text-xl font-bold">
                    {calculation.estimatedYearlyProduction} kWh
                  </p>
                </div>
                <div>
                  <p className="opacity-80">Savings/Month</p>
                  <p className="text-xl font-bold">
                    ₱{(calculation as any).monthlySavings || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* ROI Estimate */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Estimated ROI
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Based on average system cost of ₱60,000 per kW, your estimated
                payback period is approximately{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {(() => {
                    const paybackMonths =
                      (calculation as any).paybackMonths || 0;
                    const years = Math.floor(paybackMonths / 12);
                    const months = paybackMonths % 12;
                    if (years > 0) {
                      return `${years} year${years > 1 ? "s" : ""}${
                        months > 0
                          ? ` ${months} month${months > 1 ? "s" : ""}`
                          : ""
                      }`;
                    }
                    return `${months} months`;
                  })()}
                </span>
                .
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
