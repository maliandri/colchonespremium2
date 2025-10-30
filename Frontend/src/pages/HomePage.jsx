import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { VendedorModal } from '../components/VendedorModal';
import { AuthModal } from '../components/AuthModal';
import { CategorySidebar } from '../components/CategorySidebar';
import { getProductos, getCategorias } from '../services/api';

export const HomePage = ({ showVendedorModal, setShowVendedorModal, showAuthModal, setShowAuthModal }) => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('nombre-asc');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productosData, categoriasData] = await Promise.all([
        getProductos(),
        getCategorias(),
      ]);
      setProductos(productosData);
      setCategorias(categoriasData);
      setError(null);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los productos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Calcular conteo de productos por categoría
  const productCount = useMemo(() => {
    const count = {};
    productos.forEach((producto) => {
      count[producto.categoria] = (count[producto.categoria] || 0) + 1;
    });
    return count;
  }, [productos]);

  // Filtrar y ordenar productos
  const filteredProducts = productos
    .filter((producto) => {
      // Filtro por búsqueda
      const matchesSearch =
        searchTerm === '' ||
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por categoría
      const matchesCategory =
        selectedCategory === '' || producto.categoria === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case 'nombre-asc':
          return a.nombre.localeCompare(b.nombre);
        case 'nombre-desc':
          return b.nombre.localeCompare(a.nombre);
        case 'precio-asc':
          return a.precio - b.precio;
        case 'precio-desc':
          return b.precio - a.precio;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
        id="inicio"
        className="relative h-[500px] flex items-center justify-center text-center gradient-primary text-white"
      >
        <div className="gradient-overlay absolute inset-0" />
        <div className="relative z-10 container-custom px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-shadow animate-fadeIn">
            Descanso de Calidad para tu Hogar
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-shadow animate-fadeIn">
            Encuentra los mejores colchones y almohadas para tu descanso
          </p>
          <a
            href="#productos"
            className="btn-primary inline-block text-lg animate-fadeIn"
          >
            Ver Productos
          </a>
        </div>
      </section>

      {/* Productos Section */}
      <section id="productos" className="py-16">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Nuestros Productos
          </h2>

          {/* Layout con Sidebar y Productos */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar de Categorías (Solo en desktop) */}
            <div className="hidden lg:block">
              {!loading && (
                <CategorySidebar
                  categorias={categorias}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  productCount={productCount}
                />
              )}
            </div>

            {/* Contenido Principal */}
            <div className="lg:col-span-3">
              {/* Barra de búsqueda y filtros */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Búsqueda */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>

                  {/* Ordenar */}
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="input-field"
                  >
                    <option value="nombre-asc">Nombre (A-Z)</option>
                    <option value="nombre-desc">Nombre (Z-A)</option>
                    <option value="precio-asc">Precio (Menor a Mayor)</option>
                    <option value="precio-desc">Precio (Mayor a Menor)</option>
                  </select>
                </div>

                {/* Resultados encontrados y categoría seleccionada */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-gray-600 text-sm">
                    {filteredProducts.length} producto{filteredProducts.length !== 1 && 's'} encontrado{filteredProducts.length !== 1 && 's'}
                  </div>
                  {selectedCategory && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Mostrando:</span>
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                        {selectedCategory}
                      </span>
                      <button
                        onClick={() => setSelectedCategory('')}
                        className="text-sm text-gray-500 hover:text-primary"
                      >
                        Limpiar
                      </button>
                    </div>
                  )}
                </div>
              </div>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8">
              <p className="font-semibold">Error al cargar productos</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={loadData}
                className="mt-3 text-sm underline hover:no-underline"
              >
                Intentar nuevamente
              </button>
            </div>
          )}

              {/* Grid de productos */}
              {!loading && !error && (
                <>
                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredProducts.map((producto) => (
                        <ProductCard key={producto._id} product={producto} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <p className="text-gray-500 text-lg">
                        No se encontraron productos con los filtros seleccionados.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-16 bg-gray-100">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Necesitas ayuda?</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Nuestro equipo está listo para ayudarte a encontrar el colchón perfecto para
            tu descanso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+542995123456" className="btn-primary">
              Llamar Ahora
            </a>
            <a href="mailto:info@colchonespremium.com" className="btn-outline">
              Enviar Email
            </a>
          </div>
        </div>
      </section>

      {/* Modal de Vendedores */}
      <VendedorModal
        isOpen={showVendedorModal}
        onClose={() => setShowVendedorModal(false)}
        productos={productos}
        categorias={categorias}
      />

      {/* Modal de Autenticación */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};
