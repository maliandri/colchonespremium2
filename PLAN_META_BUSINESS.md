# Plan de Acción: Conectar Catálogo a Meta Business (Facebook/Instagram)

## 📋 Resumen

Vamos a conectar tu catálogo de productos de MongoDB a Meta Business Suite para que puedas:
- Mostrar productos en Facebook Shop
- Mostrar productos en Instagram Shopping
- Crear anuncios dinámicos con catálogo
- Etiquetar productos en publicaciones de Instagram

---

## 🎯 Objetivo

Sincronizar automáticamente los productos de tu base de datos MongoDB con Facebook/Instagram mediante:
1. **Catálogo Feed** (archivo XML/CSV actualizado automáticamente)
2. **Meta Business Suite** (configuración de tienda)
3. **API de Conversiones** (opcional, para tracking avanzado)

---

## 📝 INFORMACIÓN QUE NECESITO DE TI

### 1. Accesos a Meta Business

Por favor proporcióname:

- [ ] **URL de tu Página de Facebook**
  - Ejemplo: https://facebook.com/aluminehogar
  - Si no tienes, necesitamos crearla

- [ ] **Nombre de usuario de Instagram Business** (si tienes)
  - Ejemplo: @aluminehogar
  - Debe estar convertida a cuenta Business/Creator

- [ ] **Acceso a Meta Business Suite**
  - ¿Ya tienes una cuenta de Meta Business Suite?
  - Si sí: Dame acceso como Partner/Administrador
  - Si no: Te ayudo a crearla

### 2. Información del Negocio

- [ ] **Nombre legal de la empresa**
  - Para configuración de comercio electrónico

- [ ] **CUIT/CUIL** (si aplica)
  - Necesario para ventas en Argentina

- [ ] **Dirección física del negocio**
  - Calle, ciudad, provincia, código postal

- [ ] **Categoría de productos**
  - Ejemplo: Muebles para el hogar / Colchones y almohadas

- [ ] **Política de devoluciones**
  - Link o texto de tu política

- [ ] **Política de privacidad**
  - Link a tu política de privacidad

- [ ] **Términos y condiciones**
  - Link a tus términos

### 3. Información de Productos

- [ ] **Categorías de Google Product Taxonomy**
  - Para cada tipo de producto (colchones, almohadas, etc.)
  - Ejemplo: "Home & Garden > Furniture > Bedroom Furniture > Mattresses"

- [ ] **GTIN/EAN/UPC** (si tienes)
  - Códigos de barras de productos
  - Si no tienes, podemos usar SKUs personalizados

- [ ] **Marca de los productos**
  - ¿Vendes marcas específicas? (Ej: Piero, Cannon, etc.)
  - ¿O es marca propia?

### 4. Medios de Pago y Envío

- [ ] **¿Cómo vendes actualmente?**
  - [ ] Solo consultas por WhatsApp
  - [ ] Tienes checkout en el sitio
  - [ ] Aceptas MercadoPago/transferencias

- [ ] **Zonas de envío**
  - [ ] Todo el país
  - [ ] Solo Neuquén y alrededores
  - [ ] Especificar costos de envío

---

## 🛠️ PLAN DE IMPLEMENTACIÓN

### FASE 1: Preparación (1-2 días)

#### 1.1 Configurar Meta Business Suite
```
Tareas:
✓ Crear/verificar cuenta de Meta Business Suite
✓ Conectar Página de Facebook
✓ Conectar cuenta de Instagram Business
✓ Configurar permisos de administrador
```

#### 1.2 Crear Catálogo en Meta
```
Tareas:
✓ Crear Catálogo de Productos en Commerce Manager
✓ Seleccionar tipo: "E-commerce"
✓ Configurar moneda: ARS (Pesos argentinos)
✓ Configurar método de subida: "Data Feed"
```

#### 1.3 Completar información comercial
```
Tareas:
✓ Agregar política de devoluciones
✓ Agregar política de privacidad
✓ Agregar términos y condiciones
✓ Configurar información de contacto
```

---

### FASE 2: Desarrollo del Feed (2-3 días)

#### 2.1 Crear endpoint de Product Feed
```javascript
// Nuevo endpoint: /api/catalog-feed.xml
// Genera XML en formato Facebook Product Feed

Campos requeridos:
- id (único)
- title (nombre del producto)
- description (descripción)
- availability (in stock / out of stock)
- condition (new / refurbished / used)
- price (con moneda ARS)
- link (URL del producto en tu sitio)
- image_link (URL de imagen principal)
- brand (marca)
```

#### 2.2 Mapear productos de MongoDB a Facebook Feed
```
Estructura actual → Estructura Facebook:
--------------------------------
producto.nombre → title
producto.descripcion → description
producto.precio → price (formato: "12990 ARS")
producto._id → id
producto.categoria → product_type
producto.imagenOptimizada.detail → image_link
producto.mostrar → availability
```

#### 2.3 Agregar campos faltantes a MongoDB
```
Campos nuevos necesarios:
- GTIN (opcional)
- brand (marca del producto)
- condition (siempre "new" para productos nuevos)
- google_product_category (ID de taxonomía)
- availability (calculado desde stock o "in stock")
```

---

### FASE 3: Configuración del Feed (1 día)

#### 3.1 Subir Feed a Facebook
```
Opciones:
1. Scheduled Fetch (Recomendado)
   - Facebook descarga automáticamente desde tu servidor
   - URL: https://colchonqn2.netlify.app/api/catalog-feed.xml
   - Frecuencia: Cada 24 horas

2. Manual Upload
   - Subes archivo XML/CSV manualmente
   - Solo para testing inicial

3. API (Avanzado)
   - Sincronización en tiempo real
   - Requiere app de Facebook
```

#### 3.2 Validar productos
```
Tareas:
✓ Revisar diagnóstico de errores en Commerce Manager
✓ Corregir productos rechazados
✓ Verificar que imágenes cumplan requisitos (min 500x500px)
✓ Verificar que precios sean válidos
```

---

### FASE 4: Configuración de Tiendas (1-2 días)

#### 4.1 Activar Facebook Shop
```
Tareas:
✓ Habilitar sección "Shop" en página de Facebook
✓ Conectar catálogo
✓ Personalizar diseño de tienda
✓ Configurar colecciones/categorías
✓ Configurar checkout (Mensaje/WhatsApp o externo)
```

#### 4.2 Activar Instagram Shopping
```
Requisitos:
✓ Cuenta de Instagram debe ser Business
✓ Conectada a Página de Facebook
✓ Cumplir políticas de comercio
✓ Productos revisados (puede tardar 1-3 días)

Después de aprobación:
✓ Etiquetar productos en publicaciones
✓ Crear historias con stickers de productos
✓ Habilitar pestaña de tienda en perfil
```

---

### FASE 5: Optimizaciones (Continuo)

#### 5.1 Mejorar Feed
```
Campos opcionales pero recomendados:
- additional_image_link (imágenes adicionales)
- sale_price (precio en oferta)
- sale_price_effective_date (fechas de oferta)
- custom_label_0 a 4 (etiquetas personalizadas)
- item_group_id (variaciones de producto)
```

#### 5.2 Configurar Facebook Pixel (Tracking)
```
Tareas:
✓ Crear Facebook Pixel
✓ Instalar en sitio web
✓ Configurar eventos:
  - ViewContent (ver producto)
  - AddToCart (agregar al carrito)
  - InitiateCheckout (iniciar compra)
  - Purchase (completar compra por WhatsApp)
```

#### 5.3 Crear Anuncios Dinámicos
```
Con catálogo conectado:
✓ Remarketing dinámico
✓ Productos similares
✓ Cross-selling
✓ Anuncios de colección
```

---

## 📊 ESTRUCTURA DEL FEED XML (Ejemplo)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Aluminé Hogar - Catálogo de Productos</title>
    <link>https://colchonqn2.netlify.app</link>
    <description>Colchones y almohadas premium en Neuquén</description>

    <item>
      <g:id>COL-0001</g:id>
      <g:title>Colchón Premium 2 plazas 140x190</g:title>
      <g:description>Colchón de alta densidad con espuma viscoelástica</g:description>
      <g:link>https://colchonqn2.netlify.app/producto/COL-0001</g:link>
      <g:image_link>https://res.cloudinary.com/dlshym1te/...</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>89990 ARS</g:price>
      <g:brand>Aluminé Hogar</g:brand>
      <g:google_product_category>Furniture > Bedroom Furniture > Mattresses</g:google_product_category>
      <g:product_type>Hogar > Dormitorio > Colchones</g:product_type>
    </item>

    <!-- Más productos... -->
  </channel>
</rss>
```

---

## ⚠️ REQUISITOS TÉCNICOS

### Imágenes de Productos
- **Tamaño mínimo:** 500 x 500 píxeles
- **Tamaño recomendado:** 1024 x 1024 píxeles
- **Formato:** JPG, PNG, WebP
- **Peso máximo:** 8 MB
- ✅ **Estado actual:** Tus imágenes de Cloudinary cumplen estos requisitos

### URLs de Productos
- Deben ser accesibles públicamente
- HTTPS obligatorio
- ✅ **Estado actual:** Tu sitio ya usa HTTPS

### Actualización del Feed
- Mínimo: Cada 24 horas
- Recomendado: Cada 12 horas
- Máximo permitido: Cada hora

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

### Para empezar HOY mismo:

1. **Envíame los siguientes datos:**
   ```
   - URL de tu Página de Facebook (o crearla juntos)
   - Usuario de Instagram Business (o convertirlo juntos)
   - Confirmación de acceso a Meta Business Suite
   ```

2. **Yo crearé:**
   ```
   - Endpoint /api/catalog-feed.xml
   - Script para mapear productos
   - Documentación de configuración
   ```

3. **Luego configuraremos:**
   ```
   - Commerce Manager
   - Facebook Shop
   - Instagram Shopping
   - Facebook Pixel (opcional)
   ```

---

## 💰 COSTOS

- **Facebook/Instagram Shop:** GRATIS
- **Catálogo de productos:** GRATIS
- **Publicar productos:** GRATIS
- **Anuncios:** De pago (opcional, desde $500/día)

---

## 📞 ¿Qué necesito de ti AHORA?

Por favor, respóndeme con:

1. ✅ **URL de Facebook** (o dime si necesitas crear la página)
2. ✅ **Usuario de Instagram** (o dime si necesitas convertir a Business)
3. ✅ **Acceso a Meta Business Suite** (sí/no)
4. ✅ **Marca de tus productos** (¿Aluminé Hogar o hay otras marcas?)
5. ✅ **¿Tienes política de devoluciones?** (link o la creamos)
6. ✅ **¿Cómo quieres que los clientes compren?**
   - Botón "Mensaje" → WhatsApp
   - Botón "Comprar" → Tu sitio web

---

## 📚 RECURSOS ÚTILES

- [Meta Commerce Manager](https://business.facebook.com/commerce/)
- [Facebook Product Feed Specification](https://developers.facebook.com/docs/commerce-platform/catalog/product-feed)
- [Instagram Shopping Setup](https://help.instagram.com/1627591223954487)
- [Google Product Taxonomy](https://www.google.com/basepages/producttype/taxonomy-with-ids.es-ES.txt)

---

**Fecha:** 2025-11-15
**Versión:** 1.0
**Estado:** Esperando información del cliente

Una vez que me proporciones la información solicitada, ¡podemos empezar inmediatamente! 🚀
