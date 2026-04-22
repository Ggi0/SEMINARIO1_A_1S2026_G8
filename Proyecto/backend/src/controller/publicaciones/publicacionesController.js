const {
  crearPublicacion,
  listarPublicacionesFeed,
  listarEtiquetasDisponibles,
  crearComentario,
  listarComentariosPorPublicacion,
} = require('../../services/publicaciones/publicacionesService');
const { traducirTexto, IDIOMAS_SOPORTADOS } = require('../../services/publicaciones/translateService');

// Controlador de feed: lista publicaciones visibles para el usuario autenticado.
async function obtenerFeed(req, res) {
  try {
    const { etiqueta, buscar } = req.query;

    const publicaciones = await listarPublicacionesFeed({
      userId: req.usuario.id,
      etiqueta,
      buscar,
    });

    return res.status(200).json({
      ok: true,
      filtro: {
        etiqueta: etiqueta || null,
        buscar: buscar || null,
      },
      publicaciones,
    });
  } catch (error) {
    console.error('[PUBLICACIONES] Error al obtener feed:', error);
    return res.status(500).json({ ok: false, mensaje: 'No se pudo obtener el feed' });
  }
}

// Controlador de catálogo de etiquetas para filtros del frontend.
async function obtenerEtiquetas(req, res) {
  try {
    const { buscar } = req.query;

    const etiquetas = await listarEtiquetasDisponibles({
      userId: req.usuario.id,
      buscar,
    });

    return res.status(200).json({
      ok: true,
      etiquetas: ['todos', ...etiquetas],
    });
  } catch (error) {
    console.error('[PUBLICACIONES] Error al obtener etiquetas:', error);
    return res.status(500).json({ ok: false, mensaje: 'No se pudieron obtener las etiquetas' });
  }
}

// Controlador para crear una publicación nueva con imagen obligatoria.
async function crearNuevaPublicacion(req, res) {
  try {
    const { imagen_url, imagen_s3_key, descripcion } = req.body;

    const publicacion = await crearPublicacion({
      userId: req.usuario.id,
      imagenUrl: imagen_url,
      imagenS3Key: imagen_s3_key,
      descripcion,
    });

    return res.status(201).json({
      ok: true,
      mensaje: 'Publicación creada correctamente',
      publicacion,
    });
  } catch (error) {
    console.error('[PUBLICACIONES] Error al crear publicación:', error);
    return res.status(500).json({ ok: false, mensaje: 'No se pudo crear la publicación' });
  }
}

// Controlador para comentar una publicación específica.
async function crearComentarioPublicacion(req, res) {
  try {
    const publicacionId = Number(req.params.publicacionId);
    const { comentario } = req.body;

    const comentarioCreado = await crearComentario({
      publicacionId,
      userId: req.usuario.id,
      comentario,
    });

    return res.status(201).json({
      ok: true,
      mensaje: 'Comentario agregado',
      comentario: comentarioCreado,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ ok: false, mensaje: error.message });
    }
    console.error('[PUBLICACIONES] Error al comentar:', error);
    return res.status(500).json({ ok: false, mensaje: 'No se pudo crear el comentario' });
  }
}

// Controlador para listar comentarios de una publicación.
async function listarComentarios(req, res) {
  try {
    const publicacionId = Number(req.params.publicacionId);
    const comentarios = await listarComentariosPorPublicacion({
      publicacionId,
      userId: req.usuario.id,
    });

    return res.status(200).json({
      ok: true,
      comentarios,
    });
  } catch (error) {
    console.error('[PUBLICACIONES] Error al listar comentarios:', error);
    return res.status(500).json({ ok: false, mensaje: 'No se pudieron obtener los comentarios' });
  }
}

// Controlador para traducir texto de publicaciones/comentarios.
async function traducirContenido(req, res) {
  try {
    const { texto, idiomaDestino } = req.body;

    const traduccion = await traducirTexto({ texto, idiomaDestino });

    return res.status(200).json({
      ok: true,
      traduccion,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ ok: false, mensaje: error.message, idiomas: IDIOMAS_SOPORTADOS });
    }

    console.error('[PUBLICACIONES] Error al traducir texto:', error);
    return res.status(500).json({ ok: false, mensaje: 'No se pudo traducir el contenido' });
  }
}

module.exports = {
  obtenerFeed,
  obtenerEtiquetas,
  crearNuevaPublicacion,
  crearComentarioPublicacion,
  listarComentarios,
  traducirContenido,
};
