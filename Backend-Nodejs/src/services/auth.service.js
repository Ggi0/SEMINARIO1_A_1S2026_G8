// Importar módulo de encriptación
const crypto = require("crypto");
// Importar repositorio de usuarios
const userRepository = require("../repositories/user.repository");

// Función para encriptar contraseñas con MD5
function hashPassword(password) {
    return crypto.createHash("md5").update(password).digest("hex");
}

// Función para validar formato de correo electrónico
function validarCorreo(correo) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
}



// Función principal para registrar un usuario
exports.register = async (data, file) => {

    // Extraer datos del objeto recibido
    const { correo, nombre_completo, password, confirm_password } = data;

    // Verificar que todos los campos estén presentes
    if (!correo || !nombre_completo || !password || !confirm_password) {
        throw new Error("Todos los campos son obligatorios");
    }

    // Validar que el correo tenga formato correcto
    if (!validarCorreo(correo)) {
        throw new Error("Formato de correo inválido");
    }

    // Verificar que las contraseñas coincidan
    if (password !== confirm_password) {
        throw new Error("Las contraseñas no coinciden");
    }

    // Buscar si el correo ya existe en la base de datos
    const existing = await userRepository.findByEmail(correo);
    if (existing) {
        throw new Error("El correo ya está registrado");
    }

    // Encriptar la contraseña
    const hashedPassword = hashPassword(password);

    // Crear ruta de la foto si se proporcionó un archivo
    const fotoKey = file ? `Fotos_Perfil/${file.originalname}` : null;

    // Guardar el usuario en la base de datos
    await userRepository.create(
        correo,
        nombre_completo,
        hashedPassword,
        fotoKey
    );

    // Retornar respuesta exitosa
    return {
        success: true,
        message: "Usuario registrado correctamente"
    };
};

// Función principal para iniciar sesión
exports.login = async (data) => {

    // Extraer datos del objeto recibido
    const { correo, password } = data;

    // Verificar que correo y contraseña estén presentes
    if (!correo || !password) {
        throw new Error("Correo y contraseña son obligatorios");
    }

    // Validar que el correo tenga formato correcto
    if (!validarCorreo(correo)) {
        throw new Error("Formato de correo inválido");
    }

    // Encriptar la contraseña ingresada
    const hashedPassword = hashPassword(password);

    // Buscar el usuario por correo en la base de datos
    const user = await userRepository.findByEmail(correo);

    // Verificar si el usuario existe
    if (!user) {
        throw new Error("Usuario no encontrado");
    }

    // Verificar si la contraseña coincide
    if (user.password !== hashedPassword) {
        throw new Error("Contraseña incorrecta");
    }

    // Retornar respuesta exitosa con datos del usuario
    return {
        success: true,
        message: "Login exitoso",
        user: {
            id_usuario: user.id_usuario,
            correo: user.correo,
            nombre_completo: user.nombre_completo,
            foto_perfil: user.foto_perfil
        }
    };
};