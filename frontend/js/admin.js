const API_URL = 'https://tienda-lajoyita.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('form-producto');
    
    // 1. Cargar los productos apenas se abra el administrador
    cargarProductosParaEliminar();

    if (formulario) {
        formulario.addEventListener('submit', (e) => {
            e.preventDefault(); 

            const nombre = document.getElementById('nombre').value;
            const precio = parseFloat(document.getElementById('precio').value);
            const imagen = document.getElementById('imagen').value;
            const descripcion = document.getElementById('descripcion').value;

            const nuevoProducto = { nombre, precio, imagen, descripcion };

            fetch(`${API_URL}/productos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoProducto)
            })
            .then(response => {
                if (response.ok) {
                    alert('¡Producto agregado con éxito a La Joyita!');
                    formulario.reset();
                    cargarProductosParaEliminar(); // Recargar la lista automáticamente
                } else {
                    alert('Error al guardar el producto.');
                }
            })
            .catch(error => {
                console.error('Error de red:', error);
                alert('Hubo un aviso en la red.');
            });
        });
    }
});

// 2. Función para obtener los productos y dibujarlos en el panel de administración
function cargarProductosParaEliminar() {
    fetch(`${API_URL}/productos`)
        .then(res => res.json())
        .then(productos => {
            const contenedor = document.getElementById('contenedor-eliminar');
            if (!contenedor) return;
            
            contenedor.innerHTML = '';

            if (productos.length === 0) {
                contenedor.innerHTML = '<p>No hay productos en la base de datos.</p>';
                return;
            }

            // Crear una pequeña lista visual para el administrador
            productos.forEach(prod => {
                const fila = document.createElement('div');
                fila.style.display = 'flex';
                fila.style.justifyContent = 'space-between';
                fila.style.alignItems = 'center';
                fila.style.padding = '10px';
                fila.style.borderBottom = '1px solid #ccc';

                fila.innerHTML = `
                    <span><strong>${prod.nombre}</strong> - $${prod.precio.toFixed(2)}</span>
                    <button onclick="eliminarProductoDelServidor(${prod.id})" style="background-color: #ff4d4d; color: white; border: none; padding: 5px 10px; cursor: pointer;">
                        Eliminar
                    </button>
                `;
                contenedor.appendChild(fila);
            });
        })
        .catch(err => console.error('Error al cargar productos en admin:', err));
}

// 3. Función conectada al botón de eliminar
function eliminarProductoDelServidor(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto permanentemente?')) {
        fetch(`${API_URL}/productos/${id}`, {
            method: 'DELETE'
        })
        .then(res => {
            if (res.ok) {
                alert('Producto eliminado correctamente.');
                cargarProductosParaEliminar(); // Volver a pintar la lista actualizada
            } else {
                alert('No se pudo eliminar el producto.');
            }
        })
        .catch(err => console.error('Error al eliminar:', err));
    }
}
