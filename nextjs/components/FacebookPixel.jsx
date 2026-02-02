'use client';
import { useEffect } from 'react';
import { initFacebookPixel } from '@/utils/facebookPixel';

/**
 * Componente para inicializar Facebook Pixel
 * Pixel ID: 879838197733539
 */
export const FacebookPixel = () => {
  useEffect(() => {
    // Obtener Pixel ID desde variables de entorno o usar el predeterminado
    const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '879838197733539';

    // Inicializar Facebook Pixel
    initFacebookPixel(pixelId);
  }, []);

  // No renderiza nada en el DOM
  return null;
};
