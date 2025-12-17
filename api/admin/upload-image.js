/**
 * API para subir imágenes a Cloudinary
 * Requiere autenticación de admin
 */
import { v2 as cloudinary } from 'cloudinary';
import { extractTokenFromRequest, verifyToken, requireAdmin } from '../_lib/auth-helpers.js';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb' // Permitir imágenes hasta 10MB
    }
  }
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar autenticación
    const token = extractTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'Token de autenticación requerido' });
    }

    const decoded = verifyToken(token);
    requireAdmin(decoded);

    const { image } = req.body; // Base64 string

    if (!image) {
      return res.status(400).json({ error: 'Imagen requerida' });
    }

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'colchones-premium',
      transformation: [
        { width: 800, height: 800, crop: 'limit' }, // Imagen normal
        { quality: 'auto', fetch_format: 'auto' } // Optimización automática
      ]
    });

    // Generar versión optimizada (thumbnail)
    const optimizedUrl = cloudinary.url(result.public_id, {
      width: 400,
      height: 400,
      crop: 'limit',
      quality: 'auto',
      fetch_format: 'auto'
    });

    console.log(`✅ Imagen subida por admin ${decoded.email}: ${result.secure_url}`);

    return res.status(200).json({
      success: true,
      url: result.secure_url,
      optimizedUrl,
      publicId: result.public_id
    });

  } catch (error) {
    console.error('❌ Error subiendo imagen:', error);

    if (error.message.includes('Token inválido') || error.message.includes('administrador')) {
      return res.status(403).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Error al subir imagen' });
  }
}
