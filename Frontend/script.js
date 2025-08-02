// ============== SCRIPT COMPLETO =============
// Este script gestiona todas las funcionalidades del frontend,
// incluyendo la conexión a la API para obtener los datos de los productos.

document.addEventListener('DOMContentLoaded', function () {
  
  // ===== URLs de la API =====
  // IMPORTANTE: Debes actualizar estas URLs con la dirección de tu
  // nuevo servidor de backend una vez que lo hayas desplegado en Render.
  const API_URL = 'https://colchonespremium2.onrender.com/api/colchones';
  const CATEGORIAS_URL = 'https://colchonespremium2.onrender.com/api/categorias';
  // ===== Elementos del DOM =====
  const productosGrid = document.getElementById('productos-grid');
  const categoriaSelect = document.getElementById('categoria');
  const ordenSelect = document.getElementById('orden');
  const searchInput = document.getElementById('searchInput');
  const cartCount = document.querySelector('.cart-icon .cart-count');
  const btnVendedores = document.querySelector('.vendedores-link');
  const modalVendedores = document.getElementById('modalVendedores');
  const modalCarrito = document.getElementById('modalCarrito');
  const spanCerrar = document.querySelectorAll('.cerrar');
  const filtroCategoriaVendedor = document.getElementById('filtroCategoriaVendedor');
  const formPresupuesto = document.getElementById('formPresupuesto');
  const modalImagen = document.getElementById('modalImagen');
  const imagenAmpliada = document.getElementById('imagenAmpliada');
  const cerrarModalImagen = document.querySelector('.cerrar-modal');
  const modalNotificacion = document.getElementById('modalNotificacion');
  const notificacionMensaje = document.getElementById('notificacionMensaje');

// LINEAS CORREGIDAS PARA LA SECCIÓN DEL VENDEDOR:
  const productosVendedorGrid = document.getElementById('listaProductosVendedor');
  const listaPresupuestoVendedor = document.getElementById('detallePedido');
  const totalPresupuestoVendedor = document.getElementById('totalPedido');
// FIN DE LINEAS CORREGIDAS

  const nombreCliente = document.getElementById('nombreCliente');
  const emailCliente = document.getElementById('emailCliente');
  const localidadCliente = document.getElementById('localidadCliente');
  const btnEnviarPresupuesto = document.getElementById('enviarPresupuesto');

// LINEAS CORREGIDAS PARA LA SECCIÓN DE LOCALIDADES:
  const provinciaSelect = document.getElementById('provinciaCliente');
  const localidadSelect = document.getElementById('localidadCliente');
// FIN DE LINEAS CORREGIDAS


  // ===== Datos de localidades por provincia (simulados) =====
  // En una implementación real, estos datos podrían venir de una API.
  const LOCALIDADES_POR_PROVINCIA = {
    "Neuquén": [
      "Neuquén", "Cutral Có", "Centenario", "Plottier", "Zapala",
      "San Martín de los Andes", "Villa La Angostura", "Junín de los Andes",
      "Senillosa", "Picún Leufú", "Aluminé", "Chos Malal"
    ],
    "Río Negro": [
      "San Carlos de Bariloche", "General Roca", "Cipolletti", "Viedma",
      "Villa Regina", "Allen", "Cinco Saltos", "San Antonio Oeste", "El Bolsón",
      "Catriel", "Choele Choel", "Cervantes", "Chichinales", "Chimpay",
      "Campo Grande", "General Fernández Oro", "Ingeniero Luis A. Huergo",
      "Las Grutas", "Río Colorado", "Jacobacci", "Maquinchao", "Valcheta",
      "Sierra Colorada", "Comallo"
    ],
    "Buenos Aires": [
      "La Plata", "Mar del Plata", "Bahía Blanca", "Tandil",
      "San Nicolás de los Arroyos", "Junín", "Pergamino", "Olavarría",
      "Campana", "Zárate", "Luján", "Mercedes", "San Pedro", "Arrecifes"
    ]
  };

  // ===== Datos locales =====
  let productos = [];
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  let carritoVendedor = [];
  let categorias = [];

  // ===== Funciones Principales de la Tienda (Cliente) =====

  // Carga los productos desde la API
  async function cargarProductos() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al cargar los productos');
      const allProducts = await response.json();
      
      // Filtrar los productos que se deben mostrar en la tienda
      productos = allProducts.filter(producto => producto.Mostrar === 'si' && producto.Imagen && producto.Imagen.length > 0);

      if (productos.length === 0) {
        productosGrid.innerHTML = `
          <div class="no-results">
            <i class="fas fa-box-open"></i>
            <h3>¡Ups! No hay productos disponibles.</h3>
            <p>Por favor, revisa más tarde.</p>
          </div>
        `;
      } else {
        aplicarFiltros();
      }

    } catch (error) {
      console.error('Error:', error);
      productosGrid.innerHTML = `
        <div class="no-results">
          <i class="fas fa-exclamation-circle"></i>
          <h3>Error de conexión.</h3>
          <p>No se pudieron cargar los productos. Por favor, revisa la conexión con el servidor.</p>
        </div>
      `;
    }
  }

  // Renderiza la tarjeta de un producto para la vista de cliente
  function renderizarProducto(producto) {
    return `
      <div class="producto-card">
        <div class="producto-imagen-container">
          <img src="${producto.Imagen}" alt="Imagen de ${producto.Nombre}" onerror="this.onerror=null; this.src='https://placehold.co/400x400/E5E7EB/4B5563?text=Sin+Imagen';" data-imagen-full="${producto.Imagen}">
        </div>
        <div class="producto-info">
          <h3 class="producto-nombre">${producto.Nombre}</h3>
          <p class="producto-precio">**$${producto.Precio.toLocaleString('es-AR')}**</p>
          <p class="producto-marca">${producto.Marca}</p>
          <button class="btn btn-primary btn-agregar-carrito" data-id="${producto.Nombre}">
            <i class="fas fa-cart-plus"></i> Agregar
          </button>
        </div>
      </div>
    `;
  }
  
  // Aplica los filtros de búsqueda y orden y renderiza los productos del cliente
  function aplicarFiltros() {
    let productosFiltrados = [...productos];

    // Filtrar por categoría
    if (categoriaSelect.value !== 'todos') {
      productosFiltrados = productosFiltrados.filter(p => p.Categoria.toLowerCase() === categoriaSelect.value);
    }

    // Filtrar por búsqueda
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
      productosFiltrados = productosFiltrados.filter(p =>
        p.Nombre.toLowerCase().includes(searchTerm) ||
        p.Marca.toLowerCase().includes(searchTerm)
      );
    }

    // Ordenar productos
    const orden = ordenSelect.value;
    if (orden === 'precio-asc') {
      productosFiltrados.sort((a, b) => a.Precio - b.Precio);
    } else if (orden === 'precio-desc') {
      productosFiltrados.sort((a, b) => b.Precio - a.Precio);
    }

    // Renderizar productos filtrados y ordenados
    if (productosFiltrados.length === 0) {
      productosGrid.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search-minus"></i>
          <h3>No se encontraron resultados.</h3>
          <p>Intenta con otra búsqueda o filtro.</p>
        </div>
      `;
    } else {
      productosGrid.innerHTML = productosFiltrados.map(renderizarProducto).join('');
    }
  }

  // Carga las categorías de productos desde la API
  async function cargarCategorias() {
    try {
      const response = await fetch(CATEGORIAS_URL);
      if (!response.ok) throw new Error('Error al cargar las categorías');
      const uniqueCategories = await response.json();
      
      categorias = uniqueCategories;
      
      // Renderiza las categorías en los select
      renderizarCategorias(categoriaSelect);
      renderizarCategorias(filtroCategoriaVendedor);

    } catch (error) {
      console.error('Error:', error);
      // Opcional: mostrar un mensaje de error en la UI
    }
  }

  // Renderiza las opciones de categorías en un select
  function renderizarCategorias(selectElement) {
    selectElement.innerHTML = '<option value="todos">Todas las categorías</option>';
    categorias.forEach(categoria => {
      const option = document.createElement('option');
      option.value = categoria.toLowerCase();
      option.textContent = categoria;
      selectElement.appendChild(option);
    });
  }


  // ===== Funciones del Carrito de Compras (Cliente) =====

  // Añade un producto al carrito
  function agregarAlCarrito(productoId) {
    const producto = productos.find(p => p.Nombre === productoId);
    if (producto) {
      const itemEnCarrito = carrito.find(item => item.id === productoId);
      if (itemEnCarrito) {
        itemEnCarrito.cantidad++;
      } else {
        carrito.push({
          id: producto.Nombre,
          nombre: producto.Nombre,
          precio: producto.Precio,
          cantidad: 1
        });
      }
      localStorage.setItem('carrito', JSON.stringify(carrito));
      actualizarContadorCarrito();
      mostrarNotificacion(`"${producto.Nombre}" agregado al carrito.`);
    }
  }

  // Actualiza el contador del carrito en el encabezado
  function actualizarContadorCarrito() {
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
  }

  // Muestra el modal del carrito con los productos actuales
  function mostrarCarrito() {
    const listaCarrito = document.getElementById('listaCarrito');
    const totalCarrito = document.getElementById('totalCarrito');
    const detalleCarrito = document.getElementById('detalleCarrito');
    
    listaCarrito.innerHTML = '';
    detalleCarrito.innerHTML = '';

    let total = 0;

    if (carrito.length === 0) {
      listaCarrito.innerHTML = '<p class="text-center">Tu carrito está vacío.</p>';
    } else {
      carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item-carrito');
        itemDiv.innerHTML = `
          <p class="item-nombre">${item.nombre}</p>
          <div class="item-acciones">
            <span class="item-precio">$${item.precio.toLocaleString('es-AR')}</span>
            <input type="number" class="cantidad-carrito" data-id="${item.id}" value="${item.cantidad}" min="1">
            <button class="btn-eliminar-item" data-id="${item.id}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        `;
        listaCarrito.appendChild(itemDiv);
      });
      
      // Actualiza los totales en el resumen del pedido
      detalleCarrito.innerHTML = carrito.map(item => `
        <p class="detalle-item">${item.nombre} x${item.cantidad} - **$${(item.precio * item.cantidad).toLocaleString('es-AR')}**</p>
      `).join('');
      
    }
    
    totalCarrito.textContent = total.toLocaleString('es-AR');
    modalCarrito.style.display = 'block';
    
    // Listener para los cambios de cantidad en el carrito
    document.querySelectorAll('.cantidad-carrito').forEach(input => {
      input.addEventListener('change', (e) => {
        const itemId = e.target.dataset.id;
        const nuevaCantidad = parseInt(e.target.value, 10);
        const item = carrito.find(i => i.id === itemId);
        if (item && nuevaCantidad > 0) {
          item.cantidad = nuevaCantidad;
        } else if (item && nuevaCantidad === 0) {
          carrito = carrito.filter(i => i.id !== itemId);
        }
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarContadorCarrito();
        mostrarCarrito(); // Vuelve a renderizar el carrito para actualizar los totales
      });
    });
    
    // Listener para los botones de eliminar del carrito
    document.querySelectorAll('.btn-eliminar-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.currentTarget.dataset.id;
        carrito = carrito.filter(item => item.id !== itemId);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarContadorCarrito();
        mostrarCarrito(); // Vuelve a renderizar el carrito para actualizar los totales
      });
    });
  }
  
  // Vacía todo el carrito
  function vaciarCarrito() {
    carrito = [];
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    mostrarCarrito();
    mostrarNotificacion('El carrito ha sido vaciado.');
  }
  
  // Simula una compra y vacía el carrito
  function realizarCompra() {
    if (carrito.length === 0) {
      mostrarNotificacion('El carrito está vacío. Agrega productos para comprar.');
      return;
    }
    // Aquí iría la lógica real de pago
    mostrarNotificacion('¡Compra realizada con éxito! En breve recibirás los detalles de tu pedido.');
    vaciarCarrito();
    modalCarrito.style.display = 'none';
  }


  // ===== Funciones para Vendedores (Presupuestos) =====

  // Carga todos los productos en la vista de vendedor
  function cargarProductosParaVendedor() {
    let productosFiltrados = [...productos];
    if (filtroCategoriaVendedor.value !== 'todos') {
      productosFiltrados = productosFiltrados.filter(p => p.Categoria.toLowerCase() === filtroCategoriaVendedor.value);
    }
    
    if (productosFiltrados.length === 0) {
      productosVendedorGrid.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search-minus"></i>
          <h3>No se encontraron productos en esta categoría.</h3>
        </div>
      `;
    } else {
      productosVendedorGrid.innerHTML = productosFiltrados.map(p => {
        const itemEnCarrito = carritoVendedor.find(item => item.id === p.Nombre);
        const cantidad = itemEnCarrito ? itemEnCarrito.cantidad : 0;
        return `
          <div class="producto-vendedor-card" data-id="${p.Nombre}">
            <img src="${p.Imagen}" alt="${p.Nombre}" onerror="this.onerror=null; this.src='https://placehold.co/100x100?text=Sin+Imagen';" class="producto-vendedor-imagen">
            <div class="producto-vendedor-info">
              <span class="producto-vendedor-nombre">${p.Nombre}</span>
              <span class="producto-vendedor-precio">$${p.Precio.toLocaleString('es-AR')}</span>
              <input type="number" min="0" value="${cantidad}" class="cantidad-vendedor">
            </div>
          </div>
        `;
      }).join('');
    }

    // Listener para los campos de cantidad
    document.querySelectorAll('.cantidad-vendedor').forEach(input => {
      input.addEventListener('change', (e) => {
        const card = e.target.closest('.producto-vendedor-card');
        const productoId = card.dataset.id;
        const nuevaCantidad = parseInt(e.target.value, 10);
        
        const producto = productos.find(p => p.Nombre === productoId);
        const itemEnCarrito = carritoVendedor.find(item => item.id === productoId);

        if (itemEnCarrito) {
          if (nuevaCantidad > 0) {
            itemEnCarrito.cantidad = nuevaCantidad;
          } else {
            carritoVendedor = carritoVendedor.filter(i => i.id !== productoId);
          }
        } else if (nuevaCantidad > 0) {
          carritoVendedor.push({
            id: producto.Nombre,
            nombre: producto.Nombre,
            precio: producto.Precio,
            cantidad: nuevaCantidad
          });
        }
        actualizarResumenPedido();
      });
    });
  }

  // Actualiza el resumen del presupuesto en el modal de vendedor
  function actualizarResumenPedido() {
    listaPresupuestoVendedor.innerHTML = '';
    let total = 0;
    
    if (carritoVendedor.length === 0) {
      listaPresupuestoVendedor.innerHTML = '<p class="text-center">No hay productos en el presupuesto.</p>';
    } else {
      carritoVendedor.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        const li = document.createElement('li');
        li.innerHTML = `${item.nombre} x${item.cantidad} - **$${subtotal.toLocaleString('es-AR')}**`;
        listaPresupuestoVendedor.appendChild(li);
      });
    }
    totalPresupuestoVendedor.textContent = total.toLocaleString('es-AR');
  }

  // Genera y descarga un PDF del presupuesto
  function generarPDF() {
    if (carritoVendedor.length === 0) {
      mostrarNotificacion('No hay productos para generar un presupuesto.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const fecha = new Date().toLocaleDateString('es-AR');
    const cliente = nombreCliente.value || 'Cliente sin nombre';
    const email = emailCliente.value || 'sin-email@ejemplo.com';
    const localidad = localidadCliente.value || 'Sin especificar';
    const total = carritoVendedor.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    
    let y = 20;

    doc.setFontSize(18);
    doc.text("Presupuesto - Colchones Premium", 10, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Fecha: ${fecha}`, 10, y);
    y += 7;
    doc.text(`Cliente: ${cliente}`, 10, y);
    y += 7;
    doc.text(`Email: ${email}`, 10, y);
    y += 7;
    doc.text(`Localidad: ${localidad}`, 10, y);
    y += 15;
    
    doc.setFontSize(14);
    doc.text("Detalle del Presupuesto:", 10, y);
    y += 10;
    
    doc.setFontSize(12);
    carritoVendedor.forEach(item => {
      const subtotal = item.precio * item.cantidad;
      doc.text(`${item.nombre} x${item.cantidad} - $${subtotal.toLocaleString('es-AR')}`, 15, y);
      y += 7;
    });

    y += 10;
    doc.setFontSize(16);
    doc.text(`Total: $${total.toLocaleString('es-AR')}`, 10, y);
    
    doc.save(`Presupuesto_${cliente.replace(/\s/g, '_')}.pdf`);
    mostrarNotificacion('Presupuesto PDF generado y descargado.');
  }
  
  // Envía el presupuesto por correo (simulado)
  function enviarPresupuesto() {
    if (carritoVendedor.length === 0) {
      mostrarNotificacion('No hay productos para enviar un presupuesto.');
      return;
    }
    
    const cliente = nombreCliente.value;
    const email = emailCliente.value;
    
    if (!cliente || !email) {
      mostrarNotificacion('Por favor, completa el nombre y email del cliente.');
      return;
    }

    // Aquí iría la lógica para enviar el correo electrónico
    // Por ahora, solo mostramos una notificación
    mostrarNotificacion(`Presupuesto enviado por correo a ${email} para ${cliente}.`);
    
    // Opcionalmente, resetear el presupuesto después de enviar
    // resetearPresupuesto();
  }


  // ===== Carga de Localidades y Provincias =====
  // Carga las provincias y sus localidades en los select
  function cargarLocalidades() {
    const provincias = Object.keys(LOCALIDADES_POR_PROVINCIA);
    provinciaSelect.innerHTML = '<option value="">Selecciona una Provincia</option>';
    localidadSelect.innerHTML = '<option value="">Selecciona una Localidad</option>';
    
    provincias.forEach(provincia => {
      const option = document.createElement('option');
      option.value = provincia;
      option.textContent = provincia;
      provinciaSelect.appendChild(option);
    });
    
    provinciaSelect.addEventListener('change', () => {
      const provinciaSeleccionada = provinciaSelect.value;
      localidadSelect.innerHTML = '<option value="">Selecciona una Localidad</option>';
      if (provinciaSeleccionada) {
        const localidades = LOCALIDADES_POR_PROVINCIA[provinciaSeleccionada];
        localidades.forEach(localidad => {
          const option = document.createElement('option');
          option.value = localidad;
          option.textContent = localidad;
          localidadSelect.appendChild(option);
        });
      }
    });
  }

  // ===== Modales y Notificaciones =====
  
  // Muestra una notificación temporal
  function mostrarNotificacion(mensaje) {
    notificacionMensaje.textContent = mensaje;
    modalNotificacion.style.display = 'flex';
    setTimeout(() => {
      modalNotificacion.style.display = 'none';
    }, 3000); // La notificación desaparece después de 3 segundos
  }

  // Muestra una imagen ampliada en un modal
  function mostrarImagenAmpliada(src) {
    imagenAmpliada.src = src;
    modalImagen.style.display = 'block';
  }


  // ===== Event Listeners =====
  
  // Evento para agregar productos al carrito de cliente
  productosGrid.addEventListener('click', e => {
    if (e.target.classList.contains('btn-agregar-carrito')) {
      const productoId = e.target.dataset.id;
      agregarAlCarrito(productoId);
    }
  });

  // Evento para abrir el modal del carrito
  document.querySelector('.cart-icon').closest('a').addEventListener('click', e => {
    e.preventDefault();
    mostrarCarrito();
  });

  // Evento para abrir el modal del vendedor
  btnVendedores.addEventListener('click', e => {
    e.preventDefault();
    cargarProductosParaVendedor();
    actualizarResumenPedido();
    modalVendedores.style.display = 'block';
  });

  // Evento para cerrar los modales
  spanCerrar.forEach(b => b.addEventListener('click', function(){
    this.closest('.modal').style.display = 'none';
  }));

  // Evento para el botón de "Vaciar Carrito"
  document.getElementById('vaciarCarrito').addEventListener('click', vaciarCarrito);

  // Evento para el botón de "Comprar Ahora"
  document.getElementById('comprarAhora').addEventListener('click', realizarCompra);
  
  // Evento para los filtros de búsqueda y orden del cliente
  categoriaSelect.addEventListener('change', aplicarFiltros);
  ordenSelect.addEventListener('change', aplicarFiltros);
  searchInput.addEventListener('input', aplicarFiltros);

  // Evento para abrir el modal de imagen al hacer clic en una foto
  productosGrid.addEventListener('click', e => {
    const imagen = e.target.closest('.producto-imagen-container img');
    if (imagen) {
      mostrarImagenAmpliada(imagen.dataset.imagenFull);
    }
  });

  // Evento para cerrar el modal de imagen
  cerrarModalImagen.addEventListener('click', () => {
    modalImagen.style.display = 'none';
  });
  
  // Cerrar el modal de imagen haciendo clic fuera del contenido
  window.addEventListener('click', (e) => {
    if (e.target === modalImagen) {
      modalImagen.style.display = 'none';
    }
  });
  
  // Eventos para el modal de vendedor
  filtroCategoriaVendedor.addEventListener('change', cargarProductosParaVendedor);
  btnDescargarPresupuesto.addEventListener('click', generarPDF);
  btnEnviarPresupuesto.addEventListener('click', enviarPresupuesto);
  btnResetearPresupuesto.addEventListener('click', function(){
    carritoVendedor = [];
    nombreCliente.value = '';
    emailCliente.value = '';
    localidadCliente.value = '';
    document.querySelectorAll('.cantidad-vendedor').forEach(i=>i.value=0);
    actualizarResumenPedido();
    mostrarNotificacion('Presupuesto reseteado');
  });


  // ================= INICIALIZACIÓN FINAL =================
  cargarCategorias();
  cargarProductos();
  cargarLocalidades();
  actualizarContadorCarrito();
});
// ============== FIN SCRIPT =============