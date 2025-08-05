"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.traduccionesRouter = void 0;
const express_1 = require("express");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
// Obtener todas las traducciones
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield database_1.pool.query(`
      SELECT t.*, e.descripcion_etiqueta, i.nombre_idioma, i.codigo_iso
      FROM traducciones t
      JOIN etiquetas e ON t.id_etiqueta = e.id_etiqueta
      JOIN idiomas i ON t.id_idioma = i.id_idioma
      ORDER BY t.id_etiqueta, i.nombre_idioma
    `);
        res.json(rows);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener las traducciones', error });
    }
}));
// Obtener traducciones por etiqueta
router.get('/etiqueta/:idEtiqueta', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield database_1.pool.query(`
      SELECT t.*, e.descripcion_etiqueta, i.nombre_idioma, i.codigo_iso
      FROM traducciones t
      JOIN etiquetas e ON t.id_etiqueta = e.id_etiqueta
      JOIN idiomas i ON t.id_idioma = i.id_idioma
      WHERE t.id_etiqueta = ?
      ORDER BY i.nombre_idioma
    `, [req.params.idEtiqueta]);
        res.json(rows);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener las traducciones de la etiqueta', error });
    }
}));
// Obtener traducciones por idioma
router.get('/idioma/:idIdioma', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield database_1.pool.query(`
      SELECT t.*, e.descripcion_etiqueta, i.nombre_idioma, i.codigo_iso
      FROM traducciones t
      JOIN etiquetas e ON t.id_etiqueta = e.id_etiqueta
      JOIN idiomas i ON t.id_idioma = i.id_idioma
      WHERE t.id_idioma = ?
      ORDER BY e.descripcion_etiqueta
    `, [req.params.idIdioma]);
        res.json(rows);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener las traducciones del idioma', error });
    }
}));
// Crear una nueva traducción
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_etiqueta, id_idioma, texto_traduccion } = req.body;
        // Verificar si ya existe una traducción para esta etiqueta e idioma
        const [existing] = yield database_1.pool.query('SELECT * FROM traducciones WHERE id_etiqueta = ? AND id_idioma = ?', [id_etiqueta, id_idioma]);
        if (Array.isArray(existing) && existing.length > 0) {
            return res.status(400).json({ message: 'Ya existe una traducción para esta etiqueta e idioma' });
        }
        const [result] = yield database_1.pool.query('INSERT INTO traducciones (id_etiqueta, id_idioma, texto_traduccion) VALUES (?, ?, ?)', [id_etiqueta, id_idioma, texto_traduccion]);
        // Actualizar el porcentaje de traducción de la etiqueta
        yield actualizarPorcentajeTraduccion(id_etiqueta);
        res.status(201).json({
            id_traduccion: result.insertId,
            id_etiqueta,
            id_idioma,
            texto_traduccion
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al crear la traducción', error });
    }
}));
// Actualizar una traducción
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { texto_traduccion } = req.body;
        const id_traduccion = req.params.id;
        yield database_1.pool.query('UPDATE traducciones SET texto_traduccion = ? WHERE id_traduccion = ?', [texto_traduccion, id_traduccion]);
        // Obtener el id_etiqueta para actualizar el porcentaje
        const [traduccion] = yield database_1.pool.query('SELECT id_etiqueta FROM traducciones WHERE id_traduccion = ?', [id_traduccion]);
        if (Array.isArray(traduccion) && traduccion.length > 0) {
            yield actualizarPorcentajeTraduccion(traduccion[0].id_etiqueta);
        }
        res.json({
            id_traduccion,
            texto_traduccion
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al actualizar la traducción', error });
    }
}));
// Eliminar una traducción
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id_traduccion = req.params.id;
        // Obtener el id_etiqueta antes de eliminar
        const [traduccion] = yield database_1.pool.query('SELECT id_etiqueta FROM traducciones WHERE id_traduccion = ?', [id_traduccion]);
        yield database_1.pool.query('DELETE FROM traducciones WHERE id_traduccion = ?', [id_traduccion]);
        // Actualizar el porcentaje de traducción de la etiqueta
        if (Array.isArray(traduccion) && traduccion.length > 0) {
            yield actualizarPorcentajeTraduccion(traduccion[0].id_etiqueta);
        }
        res.json({ message: 'Traducción eliminada correctamente' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al eliminar la traducción', error });
    }
}));
// Función para actualizar el porcentaje de traducción de una etiqueta
function actualizarPorcentajeTraduccion(id_etiqueta) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Contar total de idiomas disponibles
            const [totalIdiomas] = yield database_1.pool.query('SELECT COUNT(*) as total FROM idiomas');
            const total = totalIdiomas[0].total;
            // Contar traducciones existentes para esta etiqueta
            const [traducciones] = yield database_1.pool.query('SELECT COUNT(*) as total FROM traducciones WHERE id_etiqueta = ?', [id_etiqueta]);
            const traducidas = traducciones[0].total;
            // Calcular porcentaje
            const porcentaje = total > 0 ? Math.round((traducidas / total) * 100) : 0;
            // Actualizar el porcentaje en la tabla etiquetas
            yield database_1.pool.query('UPDATE etiquetas SET porcentaje_traduccion = ? WHERE id_etiqueta = ?', [porcentaje, id_etiqueta]);
            // Obtener el id_modulo de la etiqueta para actualizar el porcentaje del módulo
            const [etiqueta] = yield database_1.pool.query('SELECT id_modulo FROM etiquetas WHERE id_etiqueta = ?', [id_etiqueta]);
            if (Array.isArray(etiqueta) && etiqueta.length > 0) {
                yield actualizarPorcentajeAvanceModulo(etiqueta[0].id_modulo);
            }
        }
        catch (error) {
            console.error('Error al actualizar porcentaje de traducción:', error);
        }
    });
}
// Función para actualizar el porcentaje de avance de un módulo
function actualizarPorcentajeAvanceModulo(id_modulo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Obtener todas las etiquetas del módulo con sus porcentajes de traducción
            const [etiquetas] = yield database_1.pool.query('SELECT porcentaje_traduccion FROM etiquetas WHERE id_modulo = ?', [id_modulo]);
            if (Array.isArray(etiquetas) && etiquetas.length > 0) {
                // Calcular el promedio de los porcentajes de traducción de todas las etiquetas
                const totalPorcentaje = etiquetas.reduce((sum, etiqueta) => {
                    return sum + (etiqueta.porcentaje_traduccion || 0);
                }, 0);
                const promedioPorcentaje = Math.round(totalPorcentaje / etiquetas.length);
                // Actualizar el porcentaje de avance del módulo
                yield database_1.pool.query('UPDATE modulos SET porcentaje_avance = ? WHERE id_modulo = ?', [promedioPorcentaje, id_modulo]);
            }
            else {
                // Si no hay etiquetas, el porcentaje es 0
                yield database_1.pool.query('UPDATE modulos SET porcentaje_avance = ? WHERE id_modulo = ?', [0, id_modulo]);
            }
        }
        catch (error) {
            console.error('Error al actualizar porcentaje de avance del módulo:', error);
        }
    });
}
exports.traduccionesRouter = router;
