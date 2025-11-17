# Configuración SEO - Aluminé Hogar

Este documento detalla toda la configuración de SEO (Search Engine Optimization) implementada en el proyecto de Aluminé Hogar.

## Tabla de Contenidos

1. [Resumen](#resumen)
2. [Meta Tags Dinámicos](#meta-tags-dinámicos)
3. [Datos Estructurados (Schema.org)](#datos-estructurados-schemaorg)
4. [Sitemap.xml](#sitemapxml)
5. [Robots.txt](#robotstxt)
6. [Open Graph y Twitter Cards](#open-graph-y-twitter-cards)
7. [URLs Canónicas](#urls-canónicas)
8. [Próximos Pasos](#próximos-pasos)

---

## Resumen

Se implementó una configuración SEO completa que incluye:

- ✅ Meta tags dinámicos por página
- ✅ Open Graph para redes sociales
- ✅ Twitter Cards
- ✅ Schema.org para productos y organización
- ✅ Sitemap.xml dinámico
- ✅ Robots.txt optimizado
- ✅ URLs canónicas
- ✅ Meta descriptions optimizadas
- ✅ Keywords relevantes

---

## Meta Tags Dinámicos

### Hook personalizado: `useSEO`

Se creó un hook React personalizado en [Frontend/src/hooks/useSEO.js](Frontend/src/hooks/useSEO.js) que permite actualizar dinámicamente:

- Título de la página
- Meta description
- Keywords
- Open Graph tags
- Twitter Cards
- URLs canónicas
- Schema.org (datos estructurados)

### Uso del hook

```javascript
import { useSEO, generateTitle, generateCanonicalUrl } from '../hooks/useSEO';

useSEO({
  title: generateTitle('Nombre del Producto'),
  description: 'Descripción optimizada del producto...',
  keywords: 'colchones, almohadas, neuquén',
  url: generateCanonicalUrl('/producto/123'),
  type: 'product',
  image: 'https://...',
  product: productoData // Opcional: para Schema.org
});
```

### Páginas implementadas

- ✅ [HomePage.jsx](Frontend/src/pages/HomePage.jsx) - Página principal
- ✅ [ProductDetail.jsx](Frontend/src/pages/ProductDetail.jsx) - Detalle de producto

---

## Datos Estructurados (Schema.org)

### Organización (Store)

En [Frontend/index.html](Frontend/index.html) se agregó el Schema.org de la organización:

```json
{
  "@context": "https://schema.org",
  "@type": "Store",
  "name": "Aluminé Hogar",
  "description": "Tienda especializada en colchones y almohadas premium en Neuquén",
  "url": "https://aluminehogar.com.ar/",
  "logo": "...",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Neuquén",
    "addressRegion": "Neuquén",
    "addressCountry": "AR"
  },
  "telephone": "+54-299-541-4422",
  "priceRange": "$$"
}
```

### Productos

El hook `useSEO` genera automáticamente Schema.org para cada producto:

```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Nombre del producto",
  "description": "Descripción...",
  "image": "...",
  "sku": "ID-DEL-PRODUCTO",
  "brand": {
    "@type": "Brand",
    "name": "Aluminé Hogar"
  },
  "offers": {
    "@type": "Offer",
    "url": "...",
    "priceCurrency": "ARS",
    "price": 12990,
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Aluminé Hogar"
    }
  }
}
```

---

## Sitemap.xml

### Archivo Estático

Debido al límite de funciones serverless en Vercel (plan gratuito), se creó un archivo estático [Frontend/public/sitemap.xml](Frontend/public/sitemap.xml).

### Acceso

```
https://aluminehogar.com.ar/sitemap.xml
```

### Características

- ✅ Archivo estático en carpeta `public`
- ✅ Incluye página principal
- ⚠️ **Nota:** Para incluir productos dinámicamente, considera:
  - Generar sitemap en el proceso de build
  - Usar servicios externos como xml-sitemaps.com
  - Actualizar manualmente cuando agregues productos clave

### Actualización Dinámica (Opcional)

Si necesitas un sitemap dinámico, puedes:

1. **Opción 1:** Generar en build time con un script
2. **Opción 2:** Usar un servicio de terceros
3. **Opción 3:** Actualizar a Vercel Pro para más funciones serverless

---

## Robots.txt

### Archivo Estático

Se creó un archivo estático [Frontend/public/robots.txt](Frontend/public/robots.txt).

### Acceso

```
https://aluminehogar.com.ar/robots.txt
```

### Configuración

```
User-agent: *
Allow: /
Allow: /producto/*

Disallow: /api/auth/*
Disallow: /api/ventas/*
Disallow: /api/admin/*

Sitemap: https://aluminehogar.com.ar/sitemap.xml
```

### Características

- ✅ Permite indexación de todo el sitio público
- ✅ Bloquea APIs privadas
- ✅ Referencia al sitemap.xml
- ✅ Archivo estático (no consume función serverless)

---

## Open Graph y Twitter Cards

### Meta Tags en index.html

```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://aluminehogar.com.ar/" />
<meta property="og:title" content="Aluminé Hogar | Tu Mejor Descanso en Neuquén" />
<meta property="og:description" content="..." />
<meta property="og:image" content="..." />
<meta property="og:site_name" content="Aluminé Hogar" />
<meta property="og:locale" content="es_AR" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="..." />
```

### Actualización Dinámica

El hook `useSEO` actualiza estos tags automáticamente en cada página.

---

## URLs Canónicas

### Implementación

- ✅ URL canónica en [index.html](Frontend/index.html)
- ✅ Actualización dinámica vía hook `useSEO`
- ✅ Helper function `generateCanonicalUrl(path)`

### Ejemplo

```javascript
// Genera: https://aluminehogar.com.ar/producto/ABC-0001
const canonicalUrl = generateCanonicalUrl('/producto/ABC-0001');
```

---

## Variables de Entorno

### VITE_SITE_URL

Se agregó la variable `VITE_SITE_URL` en todos los archivos `.env`:

- ✅ `.env.local` → https://aluminehogar.com.ar
- ✅ `.env.development` → http://localhost:5173
- ✅ `.env.production` → https://aluminehogar.com.ar
- ✅ `.env.example` → Documentado para futuros desarrolladores

---

## Próximos Pasos Recomendados

### 1. Google Search Console

- [ ] Verificar propiedad del sitio
- [ ] Enviar sitemap.xml
- [ ] Monitorear indexación

### 2. Google Analytics / Tag Manager

- [ ] Instalar GA4
- [ ] Configurar eventos de e-commerce
- [ ] Tracking de conversiones

### 3. Mejoras Adicionales

- [ ] Implementar prerendering para SPA (react-snap o similar)
- [ ] Configurar breadcrumbs con Schema.org
- [ ] Agregar FAQ con Schema.org
- [ ] Optimizar imágenes con lazy loading
- [ ] Implementar AMP (opcional)

### 4. Meta Tags Adicionales

- [ ] author meta tags
- [ ] publisher meta tags
- [ ] article:published_time para blog (si se agrega)

### 5. Performance

- [ ] Lighthouse audit
- [ ] Core Web Vitals optimization
- [ ] Page Speed optimization

---

## Validación

### Herramientas para validar SEO

1. **Google Search Console** → https://search.google.com/search-console
2. **Structured Data Testing Tool** → https://validator.schema.org/
3. **Facebook Sharing Debugger** → https://developers.facebook.com/tools/debug/
4. **Twitter Card Validator** → https://cards-dev.twitter.com/validator
5. **Lighthouse** → Auditoría de Chrome DevTools

---

## Archivos Modificados/Creados

### Creados

- [Frontend/src/hooks/useSEO.js](Frontend/src/hooks/useSEO.js)
- [Frontend/public/sitemap.xml](Frontend/public/sitemap.xml) - Estático
- [Frontend/public/robots.txt](Frontend/public/robots.txt) - Estático
- [SEO_DOCUMENTATION.md](SEO_DOCUMENTATION.md)

### Modificados

- [Frontend/index.html](Frontend/index.html) - Meta tags mejorados + Schema.org
- [Frontend/src/pages/HomePage.jsx](Frontend/src/pages/HomePage.jsx) - Hook useSEO
- [Frontend/src/pages/ProductDetail.jsx](Frontend/src/pages/ProductDetail.jsx) - Hook useSEO
- [Frontend/.env.local](Frontend/.env.local) - Variable VITE_SITE_URL
- [Frontend/.env.development](Frontend/.env.development) - Variable VITE_SITE_URL
- [Frontend/.env.production](Frontend/.env.production) - Variable VITE_SITE_URL
- [Frontend/.env.example](Frontend/.env.example) - Documentación de variables

---

## Contacto y Soporte

Para cualquier duda o mejora adicional relacionada con SEO, contactar al equipo de desarrollo.

**Fecha de implementación:** 2025-11-15
**Versión:** 1.0
