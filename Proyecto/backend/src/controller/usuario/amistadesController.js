const { pool } = require('../../config/db');

function ordenarPareja(usuarioId, otroUsuarioId) {
  return usuarioId < otroUsuarioId
    ? [usuarioId, otroUsuarioId]
    : [otroUsuarioId, usuarioId];
}

async function listarUsuariosDisponibles(req, res) {
  try {
    const userId = req.usuario.id;

    const [usuarios] = await pool.query(
      `SELECT u.id, u.username, u.nombre_completo, u.correo, u.foto_perfil_url
       FROM usuarios u
       WHERE u.id != ?
         AND NOT EXISTS (
           SELECT 1
           FROM amistades a
           WHERE (a.usuario1_id = ? AND a.usuario2_id = u.id)
              OR (a.usuario2_id = ? AND a.usuario1_id = u.id)
         )
         AND NOT EXISTS (
           SELECT 1
           FROM solicitudes_amistad s
           WHERE s.estado = 'pendiente'
             AND (
               (s.remitente_id = ? AND s.destinatario_id = u.id)
               OR (s.destinatario_id = ? AND s.remitente_id = u.id)
             )
         )
       ORDER BY u.nombre_completo ASC`,
      [userId, userId, userId, userId, userId]
    );

    return res.status(200).json({
      ok: true,
      usuarios,
    });
  } catch (error) {
    console.error('[AMISTADES] Error al listar usuarios disponibles:', error);
    return res.status(500).json({ ok: false, mensaje: 'No se pudieron listar los usuarios' });
  }
}

async function listarSolicitudesRecibidas(req, res) {
  try {
    const [solicitudes] = await pool.query(
      `SELECT s.id, s.estado, s.fecha_solicitud,
              u.id AS remitente_id, u.username, u.nombre_completo, u.correo, u.foto_perfil_url
       FROM solicitudes_amistad s
       INNER JOIN usuarios u ON u.id = s.remitente_id
       WHERE s.destinatario_id = ? AND s.estado = 'pendiente'
       ORDER BY s.fecha_solicitud DESC`,
      [req.usuario.id]
    );

    return res.status(200).json({
      ok: true,
      solicitudes,
    });
  } catch (error) {
    console.error('[AMISTADES] Error al listar solicitudes recibidas:', error);
    return res.status(500).json({ ok: false, mensaje: 'No se pudieron listar las solicitudes' });
  }
}

async function listarSolicitudesEnviadas(req, res) {
  try {
    const [solicitudes] = await pool.query(
      `SELECT s.id, s.estado, s.fecha_solicitud, s.fecha_respuesta,
              u.id AS destinatario_id, u.username, u.nombre_completo, u.correo, u.foto_perfil_url
       FROM solicitudes_amistad s
       INNER JOIN usuarios u ON u.id = s.destinatario_id
       WHERE s.remitente_id = ?
       ORDER BY s.fecha_solicitud DESC`,
      [req.usuario.id]
    );

    return res.status(200).json({
      ok: true,
      solicitudes,
    });
  } catch (error) {
    console.error('[AMISTADES] Error al listar solicitudes enviadas:', error);
    return res.status(500).json({ ok: false, mensaje: 'No se pudieron listar las solicitudes enviadas' });
  }
}

async function enviarSolicitud(req, res) {
  try {
    const remitenteId = req.usuario.id;
    const destinatarioId = Number(req.params.usuarioId);

    if (!Number.isInteger(destinatarioId) || destinatarioId <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'usuarioId invalido' });
    }

    if (remitenteId === destinatarioId) {
      return res.status(400).json({ ok: false, mensaje: 'No puedes enviarte una solicitud a ti mismo' });
    }

    const [destinatario] = await pool.query(
      'SELECT id FROM usuarios WHERE id = ?',
      [destinatarioId]
    );

    if (destinatario.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario destinatario no encontrado' });
    }

    const [yaSonAmigos] = await pool.query(
      `SELECT id
       FROM amistades
       WHERE (usuario1_id = ? AND usuario2_id = ?)
          OR (usuario1_id = ? AND usuario2_id = ?)`,
      [remitenteId, destinatarioId, destinatarioId, remitenteId]
    );

    if (yaSonAmigos.length > 0) {
      return res.status(200).json({ ok: true, mensaje: 'Ya son amigos' });
    }

    const [solicitudExistente] = await pool.query(
      `SELECT id, estado, remitente_id, destinatario_id
       FROM solicitudes_amistad
       WHERE (remitente_id = ? AND destinatario_id = ?)
          OR (remitente_id = ? AND destinatario_id = ?)
       ORDER BY fecha_solicitud DESC
       LIMIT 1`,
      [remitenteId, destinatarioId, destinatarioId, remitenteId]
    );

    if (solicitudExistente.length > 0) {
      const solicitud = solicitudExistente[0];

      if (solicitud.estado === 'pendiente') {
        return res.status(200).json({
          ok: true,
          mensaje: 'Ya existe una solicitud pendiente entre estos usuarios',
          solicitud_id: solicitud.id,
        });
      }

      await pool.query(
        `UPDATE solicitudes_amistad
         SET remitente_id = ?, destinatario_id = ?, estado = 'pendiente',
             fecha_solicitud = CURRENT_TIMESTAMP, fecha_respuesta = NULL
         WHERE id = ?`,
        [remitenteId, destinatarioId, solicitud.id]
      );

      return res.status(200).json({
        ok: true,
        mensaje: 'Solicitud de amistad enviada',
        solicitud_id: solicitud.id,
      });
    }

    const [insertResult] = await pool.query(
      `INSERT INTO solicitudes_amistad (remitente_id, destinatario_id, estado)
       VALUES (?, ?, 'pendiente')`,
      [remitenteId, destinatarioId]
    );

    return res.status(201).json({
      ok: true,
      mensaje: 'Solicitud de amistad enviada',
      solicitud_id: insertResult.insertId,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(200).json({ ok: true, mensaje: 'Ya existe una solicitud para este usuario' });
    }

    console.error('[AMISTADES] Error al enviar solicitud:', error);
    return res.status(500).json({ ok: false, mensaje: 'No se pudo enviar la solicitud' });
  }
}

async function aceptarSolicitud(req, res) {
  const connection = await pool.getConnection();

  try {
    const solicitudId = Number(req.params.solicitudId);

    if (!Number.isInteger(solicitudId) || solicitudId <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'solicitudId invalido' });
    }

    await connection.beginTransaction();

    const [solicitudes] = await connection.query(
      `SELECT id, remitente_id, destinatario_id, estado
       FROM solicitudes_amistad
       WHERE id = ? AND destinatario_id = ?
       FOR UPDATE`,
      [solicitudId, req.usuario.id]
    );

    if (solicitudes.length === 0) {
      await connection.rollback();
      return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada' });
    }

    const solicitud = solicitudes[0];

    if (solicitud.estado !== 'pendiente') {
      await connection.rollback();
      return res.status(400).json({ ok: false, mensaje: 'La solicitud ya fue respondida' });
    }

    const [usuario1Id, usuario2Id] = ordenarPareja(solicitud.remitente_id, solicitud.destinatario_id);

    await connection.query(
      `UPDATE solicitudes_amistad
       SET estado = 'aceptada', fecha_respuesta = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [solicitudId]
    );

    await connection.query(
      `INSERT IGNORE INTO amistades (usuario1_id, usuario2_id)
       VALUES (?, ?)`,
      [usuario1Id, usuario2Id]
    );

    await connection.query(
      `INSERT IGNORE INTO chats (usuario1_id, usuario2_id)
       VALUES (?, ?)`,
      [usuario1Id, usuario2Id]
    );

    await connection.commit();

    return res.status(200).json({
      ok: true,
      mensaje: 'Solicitud aceptada. Ahora son amigos.',
    });
  } catch (error) {
    await connection.rollback();
    console.error('[AMISTADES] Error al aceptar solicitud:', error);
    return res.status(500).json({ ok: false, mensaje: 'No se pudo aceptar la solicitud' });
  } finally {
    connection.release();
  }
}

async function rechazarSolicitud(req, res) {
  try {
    const solicitudId = Number(req.params.solicitudId);

    if (!Number.isInteger(solicitudId) || solicitudId <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'solicitudId invalido' });
    }

    const [result] = await pool.query(
      `UPDATE solicitudes_amistad
       SET estado = 'rechazada', fecha_respuesta = CURRENT_TIMESTAMP
       WHERE id = ? AND destinatario_id = ? AND estado = 'pendiente'`,
      [solicitudId, req.usuario.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Solicitud pendiente no encontrada' });
    }

    return res.status(200).json({
      ok: true,
      mensaje: 'Solicitud rechazada',
    });
  } catch (error) {
    console.error('[AMISTADES] Error al rechazar solicitud:', error);
    return res.status(500).json({ ok: false, mensaje: 'No se pudo rechazar la solicitud' });
  }
}

async function listarAmigos(req, res) {
  try {
    const [amigos] = await pool.query(
      `SELECT u.id, u.username, u.nombre_completo, u.correo, u.foto_perfil_url,
              c.id AS chat_id, a.fecha_amistad
       FROM amistades a
       INNER JOIN usuarios u ON u.id = CASE
         WHEN a.usuario1_id = ? THEN a.usuario2_id
         ELSE a.usuario1_id
       END
       LEFT JOIN chats c ON (
         (c.usuario1_id = a.usuario1_id AND c.usuario2_id = a.usuario2_id)
         OR (c.usuario1_id = a.usuario2_id AND c.usuario2_id = a.usuario1_id)
       )
       WHERE a.usuario1_id = ? OR a.usuario2_id = ?
       ORDER BY u.nombre_completo ASC`,
      [req.usuario.id, req.usuario.id, req.usuario.id]
    );

    return res.status(200).json({
      ok: true,
      amigos,
    });
  } catch (error) {
    console.error('[AMISTADES] Error al listar amigos:', error);
    return res.status(500).json({ ok: false, mensaje: 'No se pudieron listar los amigos' });
  }
}

module.exports = {
  listarUsuariosDisponibles,
  listarSolicitudesRecibidas,
  listarSolicitudesEnviadas,
  enviarSolicitud,
  aceptarSolicitud,
  rechazarSolicitud,
  listarAmigos,
};
