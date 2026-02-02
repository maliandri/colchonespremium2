import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import { getCloudinaryUrl, IMG_CARD, IMG_DETAIL, IMG_THUMB } from '@/lib/cloudinary';
import { MAPEO_NOMBRES_CLOUDINARY } from '@/lib/cloudinary-mapeo-nombres';
import ProductDetailClient from '@/components/ProductDetailClient';

function getImageData(producto) {
  const cloudinaryPath = MAPEO_NOMBRES_CLOUDINARY[producto.nombre] || producto.cloudinaryPublicId || null;
  if (cloudinaryPath) {
    return {
      url: getCloudinaryUrl(cloudinaryPath, IMG_CARD),
      card: getCloudinaryUrl(cloudinaryPath, IMG_CARD),
      thumb: getCloudinaryUrl(cloudinaryPath, IMG_THUMB),
      detail: getCloudinaryUrl(cloudinaryPath, IMG_DETAIL),
    };
  }
  return { url: '', card: '', thumb: '', detail: '' };
}

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    await connectDB();
    const producto = await Product.findById(id).lean();

    if (!producto) {
      return { title: 'Producto no encontrado' };
    }

    const imageData = getImageData(producto);

    return {
      title: producto.nombre,
      description: `${producto.nombre} - ${producto.descripcion || 'Producto de calidad premium en Alumine Hogar'}. Precio: $${producto.precio?.toLocaleString('es-AR')}. Envios a todo el pais.`,
      keywords: `${producto.nombre}, ${producto.categoria}, colchones neuquen, ${producto.nombre} precio, comprar ${producto.nombre}`,
      openGraph: {
        title: `${producto.nombre} | Alumine Hogar`,
        description: producto.descripcion || 'Producto de calidad premium',
        images: imageData.detail ? [{ url: imageData.detail }] : [],
        type: 'website',
      },
    };
  } catch (error) {
    return { title: 'Producto' };
  }
}

export default async function ProductoPage({ params }) {
  const { id } = await params;

  let producto = null;

  try {
    await connectDB();
    const productoRaw = await Product.findById(id).lean();

    if (!productoRaw) {
      notFound();
    }

    producto = {
      _id: productoRaw._id.toString(),
      nombre: productoRaw.nombre,
      descripcion: productoRaw.descripcion || '',
      precio: productoRaw.precio,
      categoria: productoRaw.categoria || '',
      medidas: productoRaw.medidas || '',
      imagen: productoRaw.imagen || '',
      imagenOptimizada: getImageData(productoRaw),
      stock: productoRaw.stock || 0,
      especificaciones: productoRaw.especificaciones || '',
    };
  } catch (error) {
    console.error('Error loading product:', error);
    notFound();
  }

  return <ProductDetailClient producto={producto} />;
}
