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
const usuarios = require("./usuario/user_routes");
const publicaciones = require("./publicaciones/publi_routes");
// se traen aquí el resto de modulos...



// agregando el prefijo a su enpoitn segun el modulo
router.use('/user', usuarios);
router.use('/publicaciones', publicaciones);

// trabajar igual pare el resto...










module.exports = router;