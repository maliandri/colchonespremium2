import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { CloudinaryImage } from './CloudinaryImage';
import { useCartStore } from '../store/cartStore';

export const ProductListView = ({ products }) => {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <div className="space-y-4">
      {products.map((producto) => (
        <div
          key={producto._id}
          className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row">
            {/* Imagen */}
            <div className="sm:w-48 h-48 flex-shrink-0 bg-gray-50 p-4">
              <CloudinaryImage
                product={producto}
                alt={producto.nombre}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>

            {/* Información */}
            <div className="flex-1 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* Detalles del producto */}
                <div className="flex-1">
                  {/* Categoría */}
                  <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium mb-2">
                    {producto.categoria}
                  </span>

                  {/* Nombre */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {producto.nombre}
                  </h3>

                  {/* Descripción */}
                  {producto.descripcion && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {producto.descripcion}
                    </p>
                  )}

                  {/* Precio */}
                  <div className="text-2xl font-bold text-primary mb-4">
                    ${producto.precio.toLocaleString('es-AR')}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex sm:flex-col gap-2">
                  <Link
                    to={`/producto/${producto._id}`}
                    className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </Link>
                  <button
                    onClick={() => addToCart(producto)}
                    className="flex-1 sm:flex-none bg-primary hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
