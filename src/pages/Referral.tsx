import {
  DollarSign,
  Users,
  Gift,
  Share2,
  CheckCircle,
  ArrowRight,
  Sun,
  TrendingUp,
  Award,
  MessageCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import SEO from "../components/SEO";

interface ReferralProps {
  onNavigate: (page: string) => void;
}

export default function Referral({ onNavigate }: ReferralProps) {
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

  const benefits = [
    {
      icon: DollarSign,
      title: "Earn Cash Rewards",
      description:
        "Get rewarded for every successful referral. The more you refer, the more you earn!",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Gift,
      title: "Easy to Share",
      description:
        "Get your unique referral link and share it with friends, family, and your network.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Users,
      title: "Help Others Go Solar",
      description:
        "Help your community save money and the environment by switching to solar energy.",
      color: "from-amber-500 to-amber-600",
    },
    {
      icon: TrendingUp,
      title: "Unlimited Referrals",
      description:
        "No limit on how many people you can refer. Build a sustainable income stream!",
      color: "from-purple-500 to-purple-600",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Sign Up",
      description: "Register for our referral program and get your unique referral link.",
      icon: Share2,
    },
    {
      number: "2",
      title: "Share Your Link",
      description:
        "Share your referral link with friends, family, or on social media.",
      icon: Users,
    },
    {
      number: "3",
      title: "They Go Solar",
      description:
        "When someone uses your link and installs a solar system, you earn!",
      icon: Sun,
    },
    {
      number: "4",
      title: "Get Rewarded",
      description:
        "Receive your cash reward once their installation is completed.",
      icon: Award,
    },
  ];

  const faqs = [
    {
      question: "How much can I earn per referral?",
      answer:
        "Earnings vary based on the system size installed. Contact us for specific commission rates. Typically, you can earn a percentage of the installation value.",
    },
    {
      question: "When do I receive my reward?",
      answer:
        "You'll receive your reward after the referred customer's solar installation is completed and payment is received.",
    },
    {
      question: "Is there a limit to how many people I can refer?",
      answer:
        "No! There's no limit. Refer as many people as you want and earn unlimited rewards.",
    },
    {
      question: "Do I need to be a customer to participate?",
      answer:
        "No, anyone can join our referral program. You don't need to have a solar system yourself.",
    },
    {
      question: "How do I track my referrals?",
      answer:
        "Once you're registered, you'll get access to a dashboard where you can track all your referrals and earnings.",
    },
    {
      question: "What if someone uses my link but doesn't mention me?",
      answer:
        "As long as they use your unique referral link, you'll be credited automatically. No need to mention your name.",
    },
  ];

  return (
    <>
      <SEO
        title="Earn with Us - Referral Program | Sunterra Solar Energy"
        description="Join Sunterra Solar's referral program and earn money by referring friends and family. Help others go solar and get rewarded. Sign up today!"
        keywords="solar referral program, earn money solar, referral rewards, solar affiliate, Sunterra Solar referral"
      />

      {/* Hero Section */}
      <section
        id="referral-hero-section"
        data-scroll-section
        className="pt-32 pb-20 bg-gradient-to-br from-amber-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden"
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute top-20 left-10 w-72 h-72 bg-amber-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse parallax-slow"
            style={{
              transform: `translate(${mousePosition.x * 20}px, ${
                mousePosition.y * 20 + scrollY * 0.3
              }px)`,
            }}
          ></div>
          <div
            className="absolute top-40 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700 parallax-medium"
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
              visibleSections.has("referral-hero-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-full mb-6">
              <Gift className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Referral Program
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 gradient-text">
              Earn with Us
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              Turn your network into income. Refer friends and family to solar
              energy and earn rewards for every successful installation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => onNavigate("referral-signup")}
                className="w-full sm:w-auto hover:scale-110 hover:shadow-xl transition-all duration-300 group"
              >
                Join Referral Program
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  document
                    .getElementById("how-it-works-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto"
              >
                Learn How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits-section"
        data-scroll-section
        className="py-20 bg-white dark:bg-gray-900"
      >
        <div className="container mx-auto px-4">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              visibleSections.has("benefits-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">
              Why Join Our Referral Program?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Earn money while helping others make the switch to clean, renewable
              energy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ease-out ${
                  visibleSections.has("benefits-section")
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <Card className="card-3d immersive-hover depth-3 h-full flex flex-col group">
                  <div
                    className={`bg-gradient-to-br ${benefit.color} p-4 rounded-xl w-fit mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                    style={{
                      transform: `perspective(1000px) rotateY(${
                        mousePosition.x * 5
                      }deg) rotateX(${mousePosition.y * -5}deg)`,
                    }}
                  >
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {benefit.description}
                  </p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works-section"
        data-scroll-section
        className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900"
      >
        <div className="container mx-auto px-4">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              visibleSections.has("how-it-works-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get started in just 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ease-out ${
                  visibleSections.has("how-it-works-section")
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-12 scale-95"
                }`}
                style={{
                  transitionDelay: `${index * 150}ms`,
                }}
              >
                <Card className="card-3d immersive-hover depth-4 h-full flex flex-col relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-amber-500/10 rounded-bl-full"></div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                        {step.number}
                      </div>
                      <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-3 rounded-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <step.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed flex-grow">
                      {step.description}
                    </p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Join Now */}
      <section
        id="join-cta-section"
        data-scroll-section
        className="py-20 bg-white dark:bg-gray-900"
      >
        <div className="container mx-auto px-4">
          <Card
            className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
              visibleSections.has("join-cta-section")
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-12 scale-95"
            }`}
          >
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Gift className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">
              Ready to Start Earning?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join our referral program today and start earning rewards for
              every successful referral. It's free to join and easy to get
              started!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => onNavigate("referral-signup")}
                className="w-full sm:w-auto hover:scale-110 hover:shadow-xl transition-all duration-300 group"
              >
                Sign Up Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  document
                    .getElementById("faq-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto"
              >
                View FAQ
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq-section"
        data-scroll-section
        className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900"
      >
        <div className="container mx-auto px-4">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              visibleSections.has("faq-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to know about our referral program
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ease-out ${
                  visibleSections.has("faq-section")
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <Card className="card-3d immersive-hover depth-2">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section
        id="final-cta-section"
        data-scroll-section
        className="py-20 bg-gradient-to-br from-amber-50 to-blue-50 dark:from-gray-800 dark:to-gray-900"
      >
        <div className="container mx-auto px-4">
          <Card
            className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
              visibleSections.has("final-cta-section")
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-12 scale-95"
            }`}
          >
            <Sun className="w-16 h-16 text-amber-500 dark:text-amber-400 mx-auto mb-6 animate-spin-slow" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">
              Start Earning Today
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of others who are earning money by sharing the
              benefits of solar energy. Get started in minutes!
            </p>
            <Button
              size="lg"
              onClick={() => onNavigate("referral-signup")}
              className="hover:scale-110 hover:shadow-xl transition-all duration-300 group"
            >
              Sign Up Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Card>
        </div>
      </section>
    </>
  );
}
