// Instala primero las dependencias con:
// npm install express cors

const express = require('express');
const cors = require('cors');
const http = require('http');

require("dotenv").config();

// para probar la db
const { testConnection } = require("./src/config/db");
const { setupChatWebSocket } = require("./src/websocket/chatSocket");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Importar rutas principales
const indexRoutes = require('./src/routes/index_routes');

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta básica
app.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    mensaje: 'API funcionando'
  });
});

// Todas las rutas iniciarán con /api
app.use('/api', indexRoutes);

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: 'Ruta no encontrada'
  });
});

// test para probar la conexion a la db
testConnection();
setupChatWebSocket(server);

// Iniciar servidor
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});
