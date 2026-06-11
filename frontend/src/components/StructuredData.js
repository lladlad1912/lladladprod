import { useEffect } from 'react';

/**
 * StructuredData Component - Adds JSON-LD structured data for SEO
 * Usage: <StructuredData type="Article" data={articleData} />
 */
function StructuredData({ type, data }) {
  useEffect(() => {
    // Remove existing structured data script if it exists
    const existingScript = document.getElementById('structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    // Create structured data based on type
    let structuredData = {};

    switch (type) {
      case 'Article':
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: data.headline,
          description: data.description,
          image: data.image,
          datePublished: data.datePublished,
          dateModified: data.dateModified || data.datePublished,
          author: {
            '@type': 'Person',
            name: data.author?.name || 'Unknown',
            ...(data.author?.url && { url: data.author.url })
          },
          publisher: {
            '@type': 'Organization',
            name: data.publisher?.name || 'lladlad',
            ...(data.publisher?.logo && {
              logo: {
                '@type': 'ImageObject',
                url: data.publisher.logo.url
              }
            })
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': data.mainEntityOfPage?.id || window.location.href
          },
          ...(data.articleSection && { articleSection: data.articleSection }),
          ...(data.keywords && { keywords: data.keywords })
        };
        break;

      case 'Blog':
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: data.name || 'lladlad',
          description: data.description || 'Blog Application with YouTube Integration',
          url: data.url || window.location.origin,
          ...(data.author && {
            author: {
              '@type': 'Person',
              name: data.author
            }
          })
        };
        break;

      case 'WebSite':
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: data.name || 'lladlad',
          url: data.url || window.location.origin,
          ...(data.searchAction && {
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: data.searchAction.urlTemplate
              },
              'query-input': 'required name=search_term_string'
            }
          })
        };
        break;

      case 'BreadcrumbList':
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: data.items?.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url
          })) || []
        };
        break;

      default:
        structuredData = data;
    }

    // Create and append script tag
    const script = document.createElement('script');
    script.id = 'structured-data';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Cleanup
    return () => {
      const scriptToRemove = document.getElementById('structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, data]);

  return null;
}

export default StructuredData;


















