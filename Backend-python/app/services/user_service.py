from app.repositories.user_repository import find_by_id, update_profile as repo_update_profile
from app.services.auth_service import hash_password

def update_profile(data, file):

    id_usuario = data.get("id_usuario")
    nombre = data.get("nombre_completo")
    password_actual = data.get("password_actual")

    if not id_usuario or not password_actual:
        raise Exception("Datos incompletos")

    user = find_by_id(id_usuario)

    if not user:
        raise Exception("Usuario no encontrado")

    hashed = hash_password(password_actual)

    if user[3] != hashed:
        raise Exception("Contraseña actual incorrecta")

    foto_key = f"Fotos_Perfil/{file.filename}" if file else user[4]

    # 👇 AQUÍ ESTABA EL ERROR
    repo_update_profile(id_usuario, nombre or user[2], foto_key)

    return {
        "success": True,
        "message": "Perfil actualizado correctamente"
    }