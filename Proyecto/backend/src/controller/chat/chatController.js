const { pool } = require('../../config/db');

async function obtenerChatAutorizado(chatId, userId) {
  const [rows] = await pool.query(
    `SELECT c.id, c.usuario1_id, c.usuario2_id
     FROM chats c
     WHERE c.id = ? AND (c.usuario1_id = ? OR c.usuario2_id = ?)`,
    [chatId, userId, userId]
  );

  return rows[0] || null;
}

async function listarChats(req, res) {
  try {
    const [chats] = await pool.query(
      `SELECT c.id AS chat_id, c.creado_en,
              u.id AS amigo_id, u.username, u.nombre_completo, u.correo, u.foto_perfil_url,
              m.mensaje AS ultimo_mensaje, m.fecha_envio AS ultima_fecha
       FROM chats c
       INNER JOIN usuarios u ON u.id = CASE
         WHEN c.usuario1_id = ? THEN c.usuario2_id
         ELSE c.usuario1_id
       END
       LEFT JOIN mensajes m ON m.id = (
         SELECT mm.id
         FROM mensajes mm
         WHERE mm.chat_id = c.id
         ORDER BY mm.fecha_envio DESC, mm.id DESC
         LIMIT 1
       )
       WHERE c.usuario1_id = ? OR c.usuario2_id = ?
       ORDER BY COALESCE(m.fecha_envio, c.creado_en) DESC`,
      [req.usuario.id, req.usuario.id, req.usuario.id]
    );

    return res.status(200).json({ ok: true, chats });
  } catch (error) {
    console.error('[CHAT] Error al listar chats:', error);
    return res.status(500).json({ ok: false, mensaje: 'No se pudieron listar los chats' });
  }
}

async function listarMensajes(req, res) {
  try {
    const chatId = Number(req.params.chatId);

    if (!Number.isInteger(chatId) || chatId <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'chatId invalido' });
    }

    const chat = await obtenerChatAutorizado(chatId, req.usuario.id);

    if (!chat) {
      return res.status(404).json({ ok: false, mensaje: 'Chat no encontrado' });
    }

    const [mensajes] = await pool.query(
      `SELECT m.id, m.chat_id, m.remitente_id, m.mensaje, m.leido, m.fecha_envio,
              u.username, u.nombre_completo, u.foto_perfil_url
       FROM mensajes m
       INNER JOIN usuarios u ON u.id = m.remitente_id
       WHERE m.chat_id = ?
       ORDER BY m.fecha_envio ASC, m.id ASC`,
      [chatId]
    );

    return res.status(200).json({ ok: true, mensajes });
  } catch (error) {
    console.error('[CHAT] Error al listar mensajes:', error);
    return res.status(500).json({ ok: false, mensaje: 'No se pudieron listar los mensajes' });
  }
}

async function crearMensaje({ chatId, userId, mensaje }) {
  const chat = await obtenerChatAutorizado(chatId, userId);

  if (!chat) {
    const error = new Error('Chat no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const texto = String(mensaje || '').trim();

  if (!texto) {
    const error = new Error('El mensaje no puede estar vacio');
    error.statusCode = 400;
    throw error;
  }

  const [insertResult] = await pool.query(
    `INSERT INTO mensajes (chat_id, remitente_id, mensaje)
     VALUES (?, ?, ?)`,
    [chatId, userId, texto]
  );

  const [rows] = await pool.query(
    `SELECT m.id, m.chat_id, m.remitente_id, m.mensaje, m.leido, m.fecha_envio,
            u.username, u.nombre_completo, u.foto_perfil_url
     FROM mensajes m
     INNER JOIN usuarios u ON u.id = m.remitente_id
     WHERE m.id = ?`,
    [insertResult.insertId]
  );

  return {
    mensaje: rows[0],
    participantes: [chat.usuario1_id, chat.usuario2_id],
  };
}

async function crearMensajeHttp(req, res) {
  try {
    const chatId = Number(req.params.chatId);

    if (!Number.isInteger(chatId) || chatId <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'chatId invalido' });
    }

    const resultado = await crearMensaje({
      chatId,
      userId: req.usuario.id,
      mensaje: req.body.mensaje,
    });

    return res.status(201).json({
      ok: true,
      mensaje: resultado.mensaje,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ ok: false, mensaje: error.message });
    }

    console.error('[CHAT] Error al crear mensaje:', error);
    return res.status(500).json({ ok: false, mensaje: 'No se pudo enviar el mensaje' });
  }
}

module.exports = {
  crearMensaje,
  listarChats,
  listarMensajes,
  crearMensajeHttp,
};
