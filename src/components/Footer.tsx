import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleNavClick = (path: string) => {
    onNavigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 text-gray-300 dark:text-gray-400 relative">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="group">
            <button
              onClick={() => handleNavClick("home")}
              className="flex items-center space-x-2 mb-4 group-hover:scale-105 transition-all duration-300"
            >
              <img
                src="/images/sunterra.svg"
                alt="Sunterra Solar Energy Philippines"
                className="h-10 w-auto group-hover:scale-110 transition-transform duration-300"
              />
              <div className="flex flex-col">
                <h3 className="font-bold text-white text-lg group-hover:text-amber-400 transition-colors duration-300">
                  Sunterra Solar
                </h3>
                <p className="text-xs text-gray-400">Energy Philippines</p>
              </div>
            </button>
            <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
              Committed to becoming the Philippines' most trusted solar
              installation company through reliable and sustainable energy
              solutions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 gradient-text">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {["home", "about", "services", "projects"].map((page, index) => (
                <li key={page}>
                  <button
                    onClick={() => handleNavClick(page)}
                    className="text-sm hover:text-amber-400 transition-all duration-300 capitalize hover:translate-x-1 hover:scale-105"
                    style={{
                      transitionDelay: `${index * 50}ms`,
                    }}
                  >
                    {page}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 gradient-text">
              Services
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                "Grid-Tie Solar Systems",
                "Hybrid Solar Systems",
                "Off-Grid Solar Systems",
                "Commercial Solar",
              ].map((service, index) => (
                <li
                  key={service}
                  className="hover:text-amber-400 transition-all duration-300 cursor-pointer hover:translate-x-1 hover:scale-105"
                  style={{
                    transitionDelay: `${index * 50}ms`,
                  }}
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 gradient-text">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-sm group">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                <span className="group-hover:text-white transition-colors duration-300">
                  San Jose del Monte, Bulacan
                </span>
              </li>
              <li className="flex items-center space-x-2 text-sm group">
                <Phone className="w-4 h-4 flex-shrink-0 text-amber-400 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                <span className="group-hover:text-white transition-colors duration-300">
                  +63 960 692 1760
                </span>
              </li>
              <li className="flex items-center space-x-2 text-sm group">
                <Mail className="w-4 h-4 flex-shrink-0 text-amber-400 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                <span className="group-hover:text-white transition-colors duration-300">
                  info@sunterrasolarenergy.com
                </span>
              </li>
            </ul>
            <div className="flex space-x-3 mt-4">
              <a
                href="https://www.facebook.com/sunterrasolarenergy/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800/80 backdrop-blur-sm rounded-lg hover:bg-blue-600 hover:scale-110 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 glass"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <button className="p-2 bg-gray-800/80 backdrop-blur-sm rounded-lg hover:bg-pink-600 hover:scale-110 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 glass">
                <Instagram className="w-4 h-4" />
              </button>
              <button className="p-2 bg-gray-800/80 backdrop-blur-sm rounded-lg hover:bg-blue-500 hover:scale-110 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 glass">
                <Linkedin className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400 hover:text-white transition-colors duration-300">
              © {currentYear} Sunterra Solar Energy Philippines. All rights
              reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <button className="hover:text-amber-400 transition-all duration-300 hover:scale-105 hover:underline">
                Privacy Policy
              </button>
              <button className="hover:text-amber-400 transition-all duration-300 hover:scale-105 hover:underline">
                Terms of Service
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700/50 pt-6 mt-6 flex justify-center items-center">
          <p className="text-sm text-white italic gradient-text text-center">
            To God be the Glory
          </p>
        </div>
      </div>

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Sunterra Solar Energy Philippines",
          description:
            "Professional solar panel installation company in the Philippines specializing in grid-tie, hybrid, and off-grid solar systems",
          image: "https://sunterrasolar.ph/logo.png",
          address: {
            "@type": "PostalAddress",
            addressCountry: "PH",
            addressLocality: "San Jose del Monte, Bulacan",
          },
          telephone: "+63-960-692-1760",
          email: "info@sunterrasolarenergy.com",
          priceRange: "$$",
          openingHours: "Mo-Sa 08:00-18:00",
        })}
      </script>
    </footer>
  );
}
