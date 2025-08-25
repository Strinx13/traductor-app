import { Router } from 'express';
import { pool } from '../config/database';
import { ResultSetHeader } from 'mysql2';

const router = Router();

// Función para actualizar el porcentaje de avance de un módulo basado en idiomas seleccionados
async function actualizarPorcentajeAvanceModulo(id_modulo: number) {
  try {
    console.log(`Actualizando porcentaje para módulo ${id_modulo}`);
    
    // Obtener los idiomas seleccionados para este módulo
    const [idiomasSeleccionados] = await pool.query(
      'SELECT id_idioma FROM modulo_idiomas WHERE id_modulo = ?',
      [id_modulo]
    );

    if (!Array.isArray(idiomasSeleccionados) || idiomasSeleccionados.length === 0) {
      console.log(`Módulo ${id_modulo} sin idiomas seleccionados, porcentaje establecido en 0%`);
      await pool.query(
        'UPDATE modulos SET porcentaje_avance = ? WHERE id_modulo = ?',
        [0, id_modulo]
      );
      return;
    }

    const idiomasIds = (idiomasSeleccionados as any[]).map(item => item.id_idioma);
    console.log(`Idiomas seleccionados para módulo ${id_modulo}:`, idiomasIds);
    
    // Obtener todas las etiquetas del módulo
    const [etiquetas] = await pool.query(
      'SELECT id_etiqueta FROM etiquetas WHERE id_modulo = ?',
      [id_modulo]
    );

    console.log('Etiquetas encontradas:', etiquetas);

    if (Array.isArray(etiquetas) && etiquetas.length > 0) {
      let totalPorcentajeEtiquetas = 0;
      
      // Calcular el porcentaje de cada etiqueta basado en los idiomas seleccionados
      for (const etiqueta of etiquetas as any[]) {
        const id_etiqueta = etiqueta.id_etiqueta;
        
        // Contar traducciones existentes para los idiomas seleccionados
        const [traducciones] = await pool.query(
          'SELECT COUNT(*) as count FROM traducciones WHERE id_etiqueta = ? AND id_idioma IN (?)',
          [id_etiqueta, idiomasIds]
        );
        
        const traduccionesCount = (traducciones as any[])[0].count;
        const porcentajeEtiqueta = Math.round((traduccionesCount / idiomasIds.length) * 100);
        
        // Actualizar el porcentaje de la etiqueta
        await pool.query(
          'UPDATE etiquetas SET porcentaje_traduccion = ? WHERE id_etiqueta = ?',
          [porcentajeEtiqueta, id_etiqueta]
        );
        
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

// Obtener todos los módulos con sus idiomas seleccionados
router.get('/', async (req, res) => {
  try {
    const [modulos] = await pool.query('SELECT * FROM modulos ORDER BY nombre_modulo');
    
    // Para cada módulo, obtener sus idiomas seleccionados
    const modulosConIdiomas = await Promise.all(
      (modulos as any[]).map(async (modulo) => {
        const [idiomas] = await pool.query(
          `SELECT i.id_idioma, i.nombre_idioma, i.codigo_iso 
           FROM idiomas i 
           INNER JOIN modulo_idiomas mi ON i.id_idioma = mi.id_idioma 
           WHERE mi.id_modulo = ?`,
          [modulo.id_modulo]
        );
        
        return {
          ...modulo,
          idiomas_seleccionados: idiomas
        };
      })
    );
    
    res.json(modulosConIdiomas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los módulos', error });
  }
});

// Ruta de prueba para verificar el cálculo de porcentajes
router.get('/test-calculo/:id', async (req, res) => {
  try {
    const id_modulo = parseInt(req.params.id);
    
    // Obtener los idiomas seleccionados
    const [idiomasSeleccionados] = await pool.query(
      'SELECT id_idioma FROM modulo_idiomas WHERE id_modulo = ?',
      [id_modulo]
    );
    
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
      idiomas_seleccionados: idiomasSeleccionados,
      etiquetas: etiquetas,
      total_etiquetas: Array.isArray(etiquetas) ? etiquetas.length : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en la prueba', error });
  }
});

// Obtener un módulo por ID con sus idiomas seleccionados
router.get('/:id', async (req, res) => {
  try {
    const [modulo] = await pool.query('SELECT * FROM modulos WHERE id_modulo = ?', [req.params.id]);
    
    if (Array.isArray(modulo) && modulo.length > 0) {
      // Obtener idiomas seleccionados para este módulo
      const [idiomas] = await pool.query(
        `SELECT i.id_idioma, i.nombre_idioma, i.codigo_iso 
         FROM idiomas i 
         INNER JOIN modulo_idiomas mi ON i.id_idioma = mi.id_idioma 
         WHERE mi.id_modulo = ?`,
        [req.params.id]
      );
      
      const moduloConIdiomas = {
        ...modulo[0],
        idiomas_seleccionados: idiomas
      };
      
      res.json(moduloConIdiomas);
    } else {
      res.status(404).json({ message: 'Módulo no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el módulo', error });
  }
});

// Crear un nuevo módulo con idiomas seleccionados
router.post('/', async (req, res) => {
  try {
    const { nombre_modulo, idiomas_seleccionados } = req.body;
    
    // Crear el módulo
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO modulos (nombre_modulo, porcentaje_avance) VALUES (?, ?)',
      [nombre_modulo, 0.00]
    );
    
    const id_modulo = result.insertId;
    
    // Asignar idiomas seleccionados al módulo
    if (Array.isArray(idiomas_seleccionados) && idiomas_seleccionados.length > 0) {
      for (const id_idioma of idiomas_seleccionados) {
        await pool.query(
          'INSERT INTO modulo_idiomas (id_modulo, id_idioma) VALUES (?, ?)',
          [id_modulo, id_idioma]
        );
      }
    }
    
    // Obtener el módulo creado con sus idiomas
    const [moduloCreado] = await pool.query(
      'SELECT * FROM modulos WHERE id_modulo = ?',
      [id_modulo]
    );
    
    const [idiomas] = await pool.query(
      `SELECT i.id_idioma, i.nombre_idioma, i.codigo_iso 
       FROM idiomas i 
       INNER JOIN modulo_idiomas mi ON i.id_idioma = mi.id_idioma 
       WHERE mi.id_modulo = ?`,
      [id_modulo]
    );
    
    res.status(201).json({
      ...(moduloCreado as any)[0],
      idiomas_seleccionados: idiomas
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el módulo', error });
  }
});

// Actualizar un módulo con idiomas seleccionados
router.put('/:id', async (req, res) => {
  try {
    const { nombre_modulo, idiomas_seleccionados } = req.body;
    const id_modulo = parseInt(req.params.id);
    
    // Actualizar nombre del módulo
    await pool.query(
      'UPDATE modulos SET nombre_modulo = ? WHERE id_modulo = ?',
      [nombre_modulo, id_modulo]
    );
    
    // Eliminar idiomas anteriores
    await pool.query('DELETE FROM modulo_idiomas WHERE id_modulo = ?', [id_modulo]);
    
    // Asignar nuevos idiomas seleccionados
    if (Array.isArray(idiomas_seleccionados) && idiomas_seleccionados.length > 0) {
      for (const id_idioma of idiomas_seleccionados) {
        await pool.query(
          'INSERT INTO modulo_idiomas (id_modulo, id_idioma) VALUES (?, ?)',
          [id_modulo, id_idioma]
        );
      }
    }
    
    // Actualizar el porcentaje de avance automáticamente
    await actualizarPorcentajeAvanceModulo(id_modulo);
    
    // Obtener el módulo actualizado con sus idiomas
    const [modulo] = await pool.query(
      'SELECT * FROM modulos WHERE id_modulo = ?',
      [id_modulo]
    );
    
    const [idiomas] = await pool.query(
      `SELECT i.id_idioma, i.nombre_idioma, i.codigo_iso 
       FROM idiomas i 
       INNER JOIN modulo_idiomas mi ON i.id_idioma = mi.id_idioma 
       WHERE mi.id_modulo = ?`,
      [id_modulo]
    );
    
    res.json({
      ...(modulo as any)[0],
      idiomas_seleccionados: idiomas
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