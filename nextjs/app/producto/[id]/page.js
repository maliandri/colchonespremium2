import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import { getCloudinaryUrl, IMG_CARD, IMG_DETAIL } from '@/lib/cloudinary';
import ProductDetailClient from '@/components/ProductDetailClient';

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    await connectDB();
    const producto = await Product.findById(id).lean();

    if (!producto) {
      return { title: 'Producto no encontrado' };
    }

    const imageUrl = producto.imagenOptimizada?.detail ||
      getCloudinaryUrl(producto.nombre, IMG_DETAIL) ||
      producto.imagen;

    return {
      title: producto.nombre,
      description: `${producto.nombre} - ${producto.descripcion || 'Producto de calidad premium en Alumine Hogar'}. Precio: $${producto.precio?.toLocaleString('es-AR')}. Envios a todo el pais.`,
      keywords: `${producto.nombre}, ${producto.categoria}, colchones neuquen, ${producto.nombre} precio, comprar ${producto.nombre}`,
      openGraph: {
        title: `${producto.nombre} | Alumine Hogar`,
        description: producto.descripcion || 'Producto de calidad premium',
        images: imageUrl ? [{ url: imageUrl }] : [],
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
      imagenOptimizada: productoRaw.imagenOptimizada
        ? {
            url: productoRaw.imagenOptimizada.url || getCloudinaryUrl(productoRaw.nombre),
            card: productoRaw.imagenOptimizada.card || getCloudinaryUrl(productoRaw.nombre, IMG_CARD),
            thumb: productoRaw.imagenOptimizada.thumb || '',
            detail: productoRaw.imagenOptimizada.detail || getCloudinaryUrl(productoRaw.nombre, IMG_DETAIL),
          }
        : {
            url: getCloudinaryUrl(productoRaw.nombre),
            card: getCloudinaryUrl(productoRaw.nombre, IMG_CARD),
            detail: getCloudinaryUrl(productoRaw.nombre, IMG_DETAIL),
          },
      stock: productoRaw.stock || 0,
      especificaciones: productoRaw.especificaciones || '',
    };
  } catch (error) {
    console.error('Error loading product:', error);
    notFound();
  }

  return <ProductDetailClient producto={producto} />;
}
