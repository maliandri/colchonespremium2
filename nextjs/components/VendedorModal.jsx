'use client';

import { useState } from 'react';
import { X, FileDown, Send, Trash2, Lock, Percent } from 'lucide-react';
import { CloudinaryImage } from './CloudinaryImage';
import jsPDF from 'jspdf';
import { enviarPresupuesto } from '@/services/api';

export const VendedorModal = ({ isOpen, onClose, productos, categorias }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [carritoVendedor, setCarritoVendedor] = useState({});
  const [vendedor, setVendedor] = useState({ nombre: '' });
  const [cliente, setCliente] = useState({
    nombre: '',
    telefono: '',
    provincia: 'Neuquen',
    localidad: '',
    direccion: '',
    email: ''
  });

  const provincias = [
    'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Cordoba',
    'Corrientes', 'Entre Rios', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
    'Mendoza', 'Misiones', 'Neuquen', 'Rio Negro', 'Salta', 'San Juan',
    'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
    'Tierra del Fuego', 'Tucuman'
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_VENDEDOR_PASSWORD) {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      alert('Contrasena incorrecta');
      setPassword('');
    }
  };

  const productosFiltrados = selectedCategory
    ? productos.filter(p => p.categoria === selectedCategory)
    : productos;

  const calcularTotal = () => {
    return Object.values(carritoVendedor).reduce(
      (total, item) => {
        const descuento = item.descuento || 0;
        const precioConDescuento = item.precio * (1 - descuento / 100);
        return total + (precioConDescuento * item.cantidad);
      },
      0
    );
  };

  const calcularTotalSinDescuento = () => {
    return Object.values(carritoVendedor).reduce(
      (total, item) => total + (item.precio * item.cantidad),
      0
    );
  };

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
          cantidad: cant,
          descuento: carritoVendedor[producto._id]?.descuento || 0
        }
      });
    }
  };

  const handleDescuentoChange = (productoId, descuento) => {
    const desc = parseFloat(descuento) || 0;
    const descuentoFinal = Math.min(Math.max(desc, 0), 15);
    if (carritoVendedor[productoId]) {
      setCarritoVendedor({
        ...carritoVendedor,
        [productoId]: {
          ...carritoVendedor[productoId],
          descuento: descuentoFinal
        }
      });
    }
  };

  const handleResetear = () => {
    if (confirm('Estas seguro de que deseas resetear el presupuesto?')) {
      setCarritoVendedor({});
      setVendedor({ nombre: '' });
      setCliente({ nombre: '', telefono: '', provincia: 'Neuquen', localidad: '', direccion: '', email: '' });
    }
  };

  const handleDescargarPDF = () => {
    const doc = new jsPDF();
    const items = Object.values(carritoVendedor);
    if (items.length === 0) { alert('No hay productos en el presupuesto'); return; }

    doc.setFontSize(20);
    doc.text('Presupuesto - Alumine Hogar', 20, 20);
    doc.setFontSize(12);
    doc.text(`Vendedor: ${vendedor.nombre || 'N/A'}`, 20, 35);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 42);
    doc.setFontSize(14);
    doc.text('Datos del Cliente:', 20, 55);
    doc.setFontSize(11);
    doc.text(`Nombre: ${cliente.nombre || 'N/A'}`, 20, 63);
    doc.text(`Telefono: ${cliente.telefono || 'N/A'}`, 20, 70);
    doc.text(`Email: ${cliente.email || 'N/A'}`, 20, 77);
    doc.text(`Direccion: ${cliente.direccion || 'N/A'}`, 20, 84);
    doc.text(`${cliente.localidad || 'N/A'}, ${cliente.provincia}`, 20, 91);
    doc.setFontSize(14);
    doc.text('Productos:', 20, 105);

    let y = 115;
    doc.setFontSize(10);
    items.forEach((item, index) => {
      const descuento = item.descuento || 0;
      const precioConDescuento = item.precio * (1 - descuento / 100);
      const subtotal = precioConDescuento * item.cantidad;
      doc.text(`${index + 1}. ${item.nombre}`, 20, y);
      if (descuento > 0) {
        doc.text(`${item.cantidad} x $${item.precio.toFixed(2)} (${descuento}% OFF) = $${subtotal.toFixed(2)}`, 20, y + 7);
      } else {
        doc.text(`${item.cantidad} x $${item.precio.toFixed(2)} = $${subtotal.toFixed(2)}`, 20, y + 7);
      }
      y += 15;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    const totalSinDescuento = calcularTotalSinDescuento();
    const totalConDescuento = calcularTotal();
    const ahorroTotal = totalSinDescuento - totalConDescuento;
    y += 10;
    doc.setFontSize(12);
    if (ahorroTotal > 0) {
      doc.text(`Subtotal: $${totalSinDescuento.toFixed(2)}`, 20, y);
      doc.setTextColor(220, 38, 38);
      doc.text(`Descuento: -$${ahorroTotal.toFixed(2)}`, 20, y + 7);
      doc.setTextColor(0, 0, 0);
      y += 14;
    }
    doc.setFontSize(14);
    doc.text(`TOTAL: $${totalConDescuento.toFixed(2)}`, 20, y);
    doc.save(`presupuesto-${Date.now()}.pdf`);
  };

  const handleEnviarEmail = async () => {
    const items = Object.values(carritoVendedor);
    if (items.length === 0) { alert('No hay productos en el presupuesto'); return; }
    if (!cliente.email) { alert('Por favor ingresa el email del cliente'); return; }

    try {
      const productosFormateados = items.map(item => {
        const descuento = item.descuento || 0;
        const precioConDescuento = item.precio * (1 - descuento / 100);
        return {
          nombre: item.nombre,
          cantidad: item.cantidad,
          precioUnitario: item.precio,
          descuento,
          precioConDescuento,
          subtotal: precioConDescuento * item.cantidad
        };
      });

      await enviarPresupuesto({
        cliente: {
          nombre: cliente.nombre, email: cliente.email, telefono: cliente.telefono,
          direccion: cliente.direccion, localidad: cliente.localidad, provincia: cliente.provincia
        },
        vendedor: { nombre: vendedor.nombre },
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

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Acceso Vendedores</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Contrasena
              </label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-field" placeholder="Ingrese la contrasena" required autoFocus />
            </div>
            <button type="submit" className="w-full btn-primary">Ingresar</button>
          </form>
          <p className="text-xs text-gray-500 text-center mt-4">Solo personal autorizado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-primary text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Panel de Vendedores</h2>
          <button onClick={onClose} className="text-white hover:bg-red-700 rounded-full p-2 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Productos</h3>
              <div className="mb-4">
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input-field">
                  <option value="">Todas las categorias</option>
                  {categorias.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {productosFiltrados.map(producto => (
                  <div key={producto._id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <div className="w-16 h-16 flex-shrink-0">
                      <CloudinaryImage product={producto} size="thumb" className="w-full h-full rounded object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{producto.nombre}</h4>
                      <p className="text-primary font-bold">${producto.precio.toLocaleString('es-AR')}</p>
                      <p className="text-xs text-gray-600">{producto.categoria}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <input type="number" min="0" value={carritoVendedor[producto._id]?.cantidad || 0}
                        onChange={(e) => handleCantidadChange(producto, e.target.value)}
                        className="w-20 px-2 py-1 border rounded text-center" placeholder="Cant." />
                      {carritoVendedor[producto._id] && (
                        <div className="flex items-center">
                          <Percent className="w-3 h-3 text-gray-400 mr-1" />
                          <input type="number" min="0" max="15" step="0.5"
                            value={carritoVendedor[producto._id]?.descuento || 0}
                            onChange={(e) => handleDescuentoChange(producto._id, e.target.value)}
                            className="w-16 px-1 py-1 border rounded text-center text-xs" placeholder="0" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Resumen del Pedido</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nombre del Vendedor</label>
                <input type="text" value={vendedor.nombre} onChange={(e) => setVendedor({ nombre: e.target.value })}
                  className="input-field" placeholder="Tu nombre" />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-3">Datos del Cliente</h4>
                <div className="space-y-3">
                  <input type="text" value={cliente.nombre} onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                    className="input-field" placeholder="Nombre completo" />
                  <input type="tel" value={cliente.telefono} onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                    className="input-field" placeholder="Telefono" />
                  <input type="email" value={cliente.email} onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                    className="input-field" placeholder="Email" />
                  <select value={cliente.provincia} onChange={(e) => setCliente({ ...cliente, provincia: e.target.value })} className="input-field">
                    {provincias.map(prov => (<option key={prov} value={prov}>{prov}</option>))}
                  </select>
                  <input type="text" value={cliente.localidad} onChange={(e) => setCliente({ ...cliente, localidad: e.target.value })}
                    className="input-field" placeholder="Localidad" />
                  <input type="text" value={cliente.direccion} onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
                    className="input-field" placeholder="Direccion" />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-3">Productos Seleccionados</h4>
                {Object.keys(carritoVendedor).length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay productos seleccionados</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Object.values(carritoVendedor).map(item => {
                      const descuento = item.descuento || 0;
                      const precioConDescuento = item.precio * (1 - descuento / 100);
                      const subtotal = precioConDescuento * item.cantidad;
                      return (
                        <div key={item._id} className="text-sm">
                          <div className="flex justify-between">
                            <span className="truncate flex-1">{item.nombre}</span>
                            <span className="font-medium ml-2">{item.cantidad} x ${item.precio.toLocaleString('es-AR')}</span>
                          </div>
                          {descuento > 0 && (
                            <div className="flex justify-between text-red-600 text-xs">
                              <span>Descuento {descuento}%</span>
                              <span>-${(item.precio * item.cantidad * descuento / 100).toLocaleString('es-AR')}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-semibold">
                            <span>Subtotal:</span>
                            <span>${subtotal.toLocaleString('es-AR')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-primary text-white p-4 rounded-lg mb-4">
                {calcularTotalSinDescuento() !== calcularTotal() && (
                  <>
                    <div className="flex justify-between items-center text-sm mb-2 opacity-75">
                      <span>Subtotal:</span>
                      <span>${calcularTotalSinDescuento().toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-2 text-yellow-300">
                      <span>Ahorro:</span>
                      <span>-${(calcularTotalSinDescuento() - calcularTotal()).toLocaleString('es-AR')}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center text-xl font-bold border-t border-white/20 pt-2">
                  <span>TOTAL:</span>
                  <span>${calcularTotal().toLocaleString('es-AR')}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={handleDescargarPDF} className="btn-primary flex items-center justify-center gap-2">
                  <FileDown className="w-4 h-4" /><span>PDF</span>
                </button>
                <button onClick={handleEnviarEmail} className="btn-secondary flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /><span>Email</span>
                </button>
                <button onClick={handleResetear} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" /><span>Reset</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
