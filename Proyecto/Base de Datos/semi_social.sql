CREATE DATABASE IF NOT EXISTS semi_social
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE semi_social;

-- =========================
-- TABLA: usuarios
-- =========================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cognito_sub VARCHAR(100) UNIQUE NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    dpi VARCHAR(20) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    foto_perfil_url TEXT,
    foto_perfil_s3_key VARCHAR(255),
    verificado BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- TABLA: publicaciones
-- =========================
CREATE TABLE publicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    imagen_url TEXT NOT NULL,
    imagen_s3_key VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- TABLA: comentarios
-- =========================
CREATE TABLE comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    publicacion_id INT NOT NULL,
    usuario_id INT NOT NULL,
    comentario TEXT NOT NULL,
    fecha_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- TABLA: solicitudes_amistad
-- estado: pendiente, aceptada, rechazada
-- =========================
CREATE TABLE solicitudes_amistad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    remitente_id INT NOT NULL,
    destinatario_id INT NOT NULL,
    estado ENUM('pendiente', 'aceptada', 'rechazada') DEFAULT 'pendiente',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta TIMESTAMP NULL,
    FOREIGN KEY (remitente_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    UNIQUE KEY unique_solicitud (remitente_id, destinatario_id)
);

-- =========================
-- TABLA: amistades
-- guarda amistad ya aceptada
-- =========================
CREATE TABLE amistades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario1_id INT NOT NULL,
    usuario2_id INT NOT NULL,
    fecha_amistad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario1_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (usuario2_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    UNIQUE KEY unique_amistad (usuario1_id, usuario2_id)
);

-- =========================
-- TABLA: chats
-- un chat por pareja de amigos
-- =========================
CREATE TABLE chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario1_id INT NOT NULL,
    usuario2_id INT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario1_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (usuario2_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    UNIQUE KEY unique_chat (usuario1_id, usuario2_id)
);

-- =========================
-- TABLA: mensajes
-- =========================
CREATE TABLE mensajes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT NOT NULL,
    remitente_id INT NOT NULL,
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (remitente_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- TABLA: etiquetas
-- etiquetas detectadas por Rekognition
-- =========================
CREATE TABLE etiquetas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

-- =========================
-- TABLA: publicacion_etiquetas
-- relación muchos a muchos
-- =========================
CREATE TABLE publicacion_etiquetas (
    publicacion_id INT NOT NULL,
    etiqueta_id INT NOT NULL,
    PRIMARY KEY (publicacion_id, etiqueta_id),
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (etiqueta_id) REFERENCES etiquetas(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- ÍNDICES ÚTILES
-- =========================
CREATE INDEX idx_publicaciones_usuario ON publicaciones(usuario_id);
CREATE INDEX idx_publicaciones_fecha ON publicaciones(fecha_publicacion);
CREATE INDEX idx_comentarios_publicacion ON comentarios(publicacion_id);
CREATE INDEX idx_comentarios_usuario ON comentarios(usuario_id);
CREATE INDEX idx_mensajes_chat ON mensajes(chat_id);
CREATE INDEX idx_mensajes_fecha ON mensajes(fecha_envio);
CREATE INDEX idx_solicitudes_destinatario ON solicitudes_amistad(destinatario_id);