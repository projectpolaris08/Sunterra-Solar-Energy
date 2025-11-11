import { useState } from "react";
import { Calendar, Clock, User, ArrowRight, Search, Tag } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import SEO from "../components/SEO";
import { blogPosts } from "../data/blogPosts";

interface BlogProps {
  onNavigate: (page: string) => void;
}

export default function Blog({ onNavigate }: BlogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    ...Array.from(new Set(blogPosts.map((post) => post.category))),
  ];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Generate structured data for Blog
  const blogStructuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Sunterra Solar Energy Blog",
    description:
      "Expert insights, guides, and tips about solar energy in the Philippines",
    url: "https://sunterrasolar.ph/blog",
    publisher: {
      "@type": "Organization",
      name: "Sunterra Solar Energy Philippines",
      logo: {
        "@type": "ImageObject",
        url: "https://sunterrasolar.ph/logo.png",
      },
    },
    blogPost: blogPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      author: {
        "@type": "Person",
        name: post.author,
      },
      datePublished: post.publishDate,
      dateModified: post.publishDate,
      url: `https://sunterrasolar.ph/blog/${post.slug}`,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://sunterrasolar.ph/blog/${post.slug}`,
      },
      keywords: post.tags.join(", "),
      articleSection: post.category,
      timeRequired: post.readTime,
    })),
  };

  return (
    <>
      <SEO
        title="Solar Energy Blog - Expert Guides & Tips"
        description="Read expert articles about solar energy in the Philippines. Learn about installation, net metering, ROI, maintenance, and more. Stay informed about the latest solar technology and best practices."
        keywords="solar energy blog Philippines, solar panel guides, solar installation tips, net metering Philippines, solar ROI, solar maintenance"
        canonicalUrl="https://sunterrasolar.ph/blog"
      />

      {/* Structured Data for Blog */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogStructuredData),
        }}
      />

      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Solar Energy Blog
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Expert insights, guides, and tips about solar energy in the
              Philippines
            </p>
          </div>

          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                itemScope
                itemType="https://schema.org/BlogPosting"
              >
                <Card className="h-full flex flex-col overflow-hidden">
                  {post.image ? (
                    <div className="h-48 -mx-6 -mt-6 mb-6 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 -mx-6 -mt-6 mb-6 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <Tag className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}

                  <div className="flex flex-col flex-grow">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        {post.category}
                      </span>
                      <time
                        dateTime={post.publishDate}
                        className="text-xs text-gray-500 dark:text-gray-400 flex items-center"
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(post.publishDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </time>
                    </div>

                    <h2
                      className="text-xl font-bold text-gray-900 dark:text-white mb-3"
                      itemProp="headline"
                    >
                      <button
                        onClick={() => onNavigate(`blog-post:${post.slug}`)}
                        className="text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                      >
                        {post.title}
                      </button>
                    </h2>

                    <p
                      className="text-gray-600 dark:text-gray-300 mb-4 flex-grow"
                      itemProp="description"
                    >
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          <span itemProp="author">{post.author}</span>
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                No articles found. Try a different search term or category.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Stay Updated with Solar News
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for the latest solar energy tips,
              guides, and industry updates
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => onNavigate("contact")}>
                Subscribe to Newsletter
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate("services")}
              >
                View Services
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
