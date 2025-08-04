// ============== SCRIPT COMPLETO CORREGIDO ==============
// Este script gestiona todas las funcionalidades del frontend,
// incluyendo la conexión a la API para obtener los datos de los productos.

document.addEventListener('DOMContentLoaded', function () {
  
  // ===== URLs de la API =====
  const API_URL = 'https://colchonespremium2.onrender.com/api/colchones';
  const CATEGORIAS_URL = 'https://colchonespremium2.onrender.com/api/categorias';
  const AUTH_URL = 'https://colchonespremium2.onrender.com/api/auth';
  const VENTAS_URL = 'https://colchonespremium2.onrender.com/api/ventas';
  const EMAIL_URL = 'https://colchonespremium2.onrender.com/api/presupuesto/enviar';
  
  // ===== Elementos del DOM =====
  const productosGrid = document.getElementById('productos-grid');
  const categoriaSelect = document.getElementById('categoria');
  const ordenSelect = document.getElementById('orden');
  const searchInput = document.getElementById('searchInput');
  const cartCount = document.querySelector('.cart-count');
  
  // Elementos de Modales
  const btnVendedores = document.getElementById('accesoVendedores');
  const modalVendedores = document.getElementById('modalVendedores');
  const modalCarrito = document.getElementById('modalCarrito');
  const modalImagen = document.getElementById('modalImagen');
  const modalRegistro = document.getElementById('modalRegistro');
  const btnRegistro = document.getElementById('registro-link');
  const formRegistro = document.getElementById('formRegistro');
  
  // Elementos del modal de vendedores
  const filtroCategoriaVendedor = document.getElementById('filtroCategoriaVendedor');
  const btnDescargarPresupuesto = document.getElementById('descargarPresupuesto');
  const btnEnviarPresupuesto = document.getElementById('enviarPresupuesto');
  const btnResetearPresupuesto = document.getElementById('resetearPresupuesto');
  const listaProductosVendedor = document.getElementById('listaProductosVendedor');
  const totalPedidoSpan = document.getElementById('totalPedido');
  const nombreVendedorInput = document.getElementById('nombreVendedor');
  const nombreClienteInput = document.getElementById('nombreCliente');
  const telefonoClienteInput = document.getElementById('telefonoCliente');
  const provinciaClienteSelect = document.getElementById('provinciaCliente');
  const localidadClienteSelect = document.getElementById('localidadCliente');
  const direccionClienteInput = document.getElementById('direccionCliente');
  const emailClienteInput = document.getElementById('emailCliente');

  // Elementos del modal de carrito
  const listaCarrito = document.getElementById('listaCarrito');
  const totalCarritoSpan = document.getElementById('totalCarrito');
  const btnVaciarCarrito = document.getElementById('vaciarCarrito');
  const btnComprarAhora = document.getElementById('comprarAhora');
  
  // Elementos del modal de imagen
  const imagenAmpliada = document.getElementById('imagenAmpliada');
  const cerrarModalImagen = document.querySelector('.cerrar-modal');

  // Elementos de notificación
  const modalNotificacion = document.getElementById('modalNotificacion');
  const notificacionMensaje = document.getElementById('notificacionMensaje');

  // ===== Variables de estado =====
  let productos = [];
  let categorias = [];
  let carrito = {};
  let carritoVendedor = [];
  
  // ===== VARIABLES Y FUNCIONES DE AUTENTICACIÓN (CORREGIDAS) =====
  let usuario = null;
  let token = localStorage.getItem('authToken');
  
  // ===== CREAR MODAL DE LOGIN/REGISTRO DINÁMICAMENTE =====
  function crearModalAuth() {
    // Verificar si ya existe
    let modalAuth = document.getElementById('modalAuth');
    if (modalAuth) {
      modalAuth.remove();
    }
    
    modalAuth = document.createElement('div');
    modalAuth.id = 'modalAuth';
    modalAuth.className = 'modal';
    modalAuth.innerHTML = `
      <div class="modal-content">
        <span class="cerrar" onclick="cerrarModalAuth()">&times;</span>
        
        <!-- Pestañas de Login y Registro -->
        <div class="auth-tabs">
          <button class="tab-btn active" onclick="mostrarTab('login')">Iniciar Sesión</button>
          <button class="tab-btn" onclick="mostrarTab('registro')">Registrarse</button>
        </div>
        
        <!-- Formulario de Login -->
        <div id="tab-login" class="tab-content active">
          <h2>Iniciar Sesión</h2>
          <form id="formLogin">
            <div class="form-group">
              <label for="loginEmail">Email:</label>
              <input type="email" id="loginEmail" required>
            </div>
            <div class="form-group">
              <label for="loginPassword">Contraseña:</label>
              <input type="password" id="loginPassword" required>
            </div>
            <button type="submit" class="btn btn-primary">Iniciar Sesión</button>
          </form>
        </div>
        
        <!-- Formulario de Registro -->
        <div id="tab-registro" class="tab-content">
          <h2>Crear Cuenta</h2>
          <form id="formRegistroNuevo">
            <div class="form-group">
              <label for="regEmail">Email:</label>
              <input type="email" id="regEmail" required>
            </div>
            <div class="form-group">
              <label for="regPassword">Contraseña:</label>
              <input type="password" id="regPassword" required>
            </div>
            <div class="form-group">
              <label for="regPasswordConfirm">Confirmar Contraseña:</label>
              <input type="password" id="regPasswordConfirm" required>
            </div>
            <button type="submit" class="btn btn-primary">Registrarse</button>
          </form>
        </div>
      </div>
    `;
    
    document.body.appendChild(modalAuth);
    
    // Agregar event listeners
    document.getElementById('formLogin').addEventListener('submit', manejarLogin);
    document.getElementById('formRegistroNuevo').addEventListener('submit', manejarRegistro);
  }
  
  // Función para mostrar tabs
  window.mostrarTab = function(tabName) {
    // Remover clase active de todos los tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Activar tab seleccionado
    event.target.classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
  };
  
  // Función para cerrar modal de auth
  window.cerrarModalAuth = function() {
    const modal = document.getElementById('modalAuth');
    if (modal) {
      modal.style.display = 'none';
    }
  };
  
  // Verificar si hay una sesión activa al cargar
  function verificarSesion() {
    const tokenGuardado = localStorage.getItem('authToken');
    const emailGuardado = localStorage.getItem('userEmail');
    
    if (tokenGuardado && emailGuardado) {
      try {
        const payload = JSON.parse(atob(tokenGuardado.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          token = tokenGuardado;
          usuario = { email: emailGuardado, id: payload.id };
          actualizarUIAutenticacion();
          cargarCarritoUsuario();
          return true;
        } else {
          cerrarSesion();
        }
      } catch (error) {
        console.error('Token inválido:', error);
        cerrarSesion();
      }
    }
    return false;
  }

  // Manejar Login
  async function manejarLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
      const response = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        token = data.token;
        localStorage.setItem('authToken', token);
        localStorage.setItem('userEmail', email);
        
        const payload = JSON.parse(atob(token.split('.')[1]));
        usuario = { email, id: payload.id };
        
        actualizarUIAutenticacion();
        cargarCarritoUsuario();
        mostrarNotificacion('Sesión iniciada correctamente', 'success');
        cerrarModalAuth();
        document.getElementById('formLogin').reset();
        
      } else {
        throw new Error(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      mostrarNotificacion(error.message, 'error');
    }
  }

  // Manejar Registro
  async function manejarRegistro(e) {
    e.preventDefault();
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;
    
    // Validar que las contraseñas coincidan
    if (password !== passwordConfirm) {
      mostrarNotificacion('Las contraseñas no coinciden', 'error');
      return;
    }
    
    try {
      const response = await fetch(`${AUTH_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        mostrarNotificacion('¡Registro exitoso! Por favor inicia sesión.', 'success');
        document.getElementById('formRegistroNuevo').reset();
        // Cambiar automáticamente al tab de login
        mostrarTab('login');
      } else {
        throw new Error(data.error || 'Error al registrarse');
      }
    } catch (error) {
      mostrarNotificacion(error.message, 'error');
    }
  }

  // Cerrar sesión
  function cerrarSesion() {
    token = null;
    usuario = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    
    const carritoActual = carrito;
    localStorage.setItem('carrito', JSON.stringify(carritoActual));
    
    actualizarUIAutenticacion();
    mostrarNotificacion('Sesión cerrada correctamente', 'success');
  }

  // Actualizar UI según estado de autenticación
  function actualizarUIAutenticacion() {
    const registroLink = document.getElementById('registro-link');
    
    if (usuario && token) {
      // Usuario logueado
      if (registroLink) {
        registroLink.innerHTML = `
          <div class="user-menu">
            <i class="fas fa-user"></i> ${usuario.email.split('@')[0]} 
            <span class="user-logout" onclick="cerrarSesion()">| Cerrar Sesión</span>
          </div>
        `;
        registroLink.onclick = (e) => e.preventDefault();
      }
    } else {
      // Usuario no logueado
      if (registroLink) {
        registroLink.innerHTML = '<i class="fas fa-user"></i> Cuenta';
        registroLink.onclick = (e) => {
          e.preventDefault();
          crearModalAuth();
          document.getElementById('modalAuth').style.display = 'flex';
        };
      }
    }
  }

  // Cargar carrito del usuario
  function cargarCarritoUsuario() {
    if (usuario && token) {
      const carritoUsuario = localStorage.getItem(`carrito_${usuario.id}`);
      if (carritoUsuario) {
        carrito = JSON.parse(carritoUsuario);
      }
    } else {
      const carritoGeneral = localStorage.getItem('carrito');
      if (carritoGeneral) {
        carrito = JSON.parse(carritoGeneral);
      }
    }
    actualizarContadorCarrito();
  }

  // Guardar carrito
  function guardarCarrito() {
    if (usuario && token) {
      localStorage.setItem(`carrito_${usuario.id}`, JSON.stringify(carrito));
    } else {
      localStorage.setItem('carrito', JSON.stringify(carrito));
    }
  }

  // Guardar carrito en el servidor (para usuarios logueados)
  async function guardarCarritoEnServidor() {
    if (!usuario || !token) {
      mostrarNotificacion('Debes iniciar sesión para guardar el carrito', 'warning');
      return;
    }

    try {
      const productos = Object.values(carrito).map(item => ({
        nombre: item.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precio
      }));

      const total = Object.values(carrito).reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

      const response = await fetch(VENTAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
        body: JSON.stringify({
          productos,
          total,
          estado: 'presupuesto'
        })
      });

      const data = await response.json();

      if (response.ok) {
        mostrarNotificacion('Carrito guardado en tu cuenta', 'success');
      } else {
        throw new Error(data.error || 'Error al guardar el carrito');
      }
    } catch (error) {
      mostrarNotificacion(error.message, 'error');
    }
  }

  // ===== RESTO DE FUNCIONES ORIGINALES (SIN CAMBIOS) =====
  
  // Cargar productos desde la API
  async function cargarProductos() {
    try {
      console.log('Cargando productos desde:', API_URL);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      productos = await response.json();
      console.log(`✅ ${productos.length} productos cargados`);
      
      mostrarProductos(productos);
      await cargarCategorias();
      cargarProductosParaVendedor();
      actualizarContadorCarrito();
    } catch (error) {
      console.error('Error:', error);
      mostrarNotificacion('Error al cargar los productos: ' + error.message, 'error');
      
      if (productosGrid) {
        productosGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <h3>Error al cargar productos</h3>
            <p>No se pudieron cargar los productos desde el servidor.</p>
            <button class="btn" onclick="cargarProductos()" style="margin-top: 1rem;">
              <i class="fas fa-refresh"></i> Reintentar
            </button>
          </div>
        `;
      }
    }
  }

  // Mostrar productos en la cuadrícula
  function mostrarProductos(productosAMostrar) {
    if (!productosGrid) return;
    
    productosGrid.innerHTML = '';
    if (productosAMostrar.length === 0) {
      productosGrid.innerHTML = '<p>No se encontraron productos con esos criterios.</p>';
      return;
    }
    productosAMostrar.forEach(producto => {
      const card = document.createElement('div');
      card.className = 'producto-card';
      card.innerHTML = `
        <div class="producto-imagen-container">
          <img src="${producto.imagen}" alt="${producto.nombre}" 
               data-imagen-full="${producto.imagen}"
               onerror="this.src='assets/placeholder.jpg'">
        </div>
        <div class="producto-info">
          <h3>${producto.nombre}</h3>
          <p>${producto.descripcion}</p>
          <p class="categoria-tag" style="color: #666; font-size: 0.85em; margin: 0.5rem 0;">
            <i class="fas fa-tag"></i> ${producto.categoria}
          </p>
          <p class="precio">$${parseFloat(producto.precio).toFixed(2)}</p>
          <button class="agregar-carrito" data-id="${producto._id}">
            <i class="fas fa-shopping-cart"></i> Agregar al Carrito
          </button>
        </div>
      `;
      productosGrid.appendChild(card);
    });
  }

  // Cargar categorías dinámicamente desde el backend
  async function cargarCategorias() {
    try {
      console.log('Cargando categorías desde:', CATEGORIAS_URL);
      const response = await fetch(CATEGORIAS_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      categorias = await response.json();
      console.log(`✅ ${categorias.length} categorías cargadas:`, categorias);
      
      categoriaSelect.innerHTML = '<option value="">Todas las categorías</option>';
      if (filtroCategoriaVendedor) {
        filtroCategoriaVendedor.innerHTML = '<option value="">Todas las categorías</option>';
      }
      
      categorias.forEach(categoria => {
        const option1 = document.createElement('option');
        option1.value = categoria;
        option1.textContent = categoria;
        categoriaSelect.appendChild(option1);
        
        if (filtroCategoriaVendedor) {
          const option2 = document.createElement('option');
          option2.value = categoria;
          option2.textContent = categoria;
          filtroCategoriaVendedor.appendChild(option2);
        }
      });
      
      cargarCategoriasEnFooter();
      
      console.log('✅ Categorías cargadas correctamente desde el backend');
      
    } catch (error) {
      console.error('❌ Error al cargar categorías:', error);
      
      if (productos && productos.length > 0) {
        categorias = [...new Set(productos.map(p => p.categoria))];
        console.log('Usando categorías extraídas de productos:', categorias);
        
        categoriaSelect.innerHTML = '<option value="">Todas las categorías</option>';
        if (filtroCategoriaVendedor) {
          filtroCategoriaVendedor.innerHTML = '<option value="">Todas las categorías</option>';
        }
        
        categorias.forEach(categoria => {
          const option1 = document.createElement('option');
          option1.value = categoria;
          option1.textContent = categoria;
          categoriaSelect.appendChild(option1);
          
          if (filtroCategoriaVendedor) {
            const option2 = document.createElement('option');
            option2.value = categoria;
            option2.textContent = categoria;
            filtroCategoriaVendedor.appendChild(option2);
          }
        });
        
        cargarCategoriasEnFooter();
      }
      
      mostrarNotificacion('Error al cargar categorías, usando categorías de productos.', 'warning');
    }
  }

  // Cargar categorías en el footer dinámicamente
  function cargarCategoriasEnFooter() {
    const footerCategorias = document.getElementById('footer-categorias');
    
    if (!footerCategorias || !categorias || categorias.length === 0) {
      console.log('No se puede cargar footer: elemento no encontrado o categorías vacías');
      return;
    }
    
    console.log('🦶 Cargando categorías en el footer...');
    
    footerCategorias.innerHTML = '<li><a href="#productos">Ver todos los productos</a></li>';
    
    categorias.forEach((categoria, index) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      
      a.href = '#productos';
      a.textContent = categoria;
      
      a.addEventListener('click', (e) => {
        e.preventDefault();
        
        document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
        
        setTimeout(() => {
          if (categoriaSelect) {
            categoriaSelect.value = categoria;
            aplicarFiltros();
          }
        }, 500);
      });
      
      li.appendChild(a);
      footerCategorias.appendChild(li);
      
      console.log(`🦶 Categoría "${categoria}" agregada al footer`);
    });
    
    console.log('✅ Footer cargado con categorías dinámicas');
  }

  // Aplicar filtros de búsqueda, categoría y orden
  function aplicarFiltros() {
    let productosFiltrados = [...productos];
    const busqueda = searchInput.value.toLowerCase();
    const categoriaSeleccionada = categoriaSelect.value;
    const ordenSeleccionado = ordenSelect.value;
    
    if (busqueda) {
      productosFiltrados = productosFiltrados.filter(p =>
        p.nombre.toLowerCase().includes(busqueda) ||
        p.descripcion.toLowerCase().includes(busqueda) ||
        p.categoria.toLowerCase().includes(busqueda)
      );
    }
    
    if (categoriaSeleccionada) {
      productosFiltrados = productosFiltrados.filter(p =>
        p.categoria === categoriaSeleccionada
      );
    }
    
    if (ordenSeleccionado) {
      productosFiltrados.sort((a, b) => {
        if (ordenSeleccionado === 'asc') {
          return a.precio - b.precio;
        } else {
          return b.precio - a.precio;
        }
      });
    }
    mostrarProductos(productosFiltrados);
  }

  // Agregar producto al carrito
  function agregarAlCarrito(productoId) {
    const producto = productos.find(p => p._id === productoId);
    if (!producto) return;
    
    if (carrito[productoId]) {
      carrito[productoId].cantidad++;
    } else {
      carrito[productoId] = {
        ...producto,
        cantidad: 1
      };
    }
    
    guardarCarrito();
    actualizarContadorCarrito();
    mostrarNotificacion(`"${producto.nombre}" agregado al carrito.`, 'success');
  }

  // Actualizar el contador del carrito en el header
  function actualizarContadorCarrito() {
    const totalItems = Object.values(carrito).reduce((sum, item) => sum + item.cantidad, 0);
    if (cartCount) {
      cartCount.textContent = totalItems;
    }
  }

  // Mostrar el modal del carrito
  function mostrarCarrito() {
    if (!modalCarrito) return;
    
    modalCarrito.style.display = 'flex';
    listaCarrito.innerHTML = '';
    let total = 0;
    
    if (Object.keys(carrito).length === 0) {
      listaCarrito.innerHTML = '<p>El carrito está vacío.</p>';
      totalCarritoSpan.textContent = '0.00';
      return;
    }
    
    for (const id in carrito) {
      const item = carrito[id];
      const divItem = document.createElement('div');
      divItem.className = 'item-carrito';
      divItem.innerHTML = `
        <img src="${item.imagen}" alt="${item.nombre}" onerror="this.src='assets/placeholder.jpg'">
        <div class="info-carrito">
          <h4>${item.nombre}</h4>
          <p>$${item.precio.toFixed(2)} x ${item.cantidad}</p>
          <p><strong>Subtotal: $${(item.precio * item.cantidad).toFixed(2)}</strong></p>
        </div>
        <span class="eliminar-item" data-id="${id}">&times;</span>
      `;
      listaCarrito.appendChild(divItem);
      total += item.precio * item.cantidad;
    }
    
    totalCarritoSpan.textContent = total.toFixed(2);
    
    const botonesExtra = document.querySelector('.botones-carrito-extra');
    if (botonesExtra) {
      botonesExtra.remove();
    }
    
    if (usuario && token) {
      const divBotones = document.createElement('div');
      divBotones.className = 'botones-carrito-extra';
      divBotones.style.marginTop = '1rem';
      divBotones.style.paddingTop = '1rem';
      divBotones.style.borderTop = '1px solid #eee';
      divBotones.innerHTML = `
        <button class="btn" onclick="guardarCarritoEnServidor()" style="background-color: #27ae60; width: 100%;">
          <i class="fas fa-save"></i> Guardar en mi cuenta
        </button>
      `;
      document.querySelector('.seccion-botones').appendChild(divBotones);
    }
  }

  // Vaciar el carrito
  function vaciarCarrito() {
    carrito = {};
    guardarCarrito();
    actualizarContadorCarrito();
    mostrarCarrito();
    mostrarNotificacion('Carrito vaciado con éxito.', 'success');
  }

  // Eliminar un item del carrito
  function eliminarDelCarrito(id) {
    delete carrito[id];
    guardarCarrito();
    actualizarContadorCarrito();
    mostrarCarrito();
    mostrarNotificacion('Producto eliminado del carrito.', 'success');
  }

  // Realizar compra
  function realizarCompra() {
    if (Object.keys(carrito).length === 0) {
      mostrarNotificacion('El carrito está vacío. Agregue productos para comprar.', 'warning');
      return;
    }
    
    if (usuario && token) {
      guardarCarritoEnServidor().then(() => {
        vaciarCarrito();
        modalCarrito.style.display = 'none';
        mostrarNotificacion('¡Compra realizada con éxito! Se ha guardado en tu cuenta.', 'success');
      });
    } else {
      mostrarNotificacion('Para procesar la compra, por favor inicia sesión o regístrate.', 'warning');
      setTimeout(() => {
        modalCarrito.style.display = 'none';
        crearModalAuth();
        document.getElementById('modalAuth').style.display = 'flex';
      }, 2000);
    }
  }

  // ===== FUNCIONES DEL MODAL DE VENDEDORES (SIN CAMBIOS) =====
  
  function cargarProductosParaVendedor() {
    if (!listaProductosVendedor) return;
    
    listaProductosVendedor.innerHTML = '';
    const categoriaSeleccionada = filtroCategoriaVendedor ? filtroCategoriaVendedor.value : '';
    const productosFiltrados = categoriaSeleccionada
      ? productos.filter(p => p.categoria === categoriaSeleccionada)
      : productos;
    
    if (productosFiltrados.length === 0) {
      listaProductosVendedor.innerHTML = '<p>No hay productos en esta categoría.</p>';
      return;
    }
    
    productosFiltrados.forEach(producto => {
      const divProducto = document.createElement('div');
      divProducto.className = 'producto-vendedor';
      divProducto.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='assets/placeholder.jpg'">
        <div class="info-vendedor">
          <h4>${producto.nombre}</h4>
          <p class="precio-vendedor" data-precio="${producto.precio}">$${producto.precio.toFixed(2)}</p>
          <p style="font-size: 0.8em; color: #666;">${producto.categoria}</p>
        </div>
        <input type="number" class="cantidad-vendedor" value="0" min="0" data-id="${producto._id}" data-precio="${producto.precio}">
      `;
      listaProductosVendedor.appendChild(divProducto);
    });
    
    actualizarResumenPedido();
  }
  
  function actualizarResumenPedido() {
    const cantidades = document.querySelectorAll('.cantidad-vendedor');
    carritoVendedor = [];
    let total = 0;
    
    cantidades.forEach(input => {
      const cantidad = parseInt(input.value);
      if (cantidad > 0) {
        const id = input.dataset.id;
        const producto = productos.find(p => p._id === id);
        if (producto) {
          const subtotal = cantidad * producto.precio;
          total += subtotal;
          carritoVendedor.push({
            ...producto,
            cantidad,
            subtotal
          });
        }
      }
    });
    
    if (totalPedidoSpan) {
      totalPedidoSpan.textContent = total.toFixed(2);
    }
    actualizarDetallePedido();
  }

  function actualizarDetallePedido() {
    const detallePedido = document.getElementById('detallePedido');
    if (!detallePedido) return;
    
    detallePedido.innerHTML = '';
    carritoVendedor.forEach(item => {
      const p = document.createElement('p');
      p.textContent = `${item.cantidad} x ${item.nombre} - $${item.subtotal.toFixed(2)}`;
      detallePedido.appendChild(p);
    });
  }

  function generarPDF() {
    if (carritoVendedor.length === 0) {
      mostrarNotificacion('El presupuesto está vacío', 'warning');
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFont('Helvetica');
    doc.setFontSize(22);
    doc.text('Presupuesto - Colchones Premium', 10, 20);
    
    doc.setFontSize(12);
    doc.text(`Vendedor: ${nombreVendedorInput?.value || 'N/A'}`, 10, 30);
    doc.text(`Cliente: ${nombreClienteInput?.value || 'N/A'}`, 10, 37);
    doc.text(`Teléfono: ${telefonoClienteInput?.value || 'N/A'}`, 10, 44);
    doc.text(`Provincia: ${provinciaClienteSelect?.value || 'N/A'}`, 10, 51);
    doc.text(`Localidad: ${localidadClienteSelect?.value || 'N/A'}`, 10, 58);
    doc.text(`Dirección: ${direccionClienteInput?.value || 'N/A'}`, 10, 65);
    doc.text(`Email: ${emailClienteInput?.value || 'N/A'}`, 10, 72);
    
    let y = 85;
    doc.setFontSize(16);
    doc.text('Detalle del Pedido:', 10, y);
    y += 10;
    
    doc.setFontSize(12);
    carritoVendedor.forEach(item => {
      doc.text(`- ${item.cantidad} x ${item.nombre} (${item.precio.toFixed(2)} c/u)`, 15, y);
      doc.text(`Subtotal: ${item.subtotal.toFixed(2)}`, 150, y);
      y += 7;
    });
    
    y += 10;
    doc.setFontSize(16);
    doc.text(`Total: ${totalPedidoSpan?.textContent || '0.00'}`, 10, y);
    
    doc.save(`presupuesto-${nombreClienteInput?.value || 'cliente'}.pdf`);
    mostrarNotificacion('PDF generado con éxito.', 'success');
  }
  
  // Enviar presupuesto por email
  async function enviarPresupuesto() {
    if (carritoVendedor.length === 0) {
        mostrarNotificacion('El presupuesto está vacío', 'warning');
        return;
    }
    const emailCliente = emailClienteInput?.value;
    if (!emailCliente) {
        mostrarNotificacion('Por favor, ingrese un email de cliente.', 'warning');
        return;
    }

    const datosPresupuesto = {
        cliente: {
            nombre: nombreClienteInput?.value || '',
            email: emailCliente,
            telefono: telefonoClienteInput?.value || '',
            provincia: provinciaClienteSelect?.value || '',
            localidad: localidadClienteSelect?.value || '',
            direccion: direccionClienteInput?.value || ''
        },
        vendedor: {
            nombre: nombreVendedorInput?.value || ''
        },
        productos: carritoVendedor,
        total: parseFloat(totalPedidoSpan?.textContent || '0')
    };

    try {
        const response = await fetch(EMAIL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosPresupuesto)
        });

        const data = await response.json();

        if (response.ok) {
            mostrarNotificacion('Presupuesto enviado por email con éxito.', 'success');
        } else {
            throw new Error(data.error || 'Error al enviar el presupuesto.');
        }

    } catch (error) {
        console.error('Error al enviar presupuesto:', error);
        mostrarNotificacion(error.message, 'error');
    }
  }

  // Cargar localidades según la provincia seleccionada
  const LOCALIDADES_POR_PROVINCIA = {
    "Río Negro": [
      "San Carlos de Bariloche", "General Roca", "Cipolletti", "Viedma",
      "Villa Regina", "Allen", "Cinco Saltos", "San Antonio Oeste", "El Bolsón",
      "Catriel", "Choele Choel", "Cervantes", "Chichinales", "Chimpay",
      "Campo Grande", "General Fernández Oro", "Ingeniero Luis A. Huergo"
    ],
    "Neuquén": [
      "Neuquén Capital", "Plottier", "Centenario", "Cutral Có",
      "Plaza Huincul", "San Martín de los Andes", "Villa La Angostura",
      "Junín de los Andes", "Zapala", "Las Lajas", "Chos Malal",
      "Loncopué", "Picún Leufú", "Senillosa", "Villa Pehuenia"
    ]
  };

  function cargarLocalidades() {
    if (!provinciaClienteSelect || !localidadClienteSelect) return;
    
    const provincia = provinciaClienteSelect.value;
    localidadClienteSelect.innerHTML = '<option value="">Seleccione una localidad</option>';
    localidadClienteSelect.disabled = !provincia;
    
    if (provincia && LOCALIDADES_POR_PROVINCIA[provincia]) {
      LOCALIDADES_POR_PROVINCIA[provincia].forEach(localidad => {
        const option = document.createElement('option');
        option.value = localidad;
        option.textContent = localidad;
        localidadClienteSelect.appendChild(option);
      });
    }
  }

  // Mostrar notificación
  function mostrarNotificacion(mensaje, tipo = 'info') {
    if (!modalNotificacion || !notificacionMensaje) return;
    
    notificacionMensaje.textContent = mensaje;
    modalNotificacion.className = `notificacion show ${tipo}`;
    setTimeout(() => {
      modalNotificacion.className = 'notificacion';
    }, 3000);
  }

  // Mostrar imagen ampliada
  function mostrarImagenAmpliada(src) {
    if (!modalImagen || !imagenAmpliada) return;
    
    imagenAmpliada.src = src;
    modalImagen.style.display = 'block';
  }
  
  function debugCategorias() {
    console.log('=== DEBUG CATEGORÍAS ===');
    console.log('Categorías cargadas:', categorias);
    console.log('Productos únicos por categoría:');
    
    if (productos && productos.length > 0) {
      const categoriaCount = {};
      productos.forEach(p => {
        categoriaCount[p.categoria] = (categoriaCount[p.categoria] || 0) + 1;
      });
      console.table(categoriaCount);
    }
    
    console.log('Select de categorías:', categoriaSelect ? 'Encontrado' : 'NO ENCONTRADO');
    console.log('Opciones en select:', categoriaSelect ? categoriaSelect.options.length : 'N/A');
    console.log('Footer categorías:', document.getElementById('footer-categorias') ? 'Encontrado' : 'NO ENCONTRADO');
    console.log('======================');
  }

  // ================= EVENT LISTENERS =================
  
  // Eventos para filtros y búsqueda
  if (categoriaSelect) categoriaSelect.addEventListener('change', aplicarFiltros);
  if (ordenSelect) ordenSelect.addEventListener('change', aplicarFiltros);
  if (searchInput) searchInput.addEventListener('input', aplicarFiltros);

  // Evento para abrir el modal de imagen
  if (productosGrid) {
    productosGrid.addEventListener('click', e => {
      const imagen = e.target.closest('.producto-imagen-container img');
      if (imagen) {
        mostrarImagenAmpliada(imagen.dataset.imagenFull);
      }
    });
  }

  // Evento para cerrar el modal de imagen
  if (cerrarModalImagen) {
    cerrarModalImagen.addEventListener('click', () => {
      modalImagen.style.display = 'none';
    });
  }
  
  // Cerrar el modal de imagen haciendo clic fuera
  window.addEventListener('click', (e) => {
    if (e.target === modalImagen) {
      modalImagen.style.display = 'none';
    }
  });

  // Eventos para el carrito de compras
  if (productosGrid) {
    productosGrid.addEventListener('click', e => {
      const btnAgregar = e.target.closest('.agregar-carrito');
      if (btnAgregar) {
        agregarAlCarrito(btnAgregar.dataset.id);
      }
    });
  }

  const cartIcon = document.querySelector('.cart-icon');
  if (cartIcon) {
    cartIcon.closest('a').addEventListener('click', e => {
      e.preventDefault();
      mostrarCarrito();
    });
  }
  
  if (listaCarrito) {
    listaCarrito.addEventListener('click', e => {
      if (e.target.classList.contains('eliminar-item')) {
        eliminarDelCarrito(e.target.dataset.id);
      }
    });
  }
  
  if (btnVaciarCarrito) btnVaciarCarrito.addEventListener('click', vaciarCarrito);
  if (btnComprarAhora) btnComprarAhora.addEventListener('click', realizarCompra);

  // Eventos para los modales
  const botonesCerrar = document.querySelectorAll('.cerrar');
  botonesCerrar.forEach(b => b.addEventListener('click', function(){
    this.closest('.modal').style.display = 'none';
  }));
  
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  });

  // Eventos para el modal de vendedor
  if (btnVendedores) {
    btnVendedores.addEventListener('click', e => {
      e.preventDefault();
      cargarProductosParaVendedor();
      modalVendedores.style.display = 'flex';
    });
  }

  if (listaProductosVendedor) {
    listaProductosVendedor.addEventListener('input', (e) => {
      if (e.target.classList.contains('cantidad-vendedor')) {
        actualizarResumenPedido();
      }
    });
  }
  
  if (filtroCategoriaVendedor) {
    filtroCategoriaVendedor.addEventListener('change', cargarProductosParaVendedor);
  }
  
  if (btnDescargarPresupuesto) {
    btnDescargarPresupuesto.addEventListener('click', generarPDF);
  }
  
  if (btnEnviarPresupuesto) {
    btnEnviarPresupuesto.addEventListener('click', enviarPresupuesto);
  }
  
  if (btnResetearPresupuesto) {
    btnResetearPresupuesto.addEventListener('click', function() {
      carritoVendedor = [];
      if (nombreClienteInput) nombreClienteInput.value = '';
      if (emailClienteInput) emailClienteInput.value = '';
      if (localidadClienteSelect) localidadClienteSelect.value = '';
      if (provinciaClienteSelect) provinciaClienteSelect.value = '';
      if (localidadClienteSelect) localidadClienteSelect.disabled = true;
      document.querySelectorAll('.cantidad-vendedor').forEach(i => i.value = 0);
      actualizarResumenPedido();
      mostrarNotificacion('Presupuesto reseteado', 'success');
    });
  }

  if (provinciaClienteSelect) {
    provinciaClienteSelect.addEventListener('change', cargarLocalidades);
  }

  // Exponer funciones globales necesarias
  window.cerrarSesion = cerrarSesion;
  window.guardarCarritoEnServidor = guardarCarritoEnServidor;
  window.debugCategorias = debugCategorias;
  window.cargarCategoriasEnFooter = cargarCategoriasEnFooter;

  // ================= INICIALIZACIÓN FINAL =================
  
  console.log('🚀 Iniciando aplicación...');
  
  // Verificar sesión existente
  verificarSesion();
  
  // Cargar carrito del usuario o invitado
  cargarCarritoUsuario();
  
  // Cargar productos y categorías
  cargarProductos();
  
  console.log('✅ Aplicación inicializada correctamente');
});

// ============== FIN SCRIPT ==============