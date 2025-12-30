import { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Zap,
  Calendar,
  CheckCircle,
  Clock,
  Sun,
  X,
} from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import SEO from "../components/SEO";

interface ProjectDetailProps {
  onNavigate: (page: string) => void;
  projectId: string;
}

// This would normally come from a database or API
// For now, we'll define projects here (same as Projects.tsx)
const allProjectsData = [
  {
    id: 1,
    slug: "batasan-quezon-city-16kw-hybrid-solar",
    title: "Residential Hybrid Solar Installation",
    location: "Batasan, Quezon City",
    systemType: "Hybrid Solar",
    capacity: "16kW",
    installDate: "Final Phase - Near Completion",
    description:
      "Large-scale hybrid solar installation currently in progress. Includes battery storage for power reliability and energy independence. Expected to significantly reduce electricity costs.",
    color: "from-indigo-400 to-indigo-600",
    estimatedSavings: "₱20,000/month",
    category: "Residential",
    image: "/images/Batasan-project.jpg",
    additionalImages: [
      "/images/Installation16kW.jpg",
      "/images/Inverter16kW.jpg",
      "/images/Panels16kW.jpg",
      "/images/Delivery16kW.jpg",
    ],
    status: "ongoing",
    progress: 90,
    details: {
      panels: "27pcs 620W Solar panels (planned)",
      inverter: "Deye Hybrid Inverter 16kW (planned)",
      battery: "30.72kWh Battery Storage (planned)",
      roofArea: "85 sqm",
      installationTime: "2 days (estimated)",
      warranty:
        "12 years on panels, 5 years on inverter and 10 years on LiFePO4 Battery",
      environmentalImpact: "Expected to reduce CO₂ by 12.5 tons annually",
      paybackPeriod: "3-4 years (estimated)",
      currentPhase:
        "Awaiting main breaker installation to power up the inverter and install batteries",
    },
  },
  {
    id: 2,
    slug: "sampaloc-manila-6kw-hybrid-solar",
    title: "Residential Hybrid Solar Installation",
    location: "Sampaloc, Manila",
    systemType: "Hybrid Solar",
    capacity: "6kW",
    installDate: "Completed",
    description:
      "On December 28, 2025, we installed a 6kW Hybrid Inverter for a client's newly acquired townhouse unit. The client specifically chose a hybrid setup after experiencing limited savings and performance improvement from a 5kW grid-tied system installed in his first unit. With the hybrid system, the client now benefits from energy storage, improved self-consumption, and a stable power supply during grid outages and nighttime. Because of the clear advantages of the hybrid configuration, the client is planning to upgrade and eventually replace the existing grid-tied system in his first unit with a hybrid setup as well.",
    color: "from-blue-400 to-blue-600",
    savings: "₱5,500/month",
    category: "Residential",
    image: "/images/before.jpg",
    additionalImages: [
      "/images/preparation.jpg",
      "/images/railings.jpg",
      "/images/layingout.jpg",
      "/images/wiring.jpg",
      "/images/6kW-Inverter.jpg",
      "/images/battery.jpg",
      "/images/installedpanels.jpg",
      "/images/electrical.jpg",
      "/images/commisioned.jpg",
    ],
    status: "completed",
    progress: 100,
    details: {
      panels: "10pcs 620W Canadian Solar Panels (6.2kWp)",
      inverter: "6kW Hybrid Inverter",
      battery: "51.2V 314Ah LVTopsun LiFePO4 Battery (16kWh capacity)",
      roofArea: "24 sqm",
      installationTime: "1 day",
      warranty:
        "12 years on panels, 5 years on inverter and 10 years on LiFePO4 Battery",
      environmentalImpact: "Reduces CO₂ by 4.8 tons annually",
      paybackPeriod: "3-4 years",
    },
  },
];

export default function ProjectDetail({
  onNavigate,
  projectId,
}: ProjectDetailProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  // Support both slug and ID for backward compatibility
  const project = allProjectsData.find(
    (p) => (p as any).slug === projectId || p.id.toString() === projectId
  );

  // Scroll to top when lightbox opens and prevent background scroll
  useEffect(() => {
    if (lightboxImage) {
      // Scroll to top instantly
      window.scrollTo({ top: 0, behavior: "instant" });
      // Prevent body scroll when lightbox is open (but allow modal container to scroll)
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scroll when lightbox is closed
      document.body.style.overflow = "";
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxImage]);

  if (!project) {
    return (
      <>
        <SEO
          title="Project Not Found"
          description="The requested project could not be found."
        />
        <section className="pt-32 pb-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              The project you're looking for doesn't exist.
            </p>
            <Button onClick={() => onNavigate("projects")}>
              Back to Projects
            </Button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${project.title} - ${project.location}`}
        description={project.description}
        keywords={`solar installation ${project.location}, ${project.capacity} solar system, ${project.systemType}`}
      />

      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <Button
            variant="outline"
            onClick={() => onNavigate("projects")}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>

          <div className="max-w-6xl mx-auto">
            <Card className="overflow-hidden mb-8">
              <div className="h-96 md:h-[500px] -mx-6 -mt-6 mb-6 relative overflow-hidden">
                {project.image ? (
                  <>
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center justify-between">
                        <div className="text-white">
                          <p className="text-sm font-medium mb-1">
                            System Capacity
                          </p>
                          <p className="text-5xl font-bold drop-shadow-lg">
                            {project.capacity}
                          </p>
                        </div>
                        {project.status === "ongoing" && (
                          <span className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-full">
                            <Clock className="w-4 h-4" />
                            Ongoing
                          </span>
                        )}
                        {project.status === "completed" && (
                          <span className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-full">
                            <CheckCircle className="w-4 h-4" />
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    className={`bg-gradient-to-br ${project.color} w-full h-full flex flex-col items-center justify-center relative`}
                  >
                    <Sun className="w-32 h-32 text-white opacity-50 absolute" />
                    <div className="relative z-10 text-center text-white">
                      <p className="text-sm font-medium mb-1">
                        System Capacity
                      </p>
                      <p className="text-5xl font-bold">{project.capacity}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Images Gallery */}
              {(project as any).additionalImages &&
                (project as any).additionalImages.length > 0 && (
                  <div className="px-6 mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Project Gallery
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {(project as any).additionalImages.map(
                        (img: string, index: number) => (
                          <div
                            key={index}
                            className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
                            onClick={() => setLightboxImage(img)}
                          >
                            <img
                              src={img}
                              alt={`${project.title} - Image ${index + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-125"
                              onError={(e) => {
                                // Fallback to main image if additional image doesn't exist
                                (e.target as HTMLImageElement).src =
                                  project.image || "";
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full text-xs font-medium text-gray-900 dark:text-white">
                                Click to enlarge
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              <div className="px-6 pb-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                      {project.title}
                    </h1>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                        <span>{project.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 mr-2 text-amber-500" />
                        <span>{project.systemType}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-green-600" />
                        <span>{project.installDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {(project as any).progress && (
                  <div
                    className={`mb-6 p-4 rounded-lg border ${
                      project.status === "ongoing"
                        ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                        : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Installation Progress
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          project.status === "ongoing"
                            ? "text-amber-600"
                            : "text-green-600"
                        }`}
                      >
                        {(project as any).progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          project.status === "ongoing"
                            ? "bg-amber-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${(project as any).progress}%`,
                        }}
                      ></div>
                    </div>
                    {(project as any).details?.currentPhase && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        Current Phase: {(project as any).details.currentPhase}
                      </p>
                    )}
                  </div>
                )}

                <div className="prose dark:prose-invert max-w-none mb-8">
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <Card className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Project Specifications
                    </h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Solar Panels
                        </dt>
                        <dd className="text-base text-gray-900 dark:text-white">
                          {project.details?.panels}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Inverter
                        </dt>
                        <dd className="text-base text-gray-900 dark:text-white">
                          {project.details?.inverter}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Battery Storage
                        </dt>
                        <dd className="text-base text-gray-900 dark:text-white">
                          {project.details?.battery}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Roof Area Required
                        </dt>
                        <dd className="text-base text-gray-900 dark:text-white">
                          {project.details?.roofArea}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Installation Time
                        </dt>
                        <dd className="text-base text-gray-900 dark:text-white">
                          {project.details?.installationTime}
                        </dd>
                      </div>
                    </dl>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Benefits & Impact
                    </h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Estimated Monthly Savings
                        </dt>
                        <dd
                          className={`text-2xl font-bold ${
                            project.status === "ongoing"
                              ? "text-amber-600"
                              : "text-green-600"
                          }`}
                        >
                          {project.status === "ongoing"
                            ? (project as any).estimatedSavings
                            : (project as any).savings ||
                              (project as any).estimatedSavings}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Environmental Impact
                        </dt>
                        <dd className="text-base text-gray-900 dark:text-white">
                          {project.details?.environmentalImpact}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Payback Period
                        </dt>
                        <dd className="text-base text-gray-900 dark:text-white">
                          {project.details?.paybackPeriod}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Warranty
                        </dt>
                        <dd className="text-base text-gray-900 dark:text-white">
                          {project.details?.warranty}
                        </dd>
                      </div>
                    </dl>
                  </Card>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" onClick={() => onNavigate("contact")}>
                    Get Similar System
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => onNavigate("projects")}
                  >
                    View All Projects
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90"
          onClick={() => setLightboxImage(null)}
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            position: "fixed",
            overflowY: "scroll",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            height: "100vh",
            width: "100vw",
          }}
        >
          <button
            className="fixed top-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:text-gray-200 transition-all duration-300 z-[60] shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxImage(null);
            }}
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="flex justify-center w-full"
            style={{
              paddingTop: "4rem",
              paddingBottom: "4rem",
              paddingLeft: "1rem",
              paddingRight: "1rem",
              minHeight: "100vh",
              alignItems: "flex-start",
            }}
          >
            <img
              src={lightboxImage}
              alt="Enlarged view"
              className="rounded-lg"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: "100%",
                width: "auto",
                height: "auto",
                display: "block",
                margin: "0 auto",
                objectFit: "contain",
              }}
              onLoad={(e) => {
                // Ensure image can be its full natural size
                const img = e.target as HTMLImageElement;
                img.style.maxHeight = "none";
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
