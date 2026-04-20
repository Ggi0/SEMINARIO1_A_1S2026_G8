
const express = require('express');
const router = express.Router();

// GET /api/publicaciones/
router.get('/', (req, res) => {
    res.status(200).json({
      ok: true,
      modulo: 'PUBLICACIONES',
      mensaje: 'Ruta principal de publicaciones'
    });
  });



module.exports = router;
