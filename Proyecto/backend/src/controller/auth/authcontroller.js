// Maneja el login por credenciales y por reconocimiento facial

const { loginConCredenciales } = require('../../services/registro/cognito');
const { compararRostros } = require('../../services/registro/rekognition');
const { pool } = require('../../config/db');

/**
 * POST /api/auth/login
 * Login con username + password a través de Cognito
 * 
 * Body: { username, password }
 * Response: { ok, accessToken, idToken, refreshToken, usuario }
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Username y contraseña son requeridos',
      });
    }

    // Autenticar contra Cognito
    const tokens = await loginConCredenciales({ username, password });

    // Obtener datos del usuario desde MySQL para retornar al frontend
    const [rows] = await pool.query(
      `SELECT id, nombre_completo, correo, username, foto_perfil_url, verificado
       FROM usuarios WHERE username = ?`,
      [username]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado en BD' });
    }

    return res.status(200).json({
      ok: true,
      mensaje: 'Login exitoso',
      ...tokens,
      usuario: rows[0],
    });

  } catch (error) {
    // Errores específicos de Cognito
    if (error.name === 'NotAuthorizedException') {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas' });
    }
    if (error.name === 'UserNotConfirmedException') {
      return res.status(403).json({ ok: false, mensaje: 'Correo no verificado. Revisa tu bandeja de entrada.' });
    }
    if (error.name === 'UserNotFoundException') {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no existe' });
    }

    console.error('[AUTH] Error en login:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
}

/**
 * POST /api/auth/login-facial
 * Login por reconocimiento facial con Rekognition
 * 
 * Body: multipart/form-data con campo "foto" (imagen)
 * Proceso: recibe imagen → compara contra TODOS los usuarios con foto → 
 *          si hay match con similitud >= 80%, retorna tokens de ese usuario
 * 
 * IMPORTANTE: Para generar tokens de Cognito en este flujo,
 * usamos AdminInitiateAuth que no requiere contraseña (flujo admin).
 * Necesitas habilitar ALLOW_ADMIN_USER_PASSWORD_AUTH en el app client.
 */
async function loginFacial(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, mensaje: 'Se requiere una imagen para el reconocimiento facial' });
    }

    const imagenBuffer = req.file.buffer;

    // Obtener todos los usuarios que tienen foto de perfil en S3
    const [usuarios] = await pool.query(
      `SELECT id, username, cognito_sub, nombre_completo, correo, 
              foto_perfil_url, foto_perfil_s3_key
       FROM usuarios 
       WHERE foto_perfil_s3_key IS NOT NULL AND foto_perfil_s3_key != ''`
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'No hay usuarios registrados con foto' });
    }

    // Comparar la foto recibida contra cada foto de perfil en S3
    let usuarioEncontrado = null;
    let maxSimilitud = 0;

    for (const usuario of usuarios) {
      const { coincide, similitud } = await compararRostros(imagenBuffer, usuario.foto_perfil_s3_key);

      if (coincide && similitud > maxSimilitud) {
        maxSimilitud = similitud;
        usuarioEncontrado = usuario;
      }
    }

    if (!usuarioEncontrado) {
      return res.status(401).json({
        ok: false,
        mensaje: 'No se reconoció el rostro. Intenta con credenciales.',
      });
    }

    // Generar tokens usando flujo admin (sin contraseña)
    // Requiere ALLOW_ADMIN_USER_PASSWORD_AUTH habilitado en Cognito App Client
    const {
      AdminInitiateAuthCommand,
    } = require('@aws-sdk/client-cognito-identity-provider');
    const { cognitoClient } = require('../../config/aws');

    const authComando = new AdminInitiateAuthCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: usuarioEncontrado.username,
        // Usamos un token temporal firmado por el backend — 
        // alternativa: generar una contraseña temporal y resetearla
        // Por simplicidad en este proyecto: guardamos la contraseña en el servicio
        // o usamos CUSTOM_AUTH flow. Ver nota abajo.
      },
    });

    // NOTA IMPORTANTE: Cognito no permite generar tokens sin contraseña con flujos
    // estándar. La solución más limpia para este proyecto es:
    // Opción A (recomendada): Guardar una contraseña aleatoria segura en BD y usarla aquí.
    // Opción B: Usar Custom Auth Flow con Lambda triggers.
    // 
    // Para este proyecto académico, implementamos Opción A:
    // Al registrar, guardamos el password hasheado en MySQL Y lo usamos aquí.
    // Sin embargo, esto requiere guardar la contraseña en texto (mala práctica).
    //
    // SOLUCIÓN PRÁCTICA PARA EL PROYECTO:
    // Retornamos un token propio del backend (firmado con JWT secreto del backend)
    // que el frontend usará para identificar al usuario en rutas protegidas.
    // El middleware verificarAuth acepta AMBOS tipos de token.

    const jwt = require('jsonwebtoken');
    const tokenFacial = jwt.sign(
      {
        sub: usuarioEncontrado.cognito_sub,
        userId: usuarioEncontrado.id,
        username: usuarioEncontrado.username,
        loginMethod: 'facial',
        similitud: maxSimilitud,
      },
      process.env.JWT_SECRET_FACIAL,
      { expiresIn: '60m' }
    );

    return res.status(200).json({
      ok: true,
      mensaje: `Bienvenido ${usuarioEncontrado.nombre_completo} (similitud: ${maxSimilitud.toFixed(1)}%)`,
      accessToken: tokenFacial,
      loginMethod: 'facial',
      usuario: {
        id: usuarioEncontrado.id,
        nombre_completo: usuarioEncontrado.nombre_completo,
        correo: usuarioEncontrado.correo,
        username: usuarioEncontrado.username,
        foto_perfil_url: usuarioEncontrado.foto_perfil_url,
      },
    });

  } catch (error) {
    console.error('[AUTH] Error en login facial:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error en el reconocimiento facial' });
  }
}

/**
 * POST /api/auth/verificar-token
 * Verifica si el token actual sigue siendo válido.
 * Útil para que el frontend valide la sesión al recargar la página.
 * 
 * Headers: Authorization: Bearer <token>
 */
async function verificarSesion(req, res) {
  // Si llega aquí es porque el middleware verificarAuth ya lo validó
  return res.status(200).json({
    ok: true,
    mensaje: 'Token válido',
    usuario: req.usuario,
  });
}

module.exports = { login, loginFacial, verificarSesion };