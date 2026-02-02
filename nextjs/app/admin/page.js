'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, ImagePlus, Trash2, Upload } from 'lucide-react';
import {
  getProductosAdmin,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  subirImagen
} from '@/services/api';

export default function AdminPanel() {
  const { user, isAdmin } = useAuthStore();
  const router = useRouter();

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return () => unsub?.();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAdmin()) {
      alert('Acceso denegado: Solo administradores');
      router.push('/');
      return;
    }
    fetchProductos();
  }, [hydrated]);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const data = await getProductosAdmin();
      setProductos(data.productos);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const categorias = useMemo(() => {
    return [...new Set(productos.map(p => p.categoria).filter(Boolean))].sort();
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    return productos
      .filter(p => !searchTerm || p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(p => !filterCategoria || p.categoria === filterCategoria)
      .sort((a, b) => {
        switch (sortBy) {
          case 'nombre-az': return (a.nombre || '').localeCompare(b.nombre || '');
          case 'nombre-za': return (b.nombre || '').localeCompare(a.nombre || '');
          case 'precio-asc': return (a.precio || 0) - (b.precio || 0);
          case 'precio-desc': return (b.precio || 0) - (a.precio || 0);
          default: return 0;
        }
      });
  }, [productos, searchTerm, filterCategoria, sortBy]);

  const handleDelete = async (id, nombre) => {
    if (!confirm(`Eliminar el producto "${nombre}"?`)) return;
    try {
      await eliminarProducto(id);
      alert('Producto eliminado');
      fetchProductos();
    } catch (error) {
      alert('Error al eliminar producto');
    }
  };

  const handleEdit = (producto) => {
    setEditingProduct(producto);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  if (loading) {
    return <div className="container mx-auto p-8">Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Panel de Administracion</h1>
        <button onClick={handleCreate} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          + Crear Producto
        </button>
      </div>

      {showForm && (
        <ProductForm
          producto={editingProduct}
          categorias={categorias}
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); fetchProductos(); }}
        />
      )}

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded px-3 py-2 pl-9 text-sm"
            />
          </div>
          <select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
            className="border rounded px-3 py-2 text-sm min-w-[180px]"
          >
            <option value="">Todas las categorias</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded px-3 py-2 text-sm min-w-[180px]"
          >
            <option value="">Ordenar por...</option>
            <option value="nombre-az">Nombre A-Z</option>
            <option value="nombre-za">Nombre Z-A</option>
            <option value="precio-asc">Precio menor a mayor</option>
            <option value="precio-desc">Precio mayor a menor</option>
          </select>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Mostrando {productosFiltrados.length} de {productos.length} productos
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Imagen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Categoria</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Mostrar</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {productosFiltrados.map((producto) => (
              <tr key={producto._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {producto.imagen ? (
                    <img
                      src={typeof producto.imagenOptimizada === 'object' ? producto.imagenOptimizada?.thumb : (producto.imagenOptimizada || producto.imagen)}
                      alt={producto.nombre}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                      <ImagePlus className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 font-medium">{producto.nombre}</td>
                <td className="px-6 py-4">${producto.precio?.toLocaleString('es-AR')}</td>
                <td className="px-6 py-4">{producto.categoria}</td>
                <td className="px-6 py-4">{producto.stock || 0}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    producto.mostrar === 'si' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {producto.mostrar === 'si' ? 'Si' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleEdit(producto)} className="text-blue-600 hover:text-blue-800">Editar</button>
                  <button onClick={() => handleDelete(producto._id, producto.nombre)} className="text-red-600 hover:text-red-800">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {productosFiltrados.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {productos.length === 0 ? 'No hay productos creados. Crea uno para empezar.' : 'No se encontraron productos con esos filtros.'}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductForm({ producto, categorias, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nombre: producto?.nombre || '',
    descripcion: producto?.descripcion || '',
    precio: producto?.precio || '',
    categoria: producto?.categoria || '',
    medidas: producto?.medidas || '',
    imagen: producto?.imagen || '',
    imagenOptimizada: producto?.imagenOptimizada || '',
    mostrar: producto?.mostrar || 'si',
    stock: producto?.stock || 0
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const imagenPreview = formData.imagen
    ? (typeof formData.imagenOptimizada === 'object' ? formData.imagenOptimizada?.card : (formData.imagenOptimizada || formData.imagen))
    : null;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('La imagen debe pesar menos de 10MB'); return; }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result;
          const response = await subirImagen(base64);
          setFormData(prev => ({ ...prev, imagen: response.url, imagenOptimizada: response.optimizedUrl }));
        } catch (error) {
          alert('Error al subir imagen');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert('Error al subir imagen');
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.precio || !formData.categoria) {
      alert('Nombre, precio y categoria son requeridos'); return;
    }
    setSaving(true);
    try {
      if (producto) {
        await actualizarProducto(producto._id, formData);
        alert('Producto actualizado');
      } else {
        await crearProducto(formData);
        alert('Producto creado');
      }
      onSuccess();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al guardar producto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">{producto ? 'Editar Producto' : 'Crear Producto'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium mb-2">Imagen del producto</label>
              <div className="flex items-start gap-4">
                {imagenPreview ? (
                  <div className="relative group">
                    <img src={imagenPreview} alt="Imagen actual"
                      className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">Cambiar imagen</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400">
                    <ImagePlus className="w-10 h-10 mb-2" />
                    <span className="text-xs">Sin imagen</span>
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <label className={`flex items-center gap-2 px-4 py-2 rounded cursor-pointer text-sm font-medium transition-colors ${
                    uploading ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}>
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Subiendo...' : (imagenPreview ? 'Cambiar imagen' : 'Subir imagen')}
                    <input type="file" accept="image/*" onChange={handleImageUpload}
                      className="hidden" disabled={uploading} />
                  </label>
                  {uploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">JPG, PNG o WebP. Max 10MB.</p>
                  {imagenPreview && (
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, imagen: '', imagenOptimizada: '' }))}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                      <Trash2 className="w-3 h-3" /> Quitar imagen
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripcion</label>
              <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full border rounded px-3 py-2" rows="3" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Precio * (ARS)</label>
                <input type="number" value={formData.precio} onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full border rounded px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoria *</label>
              <input type="text" value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full border rounded px-3 py-2" placeholder="Ej: Colchones, Almohadas, etc." required
                list="categorias-list" />
              <datalist id="categorias-list">
                {categorias.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Medidas</label>
              <input type="text" value={formData.medidas} onChange={(e) => setFormData({ ...formData, medidas: e.target.value })}
                className="w-full border rounded px-3 py-2" placeholder="Ej: 190 x 140 cm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mostrar en web</label>
              <select value={formData.mostrar} onChange={(e) => setFormData({ ...formData, mostrar: e.target.value })}
                className="w-full border rounded px-3 py-2">
                <option value="si">Si</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="px-6 py-2 border rounded hover:bg-gray-100" disabled={saving}>
                Cancelar
              </button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400" disabled={saving || uploading}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
