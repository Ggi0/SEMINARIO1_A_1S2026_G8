const { pool } = require('../../config/db');
const {
  loginConCredenciales,
  actualizarAtributosCognito,
} = require('../../services/registro/cognito');

async function obtenerPerfil(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, username, correo, nombre_completo, dpi, foto_perfil_url, foto_perfil_s3_key, verificado
       FROM usuarios
       WHERE id = ?`,
      [req.usuario.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }

    return res.status(200).json({
      ok: true,
      usuario: rows[0],
    });
  } catch (error) {
    console.error('[PERFIL] Error al obtener perfil:', error);
    return res.status(500).json({ ok: false, mensaje: 'No se pudo obtener el perfil' });
  }
}

async function actualizarPerfil(req, res) {
  try {
    const {
      nombre_completo,
      dpi,
      password,
      foto_perfil_url,
      foto_perfil_s3_key,
    } = req.body;

    if (!nombre_completo || !dpi || !password) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Nombre completo, DPI y contrasena son requeridos',
      });
    }

    const nombreNormalizado = String(nombre_completo).trim();
    const dpiNormalizado = String(dpi).trim();

    if (!nombreNormalizado || !dpiNormalizado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Nombre completo y DPI no pueden estar vacios',
      });
    }

    await loginConCredenciales({
      username: req.usuario.username,
      password,
    });

    await actualizarAtributosCognito(req.usuario.username, [
      { Name: 'name', Value: nombreNormalizado },
      { Name: 'custom:dpi', Value: dpiNormalizado },
    ]);

    const campos = ['nombre_completo = ?', 'dpi = ?'];
    const valores = [nombreNormalizado, dpiNormalizado];

    if (foto_perfil_url !== undefined) {
      campos.push('foto_perfil_url = ?');
      valores.push(foto_perfil_url || null);
    }

    if (foto_perfil_s3_key !== undefined) {
      campos.push('foto_perfil_s3_key = ?');
      valores.push(foto_perfil_s3_key || null);
    }

    valores.push(req.usuario.id);

    await pool.query(
      `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`,
      valores
    );

    const [rows] = await pool.query(
      `SELECT id, username, correo, nombre_completo, dpi, foto_perfil_url, foto_perfil_s3_key, verificado
       FROM usuarios
       WHERE id = ?`,
      [req.usuario.id]
    );

    return res.status(200).json({
      ok: true,
      mensaje: 'Perfil actualizado correctamente',
      usuario: rows[0],
    });
  } catch (error) {
    if (error.name === 'NotAuthorizedException') {
      return res.status(401).json({ ok: false, mensaje: 'Contrasena incorrecta' });
    }

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ ok: false, mensaje: 'El DPI ya esta registrado por otro usuario' });
    }

    console.error('[PERFIL] Error al actualizar perfil:', error);
    return res.status(500).json({ ok: false, mensaje: 'No se pudo actualizar el perfil' });
  }
}

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
};
