// URL de tu servidor backend en Render
const API_URL = 'https://tienda-bikershop.onrender.com';

// Variables globales
let productosGlobales = [];
let carrito = [];

document.addEventListener('DOMContentLoaded', () => {
    obtenerProductos();
    configurarFiltro();
    configurarModalContacto();
    configurarModalEntrega();
    configurarModalCarrito();
    configurarBotonScroll();
    configurarSincronizacion();

    // Enlazamos los botones de enviar pedido (lateral y modal)
    const btnComprar = document.getElementById('btn-comprar');
    if (btnComprar) {
        btnComprar.addEventListener('click', enviarPedidoWhatsApp);
    }
});

// ==========================================
// 1. CARGA Y RENDERIZADO DE PRODUCTOS
// ==========================================
function obtenerProductos() {
    const contenedor = document.getElementById('contenedor-productos');
    
    fetch(`${API_URL}/productos`)
        .then(res => res.json())
        .then(productos => {
            productosGlobales = productos;

            // Genera la lista desplegable de categorías según lo que guardó el admin
            actualizarMenuCategorias(productosGlobales);

            // Muestra los productos en pantalla
            renderizarProductos(productosGlobales);
        })
        .catch(err => {
            console.error('Error al cargar productos:', err);
            contenedor.innerHTML = '<p style="color: red;">Error al conectar con la tienda.</p>';
        });
}

// Genera automáticamente las opciones del select a partir de las categorías reales del inventario
function actualizarMenuCategorias(productos) {
    const selectFiltro = document.getElementById('filtro-seccion');
    if (!selectFiltro) return;

    // Extrae categorías únicas eliminando vacías o duplicadas
    const categorias = [...new Set(
        productos
            .map(p => p.categoria || p.seccion)
            .filter(cat => cat && cat.trim() !== '')
    )];

    selectFiltro.innerHTML = '<option value="TODOS" selected>Todos los productos</option>';

    categorias.forEach(cat => {
        const opcion = document.createElement('option');
        opcion.value = cat;
        opcion.textContent = cat;
        selectFiltro.appendChild(opcion);
    });
}

function renderizarProductos(productos) {
    const contenedor = document.getElementById('contenedor-productos');
    contenedor.innerHTML = '';

    if (productos.length === 0) {
        contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #777; padding: 20px;">No se encontraron productos con esa búsqueda.</p>';
        return;
    }

    productos.forEach(prod => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-producto';
        
        const imagenHTML = (prod.imagen && prod.imagen.trim() !== '') 
            ? `<img src="${prod.imagen}" alt="${prod.nombre}">` : ''; 

        const nombreSeguro = prod.nombre.replace(/'/g, "\\'");
        const categoriaTexto = prod.categoria || prod.seccion || 'General';
        const subcategoriaHTML = prod.subcategoria 
            ? `<p style="font-size: 13px; color: #666; margin-top: 2px;">🏷️ Subcategoría: <b>${prod.subcategoria}</b></p>` 
            : '';

        tarjeta.innerHTML = `
            ${imagenHTML}
            <div class="contenido-tarjeta">
                <h3>${prod.nombre}</h3>
                <span class="etiqueta-seccion">📂 ${categoriaTexto}</span>
                ${subcategoriaHTML}
                <div class="precio">$${parseFloat(prod.precio).toFixed(2)}</div>
                <button class="btn-accion" onclick="agregarAlCarrito('${prod.id}', '${nombreSeguro}', ${prod.precio})">
                    Comprar
                </button>
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });
}

// ==========================================
// 🔍 2. FILTRADO COMBINADO (CATEGORÍA + BUSCADOR)
// ==========================================
function aplicarFiltros() {
    const selectFiltro = document.getElementById('filtro-seccion');
    const inputBuscador = document.getElementById('input-buscador');

    const categoriaSeleccionada = selectFiltro ? selectFiltro.value : 'TODOS';
    const busqueda = inputBuscador ? inputBuscador.value.toLowerCase().trim() : '';

    const productosFiltrados = productosGlobales.filter(prod => {
        const catProducto = prod.categoria || prod.seccion || '';
        const subcatProducto = prod.subcategoria || '';

        const coincideCategoria = (categoriaSeleccionada === 'TODOS' || catProducto === categoriaSeleccionada);
        const coincideTexto = prod.nombre.toLowerCase().includes(busqueda) ||
                              catProducto.toLowerCase().includes(busqueda) ||
                              subcatProducto.toLowerCase().includes(busqueda);

        return coincideCategoria && coincideTexto;
    });

    renderizarProductos(productosFiltrados);
}

function configurarFiltro() {
    const selectFiltro = document.getElementById('filtro-seccion');
    const inputBuscador = document.getElementById('input-buscador');

    if (selectFiltro) {
        selectFiltro.addEventListener('change', aplicarFiltros);
    }

    if (inputBuscador) {
        inputBuscador.addEventListener('input', aplicarFiltros);
    }
}

// ==========================================
// 📞 3. GESTIÓN DEL MODAL DE CONTACTO
// ==========================================
function configurarModalContacto() {
    const modalContacto = document.getElementById('modal-contacto');
    const btnLogo = document.getElementById('logo-contacto');
    const btnTexto = document.getElementById('texto-contacto');
    const btnCerrar = document.getElementById('cerrar-modal');

    const abrirModal = () => {
        if (modalContacto) modalContacto.style.display = 'flex';
    };

    const cerrarModal = () => {
        if (modalContacto) modalContacto.style.display = 'none';
    };

    if (btnLogo) btnLogo.addEventListener('click', abrirModal);
    if (btnTexto) btnTexto.addEventListener('click', abrirModal);
    if (btnCerrar) btnCerrar.addEventListener('click', cerrarModal);

    window.addEventListener('click', (e) => {
        if (e.target === modalContacto) {
            cerrarModal();
        }
    });
}

// ==========================================
// 🛵 4. GESTIÓN DEL MODAL DE ENTREGA
// ==========================================
function configurarModalEntrega() {
    const modalEntrega = document.getElementById('modal-entrega');
    const btnCerrarEntrega = document.getElementById('cerrar-modal-entrega');

    if (btnCerrarEntrega) {
        btnCerrarEntrega.addEventListener('click', () => {
            if (modalEntrega) modalEntrega.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modalEntrega) {
            modalEntrega.style.display = 'none';
        }
    });
}

// ==========================================
// 🛒 5. MODAL DEL CARRITO DE COMPRAS
// ==========================================
function configurarModalCarrito() {
    const btnCarritoHeader = document.getElementById('btn-carrito-top');
    const modalCarrito = document.getElementById('modal-carrito-popup');
    const btnCerrar = document.getElementById('cerrar-modal-carrito');
    const btnComprarModal = document.getElementById('btn-comprar-modal');

    const abrirModal = () => {
        if (modalCarrito) modalCarrito.style.display = 'flex';
    };

    const cerrarModal = () => {
        if (modalCarrito) modalCarrito.style.display = 'none';
    };

    if (btnCarritoHeader) btnCarritoHeader.addEventListener('click', abrirModal);
    if (btnCerrar) btnCerrar.addEventListener('click', cerrarModal);

    if (btnComprarModal) {
        btnComprarModal.addEventListener('click', () => {
            cerrarModal();
            enviarPedidoWhatsApp();
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modalCarrito) {
            cerrarModal();
        }
    });
}

// ==========================================
// 🛒 6. CARRITO Y ENVÍO POR WHATSAPP
// ==========================================
function agregarAlCarrito(id, nombre, precio) {
    const existente = carrito.find(item => item.id === id);
    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({ id, nombre, precio, cantidad: 1 });
    }
    actualizarCarrito();

    // Alerta de confirmación al usuario
    alert(`Usted ha agregado el producto ${nombre} al carrito`);
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    actualizarCarrito();
}

function actualizarCarrito() {
    const listaCarrito = document.getElementById('lista-carrito');
    const listaCarritoModal = document.getElementById('lista-carrito-modal');
    const totalCarrito = document.getElementById('total-carrito');
    const totalCarritoModal = document.getElementById('total-carrito-modal');
    const contadorCarrito = document.getElementById('contador-carrito');
    const contadorCarritoHeader = document.getElementById('contador-carrito-header');

    let total = 0;
    let totalItems = 0;

    let itemsHTML = '';

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        totalItems += item.cantidad;

        itemsHTML += `
            <li class="item-carrito">
                <span class="nombre-item">${item.nombre} x${item.cantidad}</span>
                <span class="precio-item">$${subtotal.toFixed(2)}</span>
                <button class="btn-eliminar-carrito" onclick="eliminarDelCarrito('${item.id}')">X</button>
            </li>
        `;
    });

    const textoVacio = '<p style="text-align: center; color: #777; padding: 10px;">El carrito está vacío.</p>';

    // Renderizar lista en lateral y en el modal
    if (listaCarrito) listaCarrito.innerHTML = carrito.length ? itemsHTML : '';
    if (listaCarritoModal) listaCarritoModal.innerHTML = carrito.length ? itemsHTML : textoVacio;

    // Actualizar totales en ambas vistas
    const totalFormateado = `$${total.toFixed(2)}`;
    if (totalCarrito) totalCarrito.innerText = totalFormateado;
    if (totalCarritoModal) totalCarritoModal.innerText = totalFormateado;

    // Actualizar contadores
    if (contadorCarrito) contadorCarrito.innerText = totalItems;
    if (contadorCarritoHeader) contadorCarritoHeader.innerText = totalItems;
}

function enviarPedidoWhatsApp() {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    const modalEntrega = document.getElementById('modal-entrega');
    if (modalEntrega) {
        modalEntrega.style.display = 'flex';
    }
}

function confirmarEntrega(metodoSeleccionado) {
    alert(`Usted seleccionó el servicio de: ${metodoSeleccionado}`);

    const modalEntrega = document.getElementById('modal-entrega');
    if (modalEntrega) modalEntrega.style.display = 'none';

    let mensaje = "Hola, quiero realizar el siguiente pedido:%0A%0A";
    let total = 0;

    carrito.forEach(item => {
        mensaje += `- ${item.nombre} (x${item.cantidad}): $${(item.precio * item.cantidad).toFixed(2)}%0A`;
        total += (item.precio * item.cantidad);
    });

    mensaje += `%0A*Total: $${total.toFixed(2)}*`;
    mensaje += `%0A*Método de entrega:* ${metodoSeleccionado}`;

    const numeroTelefono = "5358875588"; 
    const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${mensaje}`;

    window.open(urlWhatsApp, '_blank');
}

// ==========================================
// ⬆️⬇️ 7. BOTÓN FLOTANTE DESPLAZAMIENTO
// ==========================================
function configurarBotonScroll() {
    const btnScroll = document.getElementById('btn-scroll-flotante');
    const flecha = document.getElementById('flecha-scroll');
    if (!btnScroll || !flecha) return;

    window.addEventListener('scroll', () => {
        // Si el usuario bajó más de 300px, la flecha apunta hacia arriba
        if (window.scrollY > 300) {
            flecha.textContent = '↑';
        } else {
            flecha.textContent = '↓';
        }
    });

    btnScroll.addEventListener('click', () => {
        if (window.scrollY > 300) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    });
}

// ==========================================
// 🔄 8. SINCRO AUTO-REFRESCO
// ==========================================
function configurarSincronizacion() {
    window.addEventListener('storage', (e) => {
        if (e.key === 'actualizacionCatalogo') {
            window.location.reload();
        }
    });
}
