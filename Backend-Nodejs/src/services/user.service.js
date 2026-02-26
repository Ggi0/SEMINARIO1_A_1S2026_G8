const crypto = require("crypto");
const userRepository = require("../repositories/user.repository");

function hashPassword(password) {
    return crypto.createHash("md5").update(password).digest("hex");
}

exports.updateProfile = async (data, file) => {

    const { id_usuario, nombre_completo, password_actual, password_nueva } = data;

    if (!id_usuario || !password_actual) {
        throw new Error("Datos incompletos");
    }

    const user = await userRepository.findById(id_usuario);

    if (!user) {
        throw new Error("Usuario no encontrado");
    }

    const hashed = hashPassword(password_actual);

    if (user.password !== hashed) {
        throw new Error("Contraseña actual incorrecta");
    }

    const fotoKey = file ? `Fotos_Perfil/${file.originalname}` : user.foto_perfil;

    // Si viene password_nueva, la encriptamos, si no usamos la actual
    const nuevaPassword = password_nueva ? hashPassword(password_nueva) : user.password;

    await userRepository.updateProfile(
        id_usuario,
        nombre_completo || user.nombre_completo,
        fotoKey,
        nuevaPassword  // ⬅️ pasamos la contraseña
    );

    return {
        success: true,
        message: "Perfil actualizado correctamente"
    };
};