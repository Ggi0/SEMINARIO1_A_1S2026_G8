
const express = require('express');
const router = express.Router();

// GET /api/usuarios/
router.get('/', (req, res) => {
    res.status(200).json({
      ok: true,
      modulo: 'USUARIOS',
      mensaje: 'Ruta principal de USUAIROS'
    });
  });



module.exports = router;
