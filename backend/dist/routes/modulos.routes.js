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
// Función para actualizar el porcentaje de avance de un módulo basado en idiomas seleccionados
function actualizarPorcentajeAvanceModulo(id_modulo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`Actualizando porcentaje para módulo ${id_modulo}`);
            // Obtener los idiomas seleccionados para este módulo
            const [idiomasSeleccionados] = yield database_1.pool.query('SELECT id_idioma FROM modulo_idiomas WHERE id_modulo = ?', [id_modulo]);
            if (!Array.isArray(idiomasSeleccionados) || idiomasSeleccionados.length === 0) {
                console.log(`Módulo ${id_modulo} sin idiomas seleccionados, porcentaje establecido en 0%`);
                yield database_1.pool.query('UPDATE modulos SET porcentaje_avance = ? WHERE id_modulo = ?', [0, id_modulo]);
                return;
            }
            const idiomasIds = idiomasSeleccionados.map(item => item.id_idioma);
            console.log(`Idiomas seleccionados para módulo ${id_modulo}:`, idiomasIds);
            // Obtener todas las etiquetas del módulo
            const [etiquetas] = yield database_1.pool.query('SELECT id_etiqueta FROM etiquetas WHERE id_modulo = ?', [id_modulo]);
            console.log('Etiquetas encontradas:', etiquetas);
            if (Array.isArray(etiquetas) && etiquetas.length > 0) {
                let totalPorcentajeEtiquetas = 0;
                // Calcular el porcentaje de cada etiqueta basado en los idiomas seleccionados
                for (const etiqueta of etiquetas) {
                    const id_etiqueta = etiqueta.id_etiqueta;
                    // Contar traducciones existentes para los idiomas seleccionados
                    const [traducciones] = yield database_1.pool.query('SELECT COUNT(*) as count FROM traducciones WHERE id_etiqueta = ? AND id_idioma IN (?)', [id_etiqueta, idiomasIds]);
                    const traduccionesCount = traducciones[0].count;
                    const porcentajeEtiqueta = Math.round((traduccionesCount / idiomasIds.length) * 100);
                    // Actualizar el porcentaje de la etiqueta
                    yield database_1.pool.query('UPDATE etiquetas SET porcentaje_traduccion = ? WHERE id_etiqueta = ?', [porcentajeEtiqueta, id_etiqueta]);
                    totalPorcentajeEtiquetas += porcentajeEtiqueta;
                    console.log(`Etiqueta ${id_etiqueta}: ${traduccionesCount}/${idiomasIds.length} traducciones = ${porcentajeEtiqueta}%`);
                }
                const promedioPorcentaje = Math.round(totalPorcentajeEtiquetas / etiquetas.length);
                console.log(`Total: ${totalPorcentajeEtiquetas}, Promedio: ${promedioPorcentaje}`);
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
// Obtener todos los módulos con sus idiomas seleccionados
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [modulos] = yield database_1.pool.query('SELECT * FROM modulos ORDER BY nombre_modulo');
        // Para cada módulo, obtener sus idiomas seleccionados
        const modulosConIdiomas = yield Promise.all(modulos.map((modulo) => __awaiter(void 0, void 0, void 0, function* () {
            const [idiomas] = yield database_1.pool.query(`SELECT i.id_idioma, i.nombre_idioma, i.codigo_iso 
           FROM idiomas i 
           INNER JOIN modulo_idiomas mi ON i.id_idioma = mi.id_idioma 
           WHERE mi.id_modulo = ?`, [modulo.id_modulo]);
            return Object.assign(Object.assign({}, modulo), { idiomas_seleccionados: idiomas });
        })));
        res.json(modulosConIdiomas);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener los módulos', error });
    }
}));
// Ruta de prueba para verificar el cálculo de porcentajes
router.get('/test-calculo/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id_modulo = parseInt(req.params.id);
        // Obtener los idiomas seleccionados
        const [idiomasSeleccionados] = yield database_1.pool.query('SELECT id_idioma FROM modulo_idiomas WHERE id_modulo = ?', [id_modulo]);
        // Obtener todas las etiquetas del módulo
        const [etiquetas] = yield database_1.pool.query('SELECT id_etiqueta, descripcion_etiqueta, porcentaje_traduccion FROM etiquetas WHERE id_modulo = ?', [id_modulo]);
        // Obtener el módulo
        const [modulo] = yield database_1.pool.query('SELECT * FROM modulos WHERE id_modulo = ?', [id_modulo]);
        res.json({
            modulo: modulo[0],
            idiomas_seleccionados: idiomasSeleccionados,
            etiquetas: etiquetas,
            total_etiquetas: Array.isArray(etiquetas) ? etiquetas.length : 0
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error en la prueba', error });
    }
}));
// Obtener un módulo por ID con sus idiomas seleccionados
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [modulo] = yield database_1.pool.query('SELECT * FROM modulos WHERE id_modulo = ?', [req.params.id]);
        if (Array.isArray(modulo) && modulo.length > 0) {
            // Obtener idiomas seleccionados para este módulo
            const [idiomas] = yield database_1.pool.query(`SELECT i.id_idioma, i.nombre_idioma, i.codigo_iso 
         FROM idiomas i 
         INNER JOIN modulo_idiomas mi ON i.id_idioma = mi.id_idioma 
         WHERE mi.id_modulo = ?`, [req.params.id]);
            const moduloConIdiomas = Object.assign(Object.assign({}, modulo[0]), { idiomas_seleccionados: idiomas });
            res.json(moduloConIdiomas);
        }
        else {
            res.status(404).json({ message: 'Módulo no encontrado' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener el módulo', error });
    }
}));
// Crear un nuevo módulo con idiomas seleccionados
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre_modulo, idiomas_seleccionados } = req.body;
        // Crear el módulo
        const [result] = yield database_1.pool.query('INSERT INTO modulos (nombre_modulo, porcentaje_avance) VALUES (?, ?)', [nombre_modulo, 0.00]);
        const id_modulo = result.insertId;
        // Asignar idiomas seleccionados al módulo
        if (Array.isArray(idiomas_seleccionados) && idiomas_seleccionados.length > 0) {
            for (const id_idioma of idiomas_seleccionados) {
                yield database_1.pool.query('INSERT INTO modulo_idiomas (id_modulo, id_idioma) VALUES (?, ?)', [id_modulo, id_idioma]);
            }
        }
        // Obtener el módulo creado con sus idiomas
        const [moduloCreado] = yield database_1.pool.query('SELECT * FROM modulos WHERE id_modulo = ?', [id_modulo]);
        const [idiomas] = yield database_1.pool.query(`SELECT i.id_idioma, i.nombre_idioma, i.codigo_iso 
       FROM idiomas i 
       INNER JOIN modulo_idiomas mi ON i.id_idioma = mi.id_idioma 
       WHERE mi.id_modulo = ?`, [id_modulo]);
        res.status(201).json(Object.assign(Object.assign({}, moduloCreado[0]), { idiomas_seleccionados: idiomas }));
    }
    catch (error) {
        res.status(500).json({ message: 'Error al crear el módulo', error });
    }
}));
// Actualizar un módulo con idiomas seleccionados
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre_modulo, idiomas_seleccionados } = req.body;
        const id_modulo = parseInt(req.params.id);
        // Actualizar nombre del módulo
        yield database_1.pool.query('UPDATE modulos SET nombre_modulo = ? WHERE id_modulo = ?', [nombre_modulo, id_modulo]);
        // Eliminar idiomas anteriores
        yield database_1.pool.query('DELETE FROM modulo_idiomas WHERE id_modulo = ?', [id_modulo]);
        // Asignar nuevos idiomas seleccionados
        if (Array.isArray(idiomas_seleccionados) && idiomas_seleccionados.length > 0) {
            for (const id_idioma of idiomas_seleccionados) {
                yield database_1.pool.query('INSERT INTO modulo_idiomas (id_modulo, id_idioma) VALUES (?, ?)', [id_modulo, id_idioma]);
            }
        }
        // Actualizar el porcentaje de avance automáticamente
        yield actualizarPorcentajeAvanceModulo(id_modulo);
        // Obtener el módulo actualizado con sus idiomas
        const [modulo] = yield database_1.pool.query('SELECT * FROM modulos WHERE id_modulo = ?', [id_modulo]);
        const [idiomas] = yield database_1.pool.query(`SELECT i.id_idioma, i.nombre_idioma, i.codigo_iso 
       FROM idiomas i 
       INNER JOIN modulo_idiomas mi ON i.id_idioma = mi.id_idioma 
       WHERE mi.id_modulo = ?`, [id_modulo]);
        res.json(Object.assign(Object.assign({}, modulo[0]), { idiomas_seleccionados: idiomas }));
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
