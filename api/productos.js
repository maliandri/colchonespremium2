import { connectDB } from './_lib/db.js';
import Product from './_lib/models/Product.js';
import { getCloudinaryUrl, IMG_CARD, IMG_THUMB, IMG_DETAIL } from './_lib/cloudinary.js';
import xlsx from 'xlsx';

/**
 * API CONSOLIDADA DE PRODUCTOS
 *
 * Maneja:
 * - GET: Obtener productos con imágenes optimizadas de Cloudinary
 * - POST: Migrar Excel a MongoDB (convierte Excel a JSON y actualiza BD)
 */

/**
 * Construye el path de Cloudinary usando el nombre del producto
 */
function buildCloudinaryPath(nombre) {
  return `alumine/${nombre}`;
}

/**
 * Función para generar IDs únicos basados en categoría
 */
function generarIdUnico(categoria, contador) {
  const prefijo = categoria
    ? categoria
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 3)
        .toUpperCase()
    : 'GEN';

  return `${prefijo}-${contador.toString().padStart(4, '0')}`;
}

/**
 * Migra datos de Excel/JSON a MongoDB
 * IMPORTANTE: Elimina TODOS los productos existentes y reimporta desde cero
 */
async function migrateProductsToMongoDB(excelData, cleanDatabase = true) {
  console.log('🔄 Iniciando migración de productos...');

  const productsToProcess = [];
  const contadores = {};
  let procesados = 0;
  let omitidos = 0;
  let eliminados = 0;

  excelData.forEach((item, index) => {
    const mostrar = item.Mostrar?.toString().toLowerCase().trim();

    if (mostrar === "si" || mostrar === "sí") {
      const categoria = item.Categoria?.toString().trim() || 'General';
      contadores[categoria] = (contadores[categoria] || 0) + 1;

      productsToProcess.push({
        _id: generarIdUnico(categoria, contadores[categoria]),
        nombre: item.Nombre?.toString().trim() || `Producto ${index + 1}`,
        descripcion: item.Descripcion?.toString().trim() || '',
        precio: parseFloat(item.Precio) || 0,
        categoria: categoria,
        imagen: item.Imagen?.toString().trim() || '',
        especificaciones: item.Especificaciones?.toString().trim() || '',
        mostrar: 'si'
      });
      procesados++;
    } else {
      omitidos++;
    }
  });

  console.log(`✅ Productos a procesar: ${procesados}`);
  console.log(`⏭️ Productos omitidos: ${omitidos}`);

  if (productsToProcess.length > 0) {
    // PASO 1: Limpiar base de datos si está habilitado
    if (cleanDatabase) {
      console.log('🗑️ Limpiando base de datos...');
      const deleteResult = await Product.deleteMany({});
      eliminados = deleteResult.deletedCount;
      console.log(`✅ ${eliminados} productos eliminados`);
    }

    // PASO 2: Insertar productos nuevos
    console.log('💾 Insertando productos...');
    const insertResult = await Product.insertMany(productsToProcess);
    console.log(`✅ ${insertResult.length} productos insertados`);

    const stats = {
      totalProductos: await Product.countDocuments(),
      productosVisibles: await Product.countDocuments({ mostrar: 'si' }),
      categorias: await Product.distinct('categoria', { mostrar: 'si' })
    };

    return {
      success: true,
      eliminados,
      insertados: insertResult.length,
      procesados,
      omitidos,
      stats
    };
  }

  return { success: false, message: 'No hay productos para procesar' };
}

/**
 * Handler principal
 */
export default async function handler(req, res) {
  try {
    await connectDB();

    // GET: Obtener productos
    if (req.method === 'GET') {
      return await handleGetProducts(req, res);
    }

    // POST: Migrar Excel/JSON a MongoDB
    if (req.method === 'POST') {
      return await handleMigrateProducts(req, res);
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('❌ Error en API de productos:', error);
    return res.status(500).json({ error: 'Error del servidor', details: error.message });
  }
}

/**
 * GET: Obtener productos con imágenes optimizadas de Cloudinary
 */
async function handleGetProducts(req, res) {
  console.log('📋 Solicitud de productos recibida');

  const productos = await Product.find({ mostrar: 'si' }).sort({ categoria: 1, nombre: 1 });

  // Transformar productos para incluir URLs optimizadas de Cloudinary
  const productosOptimizados = productos.map(producto => {
    const productoObj = producto.toObject();

    // Usar cloudinaryPublicId si existe, sino construir con el nombre
    let cloudinaryPath;
    if (productoObj.cloudinaryPublicId) {
      cloudinaryPath = productoObj.cloudinaryPublicId;
    } else {
      cloudinaryPath = buildCloudinaryPath(productoObj.nombre);
    }

    productoObj.imagenOptimizada = {
      original: productoObj.imagen || '',
      card: getCloudinaryUrl(cloudinaryPath, IMG_CARD),
      thumb: getCloudinaryUrl(cloudinaryPath, IMG_THUMB),
      detail: getCloudinaryUrl(cloudinaryPath, IMG_DETAIL),
      url: getCloudinaryUrl(cloudinaryPath, IMG_CARD)
    };

    return productoObj;
  });

  console.log(`✅ Enviando ${productosOptimizados.length} productos con imágenes optimizadas`);

  return res.status(200).json(productosOptimizados);
}

/**
 * POST: Migrar productos desde Excel/JSON a MongoDB
 *
 * Body esperado:
 * - excelData: Array de objetos con estructura del Excel
 * - excelBase64: String base64 del archivo Excel (opcional)
 */
async function handleMigrateProducts(req, res) {
  console.log('📤 Solicitud de migración de productos recibida');

  const { excelData, excelBase64 } = req.body;

  let dataToMigrate = excelData;

  // Si viene base64, convertir a JSON
  if (excelBase64 && !excelData) {
    try {
      const buffer = Buffer.from(excelBase64, 'base64');
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      dataToMigrate = xlsx.utils.sheet_to_json(sheet);
      console.log(`📊 Excel convertido: ${dataToMigrate.length} registros`);
    } catch (error) {
      return res.status(400).json({
        error: 'Error al procesar archivo Excel',
        details: error.message
      });
    }
  }

  if (!dataToMigrate || !Array.isArray(dataToMigrate) || dataToMigrate.length === 0) {
    return res.status(400).json({
      error: 'Se requiere excelData (array) o excelBase64 (string)'
    });
  }

  const result = await migrateProductsToMongoDB(dataToMigrate);

  if (result.success) {
    return res.status(200).json({
      message: 'Migración completada exitosamente',
      ...result
    });
  } else {
    return res.status(400).json(result);
  }
}
