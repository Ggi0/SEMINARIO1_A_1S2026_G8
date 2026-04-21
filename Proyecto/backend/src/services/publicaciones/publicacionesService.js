const { DetectLabelsCommand } = require('@aws-sdk/client-rekognition');
const { pool } = require('../../config/db');
const { rekognitionClient } = require('../../config/aws');

const S3_BUCKET = process.env.S3_BUCKET_NAME;

// Normaliza etiquetas para evitar duplicados por mayúsculas/minúsculas o espacios.
function normalizeEtiqueta(etiqueta) {
  return String(etiqueta || '').trim().toLowerCase();
}

// Obtiene etiquetas automáticas de Rekognition desde la imagen almacenada en S3.
async function detectEtiquetasDesdeS3(imagenS3Key) {
  if (!imagenS3Key || !S3_BUCKET) {
    return [];
  }

  const command = new DetectLabelsCommand({
    Image: {
      S3Object: {
        Bucket: S3_BUCKET,
        Name: imagenS3Key,
      },
    },
    MaxLabels: 10,
    MinConfidence: 80,
  });

  const response = await rekognitionClient.send(command);
  const etiquetas = (response.Labels || [])
    .map((label) => normalizeEtiqueta(label.Name))
    .filter(Boolean);

  return [...new Set(etiquetas)];
}

// Guarda etiquetas en catálogo y crea relación many-to-many con la publicación.
async function guardarEtiquetasPublicacion(connection, publicacionId, etiquetas) {
  for (const etiqueta of etiquetas) {
    const [insertEtiqueta] = await connection.query(
      'INSERT INTO etiquetas (nombre) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)',
      [etiqueta]
    );

    const etiquetaId = insertEtiqueta.insertId;

    await connection.query(
      'INSERT IGNORE INTO publicacion_etiquetas (publicacion_id, etiqueta_id) VALUES (?, ?)',
      [publicacionId, etiquetaId]
    );
  }
}

// Crea una publicación y, si es posible, persiste sus etiquetas detectadas.
async function crearPublicacion({ userId, imagenUrl, imagenS3Key, descripcion }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [insertResult] = await connection.query(
      `INSERT INTO publicaciones (usuario_id, imagen_url, imagen_s3_key, descripcion)
       VALUES (?, ?, ?, ?)`,
      [userId, imagenUrl, imagenS3Key, descripcion || null]
    );

    const publicacionId = insertResult.insertId;

    try {
      const etiquetas = await detectEtiquetasDesdeS3(imagenS3Key);
      if (etiquetas.length > 0) {
        await guardarEtiquetasPublicacion(connection, publicacionId, etiquetas);
      }
    } catch (rekognitionError) {
      // No se cancela la publicación si falla la detección de etiquetas.
      console.error('[PUBLICACIONES] Rekognition error:', rekognitionError.message);
    }

    await connection.commit();

    const [rows] = await pool.query(
      `SELECT p.id, p.usuario_id, p.imagen_url, p.imagen_s3_key, p.descripcion, p.fecha_publicacion,
              u.username, u.nombre_completo, u.foto_perfil_url
       FROM publicaciones p
       INNER JOIN usuarios u ON u.id = p.usuario_id
       WHERE p.id = ?`,
      [publicacionId]
    );

    return rows[0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Restricción de visibilidad: solo publicaciones propias o de amistades confirmadas.
function buildAccesoAmigosClause(alias = 'p') {
  return `(
    ${alias}.usuario_id = ?
    OR ${alias}.usuario_id IN (
      SELECT CASE
        WHEN a.usuario1_id = ? THEN a.usuario2_id
        ELSE a.usuario1_id
      END
      FROM amistades a
      WHERE a.usuario1_id = ? OR a.usuario2_id = ?
    )
  )`;
}

// Verifica que la publicación exista y que el usuario tenga permiso de verla/comentarla.
async function validarAccesoPublicacion({ publicacionId, userId }) {
  const [existePublicacion] = await pool.query(
    'SELECT id FROM publicaciones WHERE id = ?',
    [publicacionId]
  );

  if (existePublicacion.length === 0) {
    const error = new Error('Publicación no encontrada');
    error.statusCode = 404;
    throw error;
  }

  const accesoSql = buildAccesoAmigosClause('p');
  const [acceso] = await pool.query(
    `SELECT p.id
     FROM publicaciones p
     WHERE p.id = ? AND ${accesoSql}`,
    [publicacionId, userId, userId, userId, userId]
  );

  if (acceso.length === 0) {
    const error = new Error('No tienes permiso para interactuar con esta publicación');
    error.statusCode = 403;
    throw error;
  }
}

// Feed principal con filtros por etiqueta exacta y búsqueda parcial por etiqueta.
async function listarPublicacionesFeed({ userId, etiqueta, buscar }) {
  const where = [buildAccesoAmigosClause('p')];
  const params = [userId, userId, userId, userId];

  if (etiqueta) {
    where.push(`EXISTS (
      SELECT 1
      FROM publicacion_etiquetas pef
      INNER JOIN etiquetas ef ON ef.id = pef.etiqueta_id
      WHERE pef.publicacion_id = p.id AND ef.nombre = ?
    )`);
    params.push(normalizeEtiqueta(etiqueta));
  }

  if (buscar) {
    where.push(`EXISTS (
      SELECT 1
      FROM publicacion_etiquetas pes
      INNER JOIN etiquetas es ON es.id = pes.etiqueta_id
      WHERE pes.publicacion_id = p.id AND es.nombre LIKE ?
    )`);
    params.push(`%${normalizeEtiqueta(buscar)}%`);
  }

  const [publicaciones] = await pool.query(
    `SELECT p.id, p.descripcion, p.imagen_url, p.imagen_s3_key, p.fecha_publicacion,
            u.id AS usuario_id, u.username, u.nombre_completo, u.foto_perfil_url,
            GROUP_CONCAT(DISTINCT e.nombre ORDER BY e.nombre SEPARATOR ',') AS etiquetas_csv,
            COUNT(DISTINCT c.id) AS total_comentarios
     FROM publicaciones p
     INNER JOIN usuarios u ON u.id = p.usuario_id
     LEFT JOIN publicacion_etiquetas pe ON pe.publicacion_id = p.id
     LEFT JOIN etiquetas e ON e.id = pe.etiqueta_id
     LEFT JOIN comentarios c ON c.publicacion_id = p.id
     WHERE ${where.join(' AND ')}
     GROUP BY p.id
     ORDER BY p.fecha_publicacion DESC`,
    params
  );

  const publicacionesIds = publicaciones.map((p) => p.id);

  if (publicacionesIds.length === 0) {
    return [];
  }

  const [comentarios] = await pool.query(
    `SELECT c.id, c.publicacion_id, c.comentario, c.fecha_comentario,
            u.id AS usuario_id, u.username, u.nombre_completo, u.foto_perfil_url
     FROM comentarios c
     INNER JOIN usuarios u ON u.id = c.usuario_id
     WHERE c.publicacion_id IN (?)
     ORDER BY c.fecha_comentario ASC`,
    [publicacionesIds]
  );

  const comentariosPorPublicacion = comentarios.reduce((acc, comentario) => {
    if (!acc[comentario.publicacion_id]) {
      acc[comentario.publicacion_id] = [];
    }
    acc[comentario.publicacion_id].push(comentario);
    return acc;
  }, {});

  return publicaciones.map((publicacion) => ({
    ...publicacion,
    etiquetas: publicacion.etiquetas_csv ? publicacion.etiquetas_csv.split(',') : [],
    total_comentarios: Number(publicacion.total_comentarios || 0),
    comentarios: comentariosPorPublicacion[publicacion.id] || [],
  }));
}

// Devuelve etiquetas disponibles para la UI de filtros y buscador.
async function listarEtiquetasDisponibles({ userId, buscar }) {
  const where = [buildAccesoAmigosClause('p')];
  const params = [userId, userId, userId, userId];

  if (buscar) {
    where.push('e.nombre LIKE ?');
    params.push(`%${normalizeEtiqueta(buscar)}%`);
  }

  const [rows] = await pool.query(
    `SELECT DISTINCT e.nombre
     FROM etiquetas e
     INNER JOIN publicacion_etiquetas pe ON pe.etiqueta_id = e.id
     INNER JOIN publicaciones p ON p.id = pe.publicacion_id
     WHERE ${where.join(' AND ')}
     ORDER BY e.nombre ASC`,
    params
  );

  return rows.map((row) => row.nombre);
}

// Crea un comentario asociado a una publicación existente.
async function crearComentario({ publicacionId, userId, comentario }) {
  await validarAccesoPublicacion({ publicacionId, userId });

  const [insertResult] = await pool.query(
    `INSERT INTO comentarios (publicacion_id, usuario_id, comentario)
     VALUES (?, ?, ?)`,
    [publicacionId, userId, comentario]
  );

  const [rows] = await pool.query(
    `SELECT c.id, c.publicacion_id, c.comentario, c.fecha_comentario,
            u.id AS usuario_id, u.username, u.nombre_completo, u.foto_perfil_url
     FROM comentarios c
     INNER JOIN usuarios u ON u.id = c.usuario_id
     WHERE c.id = ?`,
    [insertResult.insertId]
  );

  return rows[0];
}

// Lista comentarios de una publicación ordenados por fecha ascendente.
async function listarComentariosPorPublicacion({ publicacionId, userId }) {
  await validarAccesoPublicacion({ publicacionId, userId });

  const [rows] = await pool.query(
    `SELECT c.id, c.publicacion_id, c.comentario, c.fecha_comentario,
            u.id AS usuario_id, u.username, u.nombre_completo, u.foto_perfil_url
     FROM comentarios c
     INNER JOIN usuarios u ON u.id = c.usuario_id
     WHERE c.publicacion_id = ?
     ORDER BY c.fecha_comentario ASC`,
    [publicacionId]
  );

  return rows;
}

module.exports = {
  crearPublicacion,
  listarPublicacionesFeed,
  listarEtiquetasDisponibles,
  crearComentario,
  listarComentariosPorPublicacion,
};
