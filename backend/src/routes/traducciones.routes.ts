import { Router } from 'express';
import { pool } from '../config/database';
import { ResultSetHeader } from 'mysql2';

const router = Router();

// Obtener todas las traducciones
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, e.descripcion_etiqueta, i.nombre_idioma, i.codigo_iso
      FROM traducciones t
      JOIN etiquetas e ON t.id_etiqueta = e.id_etiqueta
      JOIN idiomas i ON t.id_idioma = i.id_idioma
      ORDER BY t.id_etiqueta, t.orden, i.nombre_idioma
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las traducciones', error });
  }
});

// Obtener traducciones por etiqueta
router.get('/etiqueta/:idEtiqueta', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, e.descripcion_etiqueta, i.nombre_idioma, i.codigo_iso
      FROM traducciones t
      JOIN etiquetas e ON t.id_etiqueta = e.id_etiqueta
      JOIN idiomas i ON t.id_idioma = i.id_idioma
      WHERE t.id_etiqueta = ?
      ORDER BY t.orden, i.nombre_idioma
    `, [req.params.idEtiqueta]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las traducciones de la etiqueta', error });
  }
});

// Obtener traducciones por idioma
router.get('/idioma/:idIdioma', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, e.descripcion_etiqueta, i.nombre_idioma, i.codigo_iso
      FROM traducciones t
      JOIN etiquetas e ON t.id_etiqueta = e.id_etiqueta
      JOIN idiomas i ON t.id_idioma = i.id_idioma
      WHERE t.id_idioma = ?
      ORDER BY e.descripcion_etiqueta, t.orden
    `, [req.params.idIdioma]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las traducciones del idioma', error });
  }
});

// Crear una nueva traducción
router.post('/', async (req, res) => {
  try {
    const { id_etiqueta, id_idioma, texto_traduccion } = req.body;
    
    // Verificar si ya existe una traducción para esta etiqueta e idioma
    const [existing] = await pool.query(
      'SELECT * FROM traducciones WHERE id_etiqueta = ? AND id_idioma = ?',
      [id_etiqueta, id_idioma]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(400).json({ message: 'Ya existe una traducción para esta etiqueta e idioma' });
    }

    // Obtener el siguiente orden para esta etiqueta
    const [maxOrder] = await pool.query(
      'SELECT COALESCE(MAX(orden), 0) + 1 as next_order FROM traducciones WHERE id_etiqueta = ?',
      [id_etiqueta]
    );
    const nextOrder = (maxOrder as any)[0].next_order;

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO traducciones (id_etiqueta, id_idioma, texto_traduccion, orden) VALUES (?, ?, ?, ?)',
      [id_etiqueta, id_idioma, texto_traduccion, nextOrder]
    );

    // Actualizar el porcentaje de traducción de la etiqueta
    await actualizarPorcentajeTraduccion(id_etiqueta);

    res.status(201).json({ 
      id_traduccion: result.insertId, 
      id_etiqueta, 
      id_idioma, 
      texto_traduccion,
      orden: nextOrder
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la traducción', error });
  }
});

// Actualizar una traducción
router.put('/:id', async (req, res) => {
  try {
    const { texto_traduccion } = req.body;
    const id_traduccion = req.params.id;

    await pool.query(
      'UPDATE traducciones SET texto_traduccion = ? WHERE id_traduccion = ?',
      [texto_traduccion, id_traduccion]
    );

    // Obtener el id_etiqueta para actualizar el porcentaje
    const [traduccion] = await pool.query(
      'SELECT id_etiqueta FROM traducciones WHERE id_traduccion = ?',
      [id_traduccion]
    );

    if (Array.isArray(traduccion) && traduccion.length > 0) {
      await actualizarPorcentajeTraduccion((traduccion[0] as any).id_etiqueta);
    }

    res.json({ 
      id_traduccion, 
      texto_traduccion 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la traducción', error });
  }
});

// Actualizar el orden de las traducciones
router.put('/orden/actualizar', async (req, res) => {
  try {
    const { traducciones } = req.body; // Array de { id_traduccion, orden }
    
    // Actualizar el orden de cada traducción
    for (const traduccion of traducciones) {
      await pool.query(
        'UPDATE traducciones SET orden = ? WHERE id_traduccion = ?',
        [traduccion.orden, traduccion.id_traduccion]
      );
    }

    res.json({ message: 'Orden actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el orden', error });
  }
});

// Eliminar una traducción
router.delete('/:id', async (req, res) => {
  try {
    const id_traduccion = req.params.id;

    // Obtener el id_etiqueta antes de eliminar
    const [traduccion] = await pool.query(
      'SELECT id_etiqueta FROM traducciones WHERE id_traduccion = ?',
      [id_traduccion]
    );

    await pool.query('DELETE FROM traducciones WHERE id_traduccion = ?', [id_traduccion]);

    // Reordenar las traducciones restantes de la etiqueta
    if (Array.isArray(traduccion) && traduccion.length > 0) {
      const id_etiqueta = (traduccion[0] as any).id_etiqueta;
      await reordenarTraducciones(id_etiqueta);
      await actualizarPorcentajeTraduccion(id_etiqueta);
    }

    res.json({ message: 'Traducción eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la traducción', error });
  }
});

// Función para reordenar traducciones después de eliminar una
async function reordenarTraducciones(id_etiqueta: number) {
  try {
    const [traducciones] = await pool.query(
      'SELECT id_traduccion FROM traducciones WHERE id_etiqueta = ? ORDER BY orden',
      [id_etiqueta]
    );

    let nuevoOrden = 1;
    for (const traduccion of traducciones as any[]) {
      await pool.query(
        'UPDATE traducciones SET orden = ? WHERE id_traduccion = ?',
        [nuevoOrden, traduccion.id_traduccion]
      );
      nuevoOrden++;
    }
  } catch (error) {
    console.error('Error al reordenar traducciones:', error);
  }
}

// Función para actualizar el porcentaje de traducción de una etiqueta
async function actualizarPorcentajeTraduccion(id_etiqueta: number) {
  try {
    // Obtener el id_modulo de la etiqueta
    const [etiqueta] = await pool.query(
      'SELECT id_modulo FROM etiquetas WHERE id_etiqueta = ?',
      [id_etiqueta]
    );

    if (!Array.isArray(etiqueta) || etiqueta.length === 0) {
      console.error('Etiqueta no encontrada:', id_etiqueta);
      return;
    }

    const id_modulo = (etiqueta[0] as any).id_modulo;

    // Obtener los idiomas seleccionados para este módulo
    const [idiomasSeleccionados] = await pool.query(
      'SELECT id_idioma FROM modulo_idiomas WHERE id_modulo = ?',
      [id_modulo]
    );

    if (!Array.isArray(idiomasSeleccionados) || idiomasSeleccionados.length === 0) {
      // Si no hay idiomas seleccionados, el porcentaje es 0
      await pool.query(
        'UPDATE etiquetas SET porcentaje_traduccion = ? WHERE id_etiqueta = ?',
        [0, id_etiqueta]
      );
      await actualizarPorcentajeAvanceModulo(id_modulo);
      return;
    }

    const idiomasIds = (idiomasSeleccionados as any[]).map(item => item.id_idioma);
    const totalIdiomas = idiomasIds.length;

    // Contar traducciones existentes para esta etiqueta en los idiomas seleccionados
    const [traducciones] = await pool.query(
      'SELECT COUNT(*) as total FROM traducciones WHERE id_etiqueta = ? AND id_idioma IN (?)',
      [id_etiqueta, idiomasIds]
    );
    const traducidas = ((traducciones as any)[0] as any).total;

    // Calcular porcentaje basado en los idiomas seleccionados
    const porcentaje = totalIdiomas > 0 ? Math.round((traducidas / totalIdiomas) * 100) : 0;

    // Actualizar el porcentaje en la tabla etiquetas
    await pool.query(
      'UPDATE etiquetas SET porcentaje_traduccion = ? WHERE id_etiqueta = ?',
      [porcentaje, id_etiqueta]
    );

    // Actualizar el porcentaje del módulo
    await actualizarPorcentajeAvanceModulo(id_modulo);
  } catch (error) {
    console.error('Error al actualizar porcentaje de traducción:', error);
  }
}

// Función para actualizar el porcentaje de avance de un módulo
async function actualizarPorcentajeAvanceModulo(id_modulo: number) {
  try {
    console.log(`Actualizando porcentaje para módulo ${id_modulo}`);
    
    // Obtener todas las etiquetas del módulo con sus porcentajes de traducción
    const [etiquetas] = await pool.query(
      'SELECT id_etiqueta, porcentaje_traduccion FROM etiquetas WHERE id_modulo = ?',
      [id_modulo]
    );

    console.log('Etiquetas encontradas:', etiquetas);

    if (Array.isArray(etiquetas) && etiquetas.length > 0) {
      // Calcular el promedio de los porcentajes de traducción de todas las etiquetas
      const totalPorcentaje = (etiquetas as any[]).reduce((sum, etiqueta) => {
        const porcentaje = parseFloat(etiqueta.porcentaje_traduccion) || 0;
        console.log(`Porcentaje de etiqueta ${etiqueta.id_etiqueta}: ${porcentaje}`);
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

export const traduccionesRouter = router; 