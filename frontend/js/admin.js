// La URL de tu servidor en Render
const API_URL = 'https://tienda-lajoyita.onrender.com';

// Ejemplo de función para guardar un producto nuevo
function guardarProducto(nuevoProducto) {
    fetch(`${API_URL}/productos`, { // Suponiendo que crees una ruta /productos
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoProducto)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Producto guardado con éxito:', data);
    })
    .catch(error => console.error('Error al guardar producto:', error));
}
