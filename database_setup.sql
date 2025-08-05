-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS traductor_app;
USE traductor_app;

-- Tabla de módulos
CREATE TABLE IF NOT EXISTS modulos (
    id_modulo INT AUTO_INCREMENT PRIMARY KEY,
    nombre_modulo VARCHAR(255) NOT NULL,
    porcentaje_avance DECIMAL(5,2) DEFAULT 0.00
);

-- Tabla de idiomas
CREATE TABLE IF NOT EXISTS idiomas (
    id_idioma INT AUTO_INCREMENT PRIMARY KEY,
    nombre_idioma VARCHAR(100) NOT NULL,
    codigo_iso VARCHAR(3) NOT NULL UNIQUE
);

-- Tabla de etiquetas
CREATE TABLE IF NOT EXISTS etiquetas (
    id_etiqueta INT AUTO_INCREMENT PRIMARY KEY,
    descripcion_etiqueta TEXT NOT NULL,
    id_modulo INT NOT NULL,
    porcentaje_traduccion DECIMAL(5,2) DEFAULT 0.00,
    FOREIGN KEY (id_modulo) REFERENCES modulos(id_modulo) ON DELETE CASCADE
);

-- Tabla de traducciones
CREATE TABLE IF NOT EXISTS traducciones (
    id_traduccion INT AUTO_INCREMENT PRIMARY KEY,
    id_etiqueta INT NOT NULL,
    id_idioma INT NOT NULL,
    texto_traduccion TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_etiqueta) REFERENCES etiquetas(id_etiqueta) ON DELETE CASCADE,
    FOREIGN KEY (id_idioma) REFERENCES idiomas(id_idioma) ON DELETE CASCADE,
    UNIQUE KEY unique_etiqueta_idioma (id_etiqueta, id_idioma)
);

-- Insertar datos de ejemplo para módulos
INSERT INTO modulos (nombre_modulo, porcentaje_avance) VALUES
('Interfaz de Usuario', 0.00),
('Mensajes del Sistema', 0.00),
('Documentación', 0.00),
('Ayuda Contextual', 0.00);

-- Insertar datos de ejemplo para idiomas
INSERT INTO idiomas (nombre_idioma, codigo_iso) VALUES
('Español', 'ES'),
('Inglés', 'EN'),
('Portugués', 'PT'),
('Francés', 'FR'),
('Alemán', 'DE'),
('Italiano', 'IT');

-- Insertar datos de ejemplo para etiquetas
INSERT INTO etiquetas (descripcion_etiqueta, id_modulo, porcentaje_traduccion) VALUES
('Bienvenido al sistema', 1, 0.00),
('Iniciar sesión', 1, 0.00),
('Cerrar sesión', 1, 0.00),
('Configuración', 1, 0.00),
('Guardar cambios', 2, 0.00),
('Error al cargar datos', 2, 0.00),
('Operación exitosa', 2, 0.00),
('Manual de usuario', 3, 0.00),
('Guía de inicio rápido', 3, 0.00),
('¿Necesitas ayuda?', 4, 0.00);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_etiquetas_modulo ON etiquetas(id_modulo);
CREATE INDEX idx_traducciones_etiqueta ON traducciones(id_etiqueta);
CREATE INDEX idx_traducciones_idioma ON traducciones(id_idioma); 