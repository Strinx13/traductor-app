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
exports.etiquetasRouter = void 0;
const express_1 = require("express");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
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
// Obtener todas las etiquetas
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield database_1.pool.query('SELECT * FROM etiquetas');
        res.json(rows);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener las etiquetas', error });
    }
}));
// Obtener una etiqueta por ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield database_1.pool.query('SELECT * FROM etiquetas WHERE id_etiqueta = ?', [req.params.id]);
        if (Array.isArray(rows) && rows.length > 0) {
            res.json(rows[0]);
        }
        else {
            res.status(404).json({ message: 'Etiqueta no encontrada' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener la etiqueta', error });
    }
}));
// Crear una nueva etiqueta
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { descripcion_etiqueta, id_modulo, porcentaje_traduccion } = req.body;
        const [result] = yield database_1.pool.query('INSERT INTO etiquetas (descripcion_etiqueta, id_modulo, porcentaje_traduccion) VALUES (?, ?, ?)', [descripcion_etiqueta, id_modulo, porcentaje_traduccion || 0.00]);
        // Actualizar el porcentaje de avance del módulo
        yield actualizarPorcentajeAvanceModulo(id_modulo);
        res.status(201).json({
            id_etiqueta: result.insertId,
            descripcion_etiqueta,
            id_modulo,
            porcentaje_traduccion: porcentaje_traduccion || 0.00
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al crear la etiqueta', error });
    }
}));
// Actualizar una etiqueta
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { descripcion_etiqueta, id_modulo, porcentaje_traduccion } = req.body;
        yield database_1.pool.query('UPDATE etiquetas SET descripcion_etiqueta = ?, id_modulo = ?, porcentaje_traduccion = ? WHERE id_etiqueta = ?', [descripcion_etiqueta, id_modulo, porcentaje_traduccion, req.params.id]);
        // Actualizar el porcentaje de avance del módulo
        yield actualizarPorcentajeAvanceModulo(id_modulo);
        res.json({
            id_etiqueta: req.params.id,
            descripcion_etiqueta,
            id_modulo,
            porcentaje_traduccion
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al actualizar la etiqueta', error });
    }
}));
// Eliminar una etiqueta
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Obtener el id_modulo antes de eliminar
        const [etiqueta] = yield database_1.pool.query('SELECT id_modulo FROM etiquetas WHERE id_etiqueta = ?', [req.params.id]);
        // Eliminar traducciones asociadas primero (por la foreign key)
        yield database_1.pool.query('DELETE FROM traducciones WHERE id_etiqueta = ?', [req.params.id]);
        // Eliminar la etiqueta
        yield database_1.pool.query('DELETE FROM etiquetas WHERE id_etiqueta = ?', [req.params.id]);
        // Actualizar el porcentaje de avance del módulo
        if (Array.isArray(etiqueta) && etiqueta.length > 0) {
            yield actualizarPorcentajeAvanceModulo(etiqueta[0].id_modulo);
        }
        res.json({ message: 'Etiqueta eliminada correctamente' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al eliminar la etiqueta', error });
    }
}));
exports.etiquetasRouter = router;
