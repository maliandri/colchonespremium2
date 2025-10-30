import { useEffect, useState } from 'react';

/**
 * Componente para mostrar imágenes de Cloudinary optimizadas
 * Usa las URLs optimizadas que vienen del backend
 */
export const CloudinaryImage = ({
  product,
  size = 'card', // 'thumb', 'card', 'detail'
  alt,
  className = '',
  loading = 'lazy',
  onClick,
}) => {
  const [imageSrc, setImageSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Obtener la URL optimizada según el tamaño solicitado
    if (product.imagenOptimizada) {
      const src = product.imagenOptimizada[size] || product.imagenOptimizada.url || product.imagen;
      setImageSrc(src);
    } else {
      setImageSrc(product.imagen || '/assets/placeholder.jpg');
    }
  }, [product, size]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    setImageSrc('/assets/placeholder.jpg');
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder mientras carga */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Imagen */}
      <img
        src={imageSrc}
        alt={alt || product.nombre}
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        onClick={onClick}
      />

      {/* Indicador de error */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-400">
            <svg
              className="w-16 h-16 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Imagen no disponible</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudinaryImage;
