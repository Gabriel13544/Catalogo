const path = require('path');
const sqlite3 = require('sqlite3');
const express = require('express');
const cors = require('cors');
const fs = require('fs'); // <-- Agregamos esto

const app = express();

// Asegurar que la carpeta 'data' exista antes de conectar la base de datos
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar a SQLite:', err.message);
    } else {
        console.log('Conectado con éxito a la base de datos SQLite.');
    }
});

// Configuraciones basicas para tu API
app.use(cors());
app.use(express.json());

// Ruta de prueba para saber si el backend responde
app.get('/', (req, res) => {
    res.send('El servidor de catalogo esta funcionando correctamente.');
});

// Escuchar en el puerto que te de render automaticamente
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
