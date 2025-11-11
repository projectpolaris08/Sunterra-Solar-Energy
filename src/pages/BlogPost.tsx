import { useMemo } from "react";
import { Calendar, Clock, User, ArrowLeft, Tag, Sun } from "lucide-react";
import { blogPosts } from "../data/blogPosts";
import type { BlogPost } from "../data/blogPosts";
import Button from "../components/Button";
import Card from "../components/Card";
import SEO from "../components/SEO";

interface BlogPostProps {
  onNavigate: (page: string) => void;
  slug: string;
}

export default function BlogPost({ onNavigate, slug }: BlogPostProps) {
  const post = useMemo(() => {
    return blogPosts.find((p) => p.slug === slug);
  }, [slug]);

  if (!post) {
    return (
      <section className="pt-32 pb-20 bg-white dark:bg-gray-900 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Post Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              The blog post you're looking for doesn't exist.
            </p>
            <Button onClick={() => onNavigate("blog")}>
              <ArrowLeft className="mr-2 w-5 h-5" />
              Back to Blog
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Generate structured data for individual blog post
  const postStructuredData = {
    "@context": "https://schema.org",
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
  };

  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt}
        keywords={post.tags.join(", ")}
        canonicalUrl={`https://sunterrasolar.ph/blog/${post.slug}`}
        ogType="article"
        article={{
          publishedTime: post.publishDate,
          modifiedTime: post.publishDate,
          author: post.author,
          tags: post.tags,
        }}
      />

      {/* Structured Data for Blog Post */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(postStructuredData),
        }}
      />

      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => onNavigate("blog")}
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-8 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Blog
            </button>

            {/* Article Header */}
            <article itemScope itemType="https://schema.org/BlogPosting">
              <header className="mb-8">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    {post.category}
                  </span>
                  <time
                    dateTime={post.publishDate}
                    className="text-sm text-gray-500 dark:text-gray-400 flex items-center"
                    itemProp="datePublished"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(post.publishDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {post.readTime}
                  </span>
                </div>

                <h1
                  className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
                  itemProp="headline"
                >
                  {post.title}
                </h1>

                <p
                  className="text-xl text-gray-600 dark:text-gray-300 mb-6"
                  itemProp="description"
                >
                  {post.excerpt}
                </p>

                <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                  <span className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    <span itemProp="author">{post.author}</span>
                  </span>
                </div>
              </header>

              {/* Article Image */}
              {post.image && (
                <div className="mb-8 rounded-lg overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-auto"
                    itemProp="image"
                  />
                </div>
              )}

              {/* Article Content */}
              <div
                className="prose prose-lg dark:prose-invert max-w-none mb-8"
                itemProp="articleBody"
              >
                {post.fullContent ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: post.fullContent }}
                    className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-6"
                  />
                ) : (
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-6">
                    <p>{post.content}</p>
                    <p>
                      This is a comprehensive guide covering all aspects of the
                      topic. For more detailed information and personalized
                      advice, please contact our solar experts.
                    </p>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="mb-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tags:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto text-center">
            <Sun className="w-16 h-16 text-amber-500 dark:text-amber-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Go Solar?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Get a free consultation and site assessment from our solar
              experts. Start saving on your electricity bills today!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => onNavigate("contact")}>
                Get Free Consultation
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
