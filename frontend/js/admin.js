// URL de tu backend en Render
const API_URL = 'https://tienda-lajoyita.onrender.com';

// Esperar a que el HTML cargue por completo
document.addEventListener('DOMContentLoaded', () => {
    // 1. Buscar el formulario en tu HTML (asumiendo que tenga id="form-producto")
    const formulario = document.getElementById('form-producto');

    if (formulario) {
        formulario.addEventListener('submit', (e) => {
            e.preventDefault(); // Evitar que la página se recargue

            // 2. Capturar los valores de los inputs de tu HTML
            const nombre = document.getElementById('nombre').value;
            const precio = parseFloat(document.getElementById('precio').value);
            const imagen = document.getElementById('imagen').value;
            const descripcion = document.getElementById('descripcion').value;

            // 3. Crear el objeto con los datos del producto
            const nuevoProducto = {
                nombre,
                precio,
                imagen,
                descripcion
            };

            // 4. Enviar los datos al backend en Render usando POST
            fetch(`${API_URL}/productos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nuevoProducto)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }
                return response.json();
            })
            .then(data => {
                alert('¡Producto agregado con éxito a La Joyita!');
                formulario.reset(); // Limpiar el formulario
                console.log('Producto registrado:', data);
            })
            .catch(error => {
                console.error('Error al guardar el producto:', error);
                alert('Hubo un problema al guardar el producto.');
            });
        });
    } else {
        console.warn('No se encontró ningún formulario con el id "form-producto".');
    }
});
