// La URL de tu servidor en Render
const API_URL = 'https://tienda-lajoyita.onrender.com';

// Función para obtener los productos de la base de datos
function cargarProductos() {
    fetch(`${API_URL}/`) // Apunta a la ruta principal de tu backend
        .then(response => response.text())
        .then(mensaje => {
            console.log('Respuesta del servidor:', mensaje);
            // Aquí agregarás la lógica para pintar los productos en el HTML
        })
        .catch(error => console.error('Error al conectar con el servidor:', error));
}

// Ejecutar la función cuando cargue la página
document.addEventListener('DOMContentLoaded', cargarProductos);
