const path = require ('path')
const sqlite3 = require ('sqlite3')
const express = require ('express')
const cors = require ('cors')

const app = express();
const dbPath = path.join(__dirname, 'data', 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
	if (err) {
		console.error('Error al conectar a SQLite:', err.message);
	} else{
		console.error('Conectado con exito a la base de datos SQLite.');
	}
});

//Configuraciones basicas para tu API
app.use(cors());
app.use(express.json());

//Ruta de pruba para saber si el backend response
app.get('/', (req. res) => {
	res.send('El servidor de catalogo esta funcionando correctamente.');
});

//Escuchar en el puerto que te de render automaticamente
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
	console.log(`Servidor corriendo en el puerto ${PORT}`);
});
