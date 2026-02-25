from app.config import get_connection

def find_by_id(id_usuario):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM usuarios WHERE id_usuario = %s", (id_usuario,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    return user

def update_profile(id_usuario, nombre, foto):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        UPDATE usuarios
        SET nombre_completo = %s,
            foto_perfil = %s
        WHERE id_usuario = %s
        """,
        (nombre, foto, id_usuario)
    )
    conn.commit()
    cur.close()
    conn.close()

def find_by_email(email):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    return user

def create_user(nombre_completo, email, password_hash):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO usuarios (nombre_completo, email, password) VALUES (%s, %s, %s)",
        (nombre_completo, email, password_hash)
    )
    conn.commit()
    cur.close()
    conn.close()