// URL de tu backend en Render
const API_URL = 'https://tienda-bikershop.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('form-producto');
    
    // 1. Cargar los productos existentes apenas se abra el administrador
    cargarProductosParaEliminar();

    if (formulario) {
        formulario.addEventListener('submit', (e) => {
            e.preventDefault(); 

            // Capturamos todos los valores del formulario
            const nombre = document.getElementById('nombre').value;
            const precio = parseFloat(document.getElementById('precio').value);
            const imagen = document.getElementById('imagen').value;
            const seccion = document.getElementById('seccion').value; // 👈 Captura la sección elegida (A, B, C...)
            const descripcion = document.getElementById('descripcion').value;

            // Creamos el objeto incluyendo la sección
            const nuevoProducto = { nombre, precio, imagen, seccion, descripcion };

            // Enviamos los datos al backend (POST)
            fetch(`${API_URL}/productos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nuevoProducto)
            })
            .then(response => {
                if (response.ok) {
                    alert(`¡${nombre} se agregó con éxito a la Sección ${seccion}!`);
                    formulario.reset(); // Limpia los campos del formulario
                    cargarProductosParaEliminar(); // Recarga la lista de abajo automáticamente
                } else {
                    alert('El servidor recibió el producto pero devolvió un error al guardar.');
                }
            })
            .catch(error => {
                console.error('Error de red:', error);
                alert('Hubo un aviso en la red, pero revisa la lista de abajo por si acaso.');
            });
        });
    }
});

// 2. Función para obtener los productos desde Render y dibujarlos en el panel de administración
function cargarProductosParaEliminar() {
    fetch(`${API_URL}/productos`)
        .then(res => res.json())
        .then(productos => {
            const contenedor = document.getElementById('contenedor-eliminar');
            if (!contenedor) return;
            
            contenedor.innerHTML = ''; // Limpiar el contenedor antes de pintar

            if (productos.length === 0) {
                contenedor.innerHTML = '<p style="color: #666;">No hay productos registrados en la base de datos.</p>';
                return;
            }

            // Pintar cada producto con su sección y su botón de borrado
            productos.forEach(prod => {
                const fila = document.createElement('div');
                fila.style.display = 'flex';
                fila.style.justifyContent = 'space-between';
                fila.style.alignItems = 'center';
                fila.style.padding = '10px';
                fila.style.borderBottom = '1px solid #eee';

                // Mostramos el nombre y la sección entre paréntesis para control del administrador
                fila.innerHTML = `
                    <span><strong>${prod.nombre}</strong> <small style="color:#28a745; margin-left:10px;">(Sec. ${prod.seccion || 'Ninguna'})</small> - $${prod.precio.toFixed(2)}</span>
                    <button onclick="eliminarProductoDelServidor(${prod.id})" style="background-color: #ff4d4d; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px;">
                        Eliminar
                    </button>
                `;
                contenedor.appendChild(fila);
            });
        })
        .catch(err => console.error('Error al cargar productos en el admin:', err));
}

// 3. Función conectada al botón rojo de eliminar
function eliminarProductoDelServidor(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto permanentemente de la tienda?')) {
        fetch(`${API_URL}/productos/${id}`, {
            method: 'DELETE'
        })
        .then(res => {
            if (res.ok) {
                alert('Producto eliminado correctamente.');
                cargarProductosParaEliminar(); // Volver a pintar la lista actualizada
            } else {
                alert('No se pudo eliminar el producto del servidor.');
            }
        })
        .catch(err => console.error('Error al eliminar:', err));
    }
}
