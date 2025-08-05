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
exports.idiomasRouter = void 0;
const express_1 = require("express");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
// Obtener todos los idiomas
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield database_1.pool.query('SELECT * FROM idiomas');
        res.json(rows);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener los idiomas', error });
    }
}));
// Obtener un idioma por ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield database_1.pool.query('SELECT * FROM idiomas WHERE id_idioma = ?', [req.params.id]);
        if (Array.isArray(rows) && rows.length > 0) {
            res.json(rows[0]);
        }
        else {
            res.status(404).json({ message: 'Idioma no encontrado' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener el idioma', error });
    }
}));
// Crear un nuevo idioma
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre_idioma, codigo_iso } = req.body;
        const [result] = yield database_1.pool.query('INSERT INTO idiomas (nombre_idioma, codigo_iso) VALUES (?, ?)', [nombre_idioma, codigo_iso]);
        res.status(201).json({
            id_idioma: result.insertId,
            nombre_idioma,
            codigo_iso
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al crear el idioma', error });
    }
}));
// Actualizar un idioma
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre_idioma, codigo_iso } = req.body;
        yield database_1.pool.query('UPDATE idiomas SET nombre_idioma = ?, codigo_iso = ? WHERE id_idioma = ?', [nombre_idioma, codigo_iso, req.params.id]);
        res.json({
            id_idioma: req.params.id,
            nombre_idioma,
            codigo_iso
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al actualizar el idioma', error });
    }
}));
// Eliminar un idioma
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.pool.query('DELETE FROM idiomas WHERE id_idioma = ?', [req.params.id]);
        res.json({ message: 'Idioma eliminado correctamente' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al eliminar el idioma', error });
    }
}));
exports.idiomasRouter = router;
