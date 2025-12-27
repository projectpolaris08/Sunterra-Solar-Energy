import { useState, useEffect } from "react";
import {
  MapPin,
  Zap,
  Calendar,
  CheckCircle,
  Sun,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
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

  const ongoingProjects = [
    {
      id: 7,
      title: "Residential Hybrid Solar Installation",
      location: "TBD",
      systemType: "Hybrid Solar",
      capacity: "16kW",
      installDate: "Final Phase - Near Completion",
      description:
        "Large-scale hybrid solar installation currently in progress. Includes battery storage for power reliability and energy independence. Expected to significantly reduce electricity costs.",
      color: "from-indigo-400 to-indigo-600",
      estimatedSavings: "₱20,000/month",
      category: "Residential",
      image: "/images/Batasan-project.jpg",
      status: "ongoing",
      progress: 90,
      details: {
        currentPhase: "Awaiting main breaker installation to power up the inverter and install batteries",
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

      <section
        id="projects-hero-section"
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
              visibleSections.has("projects-hero-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 gradient-text">
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
            {currentProjects.map((project, index) => (
              <div
                key={project.id}
                className={`transition-all duration-700 ease-out ${
                  visibleSections.has("projects-hero-section")
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-12 scale-95"
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <div
                  className="card-3d immersive-hover"
                  style={{
                    transform: `perspective(1000px) rotateY(${
                      mousePosition.x * 2
                    }deg) rotateX(${mousePosition.y * -2}deg)`,
                  }}
                >
                  <Card
                    className="overflow-hidden cursor-pointer depth-4 h-full"
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
                            <p className="text-4xl font-bold">
                              {project.capacity}
                            </p>
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
                </div>
              </div>
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

      <section
        id="cta-section"
        data-scroll-section
        className="py-20 bg-gradient-to-br from-amber-50 to-blue-50 dark:from-gray-800 dark:to-gray-900"
      >
        <div className="container mx-auto px-4">
          <Card
            className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
              visibleSections.has("cta-section")
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-12 scale-95"
            }`}
          >
            <Sun className="w-16 h-16 text-amber-500 dark:text-amber-400 mx-auto mb-6 animate-spin-slow" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">
              Ready to Start Your Solar Project?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of satisfied customers who have made the switch to
              clean, affordable solar energy
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
        @keyframes sun-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
