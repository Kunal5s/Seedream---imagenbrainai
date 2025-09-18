import React, { useEffect } from 'react';

interface MetaTagsProps {
  title: string;
  description: string;
  canonicalPath: string;
}

const MetaTags: React.FC<MetaTagsProps> = ({ title, description, canonicalPath }) => {
  useEffect(() => {
    // Update title
    document.title = title;

    // Helper to update or create a meta tag
    const updateMetaTag = (attr: 'name' | 'property', key: string, content: string) => {
        let tag = document.querySelector(`meta[${attr}="${key}"]`);
        if (!tag) {
            tag = document.createElement('meta');
            tag.setAttribute(attr, key);
            document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
    };

    // Helper to update or create a link tag
    const updateLinkTag = (rel: string, href: string) => {
        let tag = document.querySelector(`link[rel="${rel}"]`);
        if (!tag) {
            tag = document.createElement('link');
            tag.setAttribute('rel', rel);
            document.head.appendChild(tag);
        }
        tag.setAttribute('href', href);
    };

    const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '')}`;
    const fullUrl = `${baseUrl}${canonicalPath === '/' ? '' : '#' + canonicalPath}`;

    // Update standard meta tags
    updateMetaTag('name', 'description', description);
    
    // Update canonical link
    updateLinkTag('canonical', fullUrl);
    
    // Update Open Graph tags
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:url', fullUrl);

    // Update Twitter card tags
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);

  }, [title, description, canonicalPath]);

  return null; // This component does not render anything
};

export default MetaTags;
