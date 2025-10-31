import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dlshym1te',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Constantes de transformación
export const IMG_CARD = 'c_fill,w_400,h_300,q_auto,f_auto';
export const IMG_THUMB = 'c_fill,w_150,h_150,q_auto,f_auto';
export const IMG_DETAIL = 'c_fill,w_1200,h_900,q_auto,f_auto';

export function getCloudinaryUrl(publicIdOrUrl, transformation) {
  if (!publicIdOrUrl) return '';
  
  // Si ya es una URL completa de Cloudinary
  if (publicIdOrUrl.includes('cloudinary.com')) {
    const parts = publicIdOrUrl.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/${transformation}/${parts[1]}`;
    }
    return publicIdOrUrl;
  }
  
  // Si es un public_id
  return cloudinary.url(publicIdOrUrl, {
    transformation: transformation
  });
}

export default cloudinary;