const path = require('path');
const sqlite3 = require('sqlite3');
const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();

// 1. Asegurar que la carpeta 'data' exista antes de conectar
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'database.sqlite');

// 2. Conectar a la base de datos y verificar la tabla de productos
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar a SQLite:', err.message);
    } else {
        console.log('Conectado con éxito a la base de datos SQLite.');
        
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

// Configuraciones básicas obligatorias
app.use(cors());
app.use(express.json());

// Ruta base de prueba
app.get('/', (req, res) => {
    res.send('El servidor de catalogo esta funcionando correctamente y listo.');
});

// RUTA GET: Obtener la lista de todos los productos
app.get('/productos', (req, res) => {
    const sql = 'SELECT * FROM productos';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// RUTA POST: Recibir un producto nuevo desde el administrador
app.post('/productos', (req, res) => {
    const { nombre, precio, imagen, descripcion } = req.body;
    
    if (!nombre || !precio) {
        return res.status(400).json({ error: 'El nombre y el precio son obligatorios.' });
    }
    
    const sql = `INSERT INTO productos (nombre, precio, imagen, descripcion) VALUES (?, ?, ?, ?)`;
    const params = [nombre, precio, imagen || '', descripcion || ''];
    
    db.run(sql, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            id: this.lastID,
            nombre,
            precio,
            imagen,
            descripcion
        });
    });
});

// Configuración del puerto para Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
