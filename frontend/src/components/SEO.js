import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SEO Component - Dynamically updates meta tags for better SEO
 * Usage: <SEO title="Page Title" description="Page description" />
 */
function SEO({ 
  title, 
  description, 
  keywords,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  articleSection,
  tags
}) {
  const location = useLocation();
  const siteUrl = process.env.REACT_APP_SITE_URL || 'http://localhost:3000';
  const siteName = 'lladlad';
  const defaultImage = `${siteUrl}/logo192.png`; // You can add a default OG image
  
  // Use provided URL or construct from current location
  const canonicalUrl = url || `${siteUrl}${location.pathname}`;
  const ogImage = image || defaultImage;
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const metaDescription = description || 'lladlad - Blog Application with YouTube Integration';

  useEffect(() => {
    // Update or create meta tags
    const updateMetaTag = (name, content, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta tags
    document.title = fullTitle;
    updateMetaTag('description', metaDescription);
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }
    updateMetaTag('author', author || siteName);
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // Open Graph tags
    updateMetaTag('og:title', fullTitle, 'property');
    updateMetaTag('og:description', metaDescription, 'property');
    updateMetaTag('og:image', ogImage, 'property');
    updateMetaTag('og:url', canonicalUrl, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:site_name', siteName, 'property');
    
    if (publishedTime) {
      updateMetaTag('article:published_time', publishedTime, 'property');
    }
    if (modifiedTime) {
      updateMetaTag('article:modified_time', modifiedTime, 'property');
    }
    if (articleSection) {
      updateMetaTag('article:section', articleSection, 'property');
    }
    if (tags && Array.isArray(tags)) {
      tags.forEach((tag, index) => {
        updateMetaTag(`article:tag:${index}`, tag, 'property');
      });
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', metaDescription);
    updateMetaTag('twitter:image', ogImage);
    
    // Additional SEO tags
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('googlebot', 'index, follow');
    
    // Cleanup function
    return () => {
      // Optionally reset to defaults on unmount
    };
  }, [title, description, keywords, image, url, type, author, publishedTime, modifiedTime, articleSection, tags, canonicalUrl, ogImage, fullTitle, metaDescription, siteName]);

  return null; // This component doesn't render anything
}

export default SEO;




