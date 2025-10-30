import { useState } from 'react';
import { ShoppingCart, ZoomIn, Tag } from 'lucide-react';
import { CloudinaryImage } from './CloudinaryImage';
import { useCartStore } from '../store/cartStore';

export const ProductCard = ({ product }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = () => {
    addToCart(product);
    // TODO: Mostrar notificación de "Agregado al carrito"
  };

  const handleImageClick = () => {
    setShowImageModal(true);
  };

  return (
    <>
      <div className="card group cursor-pointer transform hover:scale-105 transition-all duration-300">
        {/* Imagen del producto */}
        <div
          className="relative h-64 overflow-hidden bg-gray-50 flex items-center justify-center"
          onClick={handleImageClick}
        >
          <CloudinaryImage
            product={product}
            size="card"
            className="w-full h-full"
          />

          {/* Overlay en hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <ZoomIn className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        {/* Información del producto */}
        <div className="p-5">
          {/* Categoría */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <Tag className="w-4 h-4" />
            <span>{product.categoria}</span>
          </div>

          {/* Nombre */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.nombre}
          </h3>

          {/* Descripción */}
          {product.descripcion && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.descripcion}
            </p>
          )}

          {/* Precio y botón */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-2xl font-bold text-primary">
              ${parseFloat(product.precio).toFixed(2)}
            </div>

            <button
              onClick={handleAddToCart}
              className="btn-primary py-2 px-4 flex items-center space-x-2 text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de imagen ampliada */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-lg">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <CloudinaryImage
              product={product}
              size="detail"
              className="w-full h-full"
              loading="eager"
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">{product.nombre}</h3>
              <p className="text-lg">${parseFloat(product.precio).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
