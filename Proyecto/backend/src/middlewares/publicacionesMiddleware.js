const { IDIOMAS_SOPORTADOS } = require('../services/publicaciones/translateService');

// Valida payload para crear publicación.
function validarCrearPublicacion(req, res, next) {
  const { imagen_url, imagen_s3_key, descripcion } = req.body;

  if (!imagen_url || !imagen_s3_key) {
    return res.status(400).json({
      ok: false,
      mensaje: 'La imagen es obligatoria (imagen_url e imagen_s3_key)',
    });
  }

  if (descripcion && typeof descripcion !== 'string') {
    return res.status(400).json({
      ok: false,
      mensaje: 'La descripción debe ser texto',
    });
  }

  next();
}

// Valida que el comentario no llegue vacío.
function validarComentario(req, res, next) {
  const { comentario } = req.body;

  if (!comentario || typeof comentario !== 'string' || !comentario.trim()) {
    return res.status(400).json({
      ok: false,
      mensaje: 'El comentario es obligatorio',
    });
  }

  next();
}

// Valida texto e idioma destino para traducción.
function validarTraduccion(req, res, next) {
  const { texto, idiomaDestino } = req.body;

  if (!texto || typeof texto !== 'string' || !texto.trim()) {
    return res.status(400).json({
      ok: false,
      mensaje: 'El texto a traducir es obligatorio',
    });
  }

  if (!idiomaDestino || !IDIOMAS_SOPORTADOS.includes(idiomaDestino)) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Idioma no soportado',
      idiomas: IDIOMAS_SOPORTADOS,
    });
  }

  next();
}

// Valida parámetro :publicacionId en rutas de comentarios.
function validarPublicacionId(req, res, next) {
  const publicacionId = Number(req.params.publicacionId);

  if (!Number.isInteger(publicacionId) || publicacionId <= 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'publicacionId inválido',
    });
  }

  next();
}

module.exports = {
  validarCrearPublicacion,
  validarComentario,
  validarTraduccion,
  validarPublicacionId,
};
