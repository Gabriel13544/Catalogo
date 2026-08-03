// URL de tu servidor backend en Render
const API_URL = 'https://tienda-bikershop.onrender.com';

// Variables globales
let productosGlobales = [];
let carrito = [];

document.addEventListener('DOMContentLoaded', () => {
    obtenerProductos();
    cargarSeccionesCliente();
    configurarFiltro();
    configurarModalContacto(); // <-- NUEVO: Inicializa los eventos para la ventana de contacto

    // Enlazamos el botón de enviar pedido por WhatsApp
    const btnComprar = document.getElementById('btn-comprar');
    if (btnComprar) {
        btnComprar.addEventListener('click', enviarPedidoWhatsApp);
    }
});

// 1. CARGA Y RENDERIZADO DE PRODUCTOS
function obtenerProductos() {
    const contenedor = document.getElementById('contenedor-productos');
    
    fetch(`${API_URL}/productos`)
        .then(res => res.json())
        .then(productos => {
            productosGlobales = productos;
            renderizarProductos(productosGlobales);
        })
        .catch(err => {
            console.error('Error al cargar productos:', err);
            contenedor.innerHTML = '<p style="color: red;">Error al conectar con la tienda.</p>';
        });
}

function renderizarProductos(productos) {
    const contenedor = document.getElementById('contenedor-productos');
    contenedor.innerHTML = '';

    if (productos.length === 0) {
        contenedor.innerHTML = '<p>No se encontraron productos.</p>';
        return;
    }

    productos.forEach(prod => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-producto';
        const imagenHTML = (prod.imagen && prod.imagen.trim() !== '') 
            ? `<img src="${prod.imagen}" alt="${prod.nombre}">` : ''; 

        // Evita que nombres con comillas rompan la función de JS
        const nombreSeguro = prod.nombre.replace(/'/g, "\\'");

        tarjeta.innerHTML = `
            ${imagenHTML}
            <div class="contenido-tarjeta">
                <h3>${prod.nombre}</h3>
                <p>Sección: ${prod.seccion || 'Sin sección'}</p>
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
// 📞 GESTIÓN DEL MODAL DE CONTACTO (NUEVO)
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

    // Abrir al hacer clic en el logo o en el texto del encabezado
    if (btnLogo) btnLogo.addEventListener('click', abrirModal);
    if (btnTexto) btnTexto.addEventListener('click', abrirModal);

    // Cerrar al hacer clic en el botón de la equis "X"
    if (btnCerrar) btnCerrar.addEventListener('click', cerrarModal);

    // Cerrar al hacer clic fuera del recuadro blanco
    window.addEventListener('click', (e) => {
        if (e.target === modalContacto) {
            cerrarModal();
        }
    });
}

// ==========================================
// 📂 GESTIÓN DINÁMICA DE SECCIONES
// ==========================================
function cargarSeccionesCliente() {
    fetch(`${API_URL}/secciones`)
        .then(res => res.json())
        .then(secciones => {
            const selectFiltro = document.getElementById('filtro-seccion');
            if (!selectFiltro) return;

            // Opción por defecto requerida
            selectFiltro.innerHTML = '<option value="TODOS" selected>Todos los productos</option>';

            secciones.forEach(sec => {
                const opcion = document.createElement('option');
                opcion.value = sec.nombre;
                opcion.textContent = sec.nombre;
                selectFiltro.appendChild(opcion);
            });
        })
        .catch(err => console.error('Error al cargar secciones en la tienda:', err));
}

// 2. FILTRADO DE PRODUCTOS
function configurarFiltro() {
    const selectFiltro = document.getElementById('filtro-seccion');
    if (selectFiltro) {
        selectFiltro.addEventListener('change', (e) => {
            const val = e.target.value;
            renderizarProductos(val === 'TODOS' ? productosGlobales : productosGlobales.filter(p => p.seccion === val));
        });
    }
}

// 3. CARRITO Y ENVÍO POR WHATSAPP
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

    let mensaje = "Hola, quiero realizar el siguiente pedido:%0A%0A";
    let total = 0;

    carrito.forEach(item => {
        mensaje += `- ${item.nombre} (x${item.cantidad}): $${(item.precio * item.cantidad).toFixed(2)}%0A`;
        total += (item.precio * item.cantidad);
    });

    mensaje += `%0A*Total: $${total.toFixed(2)}*`;

    const numeroTelefono = "5358875588"; 
    const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${mensaje}`;

    window.open(urlWhatsApp, '_blank');
}
