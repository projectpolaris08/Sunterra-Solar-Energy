import {
  Zap,
  Sun,
  Shield,
  Building2,
  Home,
  Factory,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import SEO from "../components/SEO";

interface ServicesProps {
  onNavigate: (page: string) => void;
}

export default function Services({ onNavigate }: ServicesProps) {
  const services = [
    {
      id: "grid-tie",
      title: "Grid-Tie Solar Systems",
      icon: Zap,
      color: "from-blue-500 to-blue-600",
      description:
        "Connect seamlessly to the power grid and benefit from net metering. Sell excess energy back to the grid and maximize your return on investment.",
      features: [
        "Net metering capability",
        "Lower initial investment",
        "Continuous power supply from grid",
        "Reduced electricity bills by up to 90%",
        "Perfect for urban homes and businesses",
        "Fastest ROI period",
      ],
      bestFor: [
        "Urban residential properties",
        "Commercial establishments",
        "Businesses with stable grid connection",
      ],
      capacity: "3.6kW - 10.5kW",
    },
    {
      id: "hybrid",
      title: "Hybrid Solar Systems",
      icon: Sun,
      color: "from-amber-500 to-amber-600",
      description:
        "The ultimate energy solution combining solar panels, battery storage, and grid connection. Enjoy uninterrupted power even during outages.",
      features: [
        "Battery backup for power outages",
        "Grid connection for excess energy",
        "Energy storage for nighttime use",
        "Maximum energy independence",
        "Smart energy management",
        "Seamless automatic switching",
      ],
      bestFor: [
        "Areas with unstable power",
        "Critical facilities",
        "Homes requiring backup power",
      ],
      capacity: "5kW - 16kW",
    },
    {
      id: "Battery",
      title: "Energy Storage",
      icon: Shield,
      color: "from-green-500 to-green-600",
      description:
        "Smart energy storage that captures excess solar and delivers reliable power day and night. Use stored energy during outages, peak rates, or at night for maximum savings and resilience.",
      features: [
        "24/7 backup power during outages",
        "Time-of-use savings with smart charging",
        "Scalable lithium battery capacity",
        "Seamless integration with solar and grid",
        "Mobile app monitoring and insights",
        "Safety-certified BMS and protections",
      ],
      bestFor: [
        "Homes and businesses needing reliable backup",
        "Areas with frequent power interruptions",
      ],
      capacity: "14kW - 16kW",
    },
    {
      id: "commercial",
      title: "Commercial Solar Solutions",
      icon: Building2,
      color: "from-purple-500 to-purple-600",
      description:
        "Large-scale solar installations designed for businesses, factories, and commercial properties. Reduce operational costs significantly.",
      features: [
        "Custom design for high consumption",
        "Significant cost reduction",
        "Enhanced corporate sustainability",
        "Tax incentives and benefits",
        "Professional project management",
        "Scalable solutions",
      ],
      bestFor: [
        "Factories and warehouses",
        "Shopping centers",
        "Hotels and resorts",
      ],
      capacity: "18kW - 36kW",
    },
  ];

  const process = [
    {
      step: "01",
      title: "Free Site Assessment",
      description:
        "Our experts visit your property to evaluate solar potential and energy needs",
    },
    {
      step: "02",
      title: "Custom Design",
      description:
        "We create a tailored solar solution optimized for your requirements",
    },
    {
      step: "03",
      title: "Professional Installation",
      description:
        "Certified technicians install your system with minimal disruption",
    },
    {
      step: "04",
      title: "Monitoring & Support",
      description:
        "Ongoing maintenance and 24/7 support to ensure optimal performance",
    },
  ];

  return (
    <>
      <SEO
        title="Solar Installation Services - Grid-Tie, Hybrid, Off-Grid"
        description="Comprehensive solar energy solutions in the Philippines. Grid-tie solar systems, hybrid solar with battery backup, off-grid systems, and commercial solar installations. Expert solar panel installer with customized solutions."
        keywords="grid-tie solar Philippines, hybrid solar system, off-grid solar, commercial solar installation, solar panel services, net metering Philippines"
      />

      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-amber-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Solar Solutions for Every Need
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
              From residential homes to large commercial properties, we deliver
              customized solar energy systems that maximize savings and
              sustainability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <Card className="text-center">
              <Home className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Residential</h3>
              <p className="text-sm text-gray-600">Perfect for homes</p>
            </Card>
            <Card className="text-center">
              <Building2 className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Commercial</h3>
              <p className="text-sm text-gray-600">Business solutions</p>
            </Card>
            <Card className="text-center">
              <Factory className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Industrial</h3>
              <p className="text-sm text-gray-600">Large-scale systems</p>
            </Card>
            <Card className="text-center">
              <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Off-Grid</h3>
              <p className="text-sm text-gray-600">Remote locations</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="space-y-20 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <div
                key={service.id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:grid-flow-dense" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
                  {service.id === "grid-tie" ||
                  service.id === "hybrid" ||
                  service.id === "Battery" ||
                  service.id === "commercial" ? (
                    <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl">
                      <img
                        src={
                          service.id === "grid-tie"
                            ? "/images/Deye-Gridtie.jpg"
                            : service.id === "hybrid"
                            ? "/images/Deye-Hybrid.jpg"
                            : service.id === "Battery"
                            ? "/images/Deye-Battery.jpg"
                            : "/images/Deye-Hybrid18kW.jpg"
                        }
                        alt={
                          service.id === "grid-tie"
                            ? "Deye Grid-Tie Solar Inverter"
                            : service.id === "hybrid"
                            ? "Deye Hybrid Solar Inverter"
                            : service.id === "Battery"
                            ? "Deye Energy Storage Battery"
                            : "Deye Hybrid 18kW Commercial Inverter"
                        }
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-blue-700/70 text-white p-4">
                        <p className="text-sm font-medium">System Capacity</p>
                        <p className="text-xl font-bold">{service.capacity}</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`bg-gradient-to-br ${service.color} rounded-3xl p-8 h-96 flex flex-col items-center justify-center shadow-2xl`}
                    >
                      <service.icon className="w-32 h-32 text-white mb-4" />
                      <div className="text-white text-center">
                        <p className="text-sm font-medium mb-2">
                          System Capacity
                        </p>
                        <p className="text-2xl font-bold">{service.capacity}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className={
                    index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""
                  }
                >
                  <div className="inline-block bg-blue-100 text-blue-600 text-sm font-semibold px-4 py-2 rounded-full mb-4">
                    {service.title}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {service.title}
                  </h2>
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                      Key Features:
                    </h3>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                      Best For:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {service.bestFor.map((item, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => onNavigate("contact")}
                    className="mt-4"
                  >
                    Get a Quote
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Installation Process
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A seamless journey from consultation to completion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto items-stretch">
            {process.map((item, index) => (
              <div key={index} className="relative">
                <Card className="h-full flex flex-col">
                  <div className="text-5xl font-bold text-blue-100 mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </Card>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-blue-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto text-center bg-white">
            <Sun className="w-16 h-16 text-amber-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Not Sure Which System is Right for You?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Our solar experts will assess your needs and recommend the perfect
              solution
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => onNavigate("contact")}>
                Schedule Free Consultation
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate("faq")}
              >
                View FAQ
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
