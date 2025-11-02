import { connectDB } from '../_lib/db.js';
import Product from '../_lib/models/Product.js';
import cloudinary from '../_lib/cloudinary.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await connectDB();

    const productos = await Product.find({ cloudinaryPublicId: { $exists: true, $ne: '' } });
    
    const resultados = [];
    let exitosos = 0;
    let errores = 0;

    for (const producto of productos) {
      try {
        const oldPublicId = producto.cloudinaryPublicId;
        const newPublicId = \`alumine/\${producto.nombre}\`;

        // Renombrar en Cloudinary
        const result = await cloudinary.uploader.rename(
          oldPublicId,
          newPublicId,
          { overwrite: false, invalidate: true }
        );

        // Actualizar en MongoDB
        producto.cloudinaryPublicId = newPublicId;
        await producto.save();

        resultados.push({
          nombre: producto.nombre,
          oldId: oldPublicId,
          newId: newPublicId,
          status: 'OK'
        });
        exitosos++;

      } catch (error) {
        resultados.push({
          nombre: producto.nombre,
          error: error.message,
          status: 'ERROR'
        });
        errores++;
      }
    }

    return res.status(200).json({
      message: 'Proceso completado',
      total: productos.length,
      exitosos,
      errores,
      resultados
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
