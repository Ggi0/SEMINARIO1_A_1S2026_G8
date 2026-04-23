// Endpoints de gestión de usuarios (registro, perfil, etc.)
// REEMPLAZA o complementa tu archivo existente

const express = require('express');
const router = express.Router();
const { verificarAuth } = require('../../middlewares/authMiddleware');
const { registrarUsuario, confirmarCorreo } = require('../../controller/usuario/registroController');
const { obtenerPerfil, actualizarPerfil } = require('../../controller/usuario/perfilController');
const {
  listarUsuariosDisponibles,
  listarSolicitudesRecibidas,
  listarSolicitudesEnviadas,
  enviarSolicitud,
  aceptarSolicitud,
  rechazarSolicitud,
  listarAmigos,
} = require('../../controller/usuario/amistadesController');

// POST /api/usuario/registro
// Registro de nuevo usuario (público — no requiere auth)
router.post('/registro', registrarUsuario);

// POST /api/usuario/confirmar-correo
// Confirmar correo con código de Cognito (público)
router.post('/confirmar-correo', confirmarCorreo);
router.get('/perfil', verificarAuth, obtenerPerfil);
router.put('/perfil', verificarAuth, actualizarPerfil);
router.get('/usuarios-disponibles', verificarAuth, listarUsuariosDisponibles);
router.get('/solicitudes/recibidas', verificarAuth, listarSolicitudesRecibidas);
router.get('/solicitudes/enviadas', verificarAuth, listarSolicitudesEnviadas);
router.post('/solicitudes/:usuarioId', verificarAuth, enviarSolicitud);
router.put('/solicitudes/:solicitudId/aceptar', verificarAuth, aceptarSolicitud);
router.put('/solicitudes/:solicitudId/rechazar', verificarAuth, rechazarSolicitud);
router.get('/amigos', verificarAuth, listarAmigos);

module.exports = router;
