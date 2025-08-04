// ============== SCRIPT COMPLETO CORREGIDO ==============
document.addEventListener('DOMContentLoaded', function () {

    // ===== URLs de la API =====
    const API_URL = 'https://colchonespremium2.onrender.com/api/colchones';
    const CATEGORIAS_URL = 'https://colchonespremium2.onrender.com/api/categorias';

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
    
    // ======================================
    // ELEMENTOS PARA AUTENTICACIÓN DE CLIENTES
    // ======================================
    const btnRegistro = document.getElementById('registro-link');
    const formRegistro = document.getElementById('formRegistro');
    const formLoginCliente = document.getElementById('formLoginCliente');
    const showClientLoginLink = document.getElementById('showClientLogin');
    const showClientRegisterLink = document.getElementById('showClientRegister');
    const registroStatusMessage = document.getElementById('registro-status-message');
    const loginStatusMessage = document.getElementById('login-status-message');
    const cerrarRegistro = document.getElementById('cerrarRegistro');
    const logoutBtn = document.getElementById('logout-btn');
    const authButtonsContainer = document.getElementById('auth-buttons-container');
    // ======================================

    // Elementos del modal de vendedores
    const cerrarVendedores = document.getElementById('cerrarVendedores');
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
    let carrito = JSON.parse(localStorage.getItem('carrito')) || {};
    let carritoVendedor = [];

    // ===== Funciones de Autenticación de Clientes =====
    function switchClientAuthForm(formId) {
        document.querySelectorAll('#client-auth-forms-container .auth-form').forEach(form => {
            form.classList.add('hidden');
        });
        document.getElementById(formId).classList.remove('hidden');
        registroStatusMessage.textContent = '';
        loginStatusMessage.textContent = '';
    }

    function checkLoginStatus() {
        const token = localStorage.getItem('authToken');
        const isLoggedIn = !!token;

        btnRegistro.style.display = isLoggedIn ? 'none' : 'block';
        btnVendedores.style.display = isLoggedIn ? 'none' : 'block';
        logoutBtn.style.display = isLoggedIn ? 'block' : 'none';
    }

    async function handleRegister(event) {
        event.preventDefault();
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        try {
            const response = await fetch('https://colchonespremium2.onrender.com/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Hubo un error al registrarse.');
            }

            registroStatusMessage.textContent = '¡Registro exitoso! Ahora puedes iniciar sesión.';
            registroStatusMessage.style.color = 'var(--success)';
            document.getElementById('regEmail').value = '';
            document.getElementById('regPassword').value = '';
            setTimeout(() => switchClientAuthForm('formLoginCliente'), 1500);

        } catch (error) {
            registroStatusMessage.textContent = error.message;
            registroStatusMessage.style.color = 'var(--accent)';
            console.error('Error en el registro:', error);
        }
    }

    async function handleClientLogin(event) {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('https://colchonespremium2.onrender.com/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al iniciar sesión. Verifique sus credenciales.');
            }

            localStorage.setItem('authToken', data.token);
            loginStatusMessage.textContent = '¡Inicio de sesión exitoso!';
            loginStatusMessage.style.color = 'var(--success)';

            setTimeout(() => {
                modalRegistro.style.display = 'none';
                checkLoginStatus();
            }, 1500);

        } catch (error) {
            loginStatusMessage.textContent = error.message;
            loginStatusMessage.style.color = 'var(--accent)';
            console.error('Error:', error);
        }
    }

    function handleLogout() {
        localStorage.removeItem('authToken');
        checkLoginStatus();
        mostrarNotificacion('Has cerrado sesión.', 'success');
    }

    // ===== Funciones Principales =====
    async function cargarProductos() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Error al cargar los productos');
            productos = await response.json();
            mostrarProductos(productos);
            cargarCategorias();
            cargarProductosParaVendedor();
            actualizarContadorCarrito();
        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion('Error al cargar los productos. Intente más tarde.');
        }
    }

    function mostrarProductos(productosAMostrar) {
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
                    <img src="${producto.imagen}" alt="${producto.nombre}" data-imagen-full="${producto.imagen}">
                </div>
                <div class="producto-info">
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion}</p>
                    <p class="precio">$${producto.precio.toFixed(2)}</p>
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
            const response = await fetch(CATEGORIAS_URL);
            const categorias = await response.json();
            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria;
                option.textContent = categoria;
                categoriaSelect.appendChild(option);
                filtroCategoriaVendedor.appendChild(option.cloneNode(true));
            });
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        }
    }

    function aplicarFiltros() {
        let productosFiltrados = [...productos];
        const busqueda = searchInput.value.toLowerCase();
        const categoriaSeleccionada = categoriaSelect.value;
        const ordenSeleccionado = ordenSelect.value;

        if (busqueda) {
            productosFiltrados = productosFiltrados.filter(p =>
                p.nombre.toLowerCase().includes(busqueda) ||
                p.descripcion.toLowerCase().includes(busqueda)
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

    // ===== Funciones del Carrito de Compras =====
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
        mostrarNotificacion(`"${producto.nombre}" agregado al carrito.`);
    }

    function guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    function actualizarContadorCarrito() {
        const totalItems = Object.values(carrito).reduce((sum, item) => sum + item.cantidad, 0);
        cartCount.textContent = totalItems;
    }

    function mostrarCarrito() {
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
                <img src="${item.imagen}" alt="${item.nombre}">
                <div class="info-carrito">
                    <h4>${item.nombre}</h4>
                    <p>$${item.precio.toFixed(2)} x ${item.cantidad}</p>
                </div>
                <span class="eliminar-item" data-id="${id}">&times;</span>
            `;
            listaCarrito.appendChild(divItem);
            total += item.precio * item.cantidad;
        }

        totalCarritoSpan.textContent = total.toFixed(2);
    }

    function vaciarCarrito() {
        carrito = {};
        guardarCarrito();
        actualizarContadorCarrito();
        mostrarCarrito();
        mostrarNotificacion('Carrito vaciado con éxito.');
    }

    function eliminarDelCarrito(id) {
        delete carrito[id];
        guardarCarrito();
        actualizarContadorCarrito();
        mostrarCarrito();
        mostrarNotificacion('Producto eliminado del carrito.');
    }

    function realizarCompra() {
        if (Object.keys(carrito).length === 0) {
            mostrarNotificacion('El carrito está vacío. Agregue productos para comprar.', 'warning');
            return;
        }
        vaciarCarrito();
        modalCarrito.style.display = 'none';
        mostrarNotificacion('¡Compra realizada con éxito!', 'success');
    }

    // ===== Funciones del Modal de Vendedores =====
    function cargarProductosParaVendedor() {
        listaProductosVendedor.innerHTML = '';
        const categoriaSeleccionada = filtroCategoriaVendedor.value;
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
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <div class="info-vendedor">
                    <h4>${producto.nombre}</h4>
                    <p class="precio-vendedor" data-precio="${producto.precio}">$${producto.precio.toFixed(2)}</p>
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

        totalPedidoSpan.textContent = total.toFixed(2);
        actualizarDetallePedido();
    }

    function actualizarDetallePedido() {
        const detallePedido = document.getElementById('detallePedido');
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
        doc.text(`Vendedor: ${nombreVendedorInput.value || 'N/A'}`, 10, 30);
        doc.text(`Cliente: ${nombreClienteInput.value || 'N/A'}`, 10, 37);
        doc.text(`Teléfono: ${telefonoClienteInput.value || 'N/A'}`, 10, 44);
        doc.text(`Provincia: ${provinciaClienteSelect.value || 'N/A'}`, 10, 51);
        doc.text(`Localidad: ${localidadClienteSelect.value || 'N/A'}`, 10, 58);
        doc.text(`Dirección: ${direccionClienteInput.value || 'N/A'}`, 10, 65);
        doc.text(`Email: ${emailClienteInput.value || 'N/A'}`, 10, 72);

        let y = 85;
        doc.setFontSize(16);
        doc.text('Detalle del Pedido:', 10, y);
        y += 10;

        doc.setFontSize(12);
        carritoVendedor.forEach(item => {
            doc.text(`- ${item.cantidad} x ${item.nombre} ($${item.precio.toFixed(2)} c/u)`, 15, y);
            doc.text(`Subtotal: $${item.subtotal.toFixed(2)}`, 150, y);
            y += 7;
        });

        y += 10;
        doc.setFontSize(16);
        doc.text(`Total: $${totalPedidoSpan.textContent}`, 10, y);

        doc.save(`presupuesto-${nombreClienteInput.value || 'cliente'}.pdf`);
        mostrarNotificacion('PDF generado con éxito.');
    }

    async function enviarPresupuesto() {
        if (carritoVendedor.length === 0) {
            mostrarNotificacion('El presupuesto está vacío', 'warning');
            return;
        }
        const emailCliente = emailClienteInput.value;
        if (!emailCliente) {
            mostrarNotificacion('Por favor, ingrese un email de cliente.', 'warning');
            return;
        }

        const datosPresupuesto = {
            cliente: {
                nombre: nombreClienteInput.value,
                email: emailCliente,
                telefono: telefonoClienteInput.value,
                provincia: provinciaClienteSelect.value,
                localidad: localidadClienteSelect.value,
                direccion: direccionClienteInput.value
            },
            vendedor: {
                nombre: nombreVendedorInput.value
            },
            productos: carritoVendedor,
            total: parseFloat(totalPedidoSpan.textContent)
        };

        const url = 'https://colchonespremium2.onrender.com/api/presupuesto/enviar';

        try {
            const response = await fetch(url, {
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
            mostrarNotificacion(error.message, 'warning');
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

    // ===== Funciones adicionales =====
    function mostrarNotificacion(mensaje, tipo = 'info') {
        notificacionMensaje.textContent = mensaje;
        modalNotificacion.className = `notificacion show ${tipo}`;
        setTimeout(() => {
            modalNotificacion.className = 'notificacion';
        }, 3000);
    }

    function mostrarImagenAmpliada(src) {
        imagenAmpliada.src = src;
        modalImagen.style.display = 'block';
    }

    // ================= EVENT LISTENERS =================
    // Eventos para filtros y búsqueda
    categoriaSelect.addEventListener('change', aplicarFiltros);
    ordenSelect.addEventListener('change', aplicarFiltros);
    searchInput.addEventListener('input', aplicarFiltros);

    // Evento para abrir el modal de imagen
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

    window.addEventListener('click', (e) => {
        if (e.target === modalImagen) {
            modalImagen.style.display = 'none';
        }
    });

    // Eventos para el carrito de compras
    productosGrid.addEventListener('click', e => {
        const btnAgregar = e.target.closest('.agregar-carrito');
        if (btnAgregar) {
            agregarAlCarrito(btnAgregar.dataset.id);
        }
    });

    document.querySelector('.cart-icon').closest('a').addEventListener('click', e => {
        e.preventDefault();
        mostrarCarrito();
    });

    listaCarrito.addEventListener('click', e => {
        if (e.target.classList.contains('eliminar-item')) {
            eliminarDelCarrito(e.target.dataset.id);
        }
    });

    btnVaciarCarrito.addEventListener('click', vaciarCarrito);
    btnComprarAhora.addEventListener('click', realizarCompra);

    // Eventos para los modales
    const botonesCerrar = document.querySelectorAll('.cerrar');
    botonesCerrar.forEach(b => b.addEventListener('click', function () {
        this.closest('.modal').style.display = 'none';
    }));

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });


    // ======================================
    // EVENTOS PARA EL MODAL DE CLIENTES
    // ======================================
    btnRegistro.addEventListener('click', e => {
        e.preventDefault();
        modalRegistro.style.display = 'flex';
        switchClientAuthForm('formRegistro');
    });

    cerrarRegistro.addEventListener('click', () => {
        modalRegistro.style.display = 'none';
    });
    
    showClientLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchClientAuthForm('formLoginCliente');
    });

    showClientRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchClientAuthForm('formRegistro');
    });

    formRegistro.addEventListener('submit', handleRegister);
    formLoginCliente.addEventListener('submit', handleClientLogin);
    logoutBtn.addEventListener('click', handleLogout);
    // ======================================


    // ======================================
    // EVENTOS PARA EL MODAL DE VENDEDORES
    // ======================================
    btnVendedores.addEventListener('click', e => {
        e.preventDefault();
        modalVendedores.style.display = 'flex';
        cargarProductosParaVendedor();
    });
    
    cerrarVendedores.addEventListener('click', () => {
        modalVendedores.style.display = 'none';
    });
    // ======================================

    listaProductosVendedor.addEventListener('input', (e) => {
        if (e.target.classList.contains('cantidad-vendedor')) {
            actualizarResumenPedido();
        }
    });

    filtroCategoriaVendedor.addEventListener('change', cargarProductosParaVendedor);
    btnDescargarPresupuesto.addEventListener('click', generarPDF);
    btnEnviarPresupuesto.addEventListener('click', enviarPresupuesto);
    btnResetearPresupuesto.addEventListener('click', function () {
        carritoVendedor = [];
        nombreClienteInput.value = '';
        emailClienteInput.value = '';
        localidadClienteSelect.value = '';
        provinciaClienteSelect.value = '';
        localidadClienteSelect.disabled = true;
        document.querySelectorAll('.cantidad-vendedor').forEach(i => i.value = 0);
        actualizarResumenPedido();
        mostrarNotificacion('Presupuesto reseteado');
    });

    provinciaClienteSelect.addEventListener('change', cargarLocalidades);

    // ================= INICIALIZACIÓN FINAL =================
    cargarProductos();
    checkLoginStatus();
});

// ============== FIN SCRIPT CORREGIDO ==============