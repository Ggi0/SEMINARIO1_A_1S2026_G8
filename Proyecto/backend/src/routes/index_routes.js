const express = require('express');
const router = express.Router();


// GET /api
router.get('/', (req, res) => {
    res.status(200).json({
      ok: true,
      mensaje: 'Dentro de la API Semi'
    });
});


// importar rutas por modulo
const usuarios      = require('./usuario/user_routes');
const publicaciones = require('./publicaciones/publi_routes');
const auth          = require('./auth/auth_routes');
const chat          = require('./chat/chat_routes');



// agregando el prefijo a su enpoitn segun el modulo
router.use('/usuario',       usuarios);
router.use('/publicaciones', publicaciones);
router.use('/auth',          auth);
router.use('/chat',          chat);



module.exports = router;
