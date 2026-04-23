const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { verificarToken } = require('../utils/cognitoJwt');
const { pool } = require('../config/db');
const { crearMensaje } = require('../controller/chat/chatController');

const clientsByUser = new Map();

function encodeFrame(payload) {
  const data = Buffer.from(JSON.stringify(payload));
  const length = data.length;

  if (length < 126) {
    return Buffer.concat([Buffer.from([0x81, length]), data]);
  }

  if (length < 65536) {
    const header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(length, 2);
    return Buffer.concat([header, data]);
  }

  const header = Buffer.alloc(10);
  header[0] = 0x81;
  header[1] = 127;
  header.writeBigUInt64BE(BigInt(length), 2);
  return Buffer.concat([header, data]);
}

function decodeFrame(buffer) {
  const opcode = buffer[0] & 0x0f;

  if (opcode === 0x8) {
    return { type: 'close' };
  }

  let offset = 2;
  let length = buffer[1] & 0x7f;

  if (length === 126) {
    length = buffer.readUInt16BE(offset);
    offset += 2;
  } else if (length === 127) {
    length = Number(buffer.readBigUInt64BE(offset));
    offset += 8;
  }

  const masked = Boolean(buffer[1] & 0x80);
  let maskingKey = null;

  if (masked) {
    maskingKey = buffer.subarray(offset, offset + 4);
    offset += 4;
  }

  const payload = buffer.subarray(offset, offset + length);

  if (!masked) {
    return { type: 'message', text: payload.toString('utf8') };
  }

  const decoded = Buffer.alloc(length);
  for (let i = 0; i < length; i += 1) {
    decoded[i] = payload[i] ^ maskingKey[i % 4];
  }

  return { type: 'message', text: decoded.toString('utf8') };
}

function sendJson(socket, payload) {
  if (!socket.destroyed) {
    socket.write(encodeFrame(payload));
  }
}

function addClient(userId, socket) {
  if (!clientsByUser.has(userId)) {
    clientsByUser.set(userId, new Set());
  }
  clientsByUser.get(userId).add(socket);
}

function removeClient(userId, socket) {
  const clients = clientsByUser.get(userId);
  if (!clients) {
    return;
  }

  clients.delete(socket);

  if (clients.size === 0) {
    clientsByUser.delete(userId);
  }
}

function broadcastToUsers(userIds, payload) {
  for (const userId of userIds) {
    const clients = clientsByUser.get(userId);
    if (!clients) {
      continue;
    }

    for (const socket of clients) {
      sendJson(socket, payload);
    }
  }
}

async function obtenerUsuarioDesdeToken(token) {
  let payload;
  let rows = [];

  try {
    payload = await verificarToken(token);
    [rows] = await pool.query(
      'SELECT id, username, correo, nombre_completo FROM usuarios WHERE cognito_sub = ?',
      [payload.sub]
    );
  } catch (cognitoError) {
    const secret = process.env.JWT_SECRET_FACIAL;
    if (!secret) {
      throw cognitoError;
    }

    payload = jwt.verify(token, secret);
    [rows] = await pool.query(
      'SELECT id, username, correo, nombre_completo FROM usuarios WHERE id = ?',
      [payload.userId]
    );
  }

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
}

async function handleSocketMessage(socket, usuario, rawText) {
  let data;

  try {
    data = JSON.parse(rawText);
  } catch {
    sendJson(socket, { type: 'error', mensaje: 'Mensaje WebSocket invalido' });
    return;
  }

  if (data.type !== 'mensaje') {
    return;
  }

  try {
    const resultado = await crearMensaje({
      chatId: Number(data.chatId),
      userId: usuario.id,
      mensaje: data.mensaje,
    });

    broadcastToUsers(resultado.participantes, {
      type: 'mensaje',
      mensaje: resultado.mensaje,
    });
  } catch (error) {
    sendJson(socket, {
      type: 'error',
      mensaje: error.message || 'No se pudo enviar el mensaje',
    });
  }
}

function setupChatWebSocket(server) {
  server.on('upgrade', async (req, socket) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);

      if (url.pathname !== '/ws') {
        socket.destroy();
        return;
      }

      const token = url.searchParams.get('token');
      const usuario = token ? await obtenerUsuarioDesdeToken(token) : null;

      if (!usuario) {
        socket.destroy();
        return;
      }

      const key = req.headers['sec-websocket-key'];
      const acceptKey = crypto
        .createHash('sha1')
        .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
        .digest('base64');

      socket.write(
        [
          'HTTP/1.1 101 Switching Protocols',
          'Upgrade: websocket',
          'Connection: Upgrade',
          `Sec-WebSocket-Accept: ${acceptKey}`,
          '',
          '',
        ].join('\r\n')
      );

      addClient(usuario.id, socket);
      sendJson(socket, { type: 'conectado', usuarioId: usuario.id });

      socket.on('data', (buffer) => {
        const frame = decodeFrame(buffer);

        if (frame.type === 'close') {
          socket.end();
          return;
        }

        handleSocketMessage(socket, usuario, frame.text);
      });

      socket.on('close', () => removeClient(usuario.id, socket));
      socket.on('error', () => removeClient(usuario.id, socket));
    } catch (error) {
      console.error('[WS] Error en upgrade:', error.message);
      socket.destroy();
    }
  });
}

module.exports = { setupChatWebSocket };
