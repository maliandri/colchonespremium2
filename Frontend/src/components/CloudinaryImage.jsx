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
      // Si la URL está vacía, marcar como sin imagen
      if (!src || src === '') {
        setHasError(true);
        setIsLoading(false);
        return;
      }
      setImageSrc(src);
      setHasError(false);
    } else if (product.imagen && product.imagen !== '') {
      setImageSrc(product.imagen);
      setHasError(false);
    } else {
      // No hay imagen disponible
      setHasError(true);
      setIsLoading(false);
    }
  }, [product, size]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
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

      {/* Placeholder para productos sin imagen */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center text-gray-400 p-4">
            <svg
              className="w-20 h-20 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <p className="text-sm font-medium text-gray-500">Producto sin imagen</p>
            <p className="text-xs text-gray-400 mt-1">Consultar disponibilidad</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudinaryImage;
