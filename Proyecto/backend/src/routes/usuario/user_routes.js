// Endpoints de gestión de usuarios (registro, perfil, etc.)
// REEMPLAZA o complementa tu archivo existente

const express = require('express');
const router = express.Router();
const { verificarAuth } = require('../../middlewares/authMiddleware');
const { registrarUsuario, confirmarCorreo } = require('../../controller/usuario/registroController');

// POST /api/usuario/registro
// Registro de nuevo usuario (público — no requiere auth)
router.post('/registro', registrarUsuario);

// POST /api/usuario/confirmar-correo
// Confirmar correo con código de Cognito (público)
router.post('/confirmar-correo', confirmarCorreo);

// Aquí puedes agregar más rutas de usuario:
// router.get('/perfil', verificarAuth, perfilController.obtenerPerfil);
// router.put('/perfil', verificarAuth, perfilController.actualizarPerfil);

module.exports = router;