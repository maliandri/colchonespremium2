import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import { getCloudinaryUrl, IMG_CARD, IMG_THUMB, IMG_DETAIL } from '@/lib/cloudinary';
import { MAPEO_NOMBRES_CLOUDINARY } from '@/lib/cloudinary-mapeo-nombres';
import HomePageClient from '@/components/HomePageClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let productos = [];
  let categorias = [];

  try {
    await connectDB();

    const productosRaw = await Product.find({ mostrar: 'si' }).lean();

    productos = productosRaw.map((p) => {
      const cloudinaryPath = MAPEO_NOMBRES_CLOUDINARY[p.nombre] || p.cloudinaryPublicId || null;

      return {
        _id: p._id.toString(),
        nombre: p.nombre,
        descripcion: p.descripcion || '',
        precio: p.precio,
        categoria: p.categoria || '',
        medidas: p.medidas || '',
        imagen: p.imagen || '',
        imagenOptimizada: cloudinaryPath
          ? {
              url: getCloudinaryUrl(cloudinaryPath, IMG_CARD),
              card: getCloudinaryUrl(cloudinaryPath, IMG_CARD),
              thumb: getCloudinaryUrl(cloudinaryPath, IMG_THUMB),
              detail: getCloudinaryUrl(cloudinaryPath, IMG_DETAIL),
            }
          : { url: '', card: '', thumb: '', detail: '' },
        stock: p.stock || 0,
        especificaciones: p.especificaciones || '',
      };
    });

    const categoriasRaw = await Product.distinct('categoria', { mostrar: 'si' });
    categorias = categoriasRaw.filter(Boolean);
  } catch (error) {
    console.error('Error loading home page data:', error);
  }

  return <HomePageClient initialProductos={productos} initialCategorias={categorias} />;
}
