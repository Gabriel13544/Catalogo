// URL de tu servidor backend en Render (Asegúrate de que esta sea la correcta)
const API_URL = 'https://tienda-lajoyita.onrender.com';

// Variables globales
let productosGlobales = [];
let carrito = [];

document.addEventListener('DOMContentLoaded', () => {
    obtenerProductos();
    configurarFiltro();
});

// 1. CARGA Y RENDERIZADO
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

        tarjeta.innerHTML = `
            ${imagenHTML}
            <div class="contenido-tarjeta">
                <h3>${prod.nombre}</h3>
                <p>Sección: ${prod.seccion || 'A'}</p>
                <div class="precio">$${parseFloat(prod.precio).toFixed(2)}</div>
                <button class="btn-accion" onclick="agregarAlCarrito(${prod.id}, '${prod.nombre}', ${prod.precio})">
                    Comprar
                </button>
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });
}

// 2. FILTRADO
function configurarFiltro() {
    const selectFiltro = document.getElementById('filtro-seccion');
    if (selectFiltro) {
        selectFiltro.addEventListener('change', (e) => {
            const val = e.target.value;
            renderizarProductos(val === 'TODAS' ? productosGlobales : productosGlobales.filter(p => p.seccion === val));
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
            <button class="btn-eliminar-carrito" onclick="eliminarDelCarrito(${item.id})">X</button>
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

    // REEMPLAZA EL 521XXXXXXXXXX POR TU NÚMERO CON CÓDIGO DE PAÍS
    const numeroTelefono = "521XXXXXXXXXX"; 
    const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${mensaje}`;

    window.open(urlWhatsApp, '_blank');
}
