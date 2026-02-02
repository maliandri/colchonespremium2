import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import { getCloudinaryUrl, IMG_CARD, IMG_THUMB, IMG_DETAIL } from '@/lib/cloudinary';
import { MAPEO_NOMBRES_CLOUDINARY } from '@/lib/cloudinary-mapeo-nombres';
import * as xlsx from 'xlsx';

function getCloudinaryPathFromNombre(nombre) {
  return MAPEO_NOMBRES_CLOUDINARY[nombre] || null;
}

function generarIdUnico(categoria, contador) {
  const prefijo = categoria
    ? categoria.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase()
    : 'GEN';
  return `${prefijo}-${contador.toString().padStart(4, '0')}`;
}

export async function GET() {
  try {
    await connectDB();

    const db = Product.db;
    const collection = db.collection('productos');
    const productos = await collection
      .find({ mostrar: 'si' })
      .sort({ categoria: 1, nombre: 1 })
      .toArray();

    const productosOptimizados = productos.map(producto => {
      let cloudinaryPath = getCloudinaryPathFromNombre(producto.nombre);
      if (!cloudinaryPath && producto.cloudinaryPublicId) {
        cloudinaryPath = producto.cloudinaryPublicId;
      }

      producto.imagenOptimizada = cloudinaryPath ? {
        original: producto.imagen || '',
        card: getCloudinaryUrl(cloudinaryPath, IMG_CARD),
        thumb: getCloudinaryUrl(cloudinaryPath, IMG_THUMB),
        detail: getCloudinaryUrl(cloudinaryPath, IMG_DETAIL),
        url: getCloudinaryUrl(cloudinaryPath, IMG_CARD)
      } : {
        original: '', card: '', thumb: '', detail: '', url: ''
      };

      return producto;
    });

    return NextResponse.json(productosOptimizados);
  } catch (error) {
    console.error('Error en API de productos:', error);
    return NextResponse.json({ error: 'Error del servidor', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const { excelData, excelBase64 } = await request.json();
    let dataToMigrate = excelData;

    if (excelBase64 && !excelData) {
      try {
        const buffer = Buffer.from(excelBase64, 'base64');
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        dataToMigrate = xlsx.utils.sheet_to_json(sheet);
      } catch (error) {
        return NextResponse.json({ error: 'Error al procesar archivo Excel', details: error.message }, { status: 400 });
      }
    }

    if (!dataToMigrate || !Array.isArray(dataToMigrate) || dataToMigrate.length === 0) {
      return NextResponse.json({ error: 'Se requiere excelData (array) o excelBase64 (string)' }, { status: 400 });
    }

    const productsToProcess = [];
    const contadores = {};
    let procesados = 0;
    let omitidos = 0;

    dataToMigrate.forEach((item, index) => {
      const mostrar = item.Mostrar?.toString().toLowerCase().trim();
      if (mostrar === 'si' || mostrar === 'si') {
        const categoria = item.Categoria?.toString().trim() || 'General';
        contadores[categoria] = (contadores[categoria] || 0) + 1;
        productsToProcess.push({
          _id: generarIdUnico(categoria, contadores[categoria]),
          nombre: item.Nombre?.toString().trim() || `Producto ${index + 1}`,
          descripcion: item.Descripcion?.toString().trim() || '',
          precio: parseFloat(item.Precio) || 0,
          categoria,
          imagen: item.Imagen?.toString().trim() || '',
          especificaciones: item.Especificaciones?.toString().trim() || '',
          mostrar: 'si'
        });
        procesados++;
      } else {
        omitidos++;
      }
    });

    if (productsToProcess.length > 0) {
      const deleteResult = await Product.deleteMany({});
      const insertResult = await Product.insertMany(productsToProcess);
      const stats = {
        totalProductos: await Product.countDocuments(),
        productosVisibles: await Product.countDocuments({ mostrar: 'si' }),
        categorias: await Product.distinct('categoria', { mostrar: 'si' })
      };

      return NextResponse.json({
        success: true,
        message: 'Migracion completada exitosamente',
        eliminados: deleteResult.deletedCount,
        insertados: insertResult.length,
        procesados,
        omitidos,
        stats
      });
    }

    return NextResponse.json({ success: false, message: 'No hay productos para procesar' }, { status: 400 });
  } catch (error) {
    console.error('Error en migracion:', error);
    return NextResponse.json({ error: 'Error del servidor', details: error.message }, { status: 500 });
  }
}
