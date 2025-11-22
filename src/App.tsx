import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Projects from "./pages/Projects";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminUsers from "./pages/AdminUsers";
import AdminCalendar from "./pages/AdminCalendar";
import AdminMonitoring from "./pages/AdminMonitoring";
import AdminReports from "./pages/AdminReports";
import AdminNotifications from "./pages/AdminNotifications";
import AdminSettings from "./pages/AdminSettings";
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
  "/faq": "faq",
  "/contact": "contact",
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
  faq: "/faq",
  contact: "/contact",
  login: "/login",
  admin: "/admin",
};

function App() {
  const { isAuthenticated } = useAuth();

  // Get initial page from URL
  const getPageFromPath = (): string => {
    const path = window.location.pathname;

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

  // Sync URL with page state on initial load and browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getPageFromPath());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);

    // Update URL based on page
    let newPath = "/";

    if (page.startsWith("blog-post:")) {
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
  };

  const renderPage = () => {
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
      case "faq":
        return <FAQ onNavigate={handleNavigate} />;
      case "contact":
        return <Contact onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  // Don't show header/footer for admin and login pages
  if (currentPage.startsWith("admin") || currentPage === "login") {
    return <>{renderPage()}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="flex-grow pt-20">{renderPage()}</main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
