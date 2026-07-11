// URL de tu servidor backend en Render
const API_URL = 'https://tienda-lajoyita.onrender.com';

// Variables globales para almacenar los datos
let productosGlobales = [];
let carrito = [];

// Esperar a que el HTML cargue completamente antes de ejecutar los scripts
document.addEventListener('DOMContentLoaded', () => {
    obtenerProductos();
    configurarFiltro();
    configurarBotonCompra();
});

// ==========================================
// 1. CARGA Y RENDERIZADO DE PRODUCTOS
// ==========================================

// Obtener los productos desde el servidor de Render
function obtenerProductos() {
    const contenedor = document.getElementById('contenedor-productos');
    
    fetch(`${API_URL}/productos`)
        .then(res => res.json())
        .then(productos => {
            productosGlobales = productos; // Guardamos una copia para poder filtrar después
            renderizarProductos(productosGlobales);
        })
        .catch(err => {
            console.error('Error al cargar productos:', err);
            contenedor.innerHTML = '<p style="color: red;">Error al conectar con la tienda. Intenta recargar la página.</p>';
        });
}

// Pintar los productos en la pantalla
function renderizarProductos(productos) {
    const contenedor = document.getElementById('contenedor-productos');
    contenedor.innerHTML = ''; // Limpiamos el contenedor

    if (productos.length === 0) {
        contenedor.innerHTML = '<p>No se encontraron productos en esta sección.</p>';
        return;
    }

    productos.forEach(prod => {
        // Creamos la tarjeta principal
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-producto';

        // 🌟 MAGIA AQUÍ: Evaluamos si hay imagen. 
        // Si hay texto, creamos la etiqueta. Si está vacío, no ponemos nada ('').
        const imagenHTML = (prod.imagen && prod.imagen.trim() !== '') 
            ? `<img src="${prod.imagen}" alt="${prod.nombre}">` 
            : ''; 

        // Estructura interna de la tarjeta usando las clases del styles.css
        tarjeta.innerHTML = `
            ${imagenHTML}
            
            <div class="contenido-tarjeta">
                <h3>${prod.nombre}</h3>
                <span class="etiqueta-seccion">Sección ${prod.seccion || 'A'}</span>
                <p>${prod.descripcion || 'Sin descripción disponible.'}</p>
                <div class="precio">$${prod.precio.toFixed(2)}</div>
                
                <button class="btn-accion" onclick="agregarAlCarrito(${prod.id}, '${prod.nombre}', ${prod.precio})">
                    Comprar
                </button>
            </div>
        `;
        
        contenedor.appendChild(tarjeta);
    });
}

// ==========================================
// 2. SISTEMA DE FILTRADO POR SECCIONES
// ==========================================
function configurarFiltro() {
    const selectFiltro = document.getElementById('filtro-seccion');
    
    if (selectFiltro) {
        selectFiltro.addEventListener('change', (e) => {
            const seccionElegida = e.target.value;
            
            if (seccionElegida === 'TODAS') {
                renderizarProductos(productosGlobales); // Muestra todo
            } else {
                // Filtra solo los productos que coincidan con la letra elegida
                const productosFiltrados = productosGlobales.filter(prod => prod.seccion === seccionElegida);
                renderizarProductos(productosFiltrados);
            }
        });
    }
}

// ==========================================
// 3. FUNCIONES DEL CARRITO DE COMPRAS
// ==========================================

function agregarAlCarrito(id, nombre, precio) {
    carrito.push({ id, nombre, precio });
    actualizarCarrito();
}

function eliminarDelCarrito(indice) {
    carrito.splice(indice, 1); // Elimina 1 elemento en la posición 'indice'
    actualizarCarrito();
}

function actualizarCarrito() {
    const listaCarrito = document.getElementById('lista-carrito');
    const totalCarrito = document.getElementById('total-carrito');
    const contadorCarrito = document.getElementById('contador-carrito');
    
    // Limpiar lista actual
    listaCarrito.innerHTML = '';
    
    let total = 0;

    // Pintar los items en la barra lateral
    carrito.forEach((item, indice) => {
        total += item.precio;
        
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.nombre}</span>
            <div>
                <span>$${item.precio.toFixed(2)}</span>
                <button class="btn-eliminar-carrito" onclick="eliminarDelCarrito(${indice})" style="margin-left: 10px;">X</button>
            </div>
        `;
        listaCarrito.appendChild(li);
    });

    // Actualizar los números de la interfaz
    totalCarrito.innerText = `$${total.toFixed(2)}`;
    contadorCarrito.innerText = carrito.length;
}

function configurarBotonCompra() {
    const btnComprar = document.getElementById('btn-comprar');
    
    if (btnComprar) {
        btnComprar.addEventListener('click', () => {
            if (carrito.length === 0) {
                alert('El carrito está vacío. Añade algunos productos primero.');
                return;
            }
            
            alert(`¡Gracias por tu pedido! El total es de ${document.getElementById('total-carrito').innerText}. Nos contactaremos contigo pronto.`);
            
            // Vaciar el carrito después de "comprar"
            carrito = [];
            actualizarCarrito();
        });
    }
}

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
