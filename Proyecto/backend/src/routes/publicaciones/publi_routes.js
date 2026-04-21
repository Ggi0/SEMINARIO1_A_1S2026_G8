const express = require('express');
const router = express.Router();
const { verificarAuth } = require('../../middlewares/authMiddleware');
const {
  validarCrearPublicacion,
  validarComentario,
  validarTraduccion,
  validarPublicacionId,
} = require('../../middlewares/publicacionesMiddleware');
const {
  obtenerFeed,
  obtenerEtiquetas,
  crearNuevaPublicacion,
  crearComentarioPublicacion,
  listarComentarios,
  traducirContenido,
} = require('../../controller/publicaciones/publicacionesController');

// Todas las rutas de publicaciones requieren sesión iniciada.
router.use(verificarAuth);

// GET /api/publicaciones?etiqueta=...&buscar=...
// Feed del usuario (sus publicaciones + amigos), con filtro por etiqueta y buscador
router.get('/', obtenerFeed);

// GET /api/publicaciones/etiquetas?buscar=...
// Etiquetas disponibles en el feed del usuario
router.get('/etiquetas', obtenerEtiquetas);

// POST /api/publicaciones
// Crea una publicación con imagen obligatoria
router.post('/', validarCrearPublicacion, crearNuevaPublicacion);

// GET /api/publicaciones/:publicacionId/comentarios
router.get('/:publicacionId/comentarios', validarPublicacionId, listarComentarios);

// POST /api/publicaciones/:publicacionId/comentarios
router.post('/:publicacionId/comentarios', validarPublicacionId, validarComentario, crearComentarioPublicacion);

// POST /api/publicaciones/traducir
router.post('/traducir', validarTraduccion, traducirContenido);



module.exports = router;
