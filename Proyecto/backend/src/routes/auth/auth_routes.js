// src/routes/auth/auth_routes.js
// Endpoints de autenticación (login por credenciales y facial)

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verificarAuth } = require('../../middlewares/authMiddleware');
const { login, loginFacial, verificarSesion } = require('../../controller/auth/authcontroller');

// multer en memoria — la imagen no se guarda en disco,
// se pasa como Buffer directamente a Rekognition
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // máximo 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  },
});

// POST /api/auth/login
// Login con username + password
router.post('/login', login);

// POST /api/auth/login-facial
// Login por reconocimiento facial (enviar imagen como multipart)
router.post('/login-facial', upload.single('foto'), loginFacial);

// GET /api/auth/verificar-sesion
// Verifica que el token sigue siendo válido (ruta protegida)
router.get('/verificar-sesion', verificarAuth, verificarSesion);

module.exports = router;