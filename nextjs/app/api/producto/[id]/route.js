import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import { getCloudinaryUrl, IMG_CARD, IMG_THUMB, IMG_DETAIL } from '@/lib/cloudinary';
import { MAPEO_NOMBRES_CLOUDINARY } from '@/lib/cloudinary-mapeo-nombres';

function getCloudinaryPathFromNombre(nombre) {
  return MAPEO_NOMBRES_CLOUDINARY[nombre] || null;
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID de producto requerido' }, { status: 400 });
    }

    await connectDB();

    const db = Product.db;
    const collection = db.collection('productos');
    const producto = await collection.findOne({ _id: decodeURIComponent(id) });

    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    let cloudinaryPath = getCloudinaryPathFromNombre(producto.nombre);

    if (!cloudinaryPath && producto.cloudinaryPublicId) {
      cloudinaryPath = producto.cloudinaryPublicId;
    }

    producto.imagenOptimizada = cloudinaryPath ? {
      original: producto.imagen || '',
      card: getCloudinaryUrl(cloudinaryPath, IMG_CARD),
      thumb: getCloudinaryUrl(cloudinaryPath, IMG_THUMB),
      detail: getCloudinaryUrl(cloudinaryPath, IMG_DETAIL),
      url: getCloudinaryUrl(cloudinaryPath, IMG_DETAIL)
    } : {
      original: '', card: '', thumb: '', detail: '', url: ''
    };

    return NextResponse.json(producto);
  } catch (err) {
    console.error('Error al obtener producto:', err);
    return NextResponse.json({ error: 'Error al cargar producto', details: err.message }, { status: 500 });
  }
}
