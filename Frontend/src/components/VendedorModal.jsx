import { useState, useEffect } from 'react';
import { X, Search, FileDown, Send, Trash2 } from 'lucide-react';
import { CloudinaryImage } from './CloudinaryImage';
import jsPDF from 'jspdf';
import { enviarPresupuesto } from '../services/api';

export const VendedorModal = ({ isOpen, onClose, productos, categorias }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [carritoVendedor, setCarritoVendedor] = useState({});
  const [vendedor, setVendedor] = useState({ nombre: '' });
  const [cliente, setCliente] = useState({
    nombre: '',
    telefono: '',
    provincia: 'Neuquén',
    localidad: '',
    direccion: '',
    email: ''
  });

  const provincias = [
    'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
    'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
    'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
    'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
    'Tierra del Fuego', 'Tucumán'
  ];

  // Filtrar productos según categoría
  const productosFiltrados = selectedCategory
    ? productos.filter(p => p.categoria === selectedCategory)
    : productos;

  // Calcular total
  const calcularTotal = () => {
    return Object.values(carritoVendedor).reduce(
      (total, item) => total + (item.precio * item.cantidad),
      0
    );
  };

  // Agregar/actualizar cantidad
  const handleCantidadChange = (producto, cantidad) => {
    const cant = parseInt(cantidad) || 0;

    if (cant <= 0) {
      const nuevoCarrito = { ...carritoVendedor };
      delete nuevoCarrito[producto._id];
      setCarritoVendedor(nuevoCarrito);
    } else {
      setCarritoVendedor({
        ...carritoVendedor,
        [producto._id]: {
          ...producto,
          cantidad: cant
        }
      });
    }
  };

  // Resetear presupuesto
  const handleResetear = () => {
    if (confirm('¿Estás seguro de que deseas resetear el presupuesto?')) {
      setCarritoVendedor({});
      setVendedor({ nombre: '' });
      setCliente({
        nombre: '',
        telefono: '',
        provincia: 'Neuquén',
        localidad: '',
        direccion: '',
        email: ''
      });
    }
  };

  // Descargar PDF
  const handleDescargarPDF = () => {
    const doc = new jsPDF();
    const items = Object.values(carritoVendedor);

    if (items.length === 0) {
      alert('No hay productos en el presupuesto');
      return;
    }

    // Título
    doc.setFontSize(20);
    doc.text('Presupuesto - Colchones Premium', 20, 20);

    // Info vendedor
    doc.setFontSize(12);
    doc.text(`Vendedor: ${vendedor.nombre || 'N/A'}`, 20, 35);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 42);

    // Info cliente
    doc.setFontSize(14);
    doc.text('Datos del Cliente:', 20, 55);
    doc.setFontSize(11);
    doc.text(`Nombre: ${cliente.nombre || 'N/A'}`, 20, 63);
    doc.text(`Teléfono: ${cliente.telefono || 'N/A'}`, 20, 70);
    doc.text(`Email: ${cliente.email || 'N/A'}`, 20, 77);
    doc.text(`Dirección: ${cliente.direccion || 'N/A'}`, 20, 84);
    doc.text(`${cliente.localidad || 'N/A'}, ${cliente.provincia}`, 20, 91);

    // Productos
    doc.setFontSize(14);
    doc.text('Productos:', 20, 105);

    let y = 115;
    doc.setFontSize(10);

    items.forEach((item, index) => {
      const subtotal = item.precio * item.cantidad;
      doc.text(
        `${index + 1}. ${item.nombre}`,
        20,
        y
      );
      doc.text(
        `${item.cantidad} x $${item.precio.toFixed(2)} = $${subtotal.toFixed(2)}`,
        20,
        y + 7
      );
      y += 15;

      // Nueva página si es necesario
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    // Total
    y += 10;
    doc.setFontSize(14);
    doc.text(`TOTAL: $${calcularTotal().toFixed(2)}`, 20, y);

    // Descargar
    doc.save(`presupuesto-${Date.now()}.pdf`);
  };

  // Enviar por email
  const handleEnviarEmail = async () => {
    const items = Object.values(carritoVendedor);

    if (items.length === 0) {
      alert('No hay productos en el presupuesto');
      return;
    }

    if (!cliente.email) {
      alert('Por favor ingresa el email del cliente');
      return;
    }

    try {
      const productosFormateados = items.map(item => ({
        nombre: item.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precio,
        subtotal: item.precio * item.cantidad
      }));

      await enviarPresupuesto({
        cliente: {
          nombre: cliente.nombre,
          email: cliente.email,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
          localidad: cliente.localidad,
          provincia: cliente.provincia
        },
        vendedor: {
          nombre: vendedor.nombre
        },
        productos: productosFormateados,
        total: calcularTotal()
      });

      alert('Presupuesto enviado exitosamente por email');
    } catch (error) {
      console.error('Error al enviar email:', error);
      alert('Error al enviar el presupuesto por email');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-primary text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Acceso Vendedores</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-red-700 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Productos */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Productos</h3>

              {/* Filtro de categoría */}
              <div className="mb-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Lista de productos */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {productosFiltrados.map(producto => (
                  <div
                    key={producto._id}
                    className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="w-16 h-16 flex-shrink-0">
                      <CloudinaryImage
                        product={producto}
                        size="thumb"
                        className="w-full h-full rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{producto.nombre}</h4>
                      <p className="text-primary font-bold">${producto.precio.toFixed(2)}</p>
                      <p className="text-xs text-gray-600">{producto.categoria}</p>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={carritoVendedor[producto._id]?.cantidad || 0}
                      onChange={(e) => handleCantidadChange(producto, e.target.value)}
                      className="w-20 px-2 py-1 border rounded text-center"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen y Datos */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Resumen del Pedido</h3>

              {/* Datos del Vendedor */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nombre del Vendedor</label>
                <input
                  type="text"
                  value={vendedor.nombre}
                  onChange={(e) => setVendedor({ nombre: e.target.value })}
                  className="input-field"
                  placeholder="Tu nombre"
                />
              </div>

              {/* Datos del Cliente */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-3">Datos del Cliente</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={cliente.nombre}
                    onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                    className="input-field"
                    placeholder="Nombre completo"
                  />
                  <input
                    type="tel"
                    value={cliente.telefono}
                    onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                    className="input-field"
                    placeholder="Teléfono"
                  />
                  <input
                    type="email"
                    value={cliente.email}
                    onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                    className="input-field"
                    placeholder="Email"
                  />
                  <select
                    value={cliente.provincia}
                    onChange={(e) => setCliente({ ...cliente, provincia: e.target.value })}
                    className="input-field"
                  >
                    {provincias.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={cliente.localidad}
                    onChange={(e) => setCliente({ ...cliente, localidad: e.target.value })}
                    className="input-field"
                    placeholder="Localidad"
                  />
                  <input
                    type="text"
                    value={cliente.direccion}
                    onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
                    className="input-field"
                    placeholder="Dirección"
                  />
                </div>
              </div>

              {/* Productos Seleccionados */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-3">Productos Seleccionados</h4>
                {Object.keys(carritoVendedor).length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay productos seleccionados</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Object.values(carritoVendedor).map(item => (
                      <div key={item._id} className="flex justify-between text-sm">
                        <span className="truncate flex-1">{item.nombre}</span>
                        <span className="font-medium ml-2">
                          {item.cantidad} x ${item.precio.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="bg-primary text-white p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>TOTAL:</span>
                  <span>${calcularTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleDescargarPDF}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={handleEnviarEmail}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Email</span>
                </button>
                <button
                  onClick={handleResetear}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
