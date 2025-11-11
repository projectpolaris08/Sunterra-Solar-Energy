import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
  };
}

export default function SEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = "https://sunterrasolar.ph/og-image.jpg",
  ogType = "website",
  article,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = `${title} | Sunterra Solar Energy Philippines`;
    document.title = fullTitle;

    // Helper function to set or update meta tag
    const setMetaTag = (name: string, content: string, property = false) => {
      const selector = property
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        if (property) {
          meta.setAttribute("property", name);
        } else {
          meta.setAttribute("name", name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Basic meta tags
    setMetaTag("description", description);

    if (keywords) {
      setMetaTag("keywords", keywords);
    }

    // Open Graph tags
    setMetaTag("og:title", fullTitle, true);
    setMetaTag("og:description", description, true);
    setMetaTag("og:type", ogType, true);
    setMetaTag("og:image", ogImage, true);

    if (canonicalUrl) {
      setMetaTag("og:url", canonicalUrl, true);

      let linkCanonical = document.querySelector(
        'link[rel="canonical"]'
      ) as HTMLLinkElement;
      if (!linkCanonical) {
        linkCanonical = document.createElement("link");
        linkCanonical.setAttribute("rel", "canonical");
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.href = canonicalUrl;
    }

    // Twitter Card tags
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", fullTitle);
    setMetaTag("twitter:description", description);
    setMetaTag("twitter:image", ogImage);

    // Article-specific meta tags
    if (article && ogType === "article") {
      if (article.publishedTime) {
        setMetaTag("article:published_time", article.publishedTime, true);
      }
      if (article.modifiedTime) {
        setMetaTag("article:modified_time", article.modifiedTime, true);
      }
      if (article.author) {
        setMetaTag("article:author", article.author, true);
      }
      if (article.tags && article.tags.length > 0) {
        // Remove existing article:tag meta tags first
        const existingTags = document.querySelectorAll(
          'meta[property="article:tag"]'
        );
        existingTags.forEach((tag) => tag.remove());

        // Add new article:tag meta tags
        article.tags.forEach((tag) => {
          const meta = document.createElement("meta");
          meta.setAttribute("property", "article:tag");
          meta.setAttribute("content", tag);
          document.head.appendChild(meta);
        });
      }
    }
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, article]);

  return null;
}
