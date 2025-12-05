import { useState } from "react";
import {
  Calculator as CalculatorIcon,
  Zap,
  TrendingUp,
  Sun,
} from "lucide-react";

interface CalculatorProps {
  onNavigate: (page: string) => void;
}

export default function Calculator({ onNavigate }: CalculatorProps) {
  const [monthlyBill, setMonthlyBill] = useState<string>("5000");
  const [monthlyKwh, setMonthlyKwh] = useState<string>("");
  const [roofArea, setRoofArea] = useState<string>("100");
  const [systemSize, setSystemSize] = useState<number>(0);
  const [calculation, setCalculation] = useState<any>(null);

  const calculateSystem = () => {
    // Convert string inputs to numbers
    const billValue = Number(monthlyBill) || 0;
    const kwhValue = Number(monthlyKwh) || 0;
    const areaValue = Number(roofArea) || 0;

    // Calculate system size based on roof area
    // Average: 1 kW per 6-8 m² of roof space
    const kWPerSqm = 0.15; // Conservative estimate
    const calculatedSystemSize = Math.min(areaValue * kWPerSqm, 100); // Cap at 100kW
    setSystemSize(Math.round(calculatedSystemSize * 10) / 10);

    // Estimate production based on Philippines average
    const peakSunHours = 4.3; // Average for Philippines
    const systemEfficiency = 0.78;
    const panelCount = Math.round(calculatedSystemSize / 0.62); // 620W per panel

    const estimatedDailyProduction =
      calculatedSystemSize * peakSunHours * systemEfficiency;
    const estimatedMonthlyProduction = estimatedDailyProduction * 30;
    const estimatedYearlyProduction = estimatedDailyProduction * 365;

    // Calculate savings
    // Use monthly kWh if provided, otherwise estimate from bill
    // Average electricity rate in Philippines is around ₱13/kWh
    const averageRate = 13.0; // Standard rate for estimation (₱13/kWh)
    let estimatedMonthlyConsumption: number;
    let electricityRate: number;

    if (kwhValue > 0 && billValue > 0) {
      // Both provided - calculate rate directly
      estimatedMonthlyConsumption = kwhValue;
      electricityRate = billValue / kwhValue;
    } else if (kwhValue > 0) {
      // Only kWh provided - use average rate
      estimatedMonthlyConsumption = kwhValue;
      electricityRate = averageRate;
    } else if (billValue > 0) {
      // Only bill provided - estimate consumption using average rate
      estimatedMonthlyConsumption = Math.max(billValue / averageRate, 200);
      electricityRate = averageRate;
    } else {
      // Fallback
      estimatedMonthlyConsumption = 200;
      electricityRate = averageRate;
    }
    // Calculate savings based on actual production vs consumption
    // More accurate than simple 80% rule - uses actual energy production
    const gridExportRate = 0.8; // Net metering: exported energy pays 80% of retail rate

    let monthlySavings: number;
    if (estimatedMonthlyProduction <= estimatedMonthlyConsumption) {
      // Production covers part or all of consumption
      // Savings = production * electricity rate (you don't buy this from grid)
      monthlySavings = estimatedMonthlyProduction * electricityRate;
    } else {
      // Production exceeds consumption
      // Savings = consumption * rate (full savings on what you use) + excess * rate * 0.8 (export credit)
      const excessProduction =
        estimatedMonthlyProduction - estimatedMonthlyConsumption;
      monthlySavings =
        estimatedMonthlyConsumption * electricityRate +
        excessProduction * electricityRate * gridExportRate;
    }

    // Cap savings at 80% of bill if bill is provided (realistic limit)
    // This accounts for system inefficiencies and real-world performance
    if (billValue > 0) {
      const maxSavings = billValue * 0.8;
      monthlySavings = Math.min(monthlySavings, maxSavings);
    }
    const systemCost = calculatedSystemSize * 60000; // P60,000 per kW
    // Calculate payback period accurately using exact values (no premature rounding)
    const paybackMonthsExact =
      monthlySavings > 0 ? systemCost / monthlySavings : 0;
    // Round to nearest month for display
    const paybackMonths =
      monthlySavings > 0 ? Math.round(paybackMonthsExact) : 0;
    const paybackYears = Math.floor(paybackMonths / 12);
    const paybackMonthsRemainder = paybackMonths % 12;

    setCalculation({
      panelCount,
      estimatedDailyProduction: Math.round(estimatedDailyProduction * 10) / 10,
      estimatedMonthlyProduction: Math.round(estimatedMonthlyProduction),
      estimatedYearlyProduction: Math.round(estimatedYearlyProduction),
      monthlySavings: Math.round(monthlySavings),
      paybackMonths,
      paybackYears,
      paybackMonthsRemainder,
      systemCost: Math.round(systemCost),
      electricityRate: Math.round(electricityRate * 100) / 100,
      monthlyConsumption: Math.round(estimatedMonthlyConsumption),
    });
  };

  const handleCalculate = () => {
    const areaValue = Number(roofArea) || 0;
    const billValue = Number(monthlyBill) || 0;
    const kwhValue = Number(monthlyKwh) || 0;

    if (areaValue <= 0) {
      alert("Please enter a valid roof area.");
      return;
    }
    if (billValue <= 0 && kwhValue <= 0) {
      alert(
        "Please enter either a monthly electricity bill or monthly kWh consumption."
      );
      return;
    }
    calculateSystem();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <CalculatorIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Solar System Calculator
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Calculate your potential solar energy savings and system
              requirements based on your roof area and current electricity
              consumption.
            </p>
          </div>

          {/* Calculator Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Electricity Bill (₱)
                </label>
                <input
                  type="number"
                  value={monthlyBill}
                  onChange={(e) => setMonthlyBill(e.target.value)}
                  min="0"
                  step="100"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5000"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter your average monthly electricity bill
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Consumption (kWh)
                </label>
                <input
                  type="number"
                  value={monthlyKwh}
                  onChange={(e) => setMonthlyKwh(e.target.value)}
                  min="0"
                  step="1"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Optional: Enter your monthly kWh consumption for more accurate
                  calculations
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Available Roof Area (m²)
                </label>
                <input
                  type="number"
                  value={roofArea}
                  onChange={(e) => setRoofArea(e.target.value)}
                  min="0"
                  step="1"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Total roof area available for solar panels
                </p>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <CalculatorIcon className="w-5 h-5" />
              Calculate System
            </button>
          </div>

          {/* Results */}
          {calculation && (
            <div className="space-y-6">
              {/* System Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  System Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      System Size
                    </p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {systemSize} kW
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Panel Count
                    </p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {calculation.panelCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Energy Production */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Sun className="w-6 h-6 text-yellow-500" />
                  Estimated Energy Production
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Daily Production
                    </p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {calculation.estimatedDailyProduction} kWh
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Monthly Production
                    </p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {calculation.estimatedMonthlyProduction.toLocaleString()}{" "}
                      kWh
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Yearly Production
                    </p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {calculation.estimatedYearlyProduction.toLocaleString()}{" "}
                      kWh
                    </p>
                  </div>
                </div>
              </div>

              {/* Savings */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  Estimated Savings
                </h2>
                <div className="max-w-md">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Estimated Monthly Savings
                    </p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      ₱{calculation.monthlySavings.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Based on current electricity rate: ₱
                      {calculation.electricityRate.toFixed(2)}/kWh
                      {Number(monthlyKwh) > 0 && (
                        <span className="block mt-1">
                          Monthly consumption:{" "}
                          {Number(monthlyKwh).toLocaleString()} kWh
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl shadow-xl p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-4">Ready to Go Solar?</h3>
                <p className="text-blue-100 mb-6">
                  Get a personalized quote and professional installation from
                  our expert team.
                </p>
                <button
                  onClick={() => onNavigate("contact")}
                  className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Get a Free Quote
                </button>
              </div>
            </div>
          )}

          {/* Info Section */}
          {!calculation && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                How It Works
              </h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    1.
                  </span>
                  <span>
                    Enter your monthly electricity bill to estimate your energy
                    consumption
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    2.
                  </span>
                  <span>Input your available roof area in square meters</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    3.
                  </span>
                  <span>
                    Click "Calculate System" to see your potential savings and
                    system requirements
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    4.
                  </span>
                  <span>
                    Contact us for a detailed assessment and professional
                    installation
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
