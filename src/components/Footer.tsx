import {
  Sun,
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
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 text-gray-300 dark:text-gray-400">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
                <Sun className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Sunterra Solar</h3>
                <p className="text-xs text-gray-400">Energy Philippines</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Leading solar installation company in the Philippines, providing
              reliable and sustainable energy solutions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["home", "about", "services", "projects"].map((page) => (
                <li key={page}>
                  <button
                    onClick={() => handleNavClick(page)}
                    className="text-sm hover:text-amber-400 transition-colors capitalize"
                  >
                    {page}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-amber-400 transition-colors cursor-pointer">
                Grid-Tie Solar Systems
              </li>
              <li className="hover:text-amber-400 transition-colors cursor-pointer">
                Hybrid Solar Systems
              </li>
              <li className="hover:text-amber-400 transition-colors cursor-pointer">
                Off-Grid Solar Systems
              </li>
              <li className="hover:text-amber-400 transition-colors cursor-pointer">
                Commercial Solar
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
                <span>San Jose del Monte, Bulacan</span>
              </li>
              <li className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>+63 960 692 1760</span>
              </li>
              <li className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>info@sunterrasolarenergy.com</span>
              </li>
            </ul>
            <div className="flex space-x-3 mt-4">
              <button className="p-2 bg-gray-800 rounded-lg hover:bg-blue-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </button>
              <button className="p-2 bg-gray-800 rounded-lg hover:bg-pink-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </button>
              <button className="p-2 bg-gray-800 rounded-lg hover:bg-blue-500 transition-colors">
                <Linkedin className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {currentYear} Sunterra Solar Energy Philippines. All rights
              reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <button className="hover:text-amber-400 transition-colors">
                Privacy Policy
              </button>
              <button className="hover:text-amber-400 transition-colors">
                Terms of Service
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 mt-6">
          <p className="text-center text-sm text-white italic">
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
