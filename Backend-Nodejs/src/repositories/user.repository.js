exports.findById = async (id_usuario) => {
    const result = await pool.query(
        "SELECT * FROM usuarios WHERE id_usuario = $1",
        [id_usuario]
    );
    return result.rows[0];
};

exports.updateProfile = async (id_usuario, nombre, foto) => {
    await pool.query(
        `UPDATE usuarios
         SET nombre_completo = $1,
             foto_perfil = $2
         WHERE id_usuario = $3`,
        [nombre, foto, id_usuario]
    );
};