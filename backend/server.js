const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Configuración de Middlewares (LÍMITE AMPLIADO PARA FOTOS BASE64)
app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 🔐 CONTRASEÑA SECRETA DEL ADMINISTRADOR
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'biker2026';

// ==========================================
// CONEXIÓN A MONGODB Y DEFINICIÓN DEL ESQUEMA
// ==========================================
// Lee la variable MONGODB_URI desde Render o usa una local para pruebas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bikershop';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Conectado con éxito a la base de datos MongoDB.'))
    .catch(err => console.error('Error al conectar con MongoDB:', err.message));

// Esquema y Modelo del Producto
const productoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    imagen: { type: String, default: '' },
    seccion: { type: String, default: 'A' },
    descripcion: { type: String, default: '' }
});

const Producto = mongoose.model('Producto', productoSchema);

// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================
app.post('/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        return res.json({ success: true, message: 'Acceso concedido.' });
    } else {
        return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }
});

// ==========================================
// RUTAS DEL API (PRODUCTOS)
// ==========================================

// 1. RUTA GET: Obtener todos los productos
app.get('/productos', async (req, res) => {
    try {
        const productos = await Producto.find();
        
        // Mapeamos _id de MongoDB a "id" para que coincida con tu frontend
        const productosMapeados = productos.map(prod => ({
            id: prod._id,
            nombre: prod.nombre,
            precio: prod.precio,
            imagen: prod.imagen,
            seccion: prod.seccion,
            descripcion: prod.descripcion
        }));

        res.json(productosMapeados);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. RUTA POST: Registrar un nuevo producto
app.post('/productos', async (req, res) => {
    const { nombre, precio, imagen, seccion, descripcion } = req.body;
    
    if (!nombre || !precio) {
        return res.status(400).json({ error: 'El nombre y el precio son obligatorios.' });
    }

    try {
        const nuevoProducto = new Producto({
            nombre,
            precio: parseFloat(precio),
            imagen: imagen || '',
            seccion: seccion || 'A',
            descripcion: descripcion || ''
        });

        await nuevoProducto.save();

        res.json({
            id: nuevoProducto._id,
            nombre: nuevoProducto.nombre,
            precio: nuevoProducto.precio,
            imagen: nuevoProducto.imagen,
            seccion: nuevoProducto.seccion,
            descripcion: nuevoProducto.descripcion
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. RUTA PUT: Actualizar un producto existente
app.put('/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, imagen, seccion, descripcion } = req.body;

    if (!nombre || !precio) {
        return res.status(400).json({ error: 'El nombre y el precio son obligatorios.' });
    }

    try {
        const productoActualizado = await Producto.findByIdAndUpdate(
            id,
            {
                nombre,
                precio: parseFloat(precio),
                imagen: imagen || '',
                seccion: seccion || 'A',
                descripcion: descripcion || ''
            },
            { new: true } // Retorna el objeto actualizado
        );

        if (!productoActualizado) {
            return res.status(404).json({ error: 'No se encontró el producto.' });
        }

        res.json({ message: 'Producto actualizado con éxito', id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. RUTA DELETE: Eliminar un producto por su ID
app.delete('/productos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const productoEliminado = await Producto.findByIdAndDelete(id);

        if (!productoEliminado) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        res.json({ message: 'Producto eliminado con éxito', id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// INICIO DEL SERVIDOR
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
