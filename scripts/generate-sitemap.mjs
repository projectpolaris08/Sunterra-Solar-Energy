import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base URL for the site
const BASE_URL = 'https://sunterrasolarenergy.com';

// Get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Read and parse blog posts from the TypeScript file
const getBlogPosts = () => {
  try {
    const blogPostsPath = join(__dirname, '../src/data/blogPosts.ts');
    const content = readFileSync(blogPostsPath, 'utf8');
    
    // Extract blog posts using regex to find the array
    const arrayStart = content.indexOf('export const blogPosts: BlogPost[] = [');
    if (arrayStart === -1) {
      throw new Error('Could not find blogPosts array');
    }
    
    // Find the matching closing bracket
    let depth = 0;
    let inString = false;
    let stringChar = '';
    let i = arrayStart + 'export const blogPosts: BlogPost[] = ['.length;
    let arrayEnd = i;
    
    for (; i < content.length; i++) {
      const char = content[i];
      const prevChar = i > 0 ? content[i - 1] : '';
      
      if (!inString) {
        if (char === '[') depth++;
        else if (char === ']') {
          if (depth === 0) {
            arrayEnd = i;
            break;
          }
          depth--;
        } else if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
          inString = true;
          stringChar = char;
        }
      } else {
        if (char === stringChar && prevChar !== '\\') {
          inString = false;
        }
      }
    }
    
    const arrayContent = content.substring(
      arrayStart + 'export const blogPosts: BlogPost[] = ['.length,
      arrayEnd
    );
    
    // Parse the array - extract slug and publishDate for each post
    const posts = [];
    const postRegex = /slug:\s*["']([^"']+)["'][\s\S]*?publishDate:\s*["']([^"']+)["']/g;
    let match;
    
    while ((match = postRegex.exec(arrayContent)) !== null) {
      posts.push({
        slug: match[1],
        publishDate: match[2]
      });
    }
    
    // Also try to get all slugs in order
    const slugMatches = [...arrayContent.matchAll(/slug:\s*["']([^"']+)["']/g)];
    const dateMatches = [...arrayContent.matchAll(/publishDate:\s*["']([^"']+)["']/g)];
    
    // Match slugs with dates (they should be in the same order)
    const blogPosts = slugMatches.map((slugMatch, index) => ({
      slug: slugMatch[1],
      publishDate: dateMatches[index] ? dateMatches[index][1] : getCurrentDate()
    }));
    
    return blogPosts;
  } catch (error) {
    console.error('Error parsing blog posts:', error);
    return [];
  }
};

// Generate sitemap XML
const generateSitemap = () => {
  const currentDate = getCurrentDate();
  const blogPosts = getBlogPosts();
  
  // Static pages
  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/about', priority: '0.8', changefreq: 'monthly' },
    { loc: '/services', priority: '0.9', changefreq: 'monthly' },
    { loc: '/projects', priority: '0.9', changefreq: 'weekly' },
    { loc: '/blog', priority: '0.8', changefreq: 'weekly' },
    { loc: '/calculator', priority: '0.9', changefreq: 'monthly' },
    { loc: '/faq', priority: '0.7', changefreq: 'monthly' },
    { loc: '/contact', priority: '0.8', changefreq: 'monthly' },
  ];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main Pages -->`;

  // Add static pages
  staticPages.forEach((page) => {
    sitemap += `
  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  });

  // Add blog posts
  sitemap += `
  
  <!-- Blog Posts -->`;

  // Sort blog posts by publish date (newest first)
  const sortedPosts = [...blogPosts].sort((a, b) => {
    return new Date(b.publishDate) - new Date(a.publishDate);
  });

  sortedPosts.forEach((post) => {
    sitemap += `
  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <lastmod>${post.publishDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  sitemap += `
</urlset>
`;

  return sitemap;
};

// Write sitemap to file
const sitemapContent = generateSitemap();
const sitemapPath = join(__dirname, '../public/sitemap.xml');

try {
  writeFileSync(sitemapPath, sitemapContent, 'utf8');
  const blogPosts = getBlogPosts();
  console.log('✅ Sitemap generated successfully at:', sitemapPath);
  console.log(`📝 Generated ${blogPosts.length} blog post entries`);
} catch (error) {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
}

