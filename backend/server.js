const path = require('path');
const sqlite3 = require('sqlite3');
const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();

// 1. Asegurar que la carpeta 'data' exista
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'database.sqlite');

// 2. Conectar a la base de datos y crear la tabla si no existe
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar a SQLite:', err.message);
    } else {
        console.log('Conectado con éxito a la base de datos SQLite.');
        
        // Crear la tabla de productos de forma automática
        db.run(`CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            precio REAL NOT NULL,
            imagen TEXT,
            descripcion TEXT
        )`, (createErr) => {
            if (createErr) {
                console.error('Error al crear la tabla productos:', createErr.message);
            } else {
                console.log('Tabla "productos" verificada/creada correctamente.');
            }
        });
    }
});

// Configuraciones básicas para tu API
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('El servidor de catalogo esta funcionando correctamente y listo.');
});

// ==========================================
// 🚀 LAS DOS RUTAS QUE HACÍAN FALTA
// ==========================================

// RUTA 1: Obtener todos los productos (Para app.js)
app.get('/productos', (req, res) => {
    const sql = 'SELECT * FROM productos';
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // Devuelve la lista completa de productos en formato JSON
        res.json(rows);
    });
});

// RUTA 2: Agregar un producto nuevo (Para admin.js)
app.post('/productos', (req, res) => {
    const { nombre, precio, imagen, descripcion } = req.body;
    
    // Validación básica por seguridad
    if (!nombre || !precio) {
        return res.status(400).json({ error: 'El nombre y el precio son obligatorios.' });
    }
    
    const sql = `INSERT INTO productos (nombre, precio, imagen, descripcion) VALUES (?, ?, ?, ?)`;
    const params = [nombre, precio, imagen || '', descripcion || ''];
    
    db.run(sql, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // Devuelve el producto que se acaba de crear junto con el ID que le asignó SQLite
        res.json({
            id: this.lastID,
            nombre,
            precio,
            imagen,
            descripcion
        });
    });
});

// Escuchar en el puerto automático de Render o en el 10000 localmente
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
