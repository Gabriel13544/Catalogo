const API_URL = 'https://tienda-bikershop.onrender.com';

const CLAVE_CORRECTA = 'biker2026'; 

let listaProductos = [];

document.addEventListener('DOMContentLoaded', () => {
    // Validar contraseña antes de cargar el inventario
    if (!validarAccesoAdmin()) return;

    cargarProductosAdmin();

    const form = document.getElementById('form-producto');
    if (form) {
        form.addEventListener('submit', guardarProducto);
    }
});

// 0. VERIFICACIÓN DE CONTRASEÑA
function validarAccesoAdmin() {
    const autenticado = sessionStorage.getItem('adminAutenticado');

    if (autenticado === 'true') {
        return true;
    }

    const pass = prompt("🔒 Acceso Restringido\nIngresa la contraseña de administrador:");

    if (pass === CLAVE_CORRECTA) {
        sessionStorage.setItem('adminAutenticado', 'true');
        return true;
    } else {
        alert("❌ Contraseña incorrecta.");
        window.location.href = "index.html"; // Redirige a la tienda principal
        return false;
    }
}

// 1. CARGAR INVENTARIO DE PRODUCTOS
function cargarProductosAdmin() {
    const contenedor = document.getElementById('lista-admin-productos');
    
    fetch(`${API_URL}/productos`)
        .then(res => res.json())
        .then(productos => {
            listaProductos = productos;
            renderizarInventario(listaProductos);
        })
        .catch(err => {
            console.error('Error al obtener inventario:', err);
            if (contenedor) {
                contenedor.innerHTML = '<p style="color:red;">Error al conectar con el servidor.</p>';
            }
        });
}

// 2. RENDERIZAR LISTA CON CATEGORÍA Y SUBCATEGORÍA
function renderizarInventario(productos) {
    const contenedor = document.getElementById('lista-admin-productos');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';

    if (productos.length === 0) {
        contenedor.innerHTML = '<p style="color: #777;">No hay productos registrados.</p>';
        return;
    }

    productos.forEach(prod => {
        const item = document.createElement('div');
        item.className = 'item-admin-producto';
        
        item.innerHTML = `
            <div style="flex: 1;">
                <strong>${prod.nombre}</strong> - <span style="color: #28a745; font-weight: bold;">$${parseFloat(prod.precio).toFixed(2)}</span>
                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                    📂 <b>Categoría:</b> ${prod.categoria || prod.seccion || 'N/A'} | 
                    🏷️ <b>Subcategoría:</b> ${prod.subcategoria || 'N/A'}
                </div>
            </div>
            <div style="display: flex; gap: 6px;">
                <button class="btn-editar" onclick="prepararEdicion('${prod.id}')">✏️ Editar</button>
                <button class="btn-eliminar" onclick="eliminarProducto('${prod.id}')">🗑️ Eliminar</button>
            </div>
        `;
        contenedor.appendChild(item);
    });
}

// 3. FILTRAR INVENTARIO EN TIEMPO REAL
function filtrarInventarioAdmin() {
    const query = document.getElementById('input-admin-buscar').value.toLowerCase().trim();
    const filtrados = listaProductos.filter(p => 
        p.nombre.toLowerCase().includes(query) ||
        (p.categoria && p.categoria.toLowerCase().includes(query)) ||
        (p.subcategoria && p.subcategoria.toLowerCase().includes(query))
    );
    renderizarInventario(filtrados);
}

// 4. GUARDAR O ACTUALIZAR PRODUCTO
async function guardarProducto(e) {
    e.preventDefault();

    const id = document.getElementById('prod-id').value;
    const nombre = document.getElementById('prod-nombre').value.trim();
    const precio = parseFloat(document.getElementById('prod-precio').value);
    const categoria = document.getElementById('prod-categoria').value.trim();
    const subcategoria = document.getElementById('prod-subcategoria').value.trim();
    const urlImagenInput = document.getElementById('prod-imagen-url').value.trim();
    const archivoImagenInput = document.getElementById('prod-imagen-file').files[0];

    let imagenFinal = urlImagenInput;

    // Convertir imagen local a Base64 si se adjuntó un archivo
    if (archivoImagenInput) {
        imagenFinal = await convertirBase64(archivoImagenInput);
    }

    const payload = {
        nombre,
        precio,
        categoria,      // Ej. "AX100"
        seccion: categoria, // Mantenemos compatibilidad por si se usa en el backend
        subcategoria,   // Ej. "Asientos"
        imagen: imagenFinal
    };

    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/productos/${id}` : `${API_URL}/productos`;

    fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => {
        if (!res.ok) throw new Error('Error al guardar el producto.');
        return res.json();
    })
    .then(() => {
        alert(id ? '✅ Producto actualizado correctamente.' : '✅ Producto agregado al catálogo.');
        resetearFormulario();
        cargarProductosAdmin();
    })
    .catch(err => {
        console.error(err);
        alert('❌ Ocurrió un error al guardar el producto.');
    });
}

// 5. PREPARAR FORMULARIO PARA EDICIÓN
function prepararEdicion(id) {
    const prod = listaProductos.find(p => p.id === id);
    if (!prod) return;

    document.getElementById('prod-id').value = prod.id;
    document.getElementById('prod-nombre').value = prod.nombre;
    document.getElementById('prod-precio').value = prod.precio;
    document.getElementById('prod-categoria').value = prod.categoria || prod.seccion || '';
    document.getElementById('prod-subcategoria').value = prod.subcategoria || '';
    document.getElementById('prod-imagen-url').value = prod.imagen || '';

    document.getElementById('titulo-form').innerText = '✏️ Editar Producto';
    document.getElementById('btn-guardar').innerText = 'Actualizar Producto';
    document.getElementById('btn-cancelar').style.display = 'inline-block';
}

// 6. RESETEAR FORMULARIO
function resetearFormulario() {
    document.getElementById('form-producto').reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('titulo-form').innerText = '➕ Agregar Nuevo Producto';
    document.getElementById('btn-guardar').innerText = 'Guardar Producto';
    document.getElementById('btn-cancelar').style.display = 'none';
}

// 7. ELIMINAR PRODUCTO
function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

    fetch(`${API_URL}/productos/${id}`, {
        method: 'DELETE'
    })
    .then(res => {
        if (!res.ok) throw new Error('Error al eliminar');
        alert('🗑️ Producto eliminado.');
        cargarProductosAdmin();
    })
    .catch(err => {
        console.error(err);
        alert('❌ No se pudo eliminar el producto.');
    });
}

// Función auxiliar para convertir archivo de imagen a string Base64
function convertirBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
