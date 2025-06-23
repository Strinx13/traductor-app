import { Router } from 'express';
import { pool } from '../config/database';
import { ResultSetHeader } from 'mysql2';

const router = Router();

// Obtener todos los idiomas
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM idiomas');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los idiomas', error });
  }
});

// Obtener un idioma por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM idiomas WHERE id_idioma = ?', [req.params.id]);
    if (Array.isArray(rows) && rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Idioma no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el idioma', error });
  }
});

// Crear un nuevo idioma
router.post('/', async (req, res) => {
  try {
    const { nombre_idioma, codigo_iso } = req.body;
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO idiomas (nombre_idioma, codigo_iso) VALUES (?, ?)',
      [nombre_idioma, codigo_iso]
    );
    res.status(201).json({ 
      id_idioma: result.insertId, 
      nombre_idioma, 
      codigo_iso 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el idioma', error });
  }
});

// Actualizar un idioma
router.put('/:id', async (req, res) => {
  try {
    const { nombre_idioma, codigo_iso } = req.body;
    await pool.query(
      'UPDATE idiomas SET nombre_idioma = ?, codigo_iso = ? WHERE id_idioma = ?',
      [nombre_idioma, codigo_iso, req.params.id]
    );
    res.json({ 
      id_idioma: req.params.id, 
      nombre_idioma, 
      codigo_iso 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el idioma', error });
  }
});

// Eliminar un idioma
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM idiomas WHERE id_idioma = ?', [req.params.id]);
    res.json({ message: 'Idioma eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el idioma', error });
  }
});

export const idiomasRouter = router; 