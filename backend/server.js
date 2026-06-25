//Conexion apuntando a la carpeta 'data'
const path = requiere('path');
const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    // ... resto de codigo inicializacion
})
