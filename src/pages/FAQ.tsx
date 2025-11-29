import { useState } from "react";
import {
  ChevronDown,
  Sun,
  HelpCircle,
  Zap,
  Battery,
  Home,
  Plug,
  ArrowRight,
  ArrowDown,
} from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import SEO from "../components/SEO";

interface FAQProps {
  onNavigate: (page: string) => void;
}

export default function FAQ({ onNavigate }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question:
            "How much does a solar energy system cost in the Philippines?",
          answer:
            "The cost varies based on system size and type. A typical residential grid-tie system (5kW) ranges from ₱250,000 to ₱350,000. Hybrid systems with battery backup cost ₱400,000 to ₱600,000. We offer free site assessments to provide accurate quotes based on your specific needs.",
        },
        {
          question: "How long does it take to install a solar system?",
          answer:
            "Residential installations typically take 2-5 days, while commercial projects may take 1-4 weeks depending on system size. The timeline includes permits, installation, grid connection (if applicable), and final inspection.",
        },
        {
          question: "Do I need permits for solar installation?",
          answer:
            "It depends on your location and property type. In the Philippines, requirements vary: For homeowners associations (HOAs), some require permits and approval from the HOA board before installation, while others don't have specific requirements. Always check with your HOA first. Local government units (LGUs) do not require permits for solar installations. For grid-tie systems, you need approval from your utility company (Meralco, VECO, etc.) for net metering connection. Electrical inspection is typically required for safety compliance.",
        },
        {
          question: "What is the return on investment (ROI) for solar panels?",
          answer:
            "Most residential systems achieve ROI in 4-6 years. With 25+ year panel warranties and minimal maintenance, you can enjoy 15-20 years of free electricity. Commercial installations often see even faster ROI due to higher consumption rates.",
        },
      ],
    },
    {
      category: "System Types",
      questions: [
        {
          question:
            "What is the difference between grid-tie, hybrid, and off-grid systems?",
          answer:
            "Grid-tie systems connect to the utility grid, allowing net metering and lower costs. Hybrid systems combine solar panels, batteries, and grid connection for backup power. Off-grid systems are completely independent, ideal for remote locations but require larger battery banks.",
        },
        {
          question: "Which solar system is best for my home?",
          answer:
            "It depends on your location and needs. Grid-tie is best for urban areas with stable power. Hybrid is ideal if you experience frequent outages. Off-grid suits remote properties without grid access. Our experts provide personalized recommendations during the free site assessment.",
        },
        {
          question: "Can I add batteries to my grid-tie system later?",
          answer:
            "No, you cannot directly add batteries to an existing grid-tie system. Grid-tie inverters are designed specifically for grid connection and do not have the communication ports or battery management capabilities required for battery integration. How Grid-Tie Systems Work: Grid-tie systems convert DC electricity from solar panels directly into AC power that synchronizes with the utility grid. They have no battery storage - excess solar energy flows back to the grid (net metering), and when solar production is insufficient, power is drawn from the grid. These inverters lack battery communication protocols (like CAN bus or RS485) and battery management system (BMS) interfaces that hybrid inverters have. To add battery backup, you would need to replace the entire grid-tie inverter with a hybrid inverter, which can manage both grid connection and battery storage. This essentially means upgrading to a hybrid system. It's more cost-effective to plan for batteries from the start if you anticipate needing backup power.",
        },
      ],
    },
    {
      category: "Performance & Maintenance",
      questions: [
        {
          question: "How much electricity will my solar panels generate?",
          answer:
            "Solar panel generation depends on several factors: system size, location, weather, and panel orientation. In the Philippines, a 1kW solar system typically generates 3-4 kWh per day on average (approximately 1,100-1,460 kWh per year). A 5kW system would produce around 15-20 kWh daily. However, actual generation varies significantly: sunny days produce more (up to 4-5 kWh per 1kW), while cloudy or rainy days produce less (1-2 kWh per 1kW). Peak generation occurs during midday (10 AM to 2 PM) when the sun is strongest. Factors affecting output include roof angle, shading from trees or buildings, panel quality, and seasonal weather patterns. During the dry season (March to May), you'll see higher generation, while the rainy season (June to October) typically produces less.",
        },
        {
          question: "What happens during cloudy days or at night?",
          answer:
            "Solar panels still generate power on cloudy days, though at reduced capacity (10-25% of peak output). At night, grid-tie systems draw power from the utility grid, while hybrid and off-grid systems use stored battery power.",
        },
        {
          question: "How often do solar panels need maintenance?",
          answer:
            "Solar panels require minimal maintenance. We recommend cleaning 2-3 times per year (more frequently in dusty areas) and annual professional inspections. Our systems come with monitoring software to track performance and alert you to any issues.",
        },
        {
          question: "What is the lifespan of solar panels?",
          answer:
            "Quality solar panels last 25-30+ years. Most manufacturers warranty 80-90% performance after 25 years. Inverters typically last 10-15 years and may need replacement once during the system's lifetime.",
        },
      ],
    },
    {
      category: "Financial",
      questions: [
        {
          question: "Are there financing options available?",
          answer:
            "Currently, we accept cash payments and bank transfers. We are working on establishing partnerships with banks to offer financing options and payment plans in the future. For now, all installations are on a cash basis or bank transfer. We'll update our customers once financing options become available.",
        },
        {
          question: "What is net metering and how does it work?",
          answer:
            'Net metering allows you to sell excess solar electricity back to the grid. Your meter runs backward when you generate more than you consume. You only pay for "net" consumption (used minus generated). This maximizes savings from your grid-tie system.',
        },
        {
          question: "How much can I save on my electricity bill?",
          answer:
            "Most customers save 70-90% on electricity bills. A properly sized system can offset nearly all daytime consumption. With net metering, excess generation during low-usage periods credits your account for nighttime use.",
        },
      ],
    },
    {
      category: "Technical",
      questions: [
        {
          question: "Will solar panels work during a brownout?",
          answer:
            "Grid-tie systems automatically shut off during brownouts for safety (protecting utility workers). Hybrid systems with batteries can provide backup power during outages. Off-grid systems are unaffected by grid issues.",
        },
        {
          question: "How much roof space do I need?",
          answer:
            "A typical 5kW residential system requires 25-35 square meters of unshaded roof space. We can work with various roof types (concrete, metal, tile) and orientations. Ground-mounted systems are also available if roof space is limited.",
        },
        {
          question: "Are solar panels affected by typhoons?",
          answer:
            "Our systems are engineered for Philippine weather conditions, including typhoons. Panels are tested to withstand winds up to 200+ km/h and are securely mounted to prevent damage. We use reinforced mounting systems for added safety.",
        },
      ],
    },
  ];

  return (
    <>
      <SEO
        title="Frequently Asked Questions - Solar Installation Philippines"
        description="Get answers to common questions about solar panel installation in the Philippines. Learn about costs, ROI, system types, maintenance, net metering, and more from Sunterra Solar Energy experts."
        keywords="solar FAQ Philippines, solar panel cost, solar installation questions, net metering Philippines, solar ROI, solar maintenance"
      />

      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Everything you need to know about solar installation in the
              Philippines
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
            {faqs.map((category, index) => (
              <Card key={index} className="text-center">
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {category.questions.length}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {category.category}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Questions answered
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solar Hybrid System Infographic */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                How a Solar Hybrid System Works
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                A simple guide to understanding solar energy flow in your home
              </p>
            </div>

            <Card className="p-8 md:p-12 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-gray-700">
              <div className="mb-12">
                <div className="relative max-w-4xl mx-auto">
                  {/* Daytime Flow Section */}
                  <div className="mb-16">
                    <div className="flex items-center justify-center mb-8">
                      <Sun className="w-10 h-10 text-yellow-500 mr-3" />
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Daytime Flow
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {/* Sunlight to Solar Panels */}
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center mb-2 border-2 border-yellow-300 dark:border-yellow-700">
                          <Sun className="w-8 h-8 text-yellow-500" />
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-xs mb-1">
                          Sunlight
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center max-w-[100px]">
                          Solar panels capture sunlight
                        </p>
                      </div>

                      <ArrowDown className="w-6 h-6 text-blue-600 mx-auto" />

                      {/* Solar Panels */}
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-2 border-2 border-blue-300 dark:border-blue-700">
                          <Zap className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-xs mb-1">
                          Solar Panels
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center max-w-[100px]">
                          Convert sunlight to DC electricity
                        </p>
                      </div>

                      <ArrowDown className="w-6 h-6 text-blue-600 mx-auto" />

                      {/* Hybrid Inverter */}
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-2 border-2 border-blue-300 dark:border-blue-700">
                          <Plug className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-xs mb-1">
                          Hybrid Inverter
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center max-w-[100px]">
                          Converts DC to AC power
                        </p>
                      </div>

                      {/* Split to House and Battery */}
                      <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="flex flex-col items-center">
                          <ArrowRight className="w-6 h-6 text-blue-600 mb-2" />
                          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-2 border-2 border-blue-300 dark:border-blue-700">
                            <Home className="w-8 h-8 text-blue-600" />
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-white text-xs mb-1">
                            Powers the House
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 text-center max-w-[100px]">
                            Electricity flows to household loads
                          </p>
                        </div>

                        <div className="flex flex-col items-center">
                          <ArrowRight className="w-6 h-6 text-blue-600 mb-2" />
                          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-2 border-2 border-blue-300 dark:border-blue-700">
                            <Battery className="w-8 h-8 text-blue-600" />
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-white text-xs mb-1">
                            Charges Battery
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 text-center max-w-[100px]">
                            Excess energy stored in LiFePO4 battery
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nighttime Flow Section */}
                  <div className="border-t-2 border-blue-200 dark:border-gray-700 pt-12">
                    <div className="flex items-center justify-center mb-8">
                      <div className="w-10 h-10 bg-gray-800 dark:bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                        <div className="w-5 h-5 bg-yellow-400 rounded-full"></div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Nighttime Flow
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {/* Battery */}
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-2 border-2 border-blue-300 dark:border-blue-700">
                          <Battery className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-xs mb-1">
                          LiFePO4 Battery Bank
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center max-w-[100px]">
                          Stored energy from daytime
                        </p>
                      </div>

                      <ArrowDown className="w-6 h-6 text-blue-600 mx-auto" />

                      {/* Hybrid Inverter */}
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-2 border-2 border-blue-300 dark:border-blue-700">
                          <Plug className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-xs mb-1">
                          Hybrid Inverter
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center max-w-[100px]">
                          Converts battery DC to AC power
                        </p>
                      </div>

                      <ArrowDown className="w-6 h-6 text-blue-600 mx-auto" />

                      {/* House */}
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-2 border-2 border-blue-300 dark:border-blue-700">
                          <Home className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-xs mb-1">
                          Powers the House
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center max-w-[100px]">
                          Continuous power supply at night
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Components Legend */}
              <div className="border-t-2 border-blue-200 dark:border-gray-700 pt-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                  System Components
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center mx-auto mb-2 border-2 border-yellow-300 dark:border-yellow-700">
                      <Sun className="w-7 h-7 text-yellow-500" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white text-xs">
                      Solar Panels
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-2 border-2 border-blue-300 dark:border-blue-700">
                      <Plug className="w-7 h-7 text-blue-600" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white text-xs">
                      Hybrid Inverter
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-2 border-2 border-blue-300 dark:border-blue-700">
                      <Battery className="w-7 h-7 text-blue-600" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white text-xs">
                      LiFePO4 Battery
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-2 border-2 border-blue-300 dark:border-blue-700">
                      <Home className="w-7 h-7 text-blue-600" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white text-xs">
                      Household Loads
                    </p>
                  </div>
                </div>
              </div>

              {/* Utility Grid Backup */}
              <div className="border-t-2 border-blue-200 dark:border-gray-700 pt-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                    <Plug className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 dark:text-white text-base mb-1">
                      DU/Grid (Optional Backup)
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 max-w-md">
                      Utility grid connection for backup power when needed
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {faqs.map((category, catIndex) => (
              <div key={catIndex}>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                    {catIndex + 1}
                  </span>
                  {category.category}
                </h2>

                <div className="space-y-4">
                  {category.questions.map((faq, qIndex) => {
                    const globalIndex = catIndex * 100 + qIndex;
                    const isOpen = openIndex === globalIndex;

                    return (
                      <Card
                        key={qIndex}
                        hover={false}
                        className={`transition-all duration-300 cursor-pointer ${
                          isOpen ? "ring-2 ring-blue-600" : ""
                        }`}
                        onClick={() =>
                          setOpenIndex(isOpen ? null : globalIndex)
                        }
                      >
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4 flex-1">
                            {faq.question}
                          </h3>
                          <ChevronDown
                            className={`w-6 h-6 text-blue-600 flex-shrink-0 transition-transform duration-300 ${
                              isOpen ? "transform rotate-180" : ""
                            }`}
                          />
                        </div>

                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            isOpen ? "max-h-[5000px] mt-4" : "max-h-0"
                          }`}
                        >
                          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto text-center">
            <Sun className="w-16 h-16 text-amber-500 dark:text-amber-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Still Have Questions?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Our solar experts are here to help. Get in touch for personalized
              answers and a free site assessment.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => onNavigate("contact")}>
                Contact Our Experts
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate("services")}
              >
                View Services
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
