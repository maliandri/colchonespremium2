import { useEffect } from 'react';

/**
 * Hook personalizado para manejar SEO de forma dinámica
 * @param {Object} seoData - Datos de SEO para la página
 * @param {string} seoData.title - Título de la página
 * @param {string} seoData.description - Descripción de la página
 * @param {string} seoData.keywords - Palabras clave (opcional)
 * @param {string} seoData.image - URL de la imagen para Open Graph (opcional)
 * @param {string} seoData.url - URL canónica de la página (opcional)
 * @param {string} seoData.type - Tipo de contenido Open Graph (opcional, default: 'website')
 * @param {Object} seoData.product - Datos del producto para Schema.org (opcional)
 */
export const useSEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  product,
}) => {
  useEffect(() => {
    // Actualizar título
    if (title) {
      document.title = title;
    }

    // Helper para actualizar o crear meta tags
    const updateMetaTag = (selector, attribute, value) => {
      if (!value) return;

      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        const [attr, attrValue] = selector.match(/\[(.+?)='(.+?)'\]/)?.slice(1, 3) || [];
        if (attr && attrValue) {
          element.setAttribute(attr, attrValue);
        }
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };

    // Meta tags básicos
    updateMetaTag("meta[name='description']", 'content', description);
    updateMetaTag("meta[name='keywords']", 'content', keywords);

    // Open Graph
    updateMetaTag("meta[property='og:title']", 'content', title);
    updateMetaTag("meta[property='og:description']", 'content', description);
    updateMetaTag("meta[property='og:type']", 'content', type);
    updateMetaTag("meta[property='og:url']", 'content', url || window.location.href);
    updateMetaTag("meta[property='og:image']", 'content', image);
    updateMetaTag("meta[property='og:site_name']", 'content', 'Aluminé Hogar');
    updateMetaTag("meta[property='og:locale']", 'content', 'es_AR');

    // Twitter Cards
    updateMetaTag("meta[name='twitter:card']", 'content', 'summary_large_image');
    updateMetaTag("meta[name='twitter:title']", 'content', title);
    updateMetaTag("meta[name='twitter:description']", 'content', description);
    updateMetaTag("meta[name='twitter:image']", 'content', image);

    // Canonical URL
    if (url) {
      let canonical = document.querySelector("link[rel='canonical']");
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', url);
    }

    // Schema.org para productos
    if (product) {
      let script = document.querySelector("script[type='application/ld+json']#product-schema");
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('id', 'product-schema');
        document.head.appendChild(script);
      }

      const schema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.nombre,
        "description": product.descripcion || `${product.nombre} - Aluminé Hogar`,
        "image": product.imagen || image,
        "sku": product._id,
        "brand": {
          "@type": "Brand",
          "name": "Aluminé Hogar"
        },
        "offers": {
          "@type": "Offer",
          "url": url || window.location.href,
          "priceCurrency": "ARS",
          "price": product.precio,
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": "Aluminé Hogar"
          }
        },
        "category": product.categoria
      };

      script.textContent = JSON.stringify(schema);
    }

    // Cleanup function
    return () => {
      // Remover schema de producto si existe
      const productSchema = document.querySelector("script[type='application/ld+json']#product-schema");
      if (productSchema && !product) {
        productSchema.remove();
      }
    };
  }, [title, description, keywords, image, url, type, product]);
};

/**
 * Genera el título SEO optimizado
 */
export const generateTitle = (pageTitle) => {
  return pageTitle ? `${pageTitle} | Aluminé Hogar` : 'Aluminé Hogar | Calidad para tu hogar, precios para vos';
};

/**
 * Genera la URL completa para SEO
 */
export const generateCanonicalUrl = (path = '') => {
  const baseUrl = import.meta.env.VITE_SITE_URL || 'https://aluminehogar.com.ar';
  return `${baseUrl}${path}`;
};

/**
 * Genera una imagen optimizada para SEO
 */
export const generateImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return 'https://res.cloudinary.com/dlshym1te/image/upload/f_auto,q_auto/Alumine%CC%81_Hogar-logo';
  }
  return imageUrl;
};
