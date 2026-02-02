import { connectDB } from './db.js';
import Product from './models/Product.js';

export async function searchProducts(userMessage) {
  try {
    await connectDB();

    let attempts = 0;
    while ((!Product.db || Product.db.readyState !== 1) && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      attempts++;
    }

    const lowerMessage = userMessage.toLowerCase();
    const words = lowerMessage
      .replace(/[^\w\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1\s]/gi, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);

    const searchConditions = [];
    words.forEach(word => {
      searchConditions.push(
        { nombre: { $regex: word, $options: 'i' } },
        { descripcion: { $regex: word, $options: 'i' } },
        { categoria: { $regex: word, $options: 'i' } }
      );
    });

    if (searchConditions.length === 0) {
      const productos = await Product.find({ mostrar: 'si' })
        .select('_id nombre descripcion precio categoria imagen imagenOptimizada medidas')
        .limit(5)
        .sort({ precio: -1 })
        .lean();
      return productos;
    }

    const productos = await Product.find({
      mostrar: 'si',
      $or: searchConditions
    })
      .select('_id nombre descripcion precio categoria imagen imagenOptimizada medidas')
      .limit(10)
      .lean();

    return productos;
  } catch (error) {
    console.error('Error buscando productos:', error);
    return [];
  }
}

export async function getProductById(productId) {
  try {
    await connectDB();
    const producto = await Product.findById(productId)
      .select('_id nombre descripcion precio categoria imagen imagenOptimizada medidas especificaciones')
      .lean();
    return producto;
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    return null;
  }
}

export async function getProductsByCategory(categoria) {
  try {
    await connectDB();
    const productos = await Product.find({ categoria, mostrar: 'si' })
      .select('_id nombre descripcion precio categoria imagen imagenOptimizada medidas')
      .sort({ precio: 1 })
      .lean();
    return productos;
  } catch (error) {
    console.error('Error obteniendo productos por categoria:', error);
    return [];
  }
}

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
    return productos;
  } catch (error) {
    console.error('Error buscando por rango de precio:', error);
    return [];
  }
}

export async function getCategories() {
  try {
    await connectDB();
    const categorias = await Product.distinct('categoria', { mostrar: 'si' });
    return categorias;
  } catch (error) {
    console.error('Error obteniendo categorias:', error);
    return [];
  }
}

export function formatProductsForWhatsApp(productos) {
  if (!productos || productos.length === 0) {
    return 'No encontre productos que coincidan con tu busqueda. Podrias ser mas especifico?';
  }

  let message = `*Productos disponibles:*\n\n`;
  productos.forEach((producto, index) => {
    message += `${index + 1}. *${producto.nombre}*\n`;
    message += `$${producto.precio?.toLocaleString('es-AR')} ARS\n`;
    if (producto.descripcion) {
      message += `${producto.descripcion.substring(0, 100)}${producto.descripcion.length > 100 ? '...' : ''}\n`;
    }
    message += `\n`;
  });
  message += `Para mas informacion sobre un producto, escribe su numero o nombre.`;
  return message;
}

export function formatSingleProductForWhatsApp(producto) {
  let message = `*${producto.nombre}*\n\n`;
  message += `*Precio:* $${producto.precio?.toLocaleString('es-AR')} ARS\n`;
  message += `*Categoria:* ${producto.categoria}\n`;
  if (producto.medidas) {
    message += `*Medidas:* ${producto.medidas}\n`;
  }
  if (producto.descripcion) {
    message += `\n*Descripcion:*\n${producto.descripcion}\n`;
  }
  message += `\n*Envio gratis en Neuquen Capital*`;
  message += `\n*Garantia incluida*`;
  return message;
}
