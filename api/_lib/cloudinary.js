import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dlshym1te',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Constantes de transformación
// Usar c_fit para evitar recortar las imágenes
export const IMG_CARD = 'c_fit,w_400,h_300,q_auto,f_auto';
export const IMG_THUMB = 'c_fit,w_150,h_150,q_auto,f_auto';
export const IMG_DETAIL = 'c_fit,w_1200,h_900,q_auto,f_auto';

export function getCloudinaryUrl(publicIdOrUrl, transformation) {
  if (!publicIdOrUrl) return '';

  // Si ya es una URL completa de Cloudinary
  if (publicIdOrUrl.includes('cloudinary.com')) {
    const parts = publicIdOrUrl.split('/upload/');
    if (parts.length === 2) {
      // Limpiar cualquier parámetro de query string de la segunda parte
      const pathWithoutQuery = parts[1].split('?')[0];
      return `${parts[0]}/upload/${transformation}/${pathWithoutQuery}`;
    }
    return publicIdOrUrl;
  }

  // Si es un public_id, construir URL manualmente para evitar parámetros automáticos
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dlshym1te';
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicIdOrUrl}`;
}

export default cloudinary;
