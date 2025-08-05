import { Router } from 'express';
import { pool } from '../config/database';
import { ResultSetHeader } from 'mysql2';

const router = Router();

// Función para actualizar el porcentaje de avance de un módulo
async function actualizarPorcentajeAvanceModulo(id_modulo: number) {
  try {
    console.log(`Actualizando porcentaje para módulo ${id_modulo}`);
    
    // Obtener todas las etiquetas del módulo con sus porcentajes de traducción
    const [etiquetas] = await pool.query(
      'SELECT porcentaje_traduccion FROM etiquetas WHERE id_modulo = ?',
      [id_modulo]
    );

    console.log('Etiquetas encontradas:', etiquetas);

    if (Array.isArray(etiquetas) && etiquetas.length > 0) {
      // Calcular el promedio de los porcentajes de traducción de todas las etiquetas
      const totalPorcentaje = (etiquetas as any[]).reduce((sum, etiqueta) => {
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
      await pool.query(
        'UPDATE modulos SET porcentaje_avance = ? WHERE id_modulo = ?',
        [promedioPorcentaje, id_modulo]
      );
      
      console.log(`Módulo ${id_modulo} actualizado con porcentaje: ${promedioPorcentaje}%`);
    } else {
      // Si no hay etiquetas, el porcentaje es 0
      await pool.query(
        'UPDATE modulos SET porcentaje_avance = ? WHERE id_modulo = ?',
        [0, id_modulo]
      );
      console.log(`Módulo ${id_modulo} sin etiquetas, porcentaje establecido en 0%`);
    }
  } catch (error) {
    console.error('Error al actualizar porcentaje de avance del módulo:', error);
  }
}

// Obtener todos los módulos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM modulos');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los módulos', error });
  }
});

// Ruta de prueba para verificar el cálculo de porcentajes
router.get('/test-calculo/:id', async (req, res) => {
  try {
    const id_modulo = parseInt(req.params.id);
    
    // Obtener todas las etiquetas del módulo
    const [etiquetas] = await pool.query(
      'SELECT id_etiqueta, descripcion_etiqueta, porcentaje_traduccion FROM etiquetas WHERE id_modulo = ?',
      [id_modulo]
    );
    
    // Obtener el módulo
    const [modulo] = await pool.query(
      'SELECT * FROM modulos WHERE id_modulo = ?',
      [id_modulo]
    );
    
    res.json({
      modulo: (modulo as any)[0],
      etiquetas: etiquetas,
      total_etiquetas: Array.isArray(etiquetas) ? etiquetas.length : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en la prueba', error });
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
    const { nombre_modulo } = req.body;
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO modulos (nombre_modulo, porcentaje_avance) VALUES (?, ?)',
      [nombre_modulo, 0.00]
    );
    res.status(201).json({ 
      id_modulo: result.insertId, 
      nombre_modulo, 
      porcentaje_avance: 0.00 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el módulo', error });
  }
});

// Actualizar un módulo
router.put('/:id', async (req, res) => {
  try {
    const { nombre_modulo } = req.body;
    await pool.query(
      'UPDATE modulos SET nombre_modulo = ? WHERE id_modulo = ?',
      [nombre_modulo, req.params.id]
    );
    
    // Actualizar el porcentaje de avance automáticamente
    await actualizarPorcentajeAvanceModulo(parseInt(req.params.id));
    
    // Obtener el módulo actualizado
    const [modulo] = await pool.query(
      'SELECT * FROM modulos WHERE id_modulo = ?',
      [req.params.id]
    );
    
    res.json((modulo as any)[0]);
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