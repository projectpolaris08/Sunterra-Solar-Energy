import { useState } from "react";
import {
  MapPin,
  Zap,
  Calendar,
  CheckCircle,
  Sun,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import SEO from "../components/SEO";

interface ProjectsProps {
  onNavigate: (page: string) => void;
}

interface Project {
  id: number;
  title: string;
  location: string;
  systemType: string;
  capacity: string;
  installDate: string;
  description: string;
  color: string;
  savings?: string;
  estimatedSavings?: string;
  category: string;
  image?: string;
  status?: string;
  progress?: number;
  details?: {
    currentPhase: string;
  };
}

export default function Projects({ onNavigate }: ProjectsProps) {
  const [selectedCategory, setSelectedCategory] = useState("All Projects");
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;
  const projects: Project[] = [];

  const ongoingProjects = [
    {
      id: 7,
      title: "Residential Hybrid Solar Installation",
      location: "TBD",
      systemType: "Hybrid Solar",
      capacity: "16kW",
      installDate: "Estimated Installation Date Nov. 29, 2025",
      description:
        "Large-scale hybrid solar installation currently in progress. Includes battery storage for power reliability and energy independence. Expected to significantly reduce electricity costs.",
      color: "from-indigo-400 to-indigo-600",
      estimatedSavings: "₱20,000/month",
      category: "Residential",
      image: "/images/Batasan-project.jpg",
      status: "ongoing",
      progress: 30,
      details: {
        currentPhase: "Pre-wiring for the inverter",
      },
    },
  ];

  // Add status to existing projects and put ongoing projects first
  const allProjects = [
    ...ongoingProjects,
    ...projects.map((p) => ({ ...p, status: "completed" })),
  ];

  const categories = [
    { name: "All Projects", count: allProjects.length },
    {
      name: "Residential",
      count: allProjects.filter((p) => p.category === "Residential").length,
    },
    {
      name: "Commercial",
      count: allProjects.filter((p) => p.category === "Commercial").length,
    },
    {
      name: "Industrial",
      count: allProjects.filter((p) => p.category === "Industrial").length,
    },
    {
      name: "Ongoing",
      count: ongoingProjects.length,
    },
  ];

  const filteredProjects =
    selectedCategory === "All Projects"
      ? allProjects
      : selectedCategory === "Ongoing"
      ? ongoingProjects
      : allProjects.filter((project) => project.category === selectedCategory);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  // Reset to page 1 when category changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

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
                onClick={() => handleCategoryChange(category.name)}
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
            {currentProjects.map((project) => (
              <Card
                key={project.id}
                className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => onNavigate(`project-detail:${project.id}`)}
              >
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
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {project.title}
                    </h3>
                    {project.status === "ongoing" && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full">
                        <Clock className="w-3 h-3" />
                        Ongoing
                      </span>
                    )}
                    {project.status === "completed" && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </span>
                    )}
                  </div>

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

                  {project.status === "ongoing" &&
                    (project as any).progress && (
                      <div className="pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Progress
                          </span>
                          <span className="text-sm font-semibold text-amber-600">
                            {(project as any).progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className="bg-amber-500 h-2.5 rounded-full transition-all duration-300"
                            style={{
                              width: `${(project as any).progress}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {project.status === "ongoing"
                            ? "Estimated Savings"
                            : "Monthly Savings"}
                        </p>
                        <p
                          className={`text-lg font-bold ${
                            project.status === "ongoing"
                              ? "text-amber-600"
                              : "text-green-600"
                          }`}
                        >
                          {project.status === "ongoing"
                            ? (project as any).estimatedSavings
                            : (project as any).savings}
                        </p>
                      </div>
                      {project.status === "ongoing" ? (
                        <Clock className="w-8 h-8 text-amber-500" />
                      ) : (
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 1
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === page
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === totalPages
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md"
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* By the Numbers section - hidden for now */}
      {/* <section className="py-20 bg-white dark:bg-gray-900">
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
                number: "0",
                label: "Completed Projects",
                color: "text-blue-600",
              },
              {
                number: "1",
                label: "Ongoing Projects",
                color: "text-amber-600",
              },
              {
                number: "16kW",
                label: "Total Capacity",
                color: "text-purple-600",
              },
              {
                number: "₱0",
                label: "Annual Savings",
                color: "text-green-600",
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
      </section> */}

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
