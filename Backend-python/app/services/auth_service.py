# Importar módulo de hash para encriptación
import hashlib
# Importar módulo de expresiones regulares para validaciones
import re
# Importar funciones del repositorio de usuarios
from app.repositories.user_repository import find_by_email, create_user

# Función para encriptar contraseñas con MD5
def hash_password(password):
    return hashlib.md5(password.encode()).hexdigest()

# Función para validar formato de correo electrónico
def validar_correo(correo):
    return re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", correo)

# Función principal para registrar un usuario
def register_user(data, file):

    # Extraer datos del objeto recibido
    correo = data.get("correo")
    nombre = data.get("nombre_completo")
    password = data.get("password")
    confirm = data.get("confirm_password")

    # Verificar que todos los campos estén presentes
    if not correo or not nombre or not password or not confirm:
        raise Exception("Todos los campos son obligatorios")

    # Validar que el correo tenga formato correcto
    if not validar_correo(correo):
        raise Exception("Formato de correo inválido")

    # Verificar que las contraseñas coincidan
    if password != confirm:
        raise Exception("Las contraseñas no coinciden")

    # Buscar si el correo ya existe en la base de datos
    if find_by_email(correo):
        raise Exception("El correo ya está registrado")

    # Encriptar la contraseña
    hashed = hash_password(password)

    # Crear ruta de la foto si se proporcionó un archivo
    foto_key = f"Fotos_Perfil/{file.filename}" if file else None

    # Guardar el usuario en la base de datos
    create_user(correo, nombre, hashed, foto_key)

    # Retornar respuesta exitosa
    return {
        "success": True,
        "message": "Usuario registrado correctamente"
    }


# Función principal para iniciar sesión
def login_user(data):

    correo = data.get("correo")
    password = data.get("password")

    if not correo or not password:
        raise Exception("Correo y contraseña son obligatorios")

    if not validar_correo(correo):
        raise Exception("Formato de correo inválido")

    hashed_password = hash_password(password)

    user = find_by_email(correo)

    if not user:
        raise Exception("Usuario no encontrado")

    # En tu tabla:
    # id_usuario (0)
    # correo (1)
    # nombre_completo (2)
    # password (3)
    # foto_perfil (4)

    if user[3] != hashed_password:
        raise Exception("Contraseña incorrecta")

    return {
        "success": True,
        "message": "Login exitoso",
        "user": {
            "id_usuario": user[0],
            "correo": user[1],
            "nombre_completo": user[2],
            "foto_perfil": user[4]
        }
    }

