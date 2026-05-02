
const { LexRuntimeV2Client, RecognizeTextCommand } = require('@aws-sdk/client-lex-runtime-v2');

// Inicializar el cliente de Lex con las credenciales y región del .env
const lexClient = new LexRuntimeV2Client({
  region: process.env.LEX_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Envía un mensaje de texto a Amazon Lex y retorna la lista de respuestas.
 *
 * @param {string} texto    - Mensaje escrito por el usuario
 * @param {string} sessionId - ID de sesión único por usuario/conversación
 * @returns {Promise<string[]>} - Array con los textos de respuesta del bot
 */
async function enviarMensajeALex(texto, sessionId) {
  const params = {
    botId:       process.env.LEX_BOT_ID,
    botAliasId:  process.env.LEX_BOT_ALIAS,   // TSTALIASID en tu .env
    localeId:    process.env.LEX_LOCATE_ID,    // es_ES en tu .env
    sessionId,
    text: texto,
  };

  const command = new RecognizeTextCommand(params);
  const response = await lexClient.send(command);

  // Lex puede devolver múltiples burbujas de mensaje; las extraemos todas
  const mensajes = response.messages
    ? response.messages.map((m) => m.content)
    : ['Lo siento, no entendí tu mensaje.'];

  return mensajes;
}

module.exports = { enviarMensajeALex };