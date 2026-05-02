// Controlador del endpoint /chat-bot
// Recibe el texto del usuario, lo delega al servicio de Lex y responde

const { enviarMensajeALex } = require('../../services/chatbot/lexService');

/**
 * POST /api/chat-bot
 * Cuerpo esperado: { texto: string, sessionId: string }
 *
 * - texto     : mensaje que escribió el usuario
 * - sessionId : identificador de sesión (el frontend lo genera, p.ej. UUID o userId)
 *
 * El endpoint NO requiere autenticación para que el bot sea accesible
 * incluso antes de hacer login. Si lo quieres protegido, agrega verificarAuth.
 */
async function chatBot(req, res) {
  try {
    const { texto, sessionId } = req.body;

    if (!texto || !texto.trim()) {
      return res.status(400).json({ ok: false, mensaje: 'El campo texto es requerido' });
    }

    // Usamos sessionId recibido o uno genérico de respaldo
    const session = sessionId || 'sesion-anonima-1';

    const mensajes = await enviarMensajeALex(texto.trim(), session);

    return res.status(200).json({ ok: true, mensajes });
  } catch (error) {
    console.error('[CHATBOT] Error al comunicarse con Lex:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error al conectar con el asistente virtual' });
  }
}

module.exports = { chatBot };