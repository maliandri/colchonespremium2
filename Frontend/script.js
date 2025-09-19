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

    // Elementos de Modales (estáticos)
    const modalVendedores = document.getElementById('modalVendedores');
    const modalCarrito = document.getElementById('modalCarrito');
    const modalImagen = document.getElementById('modalImagen');
    const modalMisCompras = document.getElementById('modalMisCompras');


    // Botones y enlaces
    const btnVendedores = document.getElementById('accesoVendedores');
    const btnRegistro = document.getElementById('registro-link');
    const btnCarrito = document.querySelector('.fa-shopping-cart.cart-icon').closest('a');

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

    // ✅ Elementos del modal de Mis Compras
    const listaHistorial = document.getElementById('listaHistorial');

    // Elementos de notificación
    const modalNotificacion = document.getElementById('modalNotificacion');
    const notificacionMensaje = document.getElementById('notificacionMensaje');

    // ===== Variables de estado =====
    let productos = [];
    let categorias = [];
    let carrito = JSON.parse(localStorage.getItem('carrito')) || {};
    let carritoVendedor = [];

    // ===== VARIABLES Y FUNCIONES DE AUTENTICACIÓN =====
    let usuario = null;
    let token = localStorage.getItem('authToken');

    // ===== CREAR MODAL DE LOGIN/REGISTRO DINÁMICAMENTE =====
    function crearModalAuth() {
        let modalAuth = document.getElementById('modalAuth');
        if (!modalAuth) {
            modalAuth = document.createElement('div');
            modalAuth.id = 'modalAuth';
            modalAuth.className = 'modal';
            modalAuth.innerHTML = `
                <div class="modal-content">
                    <span class="cerrar" onclick="cerrarModalAuth()">&times;</span>
                    <div class="auth-tabs">
                        <button class="tab-btn active" data-tab="login">Iniciar Sesión</button>
                        <button class="tab-btn" data-tab="registro">Registrarse</button>
                    </div>
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
        }

        // Agregar listeners después de crear el modal
        modalAuth.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => mostrarTab(e.target.dataset.tab));
        });
        document.getElementById('formLogin').addEventListener('submit', manejarLogin);
        document.getElementById('formRegistroNuevo').addEventListener('submit', manejarRegistro);

        return modalAuth;
    }

    // Funciones de control de modales
    function mostrarTab(tabId) {
        document.querySelectorAll('#modalAuth .tab-content').forEach(content => content.classList.remove('active'));
        document.querySelectorAll('#modalAuth .tab-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`tab-${tabId}`).classList.add('active');
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    }

    window.cerrarModalAuth = function() {
        const modalAuth = document.getElementById('modalAuth');
        if (modalAuth) {
            modalAuth.style.display = 'none';
        }
    };

    // Funciones de autenticación
    async function manejarLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${AUTH_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    async function manejarRegistro(e) {
        e.preventDefault();
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const passwordConfirm = document.getElementById('regPasswordConfirm').value;

        if (password !== passwordConfirm) {
            mostrarNotificacion('Las contraseñas no coinciden', 'error');
            return;
        }

        try {
            const response = await fetch(`${AUTH_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                mostrarNotificacion('¡Registro exitoso! Por favor inicia sesión.', 'success');
                document.getElementById('formRegistroNuevo').reset();
                mostrarTab('login'); // Cambiar a la pestaña de login
            } else {
                throw new Error(data.error || 'Error al registrarse');
            }
        } catch (error) {
            mostrarNotificacion(error.message, 'error');
        }
    }

    function cerrarSesion() {
        token = null;
        usuario = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        
        // Al cerrar sesión, el carrito local se mantiene
        carrito = JSON.parse(localStorage.getItem('carrito')) || {};
        
        actualizarUIAutenticacion();
        actualizarContadorCarrito();
        mostrarNotificacion('Sesión cerrada correctamente', 'success');
    }
    
    // Función de inicialización
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

    function actualizarUIAutenticacion() {
        if (!btnRegistro) return;
        
        if (usuario && token) {
            btnRegistro.innerHTML = `
                <div class="user-menu">
                    <span><i class="fas fa-user"></i> ${usuario.email.split('@')[0]}</span>
                    <span class="user-action" id="verMisCompras">| Mis Compras</span>
                    <span class="user-logout">| Cerrar Sesión</span>
                </div>`;
            btnRegistro.querySelector('.user-logout').addEventListener('click', cerrarSesion);
            btnRegistro.querySelector('#verMisCompras').addEventListener('click', cargarHistorialCompras);
        } else {
            btnRegistro.innerHTML = '<i class="fas fa-user"></i> Cuenta';
        }
    }
    // Funciones de gestión del carrito
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

    function guardarCarrito() {
        if (usuario && token) {
            localStorage.setItem(`carrito_${usuario.id}`, JSON.stringify(carrito));
        } else {
            localStorage.setItem('carrito', JSON.stringify(carrito));
        }
    }

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

    // ===== RESTO DE FUNCIONES ORIGINALES =====

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
                    <p class="descripcion">${producto.descripcion || ''}</p>
                    <p class="categoria-tag" style="color: #666; font-size: 0.85em; margin: 0.5rem 0;">
                        <i class="fas fa-tag"></i> ${producto.categoria}
                    </p>
                    <p class="precio">$ ${parseFloat(producto.precio).toFixed(2)}</p>
                    <button class="agregar-carrito" data-id="${producto._id}">
                        <i class="fas fa-shopping-cart"></i> Agregar al Carrito
                    </button>
                </div>
            `;
            productosGrid.appendChild(card);
        });
    }

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

    function aplicarFiltros() {
        let productosFiltrados = [...productos];
        const busqueda = searchInput.value.toLowerCase();
        const categoriaSeleccionada = categoriaSelect.value;
        const ordenSeleccionado = ordenSelect.value;
        
        if (busqueda) {
            productosFiltrados = productosFiltrados.filter(p =>
                p.nombre.toLowerCase().includes(busqueda) ||
                (p.descripcion && p.descripcion.toLowerCase().includes(busqueda)) ||
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

    function actualizarContadorCarrito() {
        const totalItems = Object.values(carrito).reduce((sum, item) => sum + item.cantidad, 0);
        if (cartCount) {
            cartCount.textContent = totalItems;
        }
    }

    function mostrarCarrito() {
        if (!modalCarrito) return;
        
        modalCarrito.style.display = 'flex';
        listaCarrito.innerHTML = '';
        let total = 0;
        
        if (Object.keys(carrito).length === 0) {
            listaCarrito.innerHTML = '<p>El carrito está vacío.</p>';
            totalCarritoSpan.textContent = '0.00';

            // Ocultar la sección de pago si el carrito está vacío
            const seccionPagoExistente = modalCarrito.querySelector('.seccion-pago');
            if (seccionPagoExistente) {
                seccionPagoExistente.style.display = 'none';
            }
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
                <button class="btn guardar-carrito-btn" style="background-color: #27ae60; width: 100%;">
                    <i class="fas fa-save"></i> Guardar en mi cuenta
                </button>
            `;
             // Usamos querySelector en el contexto del modal para evitar conflictos
            modalCarrito.querySelector('.seccion-botones').appendChild(divBotones);
            divBotones.querySelector('.guardar-carrito-btn').addEventListener('click', guardarCarritoEnServidor);
        }

        // ✅ INICIO: AÑADIR SECCIÓN DE PAGO
        let seccionPago = modalCarrito.querySelector('.seccion-pago');
        if (!seccionPago) {
            seccionPago = document.createElement('div');
            seccionPago.className = 'seccion-pago';
            modalCarrito.querySelector('.resumen-pedido').after(seccionPago);
        }
        seccionPago.style.display = 'block'; // Asegurarse que sea visible
        seccionPago.innerHTML = `
            <h4>Datos para Transferencia</h4>
            <p>Una vez realizada, envía el comprobante a nuestro WhatsApp para coordinar la entrega.</p>
            <div class="datos-pago">
                <p><strong>Alias:</strong> alumine.hogar.mp</p>
                <div class="dato-copiable">
                    <p><strong>CVU:</strong> <span id="cvu-text">0000003100002240486002</span></p>
                    <button class="btn-copiar" id="btnCopiarCvu"><i class="fas fa-copy"></i> Copiar</button>
                </div>
                <p><strong>Nombre:</strong> SANTA TERESA S R L</p>
            </div>
        `;
        document.getElementById('btnCopiarCvu').addEventListener('click', () => {
            const cvuText = document.getElementById('cvu-text').textContent;
            const textArea = document.createElement("textarea");
            textArea.value = cvuText;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                mostrarNotificacion('CVU copiado al portapapeles', 'success');
            } catch (err) {
                mostrarNotificacion('No se pudo copiar el CVU', 'error');
            }
            document.body.removeChild(textArea);
        });
        // ✅ FIN: AÑADIR SECCIÓN DE PAGO
    }

    function vaciarCarrito() {
        carrito = {};
        guardarCarrito();
        actualizarContadorCarrito();
        mostrarCarrito();
        mostrarNotificacion('Carrito vaciado con éxito.', 'success');
    }

    function eliminarDelCarrito(id) {
        delete carrito[id];
        guardarCarrito();
        actualizarContadorCarrito();
        mostrarCarrito();
        mostrarNotificacion('Producto eliminado del carrito.', 'success');
    }

    function realizarCompra() {
        if (Object.keys(carrito).length === 0) {
            mostrarNotificacion('El carrito está vacío. Agregue productos para comprar.', 'warning');
            return;
        }
        
        if (usuario && token) {
            guardarCarritoEnServidor().then(() => {
                vaciarCarrito();
                modalCarrito.style.display = 'none';
                mostrarNotificacion('¡Gracias por tu compra! Tu pedido se ha guardado.', 'success');
            });
        } else {
            mostrarNotificacion('Para procesar la compra, por favor inicia sesión o regístrate.', 'warning');
            setTimeout(() => {
                modalCarrito.style.display = 'none';
                const authModal = crearModalAuth();
                authModal.style.display = 'flex';
            }, 2000);
        }
    }
    
    // ✅ INICIO: FUNCIONES PARA "MIS COMPRAS"
    async function cargarHistorialCompras() {
        if (!usuario || !token) {
            mostrarNotificacion('Debes iniciar sesión para ver tu historial.', 'warning');
            return;
        }
        try {
            const response = await fetch(`${VENTAS_URL}/historial`, {
                headers: { 'auth-token': token }
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'No se pudo cargar el historial.');
            }
            const historial = await response.json();
            mostrarHistorialCompras(historial);
        } catch (error) {
            mostrarNotificacion(error.message, 'error');
        }
    }

    function mostrarHistorialCompras(historial) {
        if (!modalMisCompras || !listaHistorial) return;

        listaHistorial.innerHTML = '';
        if (!historial || historial.length === 0) {
            listaHistorial.innerHTML = '<p>No tienes compras ni presupuestos guardados.</p>';
        } else {
            historial.forEach(compra => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item-historial';
                const fecha = new Date(compra.fecha).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                const productosHtml = compra.productos.map(p => `<li><span>${p.cantidad} x ${p.nombre}</span><span>$${(p.cantidad * p.precioUnitario).toFixed(2)}</span></li>`).join('');

                itemDiv.innerHTML = `
                    <div class="item-historial-header">
                        <h3>${fecha}</h3>
                        <span class="estado ${compra.estado}">${compra.estado}</span>
                    </div>
                    <div class="item-historial-productos"><ul>${productosHtml}</ul></div>
                    <div class="item-historial-total">Total: $${compra.total.toFixed(2)}</div>
                `;
                listaHistorial.appendChild(itemDiv);
            });
        }
        modalMisCompras.style.display = 'flex';
    }
    // ✅ FIN: FUNCIONES PARA "MIS COMPRAS"

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
        doc.text(`Total: $${totalPedidoSpan?.textContent || '0.00'}`, 10, y);
        
        doc.save(`presupuesto-${nombreClienteInput?.value || 'cliente'}.pdf`);
        mostrarNotificacion('PDF generado con éxito.', 'success');
    }
    
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

    function mostrarNotificacion(mensaje, tipo = 'info') {
        if (!modalNotificacion || !notificacionMensaje) return;
        
        notificacionMensaje.textContent = mensaje;
        modalNotificacion.className = `notificacion show ${tipo}`;
        setTimeout(() => {
            modalNotificacion.className = 'notificacion';
        }, 3000);
    }

    function mostrarImagenAmpliada(src) {
        if (!modalImagen || !imagenAmpliada) return;
        
        imagenAmpliada.src = src;
        modalImagen.style.display = 'block';
    }

    // ===== GESTIÓN DE EVENTOS GENERALES =====
    // Evento delegado para el enlace de cuenta
    document.querySelector('.main-nav').addEventListener('click', (e) => {
        const linkCuenta = e.target.closest('#registro-link');
        if (linkCuenta) {
            e.preventDefault();
            if (!usuario) {
                const modal = crearModalAuth();
                modal.style.display = 'flex';
            }
        }
   });

    // Eventos para filtros y búsqueda
    if (searchInput) searchInput.addEventListener('input', aplicarFiltros);
    if (categoriaSelect) categoriaSelect.addEventListener('change', aplicarFiltros);
    if (ordenSelect) ordenSelect.addEventListener('change', aplicarFiltros);

    // Eventos para modales de la página
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('agregar-carrito')) {
            const id = e.target.dataset.id;
            agregarAlCarrito(id);
        }
        if (e.target.classList.contains('eliminar-item')) {
            const id = e.target.dataset.id;
            eliminarDelCarrito(id);
        }
        if (e.target.tagName === 'IMG' && e.target.closest('.producto-card')) {
            const imagenSrc = e.target.dataset.imagenFull;
            if (imagenSrc) {
                mostrarImagenAmpliada(imagenSrc);
            }
        }
    });

    if (btnVendedores) btnVendedores.addEventListener('click', (e) => {
        e.preventDefault();
        if (modalVendedores) modalVendedores.style.display = 'flex';
    });

    if (btnCarrito) btnCarrito.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarCarrito();
        if (modalCarrito) modalCarrito.style.display = 'flex';
    });

    if (cerrarModalImagen) cerrarModalImagen.addEventListener('click', () => {
        if (modalImagen) modalImagen.style.display = 'none';
    });
    
    // Cierre de modales
    [modalVendedores, modalCarrito, modalImagen, modalMisCompras].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
            modal.querySelector('.cerrar, .cerrar-modal')?.addEventListener('click', () => modal.style.display = 'none');
        }
    });

    window.addEventListener('click', (e) => {
        const modalAuth = document.getElementById('modalAuth');
        if (modalAuth && e.target === modalAuth) {
            modalAuth.style.display = 'none';
        }
    });
    
    // Eventos para el modal de vendedores
    if (listaProductosVendedor) listaProductosVendedor.addEventListener('input', actualizarResumenPedido);
    if (filtroCategoriaVendedor) filtroCategoriaVendedor.addEventListener('change', cargarProductosParaVendedor);
    if (provinciaClienteSelect) provinciaClienteSelect.addEventListener('change', cargarLocalidades);
    if (btnDescargarPresupuesto) btnDescargarPresupuesto.addEventListener('click', generarPDF);
    if (btnEnviarPresupuesto) btnEnviarPresupuesto.addEventListener('click', enviarPresupuesto);
    if (btnResetearPresupuesto) btnResetearPresupuesto.addEventListener('click', () => {
        const cantidades = document.querySelectorAll('.cantidad-vendedor');
        cantidades.forEach(input => input.value = 0);
        actualizarResumenPedido();
        mostrarNotificacion('Presupuesto reseteado', 'info');
    });

    // Eventos para el modal de carrito
    if (btnVaciarCarrito) btnVaciarCarrito.addEventListener('click', vaciarCarrito);
    if (btnComprarAhora) btnComprarAhora.addEventListener('click', realizarCompra);

    // ===== INICIALIZACIÓN =====
    verificarSesion();
    cargarProductos();
    
});