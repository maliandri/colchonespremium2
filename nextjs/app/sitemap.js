import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';

const BASE_URL = 'https://aluminehogar.com.ar';

export default async function sitemap() {
  const staticPages = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/bot`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  try {
    await connectDB();
    const productos = await Product.find({ mostrar: 'si' }, '_id updatedAt').lean();

    const productPages = productos.map((p) => ({
      url: `${BASE_URL}/producto/${p._id}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticPages, ...productPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}
