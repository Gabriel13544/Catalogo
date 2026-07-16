const API_URL = 'https://tienda-bikershop.onrender.com';
let todosLosProductos = []; 
let imagenBase64Actual = ""; // Guardará el texto de la imagen seleccionada

document.addEventListener('DOMContentLoaded', () => {
    // 🛡️ COMPROBACIÓN DE SEGURIDAD
    // Si el administrador ya inició sesión con éxito en esta pestaña, ocultamos el login y cargamos todo.
    if (sessionStorage.getItem('admin_autenticado') === 'true') {
        const pantallaLogin = document.getElementById('pantalla-login');
        if (pantallaLogin) pantallaLogin.style.display = 'none';
        obtenerProductosAdmin();
    }
    
    // Escuchar cuando el usuario seleccione una foto del dispositivo
    const inputImagen = document.getElementById('imagen-archivo');
    if (inputImagen) {
        inputImagen.addEventListener('change', procesarImagen);
    }

    // Escuchar el envío del formulario
    const formulario = document.getElementById('formulario-producto');
    if (formulario) {
        formulario.addEventListener('submit', guardarOActualizarProducto);
    }
});

// ==========================================
// 🔐 NUEVO: CONTROL DE ACCESO (LOGIN)
// ==========================================
function verificarPassword() {
    const passwordInput = document.getElementById('input-password');
    const errorMsg = document.getElementById('error-login');
    const btnIngresar = document.getElementById('btn-ingresar');
    const password = passwordInput ? passwordInput.value : '';

    if (!password) {
        alert("Por favor, ingresa una contraseña.");
        return;
    }

    // ⏳ Efecto de carga: Deshabilitamos el botón para evitar clics dobles mientras Render despierta
    if (btnIngresar) {
        btnIngresar.innerText = "Verificando... (Espere)";
        btnIngresar.disabled = true;
    }
    if (errorMsg) errorMsg.style.display = 'none';

    fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Contraseña incorrecta');
        }
        return res.json();
    })
    .then(data => {
        if (data.success) {
            // Guardamos sesión activa
            sessionStorage.setItem('admin_autenticado', 'true');
            
            const pantallaLogin = document.getElementById('pantalla-login');
            if (pantallaLogin) pantallaLogin.style.display = 'none';
            
            obtenerProductosAdmin();
        }
    })
    .catch(err => {
        console.error('Error de autenticación:', err);
        if (errorMsg) errorMsg.style.display = 'block';
        if (passwordInput) passwordInput.value = ''; // Limpiar input para reintentar
    })
    .finally(() => {
        // Restablecemos el botón una vez que la petición termine
        if (btnIngresar) {
            btnIngresar.innerText = "Ingresar";
            btnIngresar.disabled = false;
        }
    });
}

// ==========================================
// 📸 PROCESAMIENTO DE IMÁGENES
// ==========================================
function procesarImagen(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        imagenBase64Actual = event.target.result; // El texto listo para la base de datos
        document.getElementById('vista-previa-imagen').innerHTML = `<img src="${imagenBase64Actual}" style="max-width: 100px; border-radius: 5px;">`;
    };
    reader.readAsDataURL(archivo);
}

// ==========================================
// 🛒 GESTIÓN DE PRODUCTOS (GET, POST, PUT, DELETE)
// ==========================================

// 1. OBTENER Y LISTAR PRODUCTOS CON EL BOTÓN "EDITAR"
function obtenerProductosAdmin() {
    fetch(`${API_URL}/productos`)
        .then(res => res.json())
        .then(productos => {
            todosLosProductos = productos;
            const lista = document.getElementById('lista-productos-existentes');
            if (!lista) return;
            
            lista.innerHTML = '';
            productos.forEach(prod => {
                const div = document.createElement('div');
                div.className = 'item-admin-producto';
                div.style = "display: flex; justify-content: space-between; margin-bottom: 10px; padding: 10px; border-bottom: 1px solid #ccc;";
                div.innerHTML = `
                    <span><strong>${prod.nombre}</strong> - $${parseFloat(prod.precio).toFixed(2)} (${prod.seccion})</span>
                    <div>
                        <button class="btn-editar" style="background-color: #ffc107; border: none; padding: 5px 10px; cursor: pointer; margin-right: 5px; border-radius: 3px;" onclick="cargarFormularioEditar(${prod.id})">Editar</button>
                        <button class="btn-eliminar" style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;" onclick="eliminarProductoAdmin(${prod.id})">Eliminar</button>
                    </div>
                `;
                lista.appendChild(div);
            });
        })
        .catch(err => console.error('Error al cargar lista de administración:', err));
}

// 2. FUNCIÓN AL PRESIONAR "EDITAR": Pone los datos del producto en el formulario
function cargarFormularioEditar(id) {
    const producto = todosLosProductos.find(p => p.id === id);
    if (!producto) return;

    // Rellenar casillas
    document.getElementById('producto-id').value = producto.id;
    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('precio').value = producto.precio;
    document.getElementById('seccion').value = producto.seccion || 'A';
    document.getElementById('descripcion').value = producto.descripcion || '';
    
    // Mantener la imagen vieja en memoria por si no sube una nueva
    imagenBase64Actual = producto.imagen || '';
    if (producto.imagen) {
        document.getElementById('vista-previa-imagen').innerHTML = `<p style="margin: 5px 0; font-size: 14px; color: #555;">Imagen actual:</p><img src="${producto.imagen}" style="max-width: 100px; border-radius: 5px;">`;
    } else {
        document.getElementById('vista-previa-imagen').innerHTML = '';
    }

    // Cambiar aspecto del botón para avisar que edita
    document.getElementById('btn-guardar').innerText = "Actualizar Producto";
    document.getElementById('btn-guardar').style.backgroundColor = "#007bff"; // Azul para editar
    document.getElementById('btn-cancelar').style.display = "inline-block";
}

// Cancelar edición y limpiar formulario
function cancelarEdicion() {
    document.getElementById('formulario-producto').reset();
    document.getElementById('producto-id').value = '';
    imagenBase64Actual = '';
    document.getElementById('vista-previa-imagen').innerHTML = '';
    
    const btnGuardar = document.getElementById('btn-guardar');
    btnGuardar.innerText = "Guardar Producto";
    btnGuardar.style.backgroundColor = ""; // Regresa al estilo CSS por defecto (o pon #28a745)
    document.getElementById('btn-cancelar').style.display = "none";
}

// 3. PROCESAR CREACIÓN O ACTUALIZACIÓN
function guardarOActualizarProducto(e) {
    e.preventDefault();

    const id = document.getElementById('producto-id').value;
    const nombre = document.getElementById('nombre').value;
    const precio = document.getElementById('precio').value;
    const seccion = document.getElementById('seccion').value;
    const descripcion = document.getElementById('descripcion').value;

    const datosProducto = {
        nombre,
        precio: parseFloat(precio),
        imagen: imagenBase64Actual, // Enviamos el texto de la imagen
        seccion,
        descripcion
    };

    let url = `${API_URL}/productos`;
    let metodo = 'POST';

    // Si el ID oculto tiene número, significa que estamos EDITANDO en lugar de crear
    if (id) {
        url = `${API_URL}/productos/${id}`;
        metodo = 'PUT';
    }

    const btnGuardar = document.getElementById('btn-guardar');
    btnGuardar.innerText = "Procesando...";

    fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosProducto)
    })
    .then(res => res.json())
    .then(() => {
        alert(id ? "¡Producto actualizado correctamente!" : "¡Producto creado correctamente!");
        cancelarEdicion(); // Limpia el formulario y reestablece botones
        obtenerProductosAdmin(); // Recarga la lista visible
    })
    .catch(err => {
        console.error('Error al guardar/actualizar:', err);
        alert('Ocurrió un error en la operación.');
        btnGuardar.innerText = id ? "Actualizar Producto" : "Guardar Producto";
    });
}

// 4. ELIMINAR PRODUCTO
function eliminarProductoAdmin(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

    fetch(`${API_URL}/productos/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => {
            alert('Producto eliminado.');
            obtenerProductosAdmin();
        })
        .catch(err => console.error('Error al eliminar:', err));
}
    let url = `${API_URL}/productos`;
    let metodo = 'POST';

    // Si el ID oculto tiene número, significa que estamos EDITANDO en lugar de crear
    if (id) {
        url = `${API_URL}/productos/${id}`;
        metodo = 'PUT';
    }

    document.getElementById('btn-guardar').innerText = "Procesando...";

    fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosProducto)
    })
    .then(res => res.json())
    .then(() => {
        alert(id ? "¡Producto actualizado correctamente!" : "¡Producto creado correctamente!");
        cancelarEdicion(); // Limpia el formulario y reestablece botones
        obtenerProductosAdmin(); // Recarga la lista visible
    })
    .catch(err => {
        console.error('Error al guardar/actualizar:', err);
        alert('Ocurrió un error en la operación.');
        document.getElementById('btn-guardar').innerText = id ? "Actualizar Producto" : "Guardar Producto";
    });

// 4. ELIMINAR PRODUCTO
function eliminarProductoAdmin(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

    fetch(`${API_URL}/productos/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => {
            alert('Producto eliminado.');
            obtenerProductosAdmin();
        })
        .catch(err => console.error('Error al eliminar:', err));
}
