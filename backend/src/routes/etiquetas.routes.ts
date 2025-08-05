import { Router } from 'express';
import { pool } from '../config/database';
import { ResultSetHeader } from 'mysql2';

const router = Router();

// Función para actualizar el porcentaje de avance de un módulo
async function actualizarPorcentajeAvanceModulo(id_modulo: number) {
  try {
    // Obtener todas las etiquetas del módulo con sus porcentajes de traducción
    const [etiquetas] = await pool.query(
      'SELECT porcentaje_traduccion FROM etiquetas WHERE id_modulo = ?',
      [id_modulo]
    );

    if (Array.isArray(etiquetas) && etiquetas.length > 0) {
      // Calcular el promedio de los porcentajes de traducción de todas las etiquetas
      const totalPorcentaje = (etiquetas as any[]).reduce((sum, etiqueta) => {
        return sum + (etiqueta.porcentaje_traduccion || 0);
      }, 0);
      
      const promedioPorcentaje = Math.round(totalPorcentaje / etiquetas.length);

      // Actualizar el porcentaje de avance del módulo
      await pool.query(
        'UPDATE modulos SET porcentaje_avance = ? WHERE id_modulo = ?',
        [promedioPorcentaje, id_modulo]
      );
    } else {
      // Si no hay etiquetas, el porcentaje es 0
      await pool.query(
        'UPDATE modulos SET porcentaje_avance = ? WHERE id_modulo = ?',
        [0, id_modulo]
      );
    }
  } catch (error) {
    console.error('Error al actualizar porcentaje de avance del módulo:', error);
  }
}

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
    
    // Actualizar el porcentaje de avance del módulo
    await actualizarPorcentajeAvanceModulo(id_modulo);
    
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
    
    // Actualizar el porcentaje de avance del módulo
    await actualizarPorcentajeAvanceModulo(id_modulo);
    
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
    // Obtener el id_modulo antes de eliminar
    const [etiqueta] = await pool.query(
      'SELECT id_modulo FROM etiquetas WHERE id_etiqueta = ?',
      [req.params.id]
    );
    
    // Eliminar traducciones asociadas primero (por la foreign key)
    await pool.query('DELETE FROM traducciones WHERE id_etiqueta = ?', [req.params.id]);
    
    // Eliminar la etiqueta
    await pool.query('DELETE FROM etiquetas WHERE id_etiqueta = ?', [req.params.id]);
    
    // Actualizar el porcentaje de avance del módulo
    if (Array.isArray(etiqueta) && etiqueta.length > 0) {
      await actualizarPorcentajeAvanceModulo((etiqueta[0] as any).id_modulo);
    }
    
    res.json({ message: 'Etiqueta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la etiqueta', error });
  }
});

export const etiquetasRouter = router; 