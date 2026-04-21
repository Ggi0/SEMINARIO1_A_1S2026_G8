// Protege rutas verificando el Access Token de Cognito en el header Authorization

const { verificarToken } = require('../utils/cognitoJwt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * Middleware que verifica el JWT y adjunta el usuario a req.usuario
 * Uso: router.get('/ruta-protegida', verificarAuth, controller)
 */
async function verificarAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Token de autenticación requerido',
      });
    }

    const token = authHeader.split(' ')[1];

    let payload;
    let rows = [];

    try {
      // Verifica firma y expiración contra las claves públicas de Cognito
      payload = await verificarToken(token);

      // Busca el usuario en la BD local usando el cognito_sub del token
      [rows] = await pool.query(
        'SELECT id, username, correo, nombre_completo, foto_perfil_url, verificado FROM usuarios WHERE cognito_sub = ?',
        [payload.sub]
      );
    } catch (cognitoError) {
      // Si no es un token Cognito válido, intenta token facial del backend
      const secret = process.env.JWT_SECRET_FACIAL;
      if (!secret) {
        throw cognitoError;
      }

      payload = jwt.verify(token, secret);

      [rows] = await pool.query(
        'SELECT id, username, correo, nombre_completo, foto_perfil_url, verificado FROM usuarios WHERE id = ?',
        [payload.userId]
      );
    }

    if (rows.length === 0) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Usuario no encontrado en el sistema',
      });
    }

    // Disponible en todos los controllers siguientes
    req.usuario = rows[0];
    req.cognitoPayload = payload;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ ok: false, mensaje: 'Token expirado' });
    }
    return res.status(401).json({ ok: false, mensaje: 'Token inválido' });
  }
}

module.exports = { verificarAuth };