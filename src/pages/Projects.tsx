import { useState } from "react";
import { MapPin, Zap, Calendar, CheckCircle, Sun } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import SEO from "../components/SEO";

interface ProjectsProps {
  onNavigate: (page: string) => void;
}

export default function Projects({ onNavigate }: ProjectsProps) {
  const [selectedCategory, setSelectedCategory] = useState("All Projects");
  const projects = [
    {
      id: 1,
      title: "Residential Hybrid Solar Installation",
      location: "Cubao, Quezon City",
      systemType: "Hybrid Solar",
      capacity: "12kW",
      installDate: "January 2025",
      description:
        "Premium hybrid installation for large homes. Modern design with high-efficiency panels and advanced battery storage. Reduced electricity costs by 85% while ensuring power reliability during outages.",
      color: "from-blue-400 to-blue-600",
      savings: "₱15,000/month",
      category: "Residential",
      image: "/images/12kW-Hybrid.jpg",
    },
    {
      id: 2,
      title: "Residential Hybrid Solar Installation",
      location: "Lagro, Quezon City",
      systemType: "Hybrid Solar",
      capacity: "12kW",
      installDate: "February 2025",
      description:
        "Ideal hybrid system for medium to large-sized homes with higher energy consumption. Battery storage ensures uninterrupted power supply during outages. Provides excellent ROI and covers most household energy requirements.",
      color: "from-cyan-400 to-cyan-600",
      savings: "₱15,000/month",
      category: "Residential",
      image: "/images/12kW.jpg",
    },
    {
      id: 3,
      title: "Residential Hybrid Solar Installation",
      location: "Batasan, Quezon City",
      systemType: "Hybrid Solar",
      capacity: "12kW",
      installDate: "March 2025",
      description:
        "Perfect hybrid system installation for residential property. Includes battery backup for power reliability during outages. Covers daily energy needs and significantly reduces monthly electricity bills with smart energy management.",
      color: "from-amber-400 to-amber-600",
      savings: "₱15,000/month",
      category: "Residential",
      image: "/images/12kW-Hybrid-Solar.jpg",
    },
    {
      id: 4,
      title: "Residential Hybrid Solar Installation",
      location: "Cabanatuan, Nueva Ecija",
      systemType: "Hybrid Solar",
      capacity: "16kW",
      installDate: "April 2025",
      description:
        "Comprehensive hybrid system with battery backup for a large family home. Ensures power reliability during outages and maximizes energy independence. Perfect for properties requiring high energy capacity.",
      color: "from-green-400 to-green-600",
      savings: "₱20,000/month",
      category: "Residential",
      image: "/images/16kW.jpg",
    },
    {
      id: 5,
      title: "Residential Hybrid Solar Installation",
      location: "Gen. Trias, Cavite",
      systemType: "Hybrid Solar",
      capacity: "8kW",
      installDate: "May 2025",
      description:
        "Ideal hybrid system for medium-sized homes with higher energy consumption. Battery storage ensures uninterrupted power supply during outages. Provides excellent ROI and covers most household energy requirements.",
      color: "from-purple-400 to-purple-600",
      savings: "₱11,000/month",
      category: "Residential",
      image: "/images/8kW-Hybrid-Solar.jpg",
    },
    {
      id: 6,
      title: "Residential Hybrid Solar Installation",
      location: "Marilao, Bulacan",
      systemType: "Hybrid Solar",
      capacity: "8kW",
      installDate: "June 2025",
      description:
        "Perfect hybrid system installation for residential property. Includes battery backup for power reliability during outages. Covers daily energy needs and significantly reduces monthly electricity bills with smart energy management.",
      color: "from-emerald-400 to-emerald-600",
      savings: "₱11,000/month",
      category: "Residential",
      image: "/images/8kW-Hybrid.jpg",
    },
  ];

  const categories = [
    { name: "All Projects", count: projects.length },
    {
      name: "Residential",
      count: projects.filter((p) => p.category === "Residential").length,
    },
  ];

  const filteredProjects =
    selectedCategory === "All Projects"
      ? projects
      : projects.filter((project) => project.category === selectedCategory);

  return (
    <>
      <SEO
        title="Solar Installation Projects Portfolio"
        description="View our completed solar panel installation projects across the Philippines. Residential, commercial, and off-grid solar systems. Real results from satisfied customers in Manila, Cebu, and nationwide."
        keywords="solar projects Philippines, solar installation portfolio, completed solar projects, residential solar Manila, commercial solar installation"
      />

      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Our Project Portfolio
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Explore our successful solar installations across the Philippines.
              Real projects, real savings, real impact.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.name
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md"
                }`}
              >
                {category.name}{" "}
                <span className="ml-2 text-sm">({category.count})</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <div className="h-48 -mx-6 -mt-6 mb-6 flex flex-col items-center justify-center relative overflow-hidden">
                  {project.image ? (
                    <>
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="relative z-10 text-center text-white">
                          <p className="text-sm font-medium mb-1">
                            System Capacity
                          </p>
                          <p className="text-4xl font-bold drop-shadow-lg">
                            {project.capacity}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div
                      className={`bg-gradient-to-br ${project.color} w-full h-full flex flex-col items-center justify-center relative`}
                    >
                      <Sun className="w-24 h-24 text-white opacity-50 absolute" />
                      <div className="relative z-10 text-center text-white">
                        <p className="text-sm font-medium mb-1">
                          System Capacity
                        </p>
                        <p className="text-4xl font-bold">{project.capacity}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {project.title}
                  </h3>

                  <div className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-blue-600" />
                    <span>{project.location}</span>
                  </div>

                  <div className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                    <Zap className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-amber-500" />
                    <span>{project.systemType}</span>
                  </div>

                  <div className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-green-600" />
                    <span>{project.installDate}</span>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed pt-2">
                    {project.description}
                  </p>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Monthly Savings
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          {project.savings}
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              By the Numbers
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Our impact across the Philippines
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              {
                number: "6",
                label: "Completed Projects",
                color: "text-blue-600",
              },
              {
                number: "68kW",
                label: "Total Capacity",
                color: "text-amber-600",
              },
              {
                number: "₱1.04M+",
                label: "Annual Savings",
                color: "text-green-600",
              },
              {
                number: "56+",
                label: "Tons CO₂ Reduced",
                color: "text-purple-600",
              },
            ].map((stat, index) => (
              <Card key={index} className="text-center">
                <div
                  className={`text-4xl md:text-5xl font-bold ${stat.color} mb-2`}
                >
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto text-center">
            <Sun className="w-16 h-16 text-amber-500 dark:text-amber-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Start Your Solar Project?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of satisfied customers who have made the switch to
              clean, affordable solar energy
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => onNavigate("contact")}>
                Get Free Assessment
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
