import {
  Sun,
  Zap,
  Shield,
  TrendingUp,
  Award,
  Users,
  ArrowRight,
  CheckCircle,
  Star,
  DollarSign,
  Leaf,
  Wrench,
} from "lucide-react";
import Button from "../components/Button";
import Card from "../components/Card";
import SEO from "../components/SEO";
import HeroImage from "../assets/images/solarpanels.jpg";

interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const features = [
    {
      icon: Zap,
      title: "High Efficiency",
      description:
        "Our premium solar panels convert up to 22% of sunlight into usable energy, maximizing your power generation.",
      iconColor: "text-yellow-500 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-400 dark:border-yellow-500",
    },
    {
      icon: DollarSign,
      title: "Lower Energy Bills",
      description:
        "Reduce your electricity costs by up to 70% with our efficient solar solutions and smart energy management.",
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-400 dark:border-green-500",
    },
    {
      icon: Leaf,
      title: "Eco-Friendly",
      description:
        "Reduce your carbon footprint and contribute to a cleaner environment with 100% renewable energy.",
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-400 dark:border-green-500",
    },
    {
      icon: Shield,
      title: "12-Year Solar Panel Warranty",
      description:
        "Industry-leading warranty coverage ensures your investment is protected for decades to come.",
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-400 dark:border-blue-500",
    },
    {
      icon: TrendingUp,
      title: "Increased Home Value",
      description:
        "Solar installations can increase your property value by an average of 4% according to recent studies.",
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-400 dark:border-blue-500",
    },
    {
      icon: Wrench,
      title: "Professional Installation",
      description:
        "Our certified technicians ensure seamless installation with minimal disruption to your daily routine.",
      iconColor: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-50 dark:bg-gray-900/20",
      borderColor: "border-gray-400 dark:border-gray-500",
    },
  ];

  const services = [
    {
      title: "Grid-Tie Solar",
      description:
        "Connect to the grid and sell excess energy back. Perfect for urban homes and businesses.",
      icon: Zap,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Hybrid Solar",
      description:
        "Best of both worlds with battery backup and grid connection for uninterrupted power.",
      icon: Sun,
      color: "from-amber-500 to-amber-600",
    },
    {
      title: "Off-Grid Solar",
      description:
        "Complete energy independence for remote locations and properties.",
      icon: Shield,
      color: "from-green-500 to-green-600",
    },
  ];

  const testimonials = [
    {
      name: "Sir Kyle",
      location: "Cubao, Quezon City",
      text: "Our electricity bill dropped by 85%. The installation was professional and hassle-free. The 12kW hybrid system is perfect for our family.",
      rating: 5,
    },
    {
      name: "Doc Emman",
      location: "Cabanatuan, Nueva Ecija",
      text: "Excellent service from consultation to installation. The team was knowledgeable and the 16kW system works perfectly. We're now energy independent with battery backup.",
      rating: 5,
    },
    {
      name: "Sir Rommel",
      location: "Marilao",
      text: "Best investment we made for our home. The 8kW hybrid system provides excellent ROI and requires minimal maintenance. Highly recommend Sunterra Solar!",
      rating: 5,
    },
  ];

  const stats = [
    { number: "6", label: "Completed Projects" },
    { number: "68kW", label: "Total Capacity" },
    { number: "98%", label: "Efficiency Rate" },
  ];

  return (
    <>
      <SEO
        title="Professional Solar Panel Installation"
        description="Sunterra Solar Energy is the leading solar installation company in the Philippines. Expert installation of grid-tie, hybrid, and off-grid solar systems. Get a free site assessment today."
        keywords="solar installation Philippines, solar panel installer, Sunterra Solar Energy, grid-tie solar, hybrid solar, off-grid solar, solar energy Philippines, solar power Manila"
        canonicalUrl="https://sunterrasolar.ph"
      />

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-[kenBurns_20s_ease-in-out_infinite_alternate]"
          style={{
            backgroundImage: `url(${HeroImage})`,
          }}
        />

        {/* Overlay for better text readability - neutral dark overlay */}
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-amber-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 py-32 relative z-10 overflow-visible">
          <div className="max-w-4xl mx-auto text-center overflow-visible">
            <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-md animate-[fadeInDown_0.8s_ease-out]">
              <Sun className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Powering the Future of the Philippines
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-relaxed overflow-visible drop-shadow-lg animate-[fadeInUp_1s_ease-out_0.2s_both]">
              Your Road to Energy Independence
              <span className="block mt-2 bg-gradient-to-r from-blue-300 via-blue-400 to-amber-300 bg-clip-text text-transparent pb-3 animate-[fadeInUp_1s_ease-out_0.4s_both]">
                Begins with Sunterra
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/95 mb-10 leading-relaxed max-w-3xl mx-auto drop-shadow-md animate-[fadeInUp_1s_ease-out_0.6s_both]">
              Imagine a life where your home runs on your own sunlight. No fear
              of the next billing cycle, just steady, dependable energy.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-[fadeInUp_1s_ease-out_0.8s_both]">
              <Button
                size="lg"
                onClick={() => onNavigate("contact")}
                className="w-full sm:w-auto hover:scale-105 transition-transform duration-300"
              >
                Get Quote
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate("services")}
                className="w-full sm:w-auto hover:scale-105 transition-transform duration-300"
              >
                Explore Services
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/20 dark:bg-gray-900/20 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-2xl p-6 shadow-xl hover:scale-105 transition-all duration-300 hover:bg-white/30 dark:hover:bg-gray-900/30"
                  style={{
                    animation: `fadeInUp 1s ease-out ${1 + index * 0.2}s both`,
                  }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2 drop-shadow-lg">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white font-semibold drop-shadow-lg">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes kenBurns {
            0% {
              transform: scale(1) translate(0, 0);
            }
            100% {
              transform: scale(1.1) translate(-2%, -2%);
            }
          }
          
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Sunterra Solar?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We combine expertise, quality, and exceptional service to deliver
              the best solar solutions in the Philippines
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index}>
                <div className="flex flex-col">
                  <div
                    className={`${feature.bgColor} border ${feature.borderColor} p-3 rounded-lg w-fit mb-4`}
                  >
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-left">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our Solar Solutions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Tailored solar systems designed for Philippine homes and
              businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {services.map((service, index) => (
              <Card
                key={index}
                className="overflow-hidden h-full flex flex-col"
              >
                <div
                  className={`bg-gradient-to-br ${service.color} p-6 -mx-6 -mt-6 mb-6`}
                >
                  <service.icon className="w-12 h-12 text-white mb-4" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  {service.description}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate("services")}
                  className="w-full mt-auto"
                >
                  Learn More
                </Button>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate("services")}
            >
              View All Services
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Installations
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Trusted by hundreds of Filipino families and businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {[
              {
                title: "Residential Hybrid Solar",
                location: "Cubao, Quezon City",
                capacity: "12kW",
                image: "/images/12kW-Hybrid.jpg",
              },
              {
                title: "Residential Hybrid Solar",
                location: "Cabanatuan, Nueva Ecija",
                capacity: "16kW",
                image: "/images/16kW.jpg",
              },
              {
                title: "Residential Hybrid Solar",
                location: "Marilao, Bulacan",
                capacity: "8kW",
                image: "/images/8kW-Hybrid.jpg",
              },
            ].map((project, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-48 -mx-6 -mt-6 mb-6 relative overflow-hidden">
                  {project.image ? (
                    <>
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white text-2xl font-bold drop-shadow-lg">
                          {project.capacity}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <Sun className="w-20 h-20 text-white opacity-50" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  {project.location}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {project.capacity} System
                  </span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => onNavigate("projects")}
            >
              View All Projects
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Real experiences from satisfied customers across the Philippines
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white h-full flex flex-col">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic flex-grow">
                  "{testimonial.text}"
                </p>
                <div className="border-t dark:border-gray-700 pt-4 mt-auto">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.location}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-amber-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto text-center">
            <Sun className="w-16 h-16 text-amber-500 dark:text-amber-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Go Solar?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Get a free site assessment and discover how much you can save with
              solar energy. Our experts will design a custom solution for your
              needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => onNavigate("contact")}
                className="w-full sm:w-auto"
              >
                Schedule Free Assessment
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate("faq")}
                className="w-full sm:w-auto"
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
