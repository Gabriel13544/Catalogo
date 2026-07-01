// URL de tu backend en Render
const API_URL = 'https://tienda-lajoyita.onrender.com';

// Esperar a que la página HTML cargue por completo
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
});

// Función para obtener los productos desde el servidor en Render
function cargarProductos() {
    fetch(`${API_URL}/productos`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los productos del servidor');
            }
            return response.json(); // Convertir la respuesta a formato JSON
        })
        .then(productos => {
            mostrarProductos(productos);
        })
        .catch(error => {
            console.error('Error de conexión:', error);
            const contenedor = document.getElementById('contenedor-productos');
            if (contenedor) {
                contenedor.innerHTML = `<p class="error">No se pudo cargar el catálogo en este momento. Inténtalo más tarde.</p>`;
            }
        });
}

// Función para renderizar los productos en el HTML dinámicamente
function mostrarProductos(productos) {
    const contenedor = document.getElementById('contenedor-productos');
    
    if (!contenedor) {
        console.warn('No se encontró el elemento HTML con id "contenedor-productos".');
        return;
    }

    // Limpiar el contenedor por si tiene texto de "Cargando..."
    contenedor.innerHTML = '';

    // Si la base de datos está vacía, mostrar un aviso agradable
    if (productos.length === 0) {
        contenedor.innerHTML = `<p class="vacio">Aún no hay productos disponibles en el catálogo.</p>`;
        return;
    }

    // Recorrer la lista de productos y crear la estructura visual para cada uno
    productos.forEach(producto => {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('tarjeta-producto');

        // Validar si el producto tiene una imagen cargada, si no poner una por defecto
        const imagenUrl = producto.imagen ? producto.imagen : 'https://via.placeholder.com/200';

        tarjeta.innerHTML = `
            <img src="${imagenUrl}" alt="${producto.nombre}" class="producto-imagen">
            <div class="producto-info">
                <h3 class="producto-nombre">${producto.nombre}</h3>
                <p class="producto-descripcion">${producto.descripcion || 'Sin descripción disponible.'}</p>
                <div class="producto-footer">
                    <span class="producto-precio">$${producto.precio.toFixed(2)}</span>
                    <button class="btn-comprar" onclick="comprarProducto('${producto.nombre}')">Comprar</button>
                </div>
            </div>
        `;

        contenedor.appendChild(tarjeta);
    });
}

// Función de ejemplo por si hacen clic en comprar
function comprarProducto(nombre) {
    alert(`¡Gracias por tu interés! Pronto podrás adquirir "${nombre}" directamente.`);
}
