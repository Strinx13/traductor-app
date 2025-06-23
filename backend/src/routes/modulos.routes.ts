import { Router } from 'express';
import { pool } from '../config/database';
import { ResultSetHeader } from 'mysql2';

const router = Router();

// Obtener todos los módulos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM modulos');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los módulos', error });
  }
});

// Obtener un módulo por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM modulos WHERE id_modulo = ?', [req.params.id]);
    if (Array.isArray(rows) && rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Módulo no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el módulo', error });
  }
});

// Crear un nuevo módulo
router.post('/', async (req, res) => {
  try {
    const { nombre_modulo, porcentaje_avance } = req.body;
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO modulos (nombre_modulo, porcentaje_avance) VALUES (?, ?)',
      [nombre_modulo, porcentaje_avance || 0.00]
    );
    res.status(201).json({ 
      id_modulo: result.insertId, 
      nombre_modulo, 
      porcentaje_avance: porcentaje_avance || 0.00 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el módulo', error });
  }
});

// Actualizar un módulo
router.put('/:id', async (req, res) => {
  try {
    const { nombre_modulo, porcentaje_avance } = req.body;
    await pool.query(
      'UPDATE modulos SET nombre_modulo = ?, porcentaje_avance = ? WHERE id_modulo = ?',
      [nombre_modulo, porcentaje_avance, req.params.id]
    );
    res.json({ 
      id_modulo: req.params.id, 
      nombre_modulo, 
      porcentaje_avance 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el módulo', error });
  }
});

// Eliminar un módulo
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM modulos WHERE id_modulo = ?', [req.params.id]);
    res.json({ message: 'Módulo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el módulo', error });
  }
});

export const modulosRouter = router; 