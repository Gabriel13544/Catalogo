// URL de tu backend en Render
const API_URL = 'https://tienda-lajoyita.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('form-producto');

    if (formulario) {
        formulario.addEventListener('submit', (e) => {
            e.preventDefault(); 

            const nombre = document.getElementById('nombre').value;
            const precio = parseFloat(document.getElementById('precio').value);
            const imagen = document.getElementById('imagen').value;
            const descripcion = document.getElementById('descripcion').value;

            const nuevoProducto = { nombre, precio, imagen, descripcion };

            // Enviamos los datos al backend
            fetch(`${API_URL}/productos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nuevoProducto)
            })
            .then(response => {
                // Si el servidor responde con un estado 200-299, todo está perfecto
                if (response.ok) {
                    alert('¡Producto agregado con éxito a La Joyita!');
                    formulario.reset(); // Limpiar formulario
                } else {
                    alert('El servidor recibió el producto pero devolvió un error.');
                }
            })
            .catch(error => {
                // Aquí solo entra si verdaderamente NO hay internet o Render está caído
                console.error('Error de red:', error);
                alert('Hubo un aviso en la red, pero revisa el catálogo por si acaso.');
            });
        });
    }
});
