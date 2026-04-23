const { registrarEnCognito, confirmarUsuarioCodigo } = require('../../services/registro/cognito');
const { pool } = require('../../config/db');
const bcrypt = require('bcrypt');

/**
 * POST /api/usuario/registro
 */
async function registrarUsuario(req, res) {
  try {
    const {
      username,
      password,
      correo,
      nombre_completo,
      dpi,
      foto_perfil_url,
      foto_perfil_s3_key
    } = req.body;

    // Validación básica
    if (!username || !password || !correo || !nombre_completo || !dpi) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Todos los campos son requeridos',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El correo no tiene un formato válido',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La contraseña debe tener al menos 8 caracteres',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // 1. Crear usuario en Cognito
    const cognito_sub = await registrarEnCognito({
      username,
      password,
      correo,
      nombreCompleto: nombre_completo,
      dpi,
    });

    // 2. Guardar en MySQL
    await pool.query(
      `INSERT INTO usuarios 
      (username, correo, nombre_completo, dpi, password_hash, cognito_sub, foto_perfil_url, foto_perfil_s3_key, verificado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        username,
        correo,
        nombre_completo,
        dpi,
        passwordHash,
        cognito_sub,
        foto_perfil_url || null,
        foto_perfil_s3_key || null,
      ]
    );

    return res.status(201).json({
      ok: true,
      mensaje: 'Usuario registrado. Verifica tu correo.',
    });

  } catch (error) {
    console.error('[REGISTRO] Error:', error);

    if (error.name === 'UsernameExistsException') {
      return res.status(400).json({
        ok: false,
        mensaje: 'El usuario ya existe',
      });
    }

    if (error.name === 'InvalidPasswordException') {
      return res.status(400).json({
        ok: false,
        mensaje: 'La contraseña no cumple la política de Cognito',
      });
    }

    if (error.name === 'InvalidParameterException') {
      return res.status(400).json({
        ok: false,
        mensaje: 'Datos inválidos para registro en Cognito',
      });
    }

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        ok: false,
        mensaje: 'Correo, DPI o username ya están registrados',
      });
    }

    return res.status(500).json({
      ok: false,
      mensaje: 'Error en el registro',
    });
  }
}

/**
 * POST /api/usuario/confirmar-correo
 */
async function confirmarCorreo(req, res) {
  try {
    const { username, codigo } = req.body;

    if (!username || !codigo) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Username y código son requeridos',
      });
    }

    // 1. Confirmar en Cognito
    await confirmarUsuarioCodigo({ username, codigo });

    // 2. Actualizar BD
    await pool.query(
      `UPDATE usuarios SET verificado = 1 WHERE username = ?`,
      [username]
    );

    return res.json({
      ok: true,
      mensaje: 'Usuario confirmado correctamente',
    });

  } catch (error) {
    console.error('[CONFIRMAR] Error:', error);

    if (error.name === 'CodeMismatchException') {
      return res.status(400).json({ ok: false, mensaje: 'Código incorrecto' });
    }

    return res.status(500).json({
      ok: false,
      mensaje: 'Error al confirmar correo',
    });
  }
}



module.exports = {
  registrarUsuario,
  confirmarCorreo,
};
