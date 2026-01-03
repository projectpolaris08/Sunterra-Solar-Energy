import {
  Sun,
  Zap,
  Shield,
  TrendingUp,
  ArrowRight,
  DollarSign,
  Leaf,
  Wrench,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import SEO from "../components/SEO";
import Deye from "../assets/images/DEYE.png";
import Dyness from "../assets/images/DYNESS.png";
import Aesolar from "../assets/images/AESOLAR.png";
import Lvtopsun from "../assets/images/LVTOPSUN.png";
import GridTieImage from "../assets/images/Grid-tie.png";
import HybridImage from "../assets/images/Hybrid.png";
import OffGridImage from "../assets/images/Off-grid.png";
import SolarPanelsImage from "../assets/images/solarpanels.jpg";

interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
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

  // Initialize particles
  useEffect(() => {
    const particlesContainer = document.querySelector(".particles-container");
    if (!particlesContainer) return;

    // Create additional floating particles
    for (let i = 0; i < 5; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 100 + 50}px;
        height: ${Math.random() * 100 + 50}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(59, 130, 246, ${
          Math.random() * 0.1 + 0.05
        }) 0%, transparent 70%);
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        animation: float-particle ${
          Math.random() * 20 + 15
        }s infinite ease-in-out;
        animation-delay: ${Math.random() * 5}s;
      `;
      particlesContainer.appendChild(particle);
    }

    return () => {
      const particles = particlesContainer.querySelectorAll(".particle");
      particles.forEach((p) => p.remove());
    };
  }, []);

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
      title: "Protection from Rate Hikes",
      description:
        "Lock in your energy costs and protect yourself from rising electricity rates. Solar power provides predictable, stable energy pricing for decades.",
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
      image: GridTieImage,
      color: "from-blue-500 to-blue-600",
      animation: "animate-icon-float",
    },
    {
      title: "Hybrid Solar",
      description:
        "Best of both worlds with battery backup and grid connection for uninterrupted power.",
      icon: Sun,
      image: HybridImage,
      color: "from-cyan-500 to-cyan-600",
      animation: "animate-icon-pulse",
    },
    {
      title: "Off-Grid Solar",
      description:
        "Complete energy independence for remote locations and properties.",
      icon: Shield,
      image: OffGridImage,
      color: "from-green-500 to-green-600",
      animation: "animate-battery-charge",
    },
  ];

  const testimonials = [
    {
      name: "Curt Uy",
      location: "",
      text: "After acquiring my second unit, I realized that my existing grid-tie system was not giving the results I expected. That's when I decided to upgrade to a hybrid system and contacted Sunterra Solar Energy. The hybrid system has been a game-changer. We no longer worry about power outages, and the savings have been incredible. Sunterra's service, from consultation to installation, was excellent.",
      rating: 5,
      image: "/images/commisioned.jpg",
    },
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
        {/* Hero image background with parallax and subtle movement */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
            willChange: "transform",
          }}
        >
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${SolarPanelsImage})`,
              animation: "kenBurns 25s ease-in-out infinite alternate",
              willChange: "transform",
            }}
          />
        </div>

        {/* Overlay for better text readability - neutral dark overlay */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Enhanced animated gradient orbs with parallax */}
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
          <div
            className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000 parallax-fast"
            style={{
              transform: `translate(${mousePosition.x * 10}px, ${
                mousePosition.y * 10 + scrollY * 0.4
              }px)`,
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 py-32 relative z-10 overflow-visible">
          <div
            className="max-w-4xl mx-auto text-center overflow-visible transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(${scrollY * 0.1}px)`,
            }}
          >
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-6 shadow-md animate-[fadeInDown_0.8s_ease-out,float_6s_ease-in-out_infinite] shimmer">
              <Sun className="w-5 h-5 text-amber-500 dark:text-amber-400 animate-[spin-slow_20s_linear_infinite]" />
              <span className="text-sm font-medium text-white drop-shadow-lg">
                Powering the Future of the Philippines
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-relaxed overflow-visible drop-shadow-lg animate-[fadeInUp_1s_ease-out_0.2s_both,slideInLeft_1.2s_ease-out_0.2s_both]">
              Your Road to Energy Independence
              <span className="block mt-2 gradient-text pb-3 animate-[fadeInUp_1s_ease-out_0.4s_both,slideInRight_1.2s_ease-out_0.4s_both]">
                Begins with Sunterra
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/95 mb-10 leading-relaxed max-w-3xl mx-auto drop-shadow-md animate-[fadeInUp_1s_ease-out_0.6s_both,slideInUp_1s_ease-out_0.6s_both]">
              Imagine a life where your home runs on your own sunlight. No fear
              of the next billing cycle, just steady, dependable energy.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-[fadeInUp_1s_ease-out_0.8s_both,bounceIn_1s_ease-out_0.8s_both]">
              <Button
                onClick={() => onNavigate("contact")}
                className="w-44 whitespace-nowrap magnetic immersive-hover group flex items-center justify-center"
              >
                Get a Quote
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button
                onClick={() => onNavigate("services")}
                className="w-44 whitespace-nowrap magnetic immersive-hover group flex items-center justify-center"
              >
                Explore More
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
          </div>

          {/* Hero Features Section */}
          <div className="max-w-6xl mx-auto mt-24 md:mt-32 animate-[fadeInUp_1s_ease-out_1s_both]">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
              {/* Backup Energy Storage */}
              <div className="flex flex-col items-center text-center transition-all duration-500 hover:scale-110 hover:-translate-y-2 animate-[fadeInUp_1s_ease-out_1.2s_both,float_6s_ease-in-out_infinite] hover:animate-none">
                <div className="w-16 h-16 mb-4 flex items-center justify-center animate-[pulse_3s_ease-in-out_infinite] hover:animate-none">
                  <img
                    src="/images/battery.png"
                    alt="Battery"
                    className="w-full h-full object-contain transition-transform duration-500 hover:rotate-12"
                  />
                </div>
                <h3 className="text-white text-lg font-semibold leading-tight transition-all duration-300 hover:text-amber-400">
                  Backup Energy Storage
                </h3>
              </div>

              {/* 24/7 Outage Protection */}
              <div className="flex flex-col items-center text-center transition-all duration-500 hover:scale-110 hover:-translate-y-2 animate-[fadeInUp_1s_ease-out_1.4s_both,float_6s_ease-in-out_infinite_0.5s] hover:animate-none">
                <div className="mb-4 animate-[pulse_2s_ease-in-out_infinite] hover:animate-none">
                  <span className="text-4xl font-bold gradient-text transition-all duration-300 hover:scale-110 inline-block">
                    24/7
                  </span>
                </div>
                <h3 className="text-white text-lg font-semibold leading-tight transition-all duration-300 hover:text-amber-400">
                  Outage Protection
                </h3>
              </div>

              {/* Energy Independence */}
              <div className="flex flex-col items-center text-center transition-all duration-500 hover:scale-110 hover:-translate-y-2 animate-[fadeInUp_1s_ease-out_1.6s_both,float_6s_ease-in-out_infinite_1s] hover:animate-none">
                <div className="w-16 h-16 mb-4 flex items-center justify-center animate-[pulse_3s_ease-in-out_infinite] hover:animate-none">
                  <img
                    src="/images/electric.png"
                    alt="Electric"
                    className="w-full h-full object-contain transition-transform duration-500 hover:rotate-12"
                  />
                </div>
                <h3 className="text-white text-lg font-semibold leading-tight transition-all duration-300 hover:text-amber-400">
                  Energy Independence
                </h3>
              </div>

              {/* EV Charging */}
              <div className="flex flex-col items-center text-center transition-all duration-500 hover:scale-110 hover:-translate-y-2 animate-[fadeInUp_1s_ease-out_1.8s_both,float_6s_ease-in-out_infinite_1.5s] hover:animate-none">
                <div className="w-16 h-16 mb-4 flex items-center justify-center animate-[pulse_3s_ease-in-out_infinite] hover:animate-none">
                  <img
                    src="/images/EV.png"
                    alt="EV Charging"
                    className="w-full h-full object-contain transition-transform duration-500 hover:rotate-12"
                  />
                </div>
                <h3 className="text-white text-lg font-semibold leading-tight transition-all duration-300 hover:text-amber-400">
                  EV Charging
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Stats section - hidden for now */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </div> */}
      </section>

      <style>{`
          @keyframes kenBurns {
            0% {
              transform: scale(1.1) translate(0, 0);
            }
            33% {
              transform: scale(1.12) translate(-1.5%, -1%);
            }
            66% {
              transform: scale(1.14) translate(-2%, -1.5%);
            }
            100% {
              transform: scale(1.1) translate(-0.5%, -0.5%);
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

          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
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

          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes bounceIn {
            0% {
              opacity: 0;
              transform: scale(0.3) translateY(50px);
            }
            50% {
              opacity: 1;
              transform: scale(1.05);
            }
            70% {
              transform: scale(0.9);
            }
            100% {
              transform: scale(1) translateY(0);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.05);
            }
          }

          .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
          }

          .animate-float {
            animation: float 6s ease-in-out infinite;
          }

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

          .animate-icon-float {
            animation: icon-float 3s ease-in-out infinite;
          }

          .animate-icon-bounce {
            animation: icon-bounce 2s ease-in-out infinite;
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

          .animate-icon-pulse {
            animation: icon-pulse 2s ease-in-out infinite;
          }

          @keyframes battery-charge {
            0% {
              transform: translateY(0) scale(1);
              filter: brightness(1);
            }
            25% {
              transform: translateY(-5px) scale(1.05);
              filter: brightness(1.2);
            }
            50% {
              transform: translateY(-10px) scale(1.1);
              filter: brightness(1.4);
            }
            75% {
              transform: translateY(-5px) scale(1.05);
              filter: brightness(1.2);
            }
            100% {
              transform: translateY(0) scale(1);
              filter: brightness(1);
            }
          }

          .animate-battery-charge {
            animation: battery-charge 2s ease-in-out infinite;
          }

          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }

          .animate-scroll {
            animation: scroll 30s linear infinite;
            width: fit-content;
            display: flex;
          }

          .animate-scroll:hover {
            animation-play-state: paused;
          }

          [data-scroll-section] {
            will-change: transform, opacity;
          }
        `}</style>

      <section
        id="features-section"
        data-scroll-section
        className="py-20 bg-white dark:bg-gray-900"
      >
        <div className="container mx-auto px-4">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              visibleSections.has("features-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">
              Why Choose Sunterra Solar?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We combine expertise, quality, and exceptional service to deliver
              the best solar solutions in the Philippines
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ease-out h-full ${
                  visibleSections.has("features-section")
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <Card className="group card-3d immersive-hover cursor-pointer depth-3 h-full flex flex-col">
                  <div className="flex flex-col h-full">
                    <div
                      className={`${feature.bgColor} border ${feature.borderColor} p-3 rounded-lg w-fit mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                      style={{
                        transform: `perspective(1000px) rotateY(${
                          mousePosition.x * 5
                        }deg) rotateX(${mousePosition.y * -5}deg)`,
                      }}
                    >
                      <feature.icon
                        className={`w-6 h-6 ${
                          feature.iconColor
                        } group-hover:scale-110 transition-transform duration-300 ${
                          (feature as any).iconAnimation || ""
                        }`}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-left flex-grow">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="services-section"
        data-scroll-section
        className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900"
      >
        <div className="container mx-auto px-4">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              visibleSections.has("services-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">
              Our Solar Solutions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Tailored solar systems designed for Philippine homes and
              businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {services.map((service, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ease-out ${
                  visibleSections.has("services-section")
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-12 scale-95"
                }`}
                style={{
                  transitionDelay: `${index * 150}ms`,
                }}
              >
                <Card className="overflow-hidden h-full flex flex-col group card-3d immersive-hover cursor-pointer relative depth-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-all duration-500 rounded-lg"></div>
                  <div
                    className={`bg-gradient-to-br ${service.color} p-6 -mx-6 -mt-6 mb-6 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center relative overflow-hidden shimmer`}
                    style={{
                      transform: `perspective(1000px) rotateY(${
                        mousePosition.x * 3
                      }deg) rotateX(${mousePosition.y * -3}deg)`,
                    }}
                  >
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-500"></div>
                    <img
                      src={service.image}
                      alt={service.title}
                      className={`h-32 w-auto object-contain group-hover:scale-110 transition-transform duration-300 relative z-10 ${
                        service.animation || "animate-icon-float"
                      }`}
                    />
                  </div>
                  <div className="relative z-10 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-2 transition-all duration-300">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                      {service.description}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigate("services")}
                      className="w-full mt-auto group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:scale-105 group-hover:shadow-lg transition-all duration-300"
                    >
                      Learn More
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          <div
            className={`text-center mt-12 transition-all duration-1000 delay-500 ${
              visibleSections.has("services-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate("services")}
              className="hover:scale-110 hover:shadow-xl transition-all duration-300"
            >
              View All Services
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Installations section - hidden for now */}
      {/* <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Installations
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Trusted by Filipino families and businesses
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
      </section> */}

      {/* What Our Clients Say section - hidden for now */}
      {/* <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700">
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
      </section> */}

      <section
        id="partners-section"
        data-scroll-section
        className="py-20 bg-white dark:bg-gray-900"
      >
        <div className="container mx-auto px-4">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              visibleSections.has("partners-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">
              Trusted Partners
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We work with industry-leading manufacturers to bring you the best
              solar solutions
            </p>
          </div>

          <div className="relative overflow-hidden">
            <div className="flex animate-scroll gap-12 items-center justify-center">
              {[
                { name: "Lvtopsun", logo: Lvtopsun },
                { name: "Aesolar", logo: Aesolar },
                { name: "Deye", logo: Deye },
                { name: "Dyness", logo: Dyness },
              ].map((partner, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 transition-all duration-700 ease-out ${
                    visibleSections.has("partners-section")
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 translate-y-12 scale-95"
                  }`}
                  style={{
                    transitionDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="bg-transparent p-6 rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="h-28 w-44 object-contain"
                    />
                  </div>
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {[
                { name: "Lvtopsun", logo: Lvtopsun },
                { name: "Aesolar", logo: Aesolar },
                { name: "Deye", logo: Deye },
                { name: "Dyness", logo: Dyness },
              ].map((partner, index) => (
                <div key={`duplicate-${index}`} className="flex-shrink-0">
                  <div className="bg-transparent p-6 rounded-xl flex items-center justify-center">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="h-28 w-44 object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="testimonials-section"
        data-scroll-section
        className="py-20 bg-white dark:bg-gray-900"
      >
        <div className="container mx-auto px-4">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              visibleSections.has("testimonials-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Real experiences from satisfied customers across the Philippines
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ease-out ${
                  visibleSections.has("testimonials-section")
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-12 scale-95"
                }`}
                style={{
                  transitionDelay: `${index * 150}ms`,
                }}
              >
                <Card className="bg-white dark:bg-gray-800 h-full flex flex-col group hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                  {(testimonial as any).image && (
                    <div className="h-48 -mx-6 -mt-6 mb-6 relative overflow-hidden">
                      <img
                        src={(testimonial as any).image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    </div>
                  )}
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
                    {testimonial.location && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {testimonial.location}
                      </p>
                    )}
                  </div>
                </Card>
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
                className="w-full sm:w-auto hover:scale-110 hover:shadow-xl transition-all duration-300 group"
              >
                Schedule Free Assessment
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate("faq")}
                className="w-full sm:w-auto hover:scale-110 hover:shadow-xl transition-all duration-300"
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
