const crypto = require("crypto");
const userRepository = require("../repositories/user.repository");

function hashPassword(password) {
    return crypto.createHash("md5").update(password).digest("hex");
}

exports.updateProfile = async (data, file) => {

    const { id_usuario, nombre_completo, password_actual } = data;

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

    await userRepository.updateProfile(
        id_usuario,
        nombre_completo || user.nombre_completo,
        fotoKey,
        user.password 
    );
    return {
        success: true,
        message: "Perfil actualizado correctamente"
    };
};