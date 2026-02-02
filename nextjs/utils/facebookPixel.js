/**
 * Facebook Pixel - Utilidades y Eventos
 * Pixel ID: 879838197733539
 */

/**
 * Inicializa Facebook Pixel
 */
export const initFacebookPixel = (pixelId) => {
  if (typeof window === 'undefined') return;

  // Evitar inicializar múltiples veces
  if (window.fbq) return;

  // Código oficial de Facebook Pixel
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');

  console.log('Facebook Pixel inicializado:', pixelId);
};

/**
 * Evento: Ver contenido (producto)
 */
export const trackViewContent = (producto) => {
  if (typeof window === 'undefined' || !window.fbq) return;

  window.fbq('track', 'ViewContent', {
    content_ids: [producto._id],
    content_type: 'product',
    content_name: producto.nombre,
    content_category: producto.categoria,
    value: producto.precio,
    currency: 'ARS'
  });

  console.log('Facebook Pixel: ViewContent -', producto.nombre);
};

/**
 * Evento: Agregar al carrito
 */
export const trackAddToCart = (producto, cantidad = 1) => {
  if (typeof window === 'undefined' || !window.fbq) return;

  window.fbq('track', 'AddToCart', {
    content_ids: [producto._id],
    content_name: producto.nombre,
    content_type: 'product',
    content_category: producto.categoria,
    value: producto.precio * cantidad,
    currency: 'ARS',
    num_items: cantidad
  });

  console.log('Facebook Pixel: AddToCart -', producto.nombre);
};

/**
 * Evento: Iniciar checkout (abrir carrito)
 */
export const trackInitiateCheckout = (cartItems, totalPrice) => {
  if (typeof window === 'undefined' || !window.fbq) return;

  const contentIds = cartItems.map(item => item._id);
  const numItems = cartItems.reduce((sum, item) => sum + item.cantidad, 0);

  window.fbq('track', 'InitiateCheckout', {
    content_ids: contentIds,
    num_items: numItems,
    value: totalPrice,
    currency: 'ARS'
  });

  console.log('Facebook Pixel: InitiateCheckout - Total:', totalPrice);
};

/**
 * Evento: Contacto (WhatsApp)
 */
export const trackContact = (source = 'WhatsApp', value = 0) => {
  if (typeof window === 'undefined' || !window.fbq) return;

  window.fbq('track', 'Contact', {
    content_name: source,
    value: value,
    currency: 'ARS'
  });

  console.log('Facebook Pixel: Contact -', source);
};

/**
 * Evento: Buscar
 */
export const trackSearch = (searchQuery) => {
  if (typeof window === 'undefined' || !window.fbq) return;

  window.fbq('track', 'Search', {
    search_string: searchQuery
  });

  console.log('Facebook Pixel: Search -', searchQuery);
};

/**
 * Evento personalizado
 */
export const trackCustomEvent = (eventName, params = {}) => {
  if (typeof window === 'undefined' || !window.fbq) return;

  window.fbq('trackCustom', eventName, params);

  console.log('Facebook Pixel: Custom Event -', eventName);
};
