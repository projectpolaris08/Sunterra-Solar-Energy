import {
  Target,
  Eye,
  Award,
  Users,
  Zap,
  Shield,
  TrendingUp,
  Heart,
  BadgeCheck,
} from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import SEO from "../components/SEO";

interface AboutProps {
  onNavigate: (page: string) => void;
}

export default function About({ onNavigate }: AboutProps) {
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

      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              About Sunterra Solar Energy
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Pioneering sustainable energy solutions across the Philippines
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            <div>
              <div className="rounded-3xl h-96 overflow-hidden shadow-2xl bg-gray-900">
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

            <div className="space-y-6">
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

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            <Card>
              <div className="flex items-center mb-6">
                <div className="bg-blue-600 p-3 rounded-xl mr-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Our Mission
                </h2>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
                To empower Filipino homes and businesses with reliable,
                sustainable solar energy solutions that reduce electricity
                costs, promote energy independence, and contribute to a cleaner
                environment for future generations.
              </p>
            </Card>

            <Card>
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 p-3 rounded-xl mr-4">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Our Vision
                </h2>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
                To be the Philippines' leading solar energy provider, recognized
                for innovation, quality, and customer satisfaction. We envision
                a future where every Filipino household and business harnesses
                the power of the sun for a sustainable tomorrow.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The principles that guide every decision we make and every project
              we complete
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <Card key={index}>
                <div className="flex flex-col items-center text-center">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-4 rounded-2xl mb-4">
                    <value.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {value.description}
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
                <Card
                  key={index}
                  className="group overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative overflow-hidden rounded-t-2xl -mx-6 -mt-6 mb-6">
                    <div className="aspect-[4/5] bg-gradient-to-br from-blue-100 to-blue-50 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {member.name}
                    </h3>
                    <div className="w-12 h-1 bg-blue-600 mx-auto rounded-full"></div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:max-w-4xl lg:mx-auto">
              {[
                { name: "Joshua", image: "/images/Joshua.jpg" },
                { name: "Diane", image: "/images/Diane.jpg" },
                { name: "David", image: "/images/David.jpg" },
              ].map((member, index) => (
                <Card
                  key={index}
                  className="group overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative overflow-hidden rounded-t-2xl -mx-6 -mt-6 mb-6">
                    <div className="aspect-[4/5] bg-gradient-to-br from-blue-100 to-blue-50 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {member.name}
                    </h3>
                    <div className="w-12 h-1 bg-blue-600 mx-auto rounded-full"></div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our Expert Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Dedicated professionals committed to your solar energy success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {team.map((member, index) => (
              <Card key={index}>
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 -mx-6 -mt-6 mb-6 flex items-center justify-center h-40 overflow-hidden">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.role}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <member.icon className="w-16 h-16 text-white" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {member.role}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {member.description}
                </p>
              </Card>
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

      <section className="py-12 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-blue-600 p-3 rounded-full">
                  <BadgeCheck className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  DTI Business Registration
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Legitimately registered with the Department of Trade and
                  Industry
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Business Name
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    SUNTERRA SOLAR POWER INSTALLATION SERVICES
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Business Name No.
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    7550942
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Validity Period
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    October 28, 2025 - October 28, 2030
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center mb-4">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Reference Number:</span>{" "}
                  JIICX213618248342
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Scope: NATIONAL
                </p>
              </div>

              <div className="flex flex-col items-center justify-center">
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 font-medium">
                  Verify Certificate
                </p>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                  <img
                    src="/images/DTI.jpg"
                    alt="DTI Certificate QR Code"
                    className="w-24 h-24 object-contain"
                    onError={(e) => {
                      // Hide image if not found
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Scan QR code to verify registration
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Join the Solar Revolution
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Be part of the growing community of Filipinos choosing clean,
              sustainable energy
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => onNavigate("contact")}>
                Get Started Today
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate("services")}
              >
                Explore Solutions
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
