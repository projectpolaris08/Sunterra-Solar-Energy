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
import { useEffect, useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import SEO from "../components/SEO";

interface ServicesProps {
  onNavigate: (page: string) => void;
}

export default function Services({ onNavigate }: ServicesProps) {
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

      <section
        id="solutions-section"
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
              visibleSections.has("solutions-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 gradient-text">
              Solar Solutions for Every Need
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
              From residential homes to large commercial properties, we deliver
              customized solar energy systems that maximize savings and
              sustainability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[
              {
                icon: Home,
                title: "Residential",
                description: "Perfect for homes",
                color: "text-blue-600",
                bgColor: "bg-blue-50 dark:bg-blue-900/20",
                borderColor: "border-blue-400 dark:border-blue-500",
                animation: "animate-[icon-float_3s_ease-in-out_infinite]",
              },
              {
                icon: Building2,
                title: "Commercial",
                description: "Business solutions",
                color: "text-amber-600",
                bgColor: "bg-amber-50 dark:bg-amber-900/20",
                borderColor: "border-amber-400 dark:border-amber-500",
                animation: "animate-[icon-pulse_2s_ease-in-out_infinite]",
              },
              {
                icon: Factory,
                title: "Industrial",
                description: "Large-scale systems",
                color: "text-green-600",
                bgColor: "bg-green-50 dark:bg-green-900/20",
                borderColor: "border-green-400 dark:border-green-500",
                animation: "animate-[icon-bounce_2.5s_ease-in-out_infinite]",
              },
              {
                icon: Shield,
                title: "Off-Grid",
                description: "Remote locations",
                color: "text-purple-600",
                bgColor: "bg-purple-50 dark:bg-purple-900/20",
                borderColor: "border-purple-400 dark:border-purple-500",
                animation: "animate-[icon-float_2.8s_ease-in-out_infinite]",
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ease-out ${
                  visibleSections.has("solutions-section")
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-12 scale-95"
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <Card className="text-center group card-3d immersive-hover cursor-pointer relative overflow-hidden depth-3">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-all duration-500 rounded-lg"></div>
                  <div className="relative z-10">
                    <div
                      className={`${item.bgColor} border ${item.borderColor} p-4 rounded-lg w-fit mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                      style={{
                        transform: `perspective(1000px) rotateY(${
                          mousePosition.x * 5
                        }deg) rotateX(${mousePosition.y * -5}deg)`,
                      }}
                    >
                      <item.icon
                        className={`w-12 h-12 ${item.color} group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 ${item.animation}`}
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                      {item.description}
                    </p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="services-detail-section"
        data-scroll-section
        className="py-20 bg-white dark:bg-gray-900"
      >
        <div className="container mx-auto px-4">
          <div className="space-y-20 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <div
                key={service.id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${
                  visibleSections.has("services-detail-section")
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                } ${index % 2 === 1 ? "lg:grid-flow-dense" : ""}`}
                style={{
                  transitionDelay: `${index * 200}ms`,
                }}
              >
                <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
                  {service.id === "grid-tie" ||
                  service.id === "hybrid" ||
                  service.id === "Battery" ||
                  service.id === "commercial" ? (
                    <div
                      className="relative h-96 rounded-3xl overflow-hidden shadow-2xl card-3d immersive-hover depth-4"
                      style={{
                        transform: `perspective(1000px) rotateY(${
                          mousePosition.x * 2
                        }deg) rotateX(${mousePosition.y * -2}deg)`,
                      }}
                    >
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
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-blue-700/70 backdrop-blur-sm text-white p-4 glass">
                        <p className="text-sm font-medium">System Capacity</p>
                        <p className="text-xl font-bold">{service.capacity}</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`bg-gradient-to-br ${service.color} rounded-3xl p-8 h-96 flex flex-col items-center justify-center shadow-2xl card-3d immersive-hover depth-4 shimmer`}
                      style={{
                        transform: `perspective(1000px) rotateY(${
                          mousePosition.x * 2
                        }deg) rotateX(${mousePosition.y * -2}deg)`,
                      }}
                    >
                      <service.icon className="w-32 h-32 text-white mb-4 animate-[icon-float_3s_ease-in-out_infinite]" />
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
                  <div className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold px-4 py-2 rounded-full mb-4 glass backdrop-blur-sm">
                    {service.title}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {service.title}
                  </h2>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">
                      Key Features:
                    </h3>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start group/item hover:translate-x-2 transition-transform duration-300"
                        >
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-300" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">
                      Best For:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {service.bestFor.map((item, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm hover:scale-110 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300 cursor-default"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => onNavigate("contact")}
                    className="mt-4 magnetic immersive-hover"
                  >
                    Get a Quote
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="process-section"
        data-scroll-section
        className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-20 left-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse parallax-slow"
            style={{
              transform: `translate(${mousePosition.x * 25}px, ${
                mousePosition.y * 25 + scrollY * 0.2
              }px)`,
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              visibleSections.has("process-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">
              Our Installation Process
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A seamless journey from consultation to completion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto items-stretch">
            {process.map((item, index) => (
              <div
                key={index}
                className={`relative transition-all duration-700 ease-out ${
                  visibleSections.has("process-section")
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-12 scale-95"
                }`}
                style={{
                  transitionDelay: `${index * 150}ms`,
                }}
              >
                <Card className="h-full flex flex-col card-3d immersive-hover depth-3">
                  <div className="text-5xl font-bold text-blue-100 dark:text-blue-900/50 mb-4 group-hover:scale-110 transition-transform duration-300">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {item.description}
                  </p>
                </Card>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-blue-300 animate-[arrow-right-move_2s_ease-in-out_infinite]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="cta-section"
        data-scroll-section
        className="py-20 bg-gradient-to-br from-amber-50 to-blue-50 dark:from-gray-800 dark:to-gray-900"
      >
        <div className="container mx-auto px-4 relative z-10">
          <Card
            className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
              visibleSections.has("cta-section")
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-12 scale-95"
            }`}
          >
            <Sun className="w-16 h-16 text-amber-500 dark:text-amber-400 mx-auto mb-6 animate-spin-slow" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">
              Not Sure Which System is Right for You?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Our solar experts will assess your needs and recommend the perfect
              solution
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

        @keyframes icon-bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes icon-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.9;
          }
        }

        @keyframes sun-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes arrow-right-move {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(5px);
          }
        }
      `}</style>
    </>
  );
}
