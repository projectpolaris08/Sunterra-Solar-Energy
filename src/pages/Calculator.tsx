import { useState, useEffect } from "react";
import {
  Calculator as CalculatorIcon,
  Zap,
  TrendingUp,
  Sun,
  Battery,
  Cpu,
  ArrowRight,
} from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import SEO from "../components/SEO";

interface CalculatorProps {
  onNavigate: (page: string) => void;
}

export default function Calculator({ onNavigate }: CalculatorProps) {
  const [monthlyBill, setMonthlyBill] = useState<string>("");
  const [monthlyKwh, setMonthlyKwh] = useState<string>("");
  const [roofArea, setRoofArea] = useState<string>("");
  const [calculation, setCalculation] = useState<any>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set()
  );
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => new Set(prev).add(entry.target.id));
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll("[data-scroll-section]");
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mouse position tracking for 3D effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const calculateSystem = () => {
    // Convert string inputs to numbers
    const billValue = Number(monthlyBill) || 0;
    const kwhValue = Number(monthlyKwh) || 0;
    const areaValue = Number(roofArea) || 0;

    // Available inverter sizes (kW)
    const availableInverters = [3, 6, 8, 12, 16, 18, 24, 32, 36];

    // Calculate monthly consumption
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

    // ============================================
    // INDUSTRY-STANDARD HYBRID INVERTER SIZING
    // ============================================

    // 1️⃣ ESTIMATE PEAK LOAD FROM DAILY CONSUMPTION
    // Formula: Peak Load (kW) = Daily kWh ÷ Average Hours of Use ÷ Load Factor
    const dailyConsumption = estimatedMonthlyConsumption / 30;
    const averageHoursOfUse = 12; // Average hours appliances run per day
    const loadFactor = 0.6; // Typical load factor (not all appliances run at full capacity)
    const estimatedPeakLoad = dailyConsumption / averageHoursOfUse / loadFactor;

    // 2️⃣ APPLY SAFETY FACTOR FOR INVERTER SIZING
    // Residential with typical appliances: 1.25-1.30
    // Assume some motors (AC, ref, pump): 1.30-1.50
    // Use 1.30 as conservative estimate
    const safetyFactor = 1.3;
    const requiredInverterSize = estimatedPeakLoad * safetyFactor;

    // 3️⃣ SELECT INVERTER SIZE (round up to nearest available)
    let selectedInverterSize =
      availableInverters.find((size) => size >= requiredInverterSize) ||
      availableInverters[availableInverters.length - 1];

    // 4️⃣ SOLAR PANEL ARRAY SIZING (Industry Formula)
    // Formula: Panel Size (kWp) = (Daily kWh ÷ PSH) × System Loss Factor
    const peakSunHours = 5.0; // Philippines average: 4.5-5.5 hours, use 5.0
    const systemLossFactor = 1.2; // Accounts for losses (wiring, inverter, etc.)
    const requiredPanelSize =
      (dailyConsumption / peakSunHours) * systemLossFactor;

    // 5️⃣ INVERTER-PANEL MATCHING RULE (Oversizing Allowed)
    // Formula: Panel Size = Inverter Size × 1.2 to 1.5
    // Use the larger of: required panel size OR inverter size × 1.3
    const oversizingFactor = 1.3; // Recommended oversizing
    const matchedPanelSize = Math.max(
      requiredPanelSize,
      selectedInverterSize * oversizingFactor
    );

    // For parallel systems, determine the configuration
    let inverterConfig = "";
    if (selectedInverterSize === 24) {
      inverterConfig = "2 x 12kW (Parallel)";
    } else if (selectedInverterSize === 32) {
      inverterConfig = "2 x 16kW (Parallel)";
    } else if (selectedInverterSize === 36) {
      inverterConfig = "2 x 18kW (Parallel)";
    } else {
      inverterConfig = `${selectedInverterSize}kW Hybrid`;
    }

    // 6️⃣ CALCULATE PANEL COUNT
    const panelWattage = 0.62; // 620W per panel
    const panelCount = Math.ceil(matchedPanelSize / panelWattage);
    const actualPanelSize = panelCount * panelWattage; // Actual installed size

    // Check if roof area is sufficient (if provided)
    // Average panel size: ~2.2m x 1.1m = ~2.42 m² per panel
    const panelAreaPerPanel = 2.42; // m² per panel
    const requiredRoofArea = panelCount * panelAreaPerPanel;
    const roofAreaSufficient = areaValue === 0 || areaValue >= requiredRoofArea;

    // 7️⃣ BATTERY CAPACITY CALCULATION
    // Formula: Battery (kWh) = (Critical Load × Backup Hours) ÷ DoD
    // Estimate critical load as 50% of peak load for backup calculation
    const criticalLoad = estimatedPeakLoad * 0.5; // Typical critical load
    const backupHours = 4; // Standard backup hours for residential
    const depthOfDischarge = 0.95; // Lithium battery DoD (95% as specified)
    const requiredBatteryCapacity =
      (criticalLoad * backupHours) / depthOfDischarge;

    // Determine battery options based on inverter size
    let batteryOptions: string[] = [];
    let batteryCapacity: number;
    if (selectedInverterSize === 3) {
      batteryOptions = ["24V 280Ah"];
      batteryCapacity = (24 * 280) / 1000; // 6.72 kWh
    } else {
      batteryOptions = ["51.2V 280Ah", "51.2V 314Ah"];
      // Use larger option (314Ah) for capacity calculation
      batteryCapacity = (51.2 * 314) / 1000; // 16.077 kWh
    }

    // 8️⃣ CALCULATE ENERGY PRODUCTION
    // Use actual panel size for production calculation
    const systemEfficiency = 0.85; // DC to AC conversion efficiency
    const estimatedDailyProduction =
      actualPanelSize * peakSunHours * systemEfficiency;
    const estimatedMonthlyProduction = estimatedDailyProduction * 30;
    const estimatedYearlyProduction = estimatedDailyProduction * 365;

    // 9️⃣ CALCULATE SAVINGS (Hybrid System with Battery)
    // For hybrid systems, savings = energy from solar that displaces grid purchases
    //
    // Formula: Savings = min(Production, Consumption) × Electricity Rate
    //
    // Explanation:
    // - If Production ≤ Consumption: All solar energy is used (directly or via battery)
    //   → Savings = Production × Rate
    // - If Production > Consumption: Only consumption amount can be used from solar
    //   → Savings = Consumption × Rate (excess production may charge battery but
    //      doesn't create additional savings beyond consumption)
    //
    // Note: Battery doesn't increase total savings, it only shifts WHEN solar energy
    // is used (from day to night). Total savings is limited by consumption.

    // Calculate the amount of solar energy that can displace grid purchases
    const solarEnergyUsed = Math.min(
      estimatedMonthlyProduction,
      estimatedMonthlyConsumption
    );

    // Calculate monthly savings
    let monthlySavings = solarEnergyUsed * electricityRate;

    // Calculate 80% target savings (typical goal for hybrid systems)
    const targetSavings80Percent = billValue > 0 ? billValue * 0.8 : 0;

    // Cap savings at 95% of bill if bill is provided (realistic maximum)
    if (billValue > 0) {
      const maxSavings = billValue * 0.95;
      monthlySavings = Math.min(monthlySavings, maxSavings);
    }

    // Estimate system cost (rough estimate: ₱60,000 per kW for hybrid systems)
    const systemCost = selectedInverterSize * 60000;
    const paybackMonthsExact =
      monthlySavings > 0 ? systemCost / monthlySavings : 0;
    const paybackMonths =
      monthlySavings > 0 ? Math.round(paybackMonthsExact) : 0;
    const paybackYears = Math.floor(paybackMonths / 12);
    const paybackMonthsRemainder = paybackMonths % 12;

    setCalculation({
      inverterSize: selectedInverterSize,
      inverterConfig,
      panelCount,
      actualPanelSize: Math.round(actualPanelSize * 10) / 10,
      batteryOptions,
      batteryCapacity: Math.round(batteryCapacity * 10) / 10,
      requiredBatteryCapacity: Math.round(requiredBatteryCapacity * 10) / 10,
      estimatedPeakLoad: Math.round(estimatedPeakLoad * 10) / 10,
      criticalLoad: Math.round(criticalLoad * 10) / 10,
      estimatedDailyProduction: Math.round(estimatedDailyProduction * 10) / 10,
      estimatedMonthlyProduction: Math.round(estimatedMonthlyProduction),
      estimatedYearlyProduction: Math.round(estimatedYearlyProduction),
      monthlySavings: Math.round(monthlySavings),
      targetSavings80Percent: Math.round(targetSavings80Percent),
      paybackMonths,
      paybackYears,
      paybackMonthsRemainder,
      systemCost: Math.round(systemCost),
      electricityRate: Math.round(electricityRate * 100) / 100,
      monthlyConsumption: Math.round(estimatedMonthlyConsumption),
      requiredRoofArea: Math.round(requiredRoofArea * 10) / 10,
      roofAreaSufficient,
      areaValue,
      currentBill: billValue,
    });
  };

  const handleCalculate = () => {
    const billValue = Number(monthlyBill) || 0;
    const kwhValue = Number(monthlyKwh) || 0;

    if (billValue <= 0 && kwhValue <= 0) {
      alert(
        "Please enter either a monthly electricity bill or monthly kWh consumption."
      );
      return;
    }
    calculateSystem();
  };

  return (
    <>
      <SEO
        title="Solar System Calculator - Calculate Your Solar Needs"
        description="Use our free solar system calculator to determine the right hybrid solar system for your home. Get recommendations for inverters, panels, and batteries based on your electricity consumption."
        keywords="solar calculator, solar system calculator, solar panel calculator, hybrid solar calculator, solar system sizing, Philippines solar calculator"
      />

      <section
        id="calculator-hero-section"
        data-scroll-section
        className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden"
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse parallax-slow"
            style={{
              transform: `translate(${mousePosition.x * 20}px, ${
                mousePosition.y * 20 + scrollY * 0.3
              }px)`,
            }}
          ></div>
          <div
            className="absolute top-40 right-10 w-72 h-72 bg-amber-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700 parallax-medium"
            style={{
              transform: `translate(${mousePosition.x * -15}px, ${
                mousePosition.y * -15 + scrollY * 0.2
              }px)`,
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div
            className={`max-w-4xl mx-auto text-center mb-16 transition-all duration-1000 ${
              visibleSections.has("calculator-hero-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="flex justify-center mb-6">
              <div
                className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl group-hover:scale-110 transition-transform duration-300"
                style={{
                  transform: `perspective(1000px) rotateY(${
                    mousePosition.x * 5
                  }deg) rotateX(${mousePosition.y * -5}deg)`,
                }}
              >
                <CalculatorIcon className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-[icon-float_3s_ease-in-out_infinite]" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 gradient-text">
              Solar System Calculator
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Calculate your hybrid solar system requirements based on your
              monthly electricity consumption. We'll recommend the right
              inverter, panels, and battery configuration for your needs.
            </p>
          </div>
        </div>
      </section>

      <section
        id="calculator-form-section"
        data-scroll-section
        className="py-20 bg-white dark:bg-gray-900"
      >
        <div className="container mx-auto px-4">
          <div
            className={`max-w-4xl mx-auto transition-all duration-1000 ${
              visibleSections.has("calculator-form-section")
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-12 scale-95"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <Card className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="group flex flex-col">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                    Monthly Electricity Bill (₱)
                  </label>
                  <input
                    type="number"
                    value={monthlyBill}
                    onChange={(e) => setMonthlyBill(e.target.value)}
                    min="0"
                    step="100"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 min-h-[2.5rem]">
                    Enter your average monthly electricity bill
                  </p>
                </div>

                <div className="group flex flex-col">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
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
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 min-h-[2.5rem]">
                    Optional: Enter your monthly kWh consumption for more
                    accurate calculations
                  </p>
                </div>

                <div className="group flex flex-col">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                    Available Roof Area (m²)
                    <span className="text-gray-400 font-normal normal-case ml-1">
                      (Optional)
                    </span>
                  </label>
                  <input
                    type="number"
                    value={roofArea}
                    onChange={(e) => setRoofArea(e.target.value)}
                    min="0"
                    step="1"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Optional"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 min-h-[2.5rem]">
                    Optional: Enter roof area to verify if system will fit
                  </p>
                </div>
              </div>

              <div className="flex justify-center md:justify-start">
                <button
                  onClick={handleCalculate}
                  className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 magnetic immersive-hover"
                >
                  <CalculatorIcon className="w-5 h-5" />
                  Calculate System
                </button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {calculation && (
        <section
          id="calculator-results-section"
          data-scroll-section
          className="py-20 bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-800 dark:via-gray-900"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* System Overview */}
              <Card className="p-8 overflow-hidden relative">
                {/* Header with gradient background */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-xl p-4 mb-6 -mx-2 -mt-2">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    Recommended System
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Inverter Card */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Inverter
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {calculation.inverterConfig}
                    </p>
                  </div>

                  {/* Solar Panels Card */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Sun className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Solar Panels
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      {calculation.panelCount} panels
                    </p>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      {calculation.actualPanelSize} kWp
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      (620W per panel)
                    </p>
                  </div>
                </div>

                {/* Battery Options Card */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                    <Battery className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Battery Options
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
                        Available Options:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {calculation.batteryOptions.map(
                          (battery: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium"
                            >
                              {battery}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
                        Battery Capacity:
                      </p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {calculation.batteryCapacity} kWh
                      </p>
                      {calculation.criticalLoad > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          (Approx.{" "}
                          {Math.round(
                            (calculation.batteryCapacity /
                              calculation.criticalLoad) *
                              10
                          ) / 10}{" "}
                          hours backup at {calculation.criticalLoad}kW load)
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-3 mt-3 border-t border-blue-200 dark:border-blue-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      95% Depth of Discharge (DOD)
                    </p>
                  </div>
                </div>
                {calculation.areaValue > 0 && (
                  <div
                    className={`mt-6 p-4 rounded-xl border-2 ${
                      calculation.roofAreaSufficient
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-300 dark:border-green-700"
                        : "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border-yellow-300 dark:border-yellow-700"
                    } transition-all duration-300`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-1.5 rounded-lg flex-shrink-0 ${
                          calculation.roofAreaSufficient
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      >
                        {calculation.roofAreaSufficient ? (
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                        )}
                      </div>
                      <p
                        className={`text-sm font-medium flex-1 ${
                          calculation.roofAreaSufficient
                            ? "text-green-800 dark:text-green-200"
                            : "text-yellow-800 dark:text-yellow-200"
                        }`}
                      >
                        {calculation.roofAreaSufficient
                          ? `Roof area (${calculation.areaValue}m²) is sufficient for this system (requires ${calculation.requiredRoofArea}m²)`
                          : `Roof area (${calculation.areaValue}m²) may be insufficient. This system requires approximately ${calculation.requiredRoofArea}m²`}
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Energy Production */}
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Sun className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Estimated Energy Production
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Daily Production
                    </p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {calculation.estimatedDailyProduction} kWh
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Monthly Production
                    </p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {calculation.estimatedMonthlyProduction.toLocaleString()}{" "}
                      kWh
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Yearly Production
                    </p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {calculation.estimatedYearlyProduction.toLocaleString()}{" "}
                      kWh
                    </p>
                  </div>
                </div>
              </Card>

              {/* Savings */}
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Estimated Savings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800 flex flex-col">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Estimated Monthly Savings
                    </p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                      ₱{calculation.monthlySavings.toLocaleString()}
                    </p>
                    <div className="pt-3 border-t border-blue-200 dark:border-blue-800 mt-auto">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Electricity rate:</span>{" "}
                        ₱{calculation.electricityRate.toFixed(2)}/kWh
                      </p>
                      {Number(monthlyKwh) > 0 && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          <span className="font-semibold">
                            Monthly consumption:
                          </span>{" "}
                          {Number(monthlyKwh).toLocaleString()} kWh
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800 flex flex-col">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Target Savings Goal
                    </p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                      ₱{calculation.targetSavings80Percent.toLocaleString()}
                    </p>
                    <div className="pt-3 border-t border-blue-200 dark:border-blue-800 mt-auto">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        80% of Current Bill
                      </p>
                      {calculation.targetSavings80Percent > 0 &&
                        calculation.monthlySavings <
                          calculation.targetSavings80Percent && (
                          <>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex-1 bg-blue-200 dark:bg-blue-800 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-blue-600 dark:bg-blue-400 h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${
                                      calculation.targetSavings80Percent > 0
                                        ? Math.min(
                                            (calculation.monthlySavings /
                                              calculation.targetSavings80Percent) *
                                              100,
                                            100
                                          )
                                        : 0
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                {calculation.targetSavings80Percent > 0
                                  ? Math.min(
                                      Math.round(
                                        (calculation.monthlySavings /
                                          calculation.targetSavings80Percent) *
                                          100
                                      ),
                                      100
                                    )
                                  : 0}
                                %
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              ₱
                              {(
                                calculation.targetSavings80Percent -
                                calculation.monthlySavings
                              ).toLocaleString()}{" "}
                              more to reach target
                            </p>
                          </>
                        )}
                      {calculation.targetSavings80Percent === 0 && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Enter monthly bill to see target
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Info Section */}
      {!calculation && (
        <section
          id="calculator-info-section"
          data-scroll-section
          className="py-20 bg-white dark:bg-gray-900"
        >
          <div className="container mx-auto px-4">
            <div
              className={`max-w-4xl mx-auto transition-all duration-1000 ${
                visibleSections.has("calculator-info-section")
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-12 scale-95"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              <Card className="p-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  How It Works
                </h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      1.
                    </span>
                    <span>
                      Enter your monthly electricity bill to estimate your
                      energy consumption
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      2.
                    </span>
                    <span>
                      Optionally enter your available roof area to verify the
                      system will fit
                    </span>
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
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action Section */}
      <section
        id="calculator-cta-section"
        data-scroll-section
        className="py-20 bg-gradient-to-br from-amber-50 to-blue-50 dark:from-gray-800 dark:to-gray-900"
      >
        <div className="container mx-auto px-4 relative z-10">
          <Card
            className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
              visibleSections.has("calculator-cta-section")
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-12 scale-95"
            }`}
          >
            <Sun className="w-16 h-16 text-amber-500 dark:text-amber-400 mx-auto mb-6 animate-spin-slow" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">
              <span className="text-blue-600 dark:text-blue-400">
                Ready to Go
              </span>{" "}
              <span className="text-gray-600 dark:text-gray-400">Solar?</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Get a free site assessment and discover how much you can save with
              solar energy. Our experts will design a custom solution for your
              needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => onNavigate("contact")}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 hover:scale-105 hover:shadow-xl transition-all duration-300 group flex items-center justify-center"
              >
                Schedule Free Assessment
                <ArrowRight className="ml-2 w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate("faq")}
                className="w-full sm:w-auto bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:scale-105 hover:shadow-xl transition-all duration-300"
              >
                View FAQ
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <style>{`
        @keyframes icon-float {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.05);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </>
  );
}
