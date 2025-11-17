import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, MessageCircle, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { CloudinaryImage } from '../components/CloudinaryImage';
import { useSEO, generateTitle, generateCanonicalUrl, generateImageUrl } from '../hooks/useSEO';
import { trackViewContent, trackContact } from '../utils/facebookPixel';

export const ProductDetail = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSpecs, setOpenSpecs] = useState({});
  const addToCart = useCartStore((state) => state.addToCart);

  // Función para parsear especificaciones HTML
  const parseEspecificaciones = (htmlString) => {
    if (!htmlString) return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const items = doc.querySelectorAll('li');

    return Array.from(items).map((item, index) => {
      const strongTag = item.querySelector('strong');
      const titulo = strongTag ? strongTag.textContent : `Especificación ${index + 1}`;
      const contenido = strongTag
        ? item.innerHTML.replace(strongTag.outerHTML, '').trim()
        : item.textContent;

      return { titulo, contenido };
    });
  };

  const toggleSpec = (index) => {
    setOpenSpecs(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // SEO dinámico basado en el producto
  useSEO({
    title: producto ? generateTitle(producto.nombre) : generateTitle('Producto'),
    description: producto
      ? `${producto.nombre} - ${producto.descripcion || 'Producto de calidad premium en Aluminé Hogar'}. Precio: $${producto.precio?.toLocaleString('es-AR')}. Envíos a todo el país.`
      : 'Producto de Aluminé Hogar - Tu mejor descanso en Neuquén',
    keywords: producto
      ? `${producto.nombre}, ${producto.categoria}, colchones neuquén, ${producto.nombre} precio, comprar ${producto.nombre}`
      : 'colchones, almohadas, neuquén',
    url: generateCanonicalUrl(`/producto/${id}`),
    type: 'product',
    image: producto ? generateImageUrl(producto.imagen || producto.imagenOptimizada?.detail) : undefined,
    product: producto || undefined,
  });

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/producto/${encodeURIComponent(id)}`);

        if (!response.ok) {
          throw new Error('Producto no encontrado');
        }

        const data = await response.json();
        setProducto(data);

        // Track Facebook Pixel ViewContent event
        trackViewContent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
  }, [id]);

  const handleAddToCart = () => {
    if (producto) {
      addToCart(producto);
    }
  };

  const handleWhatsApp = () => {
    const mensaje = `Hola! Me interesa el producto: ${producto.nombre} - Precio: $${producto.precio.toLocaleString('es-AR')}`;
    const whatsappUrl = `https://wa.me/5492995769999?text=${encodeURIComponent(mensaje)}`;

    // Track Facebook Pixel Contact event
    trackContact('WhatsApp Product', producto.precio);

    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Producto no encontrado</h2>
        <Link to="/" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="text-primary hover:underline flex items-center gap-2 mb-4">
            <ArrowLeft className="w-5 h-5" />
            Volver al catálogo
          </Link>
          <div className="text-sm text-gray-600">
            <Link to="/" className="hover:text-primary">Inicio</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-400">{producto.categoria}</span>
            <span className="mx-2">/</span>
            <span className="text-gray-800">{producto.nombre}</span>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Image Section */}
            <div className="relative flex items-center justify-center bg-gray-50 rounded-lg p-4">
              <CloudinaryImage
                product={producto}
                alt={producto.nombre}
                className="w-full h-96 object-contain rounded-lg"
                loading="eager"
              />
              {producto.categoria && (
                <span className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                  {producto.categoria}
                </span>
              )}
            </div>

            {/* Info Section */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {producto.nombre}
              </h1>

              <div className="text-4xl font-bold text-primary mb-6">
                ${producto.precio.toLocaleString('es-AR')}
              </div>

              {/* Description */}
              {producto.descripcion && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Descripción</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {producto.descripcion}
                  </p>
                </div>
              )}

              {/* Specifications - Acordeones Individuales */}
              {producto.especificaciones && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">
                    Especificaciones Técnicas
                  </h2>
                  <div className="space-y-2">
                    {parseEspecificaciones(producto.especificaciones).map((spec, index) => {
                      const isOpen = openSpecs[index];
                      return (
                        <div
                          key={index}
                          className="rounded-lg overflow-hidden border border-gray-200"
                        >
                          <button
                            onClick={() => toggleSpec(index)}
                            className={`w-full flex items-center justify-between p-4 transition-colors ${
                              isOpen
                                ? 'bg-primary text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                          >
                            <span className="font-semibold text-left">
                              {spec.titulo.replace(':', '')}
                            </span>
                            {isOpen ? (
                              <Minus className="w-5 h-5 flex-shrink-0 text-green-400" />
                            ) : (
                              <Plus className="w-5 h-5 flex-shrink-0 text-green-400" />
                            )}
                          </button>

                          {isOpen && (
                            <div className="p-4 bg-white animate-fadeIn">
                              <div
                                className="text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: spec.contenido }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-auto space-y-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-primary hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Agregar al Carrito
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Consultar por WhatsApp
                </button>

                <p className="text-sm text-gray-500 text-center">
                  Envío a todo el país
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="font-semibold text-gray-800 mb-2">Envío Seguro</h3>
            <p className="text-sm text-gray-600">Envíos a todo el país con seguimiento</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="font-semibold text-gray-800 mb-2">Garantía</h3>
            <p className="text-sm text-gray-600">Productos con garantía oficial</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="font-semibold text-gray-800 mb-2">Atención Personalizada</h3>
            <p className="text-sm text-gray-600">Asesoramiento por WhatsApp</p>
          </div>
        </div>
      </div>
    </div>
  );
};
