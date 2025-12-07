import {
  Target,
  Eye,
  Award,
  Users,
  Zap,
  Shield,
  TrendingUp,
  Heart,
  Sun,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import SEO from "../components/SEO";

interface AboutProps {
  onNavigate: (page: string) => void;
}

export default function About({ onNavigate }: AboutProps) {
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

  const values = [
    {
      icon: Shield,
      title: "Reliability",
      description:
        "We deliver consistent, high-quality solar solutions that stand the test of time",
    },
    {
      icon: Award,
      title: "Excellence",
      description:
        "We pursue the highest standards in every installation and service we provide",
    },
    {
      icon: Heart,
      title: "Integrity",
      description:
        "We build trust through transparency, honesty, and ethical business practices",
    },
    {
      icon: Users,
      title: "Customer Focus",
      description:
        "Your satisfaction and energy goals are at the heart of everything we do",
    },
  ];

  const team = [
    {
      role: "Expert Solar Installers",
      description: "Licensed and certified solar installation professionals",
      icon: Zap,
      image:
        "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop&auto=format",
    },
    {
      role: "Project Managers",
      description: "Dedicated coordinators ensuring smooth installations",
      icon: TrendingUp,
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&auto=format",
    },
    {
      role: "Support Team",
      description: "Always available for maintenance and assistance",
      icon: Users,
      image:
        "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop&auto=format",
    },
  ];

  return (
    <>
      <SEO
        title="About Us - Leading Solar Energy Company"
        description="Learn about Sunterra Solar Energy Philippines. With over 10 years of experience, we're the trusted choice for solar panel installation across the Philippines. Our mission is to make clean energy accessible to all."
        keywords="about Sunterra Solar, solar company Philippines, solar energy mission, professional solar installer"
      />

      <section
        id="about-hero-section"
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
              visibleSections.has("about-hero-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 gradient-text">
              About Sunterra Solar Energy
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Pioneering sustainable energy solutions across the Philippines
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            <div
              className={`transition-all duration-1000 ${
                visibleSections.has("about-hero-section")
                  ? "opacity-100 translate-x-0 scale-100"
                  : "opacity-0 -translate-x-12 scale-95"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <div
                className="rounded-3xl h-96 overflow-hidden shadow-2xl bg-gray-900 card-3d immersive-hover depth-4"
                style={{
                  transform: `perspective(1000px) rotateY(${
                    mousePosition.x * 3
                  }deg) rotateX(${mousePosition.y * -3}deg)`,
                }}
              >
                <video
                  src="/videos/Sunterra.mp4"
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            <div
              className={`space-y-6 transition-all duration-1000 ${
                visibleSections.has("about-hero-section")
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-12"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Our Story
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Founded in 2025, Sunterra Solar Energy began with a simple
                vision: to make clean, affordable solar energy accessible to
                every Filipino home and business.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Our team brings years of combined experience in solar
                installation and renewable energy solutions. We're committed to
                becoming one of the Philippines' most trusted solar installation
                companies, helping families and businesses reduce their carbon
                footprint while saving significantly on energy costs.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Today, we lead with innovative solutions, exceptional service,
                and an unwavering commitment to quality and sustainability.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="mission-vision-section"
        data-scroll-section
        className="py-20 bg-white dark:bg-gray-900"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            <div
              className={`transition-all duration-1000 ${
                visibleSections.has("mission-vision-section")
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-12 scale-95"
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              <Card className="card-3d immersive-hover depth-3 h-full">
                <div className="flex items-center mb-6">
                  <div
                    className="bg-blue-600 p-3 rounded-xl mr-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300"
                    style={{
                      transform: `perspective(1000px) rotateY(${
                        mousePosition.x * 5
                      }deg) rotateX(${mousePosition.y * -5}deg)`,
                    }}
                  >
                    <Target className="w-8 h-8 text-white animate-[icon-float_3s_ease-in-out_infinite]" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Our Mission
                  </h2>
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
                  To empower Filipino homes and businesses with reliable,
                  sustainable solar energy solutions that reduce electricity
                  costs, promote energy independence, and contribute to a
                  cleaner environment for future generations.
                </p>
              </Card>
            </div>

            <div
              className={`transition-all duration-1000 ${
                visibleSections.has("mission-vision-section")
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-12 scale-95"
              }`}
              style={{ transitionDelay: "300ms" }}
            >
              <Card className="card-3d immersive-hover depth-3 h-full">
                <div className="flex items-center mb-6">
                  <div
                    className="bg-amber-600 p-3 rounded-xl mr-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300"
                    style={{
                      transform: `perspective(1000px) rotateY(${
                        mousePosition.x * 5
                      }deg) rotateX(${mousePosition.y * -5}deg)`,
                    }}
                  >
                    <Eye className="w-8 h-8 text-white animate-[icon-pulse_2s_ease-in-out_infinite]" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Our Vision
                  </h2>
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
                  To be the Philippines' leading solar energy provider,
                  recognized for innovation, quality, and customer satisfaction.
                  We envision a future where every Filipino household and
                  business harnesses the power of the sun for a sustainable
                  tomorrow.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section
        id="values-section"
        data-scroll-section
        className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900"
      >
        <div className="container mx-auto px-4">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              visibleSections.has("values-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The principles that guide every decision we make and every project
              we complete
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ease-out ${
                  visibleSections.has("values-section")
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-12 scale-95"
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <Card className="card-3d immersive-hover depth-3 h-full">
                  <div className="flex flex-col items-center text-center">
                    <div
                      className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 p-4 rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                      style={{
                        transform: `perspective(1000px) rotateY(${
                          mousePosition.x * 5
                        }deg) rotateX(${mousePosition.y * -5}deg)`,
                      }}
                    >
                      <value.icon className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-[icon-float_3s_ease-in-out_infinite]" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="team-section"
        data-scroll-section
        className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900"
      >
        <div className="container mx-auto px-4">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              visibleSections.has("team-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The passionate individuals driving our solar energy mission
              forward
            </p>
          </div>

          <div className="space-y-8 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { name: "Jayar", image: "/images/Jayar.jpg" },
                { name: "Mhy", image: "/images/Mhy.jpg" },
                { name: "Aira", image: "/images/Aira.jpg" },
                { name: "Reynald", image: "/images/Reynald.jpg" },
              ].map((member, index) => (
                <div
                  key={index}
                  className={`transition-all duration-700 ease-out ${
                    visibleSections.has("team-section")
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 translate-y-12 scale-95"
                  }`}
                  style={{
                    transitionDelay: `${index * 100}ms`,
                  }}
                >
                  <div
                    className="card relative w-[190px] h-[254px] transition-all duration-300 ease-in-out rounded-[30px] drop-shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:drop-shadow-[0_0_50px_rgba(59,130,246,1)] hover:scale-105 mx-auto card-3d immersive-hover"
                    style={{
                      background:
                        "linear-gradient(137deg, rgb(37, 99, 235) 0%, rgba(59,130,246,1) 100%)",
                      transform: `perspective(1000px) rotateY(${
                        mousePosition.x * 2
                      }deg) rotateX(${mousePosition.y * -2}deg)`,
                    }}
                  >
                    <div className="absolute z-[1] bg-[#181818] h-[98%] w-[98%] top-[1%] left-[1%] rounded-[28px] transition-all duration-300 ease-in-out flex flex-col items-center justify-center overflow-hidden">
                      <div className="relative w-full h-full flex flex-col items-center justify-center">
                        <div className="relative w-full flex-1 overflow-hidden">
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#181818] via-[#181818]/80 to-transparent p-4 text-center">
                          <h3 className="text-xl font-bold text-white">
                            {member.name}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:max-w-4xl lg:mx-auto">
              {[
                { name: "Joshua", image: "/images/Joshua.jpg" },
                { name: "Diane", image: "/images/Diane.jpg" },
                { name: "David", image: "/images/David.jpg" },
              ].map((member, index) => (
                <div
                  key={index}
                  className={`transition-all duration-700 ease-out ${
                    visibleSections.has("team-section")
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 translate-y-12 scale-95"
                  }`}
                  style={{
                    transitionDelay: `${400 + index * 100}ms`,
                  }}
                >
                  <div
                    className="card relative w-[190px] h-[254px] transition-all duration-300 ease-in-out rounded-[30px] drop-shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:drop-shadow-[0_0_50px_rgba(59,130,246,1)] hover:scale-105 mx-auto card-3d immersive-hover"
                    style={{
                      background:
                        "linear-gradient(137deg, rgb(37, 99, 235) 0%, rgba(59,130,246,1) 100%)",
                      transform: `perspective(1000px) rotateY(${
                        mousePosition.x * 2
                      }deg) rotateX(${mousePosition.y * -2}deg)`,
                    }}
                  >
                    <div className="absolute z-[1] bg-[#181818] h-[98%] w-[98%] top-[1%] left-[1%] rounded-[28px] transition-all duration-300 ease-in-out flex flex-col items-center justify-center overflow-hidden">
                      <div className="relative w-full h-full flex flex-col items-center justify-center">
                        <div className="relative w-full flex-1 overflow-hidden">
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#181818] via-[#181818]/80 to-transparent p-4 text-center">
                          <h3 className="text-xl font-bold text-white">
                            {member.name}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="expert-team-section"
        data-scroll-section
        className="py-20 bg-white dark:bg-gray-900"
      >
        <div className="container mx-auto px-4">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              visibleSections.has("expert-team-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">
              Our Expert Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Dedicated professionals committed to your solar energy success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {team.map((member, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ease-out ${
                  visibleSections.has("expert-team-section")
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-12 scale-95"
                }`}
                style={{
                  transitionDelay: `${index * 150}ms`,
                }}
              >
                <Card className="card-3d immersive-hover depth-3 h-full">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 -mx-6 -mt-6 mb-6 flex items-center justify-center h-40 overflow-hidden group-hover:scale-110 transition-transform duration-500 shimmer">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.role}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <member.icon className="w-16 h-16 text-white animate-[icon-float_3s_ease-in-out_infinite]" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {member.role}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {member.description}
                  </p>
                </Card>
              </div>
            ))}
          </div>

          {/* Statistics section - hidden for now */}
          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { number: "6", label: "Projects Completed" },
              { number: "68kW", label: "Total Installed Capacity" },
              { number: "98%", label: "Customer Satisfaction" },
              { number: "24/7", label: "Support Available" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div> */}
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
              Join the Solar Revolution
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Be part of the growing community of Filipinos choosing clean,
              sustainable energy
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
      `}</style>
    </>
  );
}
