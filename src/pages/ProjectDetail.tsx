import {
  ArrowLeft,
  MapPin,
  Zap,
  Calendar,
  CheckCircle,
  Clock,
  Sun,
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
    status: "completed",
    details: {
      panels: "24pcs 620W Solar Panels",
      inverter: "Deye Hybrid Inverter 12kW",
      battery: "30.72kWh Battery Storage",
      roofArea: "65 sqm",
      installationTime: "1 day",
      warranty:
        "12 years on panels, 5 years on inverter and 5 years on LiFePO4 Battery",
      environmentalImpact: "Reduces CO₂ by 9.5 tons annually",
      paybackPeriod: "3-4 years",
    },
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
    status: "completed",
    details: {
      panels: "24pcs 620W Solar Panels",
      inverter: "Deye Hybrid Inverter 12kW",
      battery: "30.72kWh Battery Storage",
      roofArea: "65 sqm",
      installationTime: "1 day",
      warranty:
        "12 years on panels, 5 years on inverter and 5 years on LiFePO4 Battery",
      environmentalImpact: "Reduces CO₂ by 9.5 tons annually",
      paybackPeriod: "3-4 years",
    },
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
    status: "completed",
    details: {
      panels: "24pcs 620W Solar Panels",
      inverter: "Deye Hybrid Inverter 12kW",
      battery: "30.72kWh Battery Storage",
      roofArea: "65 sqm",
      installationTime: "1 day",
      warranty:
        "12 years on panels, 5 years on inverter and 5 years on LiFePO4 Battery",
      environmentalImpact: "Reduces CO₂ by 9.5 tons annually",
      paybackPeriod: "3-4 years",
    },
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
    status: "completed",
    details: {
      panels: "27pcs 620W Solar Panels",
      inverter: "Deye Hybrid Inverter 16kW",
      battery: "30.72kWh Battery Storage",
      roofArea: "85 sqm",
      installationTime: "1 day",
      warranty:
        "12 years on panels, 5 years on inverter and 5 years on LiFePO4 Battery",
      environmentalImpact: "Reduces CO₂ by 12.5 tons annually",
      paybackPeriod: "3-4 years",
    },
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
    status: "completed",
    details: {
      panels: "16pcs 620W Solar Panels",
      inverter: "Deye Hybrid Inverter 8kW",
      battery: "15kWh Battery Storage",
      roofArea: "45 sqm",
      installationTime: "1 day",
      warranty:
        "12 years on panels, 5 years on inverter and 5 years on LiFePO4 Battery",
      environmentalImpact: "Reduces CO₂ by 6.5 tons annually",
      paybackPeriod: "3-4 years",
    },
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
    status: "completed",
    details: {
      panels: "16pcs 620W Solar Panels",
      inverter: "Deye Hybrid Inverter 8kW",
      battery: "15kWh Battery Storage",
      roofArea: "45 sqm",
      installationTime: "1 day",
      warranty:
        "12 years on panels, 5 years on inverter and 5 years on LiFePO4 Battery",
      environmentalImpact: "Reduces CO₂ by 6.5 tons annually",
      paybackPeriod: "3-4 years",
    },
  },
  {
    id: 7,
    title: "Residential Hybrid Solar Installation",
    location: "Batasan, Quezon City",
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
      panels: "27pcs 620W Solar panels (planned)",
      inverter: "Deye Hybrid Inverter 16kW (planned)",
      battery: "30.72kWh Battery Storage (planned)",
      roofArea: "85 sqm",
      installationTime: "2 days (estimated)",
      warranty:
        "12 years on panels, 5 years on inverter and 5 years on LiFePO4 Battery",
      environmentalImpact: "Expected to reduce CO₂ by 12.5 tons annually",
      paybackPeriod: "3-4 years (estimated)",
      currentPhase: "Pre-wiring for the inverter",
    },
  },
];

export default function ProjectDetail({
  onNavigate,
  projectId,
}: ProjectDetailProps) {
  const project = allProjectsData.find((p) => p.id.toString() === projectId);

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

                {project.status === "ongoing" && (project as any).progress && (
                  <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Installation Progress
                      </span>
                      <span className="text-sm font-semibold text-amber-600">
                        {(project as any).progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-amber-500 h-3 rounded-full transition-all duration-300"
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
                          {project.status === "ongoing"
                            ? "Monthly Savings (estimated savings)"
                            : "Monthly Savings"}
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
                            : project.savings}
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
    </>
  );
}
