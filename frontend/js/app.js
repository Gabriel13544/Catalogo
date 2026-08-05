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

    // Enlazamos el botón de enviar pedido
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

        // Comprueba si coincide la categoría seleccionada
        const coincideCategoria = (categoriaSeleccionada === 'TODOS' || catProducto === categoriaSeleccionada);
        
        // Comprueba si el texto buscado coincide con Nombre, Categoría o Subcategoría
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
        // Filtra en tiempo real conforme el usuario escribe
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
// 🛒 5. CARRITO Y ENVÍO POR WHATSAPP
// ==========================================
function agregarAlCarrito(id, nombre, precio) {
    const existente = carrito.find(item => item.id === id);
    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({ id, nombre, precio, cantidad: 1 });
    }
    actualizarCarrito();
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    actualizarCarrito();
}

function actualizarCarrito() {
    const listaCarrito = document.getElementById('lista-carrito');
    const totalCarrito = document.getElementById('total-carrito');
    const contadorCarrito = document.getElementById('contador-carrito');
    
    if (!listaCarrito) return;

    listaCarrito.innerHTML = '';
    let total = 0;
    let totalItems = 0;

    carrito.forEach(item => {
        total += (item.precio * item.cantidad);
        totalItems += item.cantidad;

        const li = document.createElement('li');
        li.className = 'item-carrito';
        li.innerHTML = `
            <span>${item.nombre} x${item.cantidad}</span>
            <span>$${(item.precio * item.cantidad).toFixed(2)}</span>
            <button class="btn-eliminar-carrito" onclick="eliminarDelCarrito('${item.id}')">X</button>
        `;
        listaCarrito.appendChild(li);
    });

    totalCarrito.innerText = `$${total.toFixed(2)}`;
    if (contadorCarrito) contadorCarrito.innerText = totalItems;
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
