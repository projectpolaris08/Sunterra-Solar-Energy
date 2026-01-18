import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { trackPageView } from "./utils/analytics";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Calculator from "./pages/Calculator";
import Referral from "./pages/Referral";
import ReferralSignup from "./pages/ReferralSignup";
import ReferralDashboard from "./pages/ReferralDashboard";
import Admin from "./pages/Admin";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminUsers from "./pages/AdminUsers";
import AdminLeads from "./pages/AdminLeads";
import AdminExpenses from "./pages/AdminExpenses";
import AdminCalendar from "./pages/AdminCalendar";
import AdminMonitoring from "./pages/AdminMonitoring";
import AdminSolarDesigner from "./pages/AdminSolarDesigner";
import AdminReports from "./pages/AdminReports";
import AdminNotifications from "./pages/AdminNotifications";
import AdminSettings from "./pages/AdminSettings";
import AdminReferrals from "./pages/AdminReferrals";
import Login from "./pages/Login";
import { useAuth } from "./contexts/AuthContext";

// Map URL paths to page names
const pathToPage: Record<string, string> = {
  "/": "home",
  "/home": "home",
  "/about": "about",
  "/services": "services",
  "/projects": "projects",
  "/blog": "blog",
  "/calculator": "calculator",
  "/faq": "faq",
  "/contact": "contact",
  "/referral": "referral",
  "/referral/signup": "referral-signup",
  "/referral/dashboard": "referral-dashboard",
  "/login": "login",
  "/admin": "admin",
};

// Map page names to URL paths
const pageToPath: Record<string, string> = {
  home: "/",
  about: "/about",
  services: "/services",
  projects: "/projects",
  blog: "/blog",
  calculator: "/calculator",
  faq: "/faq",
  contact: "/contact",
  referral: "/referral",
  "referral-signup": "/referral/signup",
  "referral-dashboard": "/referral/dashboard",
  login: "/login",
  admin: "/admin",
};

function App() {
  const { isAuthenticated } = useAuth();

  // Get initial page from URL
  const getPageFromPath = (): string => {
    const path = window.location.pathname;

    // Handle project detail URLs (e.g., /projects/batasan-quezon-city-16kw-hybrid-solar)
    if (path.startsWith("/projects/") && path !== "/projects") {
      const slug = path.replace("/projects/", "");
      return `project-detail:${slug}`;
    }

    // Handle blog post URLs (e.g., /blog/post-slug)
    if (path.startsWith("/blog/") && path !== "/blog") {
      const slug = path.replace("/blog/", "");
      return `blog-post:${slug}`;
    }

    // Handle admin sub-routes (e.g., /admin/analytics)
    if (path.startsWith("/admin")) {
      // Convert /admin/analytics to admin-analytics, /admin to admin
      const adminPath = path.replace("/admin", "admin").replace(/\//g, "-");
      return adminPath || "admin";
    }

    return pathToPage[path] || "home";
  };

  const [currentPage, setCurrentPage] = useState(getPageFromPath);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Sync URL with page state on initial load and browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const page = getPageFromPath();
      setCurrentPage(page);
      // Scroll to top on browser back/forward
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Track page view on browser back/forward
      trackPageView(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Track initial page view and scroll to top on load
  useEffect(() => {
    trackPageView(window.location.pathname);
    // Scroll to top on initial page load
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Scroll to top when page changes (handles direct URL navigation)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handleNavigate = (page: string) => {
    if (page === currentPage) return;
    
    // Scroll to top immediately when navigating (instant feedback)
    window.scrollTo({ top: 0, behavior: "instant" });
    
    setIsTransitioning(true);
    
    // Smooth transition effect
    setTimeout(() => {
      setCurrentPage(page);
      setIsTransitioning(false);
    }, 300);

    // Update URL based on page
    let newPath = "/";

    if (page.startsWith("project-detail:")) {
      const slug = page.replace("project-detail:", "");
      newPath = `/projects/${slug}`;
    } else if (page.startsWith("blog-post:")) {
      const slug = page.replace("blog-post:", "");
      newPath = `/blog/${slug}`;
    } else if (pageToPath[page]) {
      newPath = pageToPath[page];
    } else if (page.startsWith("admin")) {
      // Handle admin sub-routes
      newPath = `/${page.replace(/-/g, "/")}`;
    }

    // Update browser URL without page reload
    window.history.pushState({ page }, "", newPath);

    // Track page view in Google Analytics
    trackPageView(newPath);
  };

  const renderPage = () => {
    // Handle project detail pages
    if (currentPage.startsWith("project-detail:")) {
      const slug = currentPage.replace("project-detail:", "");
      return <ProjectDetail onNavigate={handleNavigate} projectId={slug} />;
    }

    // Handle blog post pages
    if (currentPage.startsWith("blog-post:")) {
      const slug = currentPage.replace("blog-post:", "");
      return <BlogPost onNavigate={handleNavigate} slug={slug} />;
    }

    // Handle login page
    if (currentPage === "login") {
      return <Login onNavigate={handleNavigate} />;
    }

    // Handle admin pages - check authentication
    if (currentPage.startsWith("admin")) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return <Login onNavigate={handleNavigate} />;
      }

      // Route to specific admin pages
      switch (currentPage) {
        case "admin":
          return (
            <Admin onNavigate={handleNavigate} currentPage={currentPage} />
          );
        case "admin-analytics":
          return (
            <AdminAnalytics
              onNavigate={handleNavigate}
              currentPage={currentPage}
            />
          );
        case "admin-users":
          return (
            <AdminUsers onNavigate={handleNavigate} currentPage={currentPage} />
          );
        case "admin-leads":
          return (
            <AdminLeads onNavigate={handleNavigate} currentPage={currentPage} />
          );
        case "admin-expenses":
          return (
            <AdminExpenses
              onNavigate={handleNavigate}
              currentPage={currentPage}
            />
          );
        case "admin-calendar":
          return (
            <AdminCalendar
              onNavigate={handleNavigate}
              currentPage={currentPage}
            />
          );
        case "admin-monitoring":
          return (
            <AdminMonitoring
              onNavigate={handleNavigate}
              currentPage={currentPage}
            />
          );
        case "admin-solar-designer":
          return (
            <AdminSolarDesigner
              onNavigate={handleNavigate}
              currentPage={currentPage}
            />
          );
        case "admin-reports":
          return (
            <AdminReports
              onNavigate={handleNavigate}
              currentPage={currentPage}
            />
          );
        case "admin-notifications":
          return (
            <AdminNotifications
              onNavigate={handleNavigate}
              currentPage={currentPage}
            />
          );
        case "admin-settings":
          return (
            <AdminSettings
              onNavigate={handleNavigate}
              currentPage={currentPage}
            />
          );
        case "admin-referrals":
          return (
            <AdminReferrals
              onNavigate={handleNavigate}
              currentPage={currentPage}
            />
          );
        default:
          return (
            <Admin onNavigate={handleNavigate} currentPage={currentPage} />
          );
      }
    }

    switch (currentPage) {
      case "home":
        return <Home onNavigate={handleNavigate} />;
      case "about":
        return <About onNavigate={handleNavigate} />;
      case "services":
        return <Services onNavigate={handleNavigate} />;
      case "projects":
        return <Projects onNavigate={handleNavigate} />;
      case "blog":
        return <Blog onNavigate={handleNavigate} />;
      case "calculator":
        return <Calculator onNavigate={handleNavigate} />;
      case "faq":
        return <FAQ onNavigate={handleNavigate} />;
      case "contact":
        return <Contact onNavigate={handleNavigate} />;
      case "referral":
        return <Referral onNavigate={handleNavigate} />;
      case "referral-signup":
        return <ReferralSignup onNavigate={handleNavigate} />;
      case "referral-dashboard":
        return <ReferralDashboard onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  // Don't show header/footer for admin and login pages
  if (currentPage.startsWith("admin") || currentPage === "login") {
    return <>{renderPage()}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-amber-50/50 dark:from-blue-900/20 dark:via-transparent dark:to-amber-900/20"></div>
        <div className="particles-container"></div>
      </div>

      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="flex-grow pt-20 relative z-10">
        <div
          className={`transition-all duration-500 ease-in-out ${
            isTransitioning
              ? "opacity-0 translate-y-4 scale-95"
              : "opacity-100 translate-y-0 scale-100"
          }`}
        >
          {renderPage()}
        </div>
      </main>
      <Footer onNavigate={handleNavigate} />
      <ScrollToTop />
    </div>
  );
}

export default App;
