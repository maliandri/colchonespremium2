/**
 * Búsqueda inteligente de productos en MongoDB
 * Utiliza el modelo Product existente para buscar productos relevantes
 */

import { connectDB } from './db.js';
import Product from './models/Product.js';

/**
 * Busca productos basándose en el mensaje del usuario
 * @param {string} userMessage - Mensaje del usuario
 * @returns {Promise<Array>} - Array de productos relevantes
 */
export async function searchProducts(userMessage) {
  try {
    await connectDB();

    const lowerMessage = userMessage.toLowerCase();
    const searchTerms = [];

    // Detectar categorías
    if (/(colchón|colchon)/i.test(userMessage)) {
      searchTerms.push('Colchones');
    }
    if (/almohada/i.test(userMessage)) {
      searchTerms.push('Almohadas');
    }

    // Detectar tamaños/tipos
    const sizePatterns = {
      '1 plaza': /1 plaza|una plaza|individual/i,
      '2 plazas': /2 plazas|dos plazas|matrimonial/i,
      'queen': /queen/i,
      'king': /king/i
    };

    let sizeFilter = null;
    for (const [size, pattern] of Object.entries(sizePatterns)) {
      if (pattern.test(userMessage)) {
        sizeFilter = size;
        break;
      }
    }

    // Construir query de búsqueda
    let query = { mostrar: 'si' };

    if (searchTerms.length > 0) {
      query.categoria = { $in: searchTerms };
    }

    if (sizeFilter) {
      query.nombre = { $regex: sizeFilter, $options: 'i' };
    }

    // Buscar productos
    const productos = await Product.find(query)
      .select('_id nombre descripcion precio categoria imagen imagenOptimizada medidas')
      .limit(5)
      .lean();

    console.log(`✅ Encontrados ${productos.length} productos`);
    return productos;

  } catch (error) {
    console.error('❌ Error buscando productos:', error);
    return [];
  }
}

/**
 * Obtiene un producto por ID
 * @param {string} productId - ID del producto
 * @returns {Promise<Object|null>} - Producto o null
 */
export async function getProductById(productId) {
  try {
    await connectDB();

    const producto = await Product.findById(productId)
      .select('_id nombre descripcion precio categoria imagen imagenOptimizada medidas especificaciones')
      .lean();

    return producto;

  } catch (error) {
    console.error('❌ Error obteniendo producto:', error);
    return null;
  }
}

/**
 * Obtiene todos los productos de una categoría
 * @param {string} categoria - Nombre de la categoría
 * @returns {Promise<Array>} - Array de productos
 */
export async function getProductsByCategory(categoria) {
  try {
    await connectDB();

    const productos = await Product.find({
      categoria: categoria,
      mostrar: 'si'
    })
      .select('_id nombre descripcion precio categoria imagen imagenOptimizada medidas')
      .sort({ precio: 1 })
      .lean();

    console.log(`✅ Encontrados ${productos.length} productos en ${categoria}`);
    return productos;

  } catch (error) {
    console.error('❌ Error obteniendo productos por categoría:', error);
    return [];
  }
}

/**
 * Obtiene productos por rango de precio
 * @param {number} minPrice - Precio mínimo
 * @param {number} maxPrice - Precio máximo
 * @returns {Promise<Array>} - Array de productos
 */
export async function getProductsByPriceRange(minPrice, maxPrice) {
  try {
    await connectDB();

    const productos = await Product.find({
      precio: { $gte: minPrice, $lte: maxPrice },
      mostrar: 'si'
    })
      .select('_id nombre descripcion precio categoria imagen imagenOptimizada medidas')
      .sort({ precio: 1 })
      .limit(10)
      .lean();

    console.log(`✅ Encontrados ${productos.length} productos en rango de precio`);
    return productos;

  } catch (error) {
    console.error('❌ Error buscando por rango de precio:', error);
    return [];
  }
}

/**
 * Obtiene categorías disponibles
 * @returns {Promise<Array>} - Array de categorías
 */
export async function getCategories() {
  try {
    await connectDB();

    const categorias = await Product.distinct('categoria', { mostrar: 'si' });

    console.log(`✅ Encontradas ${categorias.length} categorías`);
    return categorias;

  } catch (error) {
    console.error('❌ Error obteniendo categorías:', error);
    return [];
  }
}

/**
 * Formatea productos para mostrar en WhatsApp
 * @param {Array} productos - Array de productos
 * @returns {string} - Mensaje formateado
 */
export function formatProductsForWhatsApp(productos) {
  if (!productos || productos.length === 0) {
    return 'No encontré productos que coincidan con tu búsqueda. ¿Podrías ser más específico?';
  }

  let message = `🛏️ *Productos disponibles:*\n\n`;

  productos.forEach((producto, index) => {
    message += `${index + 1}. *${producto.nombre}*\n`;
    message += `💰 $${producto.precio?.toLocaleString('es-AR')} ARS\n`;
    if (producto.descripcion) {
      message += `📋 ${producto.descripcion.substring(0, 100)}${producto.descripcion.length > 100 ? '...' : ''}\n`;
    }
    if (producto.medidas) {
      message += `📏 ${producto.medidas}\n`;
    }
    message += `\n`;
  });

  message += `Para más información sobre un producto, escribe su número o nombre.`;

  return message;
}

/**
 * Formatea un producto individual para WhatsApp
 * @param {Object} producto - Producto
 * @returns {string} - Mensaje formateado
 */
export function formatSingleProductForWhatsApp(producto) {
  let message = `🛏️ *${producto.nombre}*\n\n`;
  message += `💰 *Precio:* $${producto.precio?.toLocaleString('es-AR')} ARS\n`;
  message += `📂 *Categoría:* ${producto.categoria}\n`;

  if (producto.medidas) {
    message += `📏 *Medidas:* ${producto.medidas}\n`;
  }

  if (producto.descripcion) {
    message += `\n📋 *Descripción:*\n${producto.descripcion}\n`;
  }

  message += `\n🚚 *Envío gratis en Neuquén Capital*`;
  message += `\n🛡️ *Garantía incluida*`;

  return message;
}
