import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import Button from "./Button";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", path: "home" },
    { name: "About", path: "about" },
    { name: "Services", path: "services" },
    { name: "Projects", path: "projects" },
    { name: "Blog", path: "blog" },
    { name: "Calculator", path: "calculator" },
    { name: "FAQ", path: "faq" },
    { name: "Contact", path: "contact" },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white dark:bg-gray-900 shadow-lg py-3"
          : "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => handleNavClick("home")}
            className="flex items-center space-x-2 group"
          >
            <img
              src="/images/sunterra.svg"
              alt="Sunterra Solar Energy Philippines"
              className="h-12 w-auto group-hover:scale-110 transition-transform duration-300"
            />
            <div className="flex flex-col">
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                Sunterra Solar
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 -mt-1">
                Energy Philippines
              </span>
            </div>
          </button>

          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`font-medium transition-colors duration-300 relative group ${
                  currentPage === item.path
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                {item.name}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 ${
                    currentPage === item.path
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                />
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Button size="md" onClick={() => handleNavClick("contact")}>
              Get Quote
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="theme-toggle-wrapper">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={theme === "dark"}
                  onChange={toggleTheme}
                  aria-label="Toggle theme"
                />
                <span className="slider">
                  <div className="clouds">
                    <svg viewBox="0 0 100 100" className="cloud cloud1">
                      <path d="M30,45 Q35,25 50,25 Q65,25 70,45 Q80,45 85,50 Q90,55 85,60 Q80,65 75,60 Q65,60 60,65 Q55,70 50,65 Q45,70 40,65 Q35,60 25,60 Q20,65 15,60 Q10,55 15,50 Q20,45 30,45"></path>
                    </svg>
                    <svg viewBox="0 0 100 100" className="cloud cloud2">
                      <path d="M30,45 Q35,25 50,25 Q65,25 70,45 Q80,45 85,50 Q90,55 85,60 Q80,65 75,60 Q65,60 60,65 Q55,70 50,65 Q45,70 40,65 Q35,60 25,60 Q20,65 15,60 Q10,55 15,50 Q20,45 30,45"></path>
                    </svg>
                  </div>
                </span>
              </label>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`block w-full text-left py-3 px-4 rounded-lg font-medium transition-colors ${
                  currentPage === item.path
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {item.name}
              </button>
            ))}
            <div className="mt-4 px-4">
              <Button
                size="md"
                onClick={() => handleNavClick("contact")}
                className="w-full"
              >
                Get Quote
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
