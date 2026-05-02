// Servicio para comunicarse con el endpoint /api/chat-bot del backend
// Sigue el mismo patrón que sesion.js

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Envía un mensaje al chatbot y retorna el array de respuestas.
 *
 * @param {string} texto      - Texto escrito por el usuario
 * @param {string} sessionId  - ID de sesión del cliente
 * @returns {Promise<{ ok: boolean, mensajes?: string[], mensaje?: string }>}
 */
export const enviarMensajeChat = async (texto, sessionId) => {
  const res = await fetch(`${API_URL}/chat-bot`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ texto, sessionId }),
  });

  return await res.json();
};