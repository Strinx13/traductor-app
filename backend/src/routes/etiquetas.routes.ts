import { Router } from 'express';
import { pool } from '../config/database';
import { ResultSetHeader } from 'mysql2';

const router = Router();

// Obtener todas las etiquetas
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM etiquetas');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las etiquetas', error });
  }
});

// Obtener una etiqueta por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM etiquetas WHERE id_etiqueta = ?', [req.params.id]);
    if (Array.isArray(rows) && rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Etiqueta no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la etiqueta', error });
  }
});

// Crear una nueva etiqueta
router.post('/', async (req, res) => {
  try {
    const { descripcion_etiqueta, id_modulo, porcentaje_traduccion } = req.body;
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO etiquetas (descripcion_etiqueta, id_modulo, porcentaje_traduccion) VALUES (?, ?, ?)',
      [descripcion_etiqueta, id_modulo, porcentaje_traduccion || 0.00]
    );
    res.status(201).json({ 
      id_etiqueta: result.insertId, 
      descripcion_etiqueta, 
      id_modulo,
      porcentaje_traduccion: porcentaje_traduccion || 0.00
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la etiqueta', error });
  }
});

// Actualizar una etiqueta
router.put('/:id', async (req, res) => {
  try {
    const { descripcion_etiqueta, id_modulo, porcentaje_traduccion } = req.body;
    await pool.query(
      'UPDATE etiquetas SET descripcion_etiqueta = ?, id_modulo = ?, porcentaje_traduccion = ? WHERE id_etiqueta = ?',
      [descripcion_etiqueta, id_modulo, porcentaje_traduccion, req.params.id]
    );
    res.json({ 
      id_etiqueta: req.params.id, 
      descripcion_etiqueta, 
      id_modulo,
      porcentaje_traduccion
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la etiqueta', error });
  }
});

// Eliminar una etiqueta
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM etiquetas WHERE id_etiqueta = ?', [req.params.id]);
    res.json({ message: 'Etiqueta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la etiqueta', error });
  }
});

export const etiquetasRouter = router; 