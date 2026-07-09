const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();

// Configuración de Middlewares
app.use(cors());
app.use(express.json());

// Conexión y creación de la Base de Datos SQLite
const dbPath = path.resolve(__dirname, 'productos.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con SQLite:', err.message);
    } else {
        console.log('Conectado con éxito a la base de datos SQLite.');
        // Crear la tabla incluyendo la nueva columna 'seccion'
        db.run(`CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            precio REAL NOT NULL,
            imagen TEXT,
            seccion TEXT,
            descripcion TEXT
        )`);
    }
});

// ==========================================
// RUTAS DEL API
// ==========================================

// 1. RUTA GET: Obtener todos los productos
app.get('/productos', (req, res) => {
    const sql = 'SELECT * FROM productos';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// 2. RUTA POST: Registrar un nuevo producto (Incluye Sección)
app.post('/productos', (req, res) => {
    const { nombre, precio, imagen, seccion, descripcion } = req.body;
    
    if (!nombre || !precio) {
        return res.status(400).json({ error: 'El nombre y el precio son obligatorios.' });
    }

    const sql = 'INSERT INTO productos (nombre, precio, imagen, seccion, descripcion) VALUES (?, ?, ?, ?, ?)';
    const params = [nombre, precio, imagen || '', seccion || 'A', descripcion || ''];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            id: this.lastID,
            nombre,
            precio,
            imagen,
            seccion,
            descripcion
        });
    });
});

// 3. RUTA DELETE: Eliminar un producto por su ID (CORREGIDA)
app.delete('/productos/:id', (req, res) => {
    const { id: productoId } = req.params;
    const sql = 'DELETE FROM productos WHERE id = ?';
    
    db.run(sql, productoId, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'No se encontró el producto con ese ID.' });
        }
        res.json({ message: 'Producto eliminado con éxito', id: productoId });
    });
});

// ==========================================
// INICIO DEL SERVIDOR
// ==========================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
