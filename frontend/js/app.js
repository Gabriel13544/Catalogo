// URL oficial de tu servidor en Render
const API_URL = 'https://tienda-lajoyita.onrender.com';

// Arreglo global para almacenar los artículos del carrito
let carrito = JSON.parse(localStorage.getItem('carrito-lajoyita')) || [];

// Esperar a que la página cargue por completo
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    actualizarVistaCarrito(); // Renderiza el carrito guardado si existe
});

// ==========================================
// 📦 SECCIÓN: CATÁLOGO DE PRODUCTOS
// ==========================================

function cargarProductos() {
    fetch(`${API_URL}/productos`)
        .then(response => {
            if (!response.ok) throw new Error('Error al obtener productos');
            return response.json();
        })
        .then(productos => {
            mostrarProductos(productos);
        })
        .catch(error => {
            console.error('Error de conexión:', error);
            const contenedor = document.getElementById('contenedor-productos');
            if (contenedor) {
                contenedor.innerHTML = `<p class="error">No se pudo conectar al catálogo. Revisa tu conexión.</p>`;
            }
        });
}

function mostrarProductos(productos) {
    const contenedor = document.getElementById('contenedor-productos');
    if (!contenedor) return;

    contenedor.innerHTML = '';

    if (productos.length === 0) {
        contenedor.innerHTML = `<p class="vacio">No hay productos disponibles en este momento.</p>`;
        return;
    }

    productos.forEach(producto => {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('tarjeta-producto');

        const imagenUrl = producto.imagen ? producto.imagen : 'https://via.placeholder.com/200';

        tarjeta.innerHTML = `
            <img src="${imagenUrl}" alt="${producto.nombre}" class="producto-imagen">
            <div class="producto-info">
                <h3 class="producto-nombre">${producto.nombre}</h3>
                <p class="producto-descripcion">${producto.descripcion || 'Sin descripción disponible.'}</p>
                <div class="producto-footer">
                    <span class="producto-precio">$${producto.precio.toFixed(2)}</span>
                    <button class="btn-agregar" onclick="agregarAlCarrito(${producto.id}, '${producto.nombre}', ${producto.precio})">
                        Agregar al carrito
                    </button>
                </div>
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });
}

// ==========================================
// 🛒 SECCIÓN: LÓGICA DEL CARRITO DE COMPRAS
// ==========================================

// Función para añadir un artículo o sumar su cantidad
function agregarAlCarrito(id, nombre, precio) {
    // Verificar si el producto ya está en el carrito
    const productoExistente = carrito.find(item => item.id === id);

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        // Si es nuevo, lo empujamos al arreglo con cantidad inicial 1
        carrito.push({ id, nombre, precio, cantidad: 1 });
    }

    guardarYActualizar();
}

// Eliminar o restar cantidad de un producto
function eliminarDelCarrito(id) {
    const productoIndex = carrito.findIndex(item => item.id === id);
    
    if (productoIndex !== -1) {
        carrito[productoIndex].cantidad -= 1;
        // Si la cantidad llega a 0, removemos el producto por completo de la lista
        if (carrito[productoIndex].cantidad <= 0) {
            carrito.splice(productoIndex, 1);
        }
    }
    guardarYActualizar();
}

// Guarda en localStorage y redibuja los elementos en la pantalla
function guardarYActualizar() {
    localStorage.setItem('carrito-lajoyita', JSON.stringify(carrito));
    actualizarVistaCarrito();
}

// Actualiza el contenedor visual del carrito en el HTML
function actualizarVistaCarrito() {
    const listaCarrito = document.getElementById('lista-carrito');
    const totalCarrito = document.getElementById('total-carrito');
    const contadorCarrito = document.getElementById('contador-carrito');

    if (!listaCarrito || !totalCarrito) return;

    listaCarrito.innerHTML = '';
    let total = 0;
    let totalItems = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        totalItems += item.cantidad;

        const li = document.createElement('li');
        li.classList.add('item-carrito');
        li.innerHTML = `
            <div class="item-detalles">
                <span class="item-nombre">${item.nombre}</span>
                <span class="item-cantidad">x${item.cantidad}</span>
            </div>
            <div class="item-acciones">
                <span class="item-subtotal">$${subtotal.toFixed(2)}</span>
                <button class="btn-restar" onclick="eliminarDelCarrito(${item.id})">-</button>
            </div>
        `;
        listaCarrito.appendChild(li);
    });

    // Actualizar los textos de totales en la interfaz
    totalCarrito.innerText = `$${total.toFixed(2)}`;
    if (contadorCarrito) {
        contadorCarrito.innerText = totalItems;
    }
}
