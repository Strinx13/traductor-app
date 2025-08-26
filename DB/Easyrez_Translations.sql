CREATE DATABASE easyrez_translations
USE easyrez_translations;
select * from  orden;

CREATE TABLE IF NOT EXISTS modulos (
    id_modulo INT AUTO_INCREMENT PRIMARY KEY,
    nombre_modulo VARCHAR(255) NOT NULL,
    porcentaje_avance DECIMAL(5,2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS idiomas (
    id_idioma INT AUTO_INCREMENT PRIMARY KEY,
    nombre_idioma VARCHAR(100) NOT NULL,
    codigo_iso VARCHAR(3) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS etiquetas (
    id_etiqueta INT AUTO_INCREMENT PRIMARY KEY,
    descripcion_etiqueta TEXT NOT NULL,
    id_modulo INT NOT NULL,
    porcentaje_traduccion DECIMAL(5,2) DEFAULT 0.00,
    FOREIGN KEY (id_modulo) REFERENCES modulos(id_modulo) ON DELETE CASCADE
);

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

INSERT INTO modulos (nombre_modulo, porcentaje_avance) VALUES
('Interfaz de Usuario', 0.00),
('Mensajes del Sistema', 0.00),
('Documentación', 0.00),
('Ayuda Contextual', 0.00);

INSERT INTO idiomas (nombre_idioma, codigo_iso) VALUES
('Español', 'ES'),
('Inglés', 'EN'),
('Portugués', 'PT'),
('Francés', 'FR'),
('Alemán', 'DE'),
('Italiano', 'IT');

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

CREATE INDEX idx_etiquetas_modulo ON etiquetas(id_modulo);
CREATE INDEX idx_traducciones_etiqueta ON traducciones(id_etiqueta);
CREATE INDEX idx_traducciones_idioma ON traducciones(id_idioma);

CREATE TABLE IF NOT EXISTS modulo_idiomas (
    id_modulo_idioma INT AUTO_INCREMENT PRIMARY KEY,
    id_modulo INT NOT NULL,
    id_idioma INT NOT NULL,
    FOREIGN KEY (id_modulo) REFERENCES modulos(id_modulo) ON DELETE CASCADE,
    FOREIGN KEY (id_idioma) REFERENCES idiomas(id_idioma) ON DELETE CASCADE,
    UNIQUE KEY unique_modulo_idioma (id_modulo, id_idioma)
);

INSERT IGNORE INTO modulo_idiomas (id_modulo, id_idioma) VALUES
(1, 1), (1, 2),
(2, 1), (2, 2),
(3, 1), (3, 2),
(4, 1), (4, 2);

CREATE INDEX idx_modulo_idiomas_modulo ON modulo_idiomas(id_modulo);
CREATE INDEX idx_modulo_idiomas_idioma ON modulo_idiomas(id_idioma);

UPDATE etiquetas SET porcentaje_traduccion = 0;

SELECT 'Base de datos actualizada correctamente' as mensaje;

ALTER TABLE traducciones ADD COLUMN orden INT DEFAULT 0;

CREATE INDEX idx_traducciones_orden ON traducciones(orden);

SET SQL_SAFE_UPDATES = 1; 
UPDATE traducciones SET orden = id_traduccion WHERE orden = 0 OR orden IS NULL;

SELECT id_traduccion, id_etiqueta, id_idioma, texto_traduccion, orden 
FROM traducciones 
ORDER BY id_etiqueta, orden;
