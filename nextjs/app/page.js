import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import { getCloudinaryUrl, IMG_CARD } from '@/lib/cloudinary';
import HomePageClient from '@/components/HomePageClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let productos = [];
  let categorias = [];

  try {
    await connectDB();

    const productosRaw = await Product.find({ mostrar: 'si' }).lean();

    productos = productosRaw.map((p) => ({
      _id: p._id.toString(),
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      precio: p.precio,
      categoria: p.categoria || '',
      medidas: p.medidas || '',
      imagen: p.imagen || '',
      imagenOptimizada: p.imagenOptimizada
        ? {
            url: p.imagenOptimizada.url || getCloudinaryUrl(p.nombre),
            card: p.imagenOptimizada.card || getCloudinaryUrl(p.nombre, IMG_CARD),
            thumb: p.imagenOptimizada.thumb || '',
            detail: p.imagenOptimizada.detail || '',
          }
        : { url: getCloudinaryUrl(p.nombre), card: getCloudinaryUrl(p.nombre, IMG_CARD) },
      stock: p.stock || 0,
      especificaciones: p.especificaciones || '',
    }));

    const categoriasRaw = await Product.distinct('categoria', { mostrar: 'si' });
    categorias = categoriasRaw.filter(Boolean);
  } catch (error) {
    console.error('Error loading home page data:', error);
  }

  return <HomePageClient initialProductos={productos} initialCategorias={categorias} />;
}
