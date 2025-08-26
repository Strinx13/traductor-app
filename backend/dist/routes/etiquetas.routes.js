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
        console.log('Actualizando etiqueta:', req.params.id, req.body);
        const { descripcion_etiqueta, id_modulo, porcentaje_traduccion } = req.body;
        yield database_1.pool.query('UPDATE etiquetas SET descripcion_etiqueta = ?, id_modulo = ?, porcentaje_traduccion = ? WHERE id_etiqueta = ?', [descripcion_etiqueta, id_modulo, porcentaje_traduccion, req.params.id]);
        console.log('Etiqueta actualizada, llamando a actualizarPorcentajeAvanceModulo para módulo:', id_modulo);
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
        console.error('Error al actualizar la etiqueta:', error);
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
// Ruta de prueba para verificar el cálculo de porcentajes de módulos
router.get('/test-calculo-modulo/:id_modulo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id_modulo = parseInt(req.params.id_modulo);
        // Obtener todas las etiquetas del módulo
        const [etiquetas] = yield database_1.pool.query('SELECT id_etiqueta, descripcion_etiqueta, porcentaje_traduccion FROM etiquetas WHERE id_modulo = ?', [id_modulo]);
        // Obtener el módulo
        const [modulo] = yield database_1.pool.query('SELECT * FROM modulos WHERE id_modulo = ?', [id_modulo]);
        // Calcular el porcentaje manualmente
        let promedioCalculado = 0;
        if (Array.isArray(etiquetas) && etiquetas.length > 0) {
            const totalPorcentaje = etiquetas.reduce((sum, etiqueta) => {
                return sum + (parseFloat(etiqueta.porcentaje_traduccion) || 0);
            }, 0);
            promedioCalculado = Math.round(totalPorcentaje / etiquetas.length);
        }
        res.json({
            modulo: modulo[0],
            etiquetas: etiquetas,
            total_etiquetas: Array.isArray(etiquetas) ? etiquetas.length : 0,
            promedio_calculado: promedioCalculado
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error en la prueba', error });
    }
}));
// Ruta para exportar traducciones en formato .ts
router.get('/export/translations/:modulo_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const modulo_id = parseInt(req.params.modulo_id);
        console.log(`Exportando traducciones para módulo: ${modulo_id}`);
        // Obtener el módulo
        const [modulo] = yield database_1.pool.query('SELECT * FROM modulos WHERE id_modulo = ?', [modulo_id]);
        if (!Array.isArray(modulo) || modulo.length === 0) {
            return res.status(404).json({ message: 'Módulo no encontrado' });
        }
        // Obtener todas las etiquetas del módulo
        const [etiquetas] = yield database_1.pool.query('SELECT * FROM etiquetas WHERE id_modulo = ?', [modulo_id]);
        console.log(`Etiquetas encontradas: ${Array.isArray(etiquetas) ? etiquetas.length : 0}`);
        // Obtener solo los idiomas seleccionados para este módulo
        const [idiomas] = yield database_1.pool.query(`
      SELECT i.* FROM idiomas i
      INNER JOIN modulo_idiomas mi ON i.id_idioma = mi.id_idioma
      WHERE mi.id_modulo = ?
      ORDER BY i.nombre_idioma
    `, [modulo_id]);
        console.log(`Idiomas seleccionados para el módulo: ${Array.isArray(idiomas) ? idiomas.length : 0}`);
        if (Array.isArray(idiomas)) {
            idiomas.forEach(idioma => {
                console.log(`- ${idioma.nombre_idioma} (${idioma.codigo_iso})`);
            });
        }
        // Obtener todas las traducciones para las etiquetas de este módulo
        const etiquetaIds = etiquetas.map(e => e.id_etiqueta);
        const [traducciones] = yield database_1.pool.query('SELECT t.*, e.descripcion_etiqueta, i.codigo_iso FROM traducciones t ' +
            'JOIN etiquetas e ON t.id_etiqueta = e.id_etiqueta ' +
            'JOIN idiomas i ON t.id_idioma = i.id_idioma ' +
            'WHERE t.id_etiqueta IN (?) ' +
            'ORDER BY t.orden', [etiquetaIds]);
        console.log(`Traducciones encontradas: ${Array.isArray(traducciones) ? traducciones.length : 0}`);
        // Generar el contenido del archivo .ts
        const nombreModulo = modulo[0].nombre_modulo.replace(/\s+/g, '');
        const contenido = generarArchivoTS(nombreModulo, etiquetas, idiomas, traducciones);
        console.log(`Archivo generado: ${nombreModulo}Translation.ts`);
        // Configurar headers para descarga
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${nombreModulo}Translation.ts"`);
        res.send(contenido);
    }
    catch (error) {
        console.error('Error al exportar traducciones:', error);
        res.status(500).json({ message: 'Error al exportar traducciones', error });
    }
}));
// Función para generar el contenido del archivo .ts
function generarArchivoTS(nombreModulo, etiquetas, idiomas, traducciones) {
    let contenido = `import { Injectable } from '@angular/core';\n`;
    contenido += `\n`;
    contenido += `import { IdiomaEnum, TraduccionService } from '@easyrez/extranet-comun';\n`;
    contenido += `\n`;
    contenido += `@Injectable()\n`;
    contenido += `export class ${nombreModulo}Translation extends TraduccionService {\n`;
    contenido += `  public iniciar(): void {\n`;
    // Mapeo de códigos ISO a enum
    const isoToEnum = {
        'ES': 'Esp',
        'EN': 'Ing',
        'PT': 'Por',
        'FR': 'Fra',
        'DE': 'Ale',
        'IT': 'Ita'
    };
    // Para cada etiqueta, generar las traducciones
    etiquetas.forEach(etiqueta => {
        const clave = etiqueta.descripcion_etiqueta.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
        contenido += `    this.traduccion('${clave}', [\n`;
        // Para cada idioma seleccionado del módulo, buscar si existe traducción
        idiomas.forEach(idioma => {
            const enumIdioma = isoToEnum[idioma.codigo_iso] || 'Esp';
            // Buscar si existe una traducción para esta etiqueta e idioma
            const traduccion = traducciones.find(t => t.id_etiqueta === etiqueta.id_etiqueta &&
                t.id_idioma === idioma.id_idioma);
            // Si existe traducción, usar el texto traducido; si no, usar la descripción original de la etiqueta
            const descripcion = traduccion ? traduccion.texto_traduccion : etiqueta.descripcion_etiqueta;
            contenido += `      { idioma: IdiomaEnum.${enumIdioma}, descripcion: '${descripcion.replace(/'/g, "\\'")}' },\n`;
        });
        contenido += `    ]);\n`;
    });
    contenido += `  }\n`;
    contenido += `}\n`;
    return contenido;
}
exports.etiquetasRouter = router;
