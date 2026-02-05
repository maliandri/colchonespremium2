import { notFound, redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import { getCloudinaryUrl, IMG_CARD, IMG_DETAIL, IMG_THUMB } from '@/lib/cloudinary';
import { MAPEO_NOMBRES_CLOUDINARY } from '@/lib/cloudinary-mapeo-nombres';
import ProductDetailClient from '@/components/ProductDetailClient';

// Verificar si es un MongoDB ObjectId valido (24 caracteres hexadecimales)
function isValidObjectId(str) {
  return /^[a-fA-F0-9]{24}$/.test(str);
}

// Convertir slug a texto para busqueda (freezer-trial-180-litros -> freezer trial 180 litros)
function slugToSearchText(slug) {
  return slug.replace(/-/g, ' ').toLowerCase();
}

// Buscar producto por slug o codigo
async function findProductBySlug(slug) {
  const searchText = slugToSearchText(slug);

  // Primero buscar coincidencia exacta por nombre normalizado
  const productos = await Product.find({}).lean();

  for (const p of productos) {
    const nombreNormalizado = p.nombre?.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9\s]/g, '') // Solo letras, numeros y espacios
      .trim();

    const slugNormalizado = searchText
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();

    // Coincidencia exacta o muy similar
    if (nombreNormalizado === slugNormalizado) {
      return p;
    }

    // Verificar si el slug esta contenido en el nombre o viceversa
    if (nombreNormalizado?.includes(slugNormalizado) || slugNormalizado.includes(nombreNormalizado)) {
      return p;
    }
  }

  return null;
}

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

    let producto = null;
    if (isValidObjectId(id)) {
      producto = await Product.findById(id).lean();
    } else {
      producto = await findProductBySlug(id);
    }

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

    // Si es un ObjectId valido, buscar directamente
    if (isValidObjectId(id)) {
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
    } else {
      // Es un slug antiguo - buscar por nombre y redirigir
      const productoEncontrado = await findProductBySlug(id);

      if (productoEncontrado) {
        // Redirigir permanentemente a la URL correcta con el ID
        redirect(`/producto/${productoEncontrado._id.toString()}`);
      } else {
        // No se encontro el producto, mostrar 404
        notFound();
      }
    }
  } catch (error) {
    console.error('Error loading product:', error);
    notFound();
  }

  return <ProductDetailClient producto={producto} />;
}
