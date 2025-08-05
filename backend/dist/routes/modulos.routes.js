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
exports.modulosRouter = void 0;
const express_1 = require("express");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
// Función para actualizar el porcentaje de avance de un módulo
function actualizarPorcentajeAvanceModulo(id_modulo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`Actualizando porcentaje para módulo ${id_modulo}`);
            // Obtener todas las etiquetas del módulo con sus porcentajes de traducción
            const [etiquetas] = yield database_1.pool.query('SELECT porcentaje_traduccion FROM etiquetas WHERE id_modulo = ?', [id_modulo]);
            console.log('Etiquetas encontradas:', etiquetas);
            if (Array.isArray(etiquetas) && etiquetas.length > 0) {
                // Calcular el promedio de los porcentajes de traducción de todas las etiquetas
                const totalPorcentaje = etiquetas.reduce((sum, etiqueta) => {
                    const porcentaje = parseFloat(etiqueta.porcentaje_traduccion) || 0;
                    console.log(`Porcentaje de etiqueta: ${porcentaje}`);
                    return sum + porcentaje;
                }, 0);
                const promedioPorcentaje = Math.round(totalPorcentaje / etiquetas.length);
                console.log(`Total: ${totalPorcentaje}, Promedio: ${promedioPorcentaje}`);
                // Validar que el porcentaje sea un número válido
                if (isNaN(promedioPorcentaje)) {
                    console.error('Error: El porcentaje calculado es NaN');
                    return;
                }
                // Actualizar el porcentaje de avance del módulo
                yield database_1.pool.query('UPDATE modulos SET porcentaje_avance = ? WHERE id_modulo = ?', [promedioPorcentaje, id_modulo]);
                console.log(`Módulo ${id_modulo} actualizado con porcentaje: ${promedioPorcentaje}%`);
            }
            else {
                // Si no hay etiquetas, el porcentaje es 0
                yield database_1.pool.query('UPDATE modulos SET porcentaje_avance = ? WHERE id_modulo = ?', [0, id_modulo]);
                console.log(`Módulo ${id_modulo} sin etiquetas, porcentaje establecido en 0%`);
            }
        }
        catch (error) {
            console.error('Error al actualizar porcentaje de avance del módulo:', error);
        }
    });
}
// Obtener todos los módulos
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield database_1.pool.query('SELECT * FROM modulos');
        res.json(rows);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener los módulos', error });
    }
}));
// Ruta de prueba para verificar el cálculo de porcentajes
router.get('/test-calculo/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id_modulo = parseInt(req.params.id);
        // Obtener todas las etiquetas del módulo
        const [etiquetas] = yield database_1.pool.query('SELECT id_etiqueta, descripcion_etiqueta, porcentaje_traduccion FROM etiquetas WHERE id_modulo = ?', [id_modulo]);
        // Obtener el módulo
        const [modulo] = yield database_1.pool.query('SELECT * FROM modulos WHERE id_modulo = ?', [id_modulo]);
        res.json({
            modulo: modulo[0],
            etiquetas: etiquetas,
            total_etiquetas: Array.isArray(etiquetas) ? etiquetas.length : 0
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error en la prueba', error });
    }
}));
// Obtener un módulo por ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield database_1.pool.query('SELECT * FROM modulos WHERE id_modulo = ?', [req.params.id]);
        if (Array.isArray(rows) && rows.length > 0) {
            res.json(rows[0]);
        }
        else {
            res.status(404).json({ message: 'Módulo no encontrado' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener el módulo', error });
    }
}));
// Crear un nuevo módulo
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre_modulo } = req.body;
        const [result] = yield database_1.pool.query('INSERT INTO modulos (nombre_modulo, porcentaje_avance) VALUES (?, ?)', [nombre_modulo, 0.00]);
        res.status(201).json({
            id_modulo: result.insertId,
            nombre_modulo,
            porcentaje_avance: 0.00
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al crear el módulo', error });
    }
}));
// Actualizar un módulo
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre_modulo } = req.body;
        yield database_1.pool.query('UPDATE modulos SET nombre_modulo = ? WHERE id_modulo = ?', [nombre_modulo, req.params.id]);
        // Actualizar el porcentaje de avance automáticamente
        yield actualizarPorcentajeAvanceModulo(parseInt(req.params.id));
        // Obtener el módulo actualizado
        const [modulo] = yield database_1.pool.query('SELECT * FROM modulos WHERE id_modulo = ?', [req.params.id]);
        res.json(modulo[0]);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al actualizar el módulo', error });
    }
}));
// Eliminar un módulo
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.pool.query('DELETE FROM modulos WHERE id_modulo = ?', [req.params.id]);
        res.json({ message: 'Módulo eliminado correctamente' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al eliminar el módulo', error });
    }
}));
exports.modulosRouter = router;
