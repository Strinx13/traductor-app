import { Router } from 'express';
import { pool } from '../config/database';
import { ResultSetHeader } from 'mysql2';
import { 
  validateEtiquetaData, 
  validateModuleData, 
  validateIdiomaData, 
  validateTraduccionData,
  sanitizeForExport,
  generateTypeScriptIdentifier,
  generateValidTypeScriptIdentifier
} from '../utils/validation';

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
    
    // Validar datos de la etiqueta
    const validation = validateEtiquetaData({ descripcion_etiqueta, id_modulo });
    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Datos de la etiqueta inválidos',
        errors: validation.errors
      });
    }
    
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO etiquetas (descripcion_etiqueta, id_modulo, porcentaje_traduccion) VALUES (?, ?, ?)',
      [descripcion_etiqueta, id_modulo, porcentaje_traduccion || 0.00]
    );
    
    // Actualizar el porcentaje de avance del módulo
    await actualizarPorcentajeAvanceModulo(id_modulo);
    
    return res.status(201).json({ 
      id_etiqueta: result.insertId, 
      descripcion_etiqueta, 
      id_modulo,
      porcentaje_traduccion: porcentaje_traduccion || 0.00
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear la etiqueta', error });
  }
});

// Actualizar una etiqueta
router.put('/:id', async (req, res) => {
  try {
    console.log('Actualizando etiqueta:', req.params.id, req.body);
    const { descripcion_etiqueta, id_modulo, porcentaje_traduccion } = req.body;
    
    // Validar datos de la etiqueta
    const validation = validateEtiquetaData({ descripcion_etiqueta, id_modulo });
    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Datos de la etiqueta inválidos',
        errors: validation.errors
      });
    }
    
    await pool.query(
      'UPDATE etiquetas SET descripcion_etiqueta = ?, id_modulo = ?, porcentaje_traduccion = ? WHERE id_etiqueta = ?',
      [descripcion_etiqueta, id_modulo, porcentaje_traduccion, req.params.id]
    );
    
    console.log('Etiqueta actualizada, llamando a actualizarPorcentajeAvanceModulo para módulo:', id_modulo);
    // Actualizar el porcentaje de avance del módulo
    await actualizarPorcentajeAvanceModulo(id_modulo);
    
    return res.json({ 
      id_etiqueta: req.params.id, 
      descripcion_etiqueta, 
      id_modulo,
      porcentaje_traduccion
    });
  } catch (error) {
    console.error('Error al actualizar la etiqueta:', error);
    return res.status(500).json({ message: 'Error al actualizar la etiqueta', error });
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

// Ruta de prueba para verificar el cálculo de porcentajes de módulos
router.get('/test-calculo-modulo/:id_modulo', async (req, res) => {
  try {
    const id_modulo = parseInt(req.params.id_modulo);
    
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
    
    // Calcular el porcentaje manualmente
    let promedioCalculado = 0;
    if (Array.isArray(etiquetas) && etiquetas.length > 0) {
      const totalPorcentaje = (etiquetas as any[]).reduce((sum, etiqueta) => {
        return sum + (parseFloat(etiqueta.porcentaje_traduccion) || 0);
      }, 0);
      promedioCalculado = Math.round(totalPorcentaje / etiquetas.length);
    }
    
    res.json({
      modulo: (modulo as any)[0],
      etiquetas: etiquetas,
      total_etiquetas: Array.isArray(etiquetas) ? etiquetas.length : 0,
      promedio_calculado: promedioCalculado
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en la prueba', error });
  }
});

// Ruta para exportar traducciones en formato .ts
router.get('/export/translations/:modulo_id', async (req, res) => {
  try {
    const modulo_id = parseInt(req.params.modulo_id);
    
    // Obtener el módulo
    const [modulo] = await pool.query(
      'SELECT * FROM modulos WHERE id_modulo = ?',
      [modulo_id]
    );
    
    if (!Array.isArray(modulo) || modulo.length === 0) {
      return res.status(404).json({ message: 'Módulo no encontrado' });
    }
    
    // Obtener todas las etiquetas del módulo
    const [etiquetas] = await pool.query(
      'SELECT * FROM etiquetas WHERE id_modulo = ?',
      [modulo_id]
    );
    
    // Verificar si hay etiquetas
    if (!Array.isArray(etiquetas) || etiquetas.length === 0) {
      return res.status(400).json({
        message: 'No se puede exportar el módulo',
        errors: ['El módulo no tiene etiquetas. Debes agregar etiquetas antes de exportar.']
      });
    }
    
    // Obtener solo los idiomas seleccionados para este módulo
    const [idiomas] = await pool.query(`
      SELECT i.* FROM idiomas i
      INNER JOIN modulo_idiomas mi ON i.id_idioma = mi.id_idioma
      WHERE mi.id_modulo = ?
      ORDER BY i.nombre_idioma
    `, [modulo_id]);
    
    // Obtener todas las traducciones para las etiquetas de este módulo
    // Ordenadas por el campo 'orden' para respetar el orden establecido por el usuario
    const etiquetaIds = (etiquetas as any[]).map(e => e.id_etiqueta);
    const [traducciones] = await pool.query(
      'SELECT t.*, e.descripcion_etiqueta, i.codigo_iso FROM traducciones t ' +
      'JOIN etiquetas e ON t.id_etiqueta = e.id_etiqueta ' +
      'JOIN idiomas i ON t.id_idioma = i.id_idioma ' +
      'WHERE t.id_etiqueta IN (?) ' +
      'ORDER BY t.orden',
      [etiquetaIds]
    );
    
    // Generar el contenido del archivo .ts
    const nombreModulo = (modulo[0] as any).nombre_modulo.replace(/\s+/g, '');
    const contenido = generarArchivoTS(nombreModulo, etiquetas as any[], idiomas as any[], traducciones as any[]);
    
    // Configurar headers para descarga
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreModulo}Translation.ts"`);
    return res.send(contenido);
    
  } catch (error) {
    console.error('Error al exportar traducciones:', error);
    return res.status(500).json({ message: 'Error al exportar traducciones', error });
  }
});

// Función para generar el contenido del archivo .ts
function generarArchivoTS(nombreModulo: string, etiquetas: any[], idiomas: any[], traducciones: any[]): string {
  let contenido = `import { Injectable } from '@angular/core';\n`;
  contenido += `\n`;
  contenido += `import { IdiomaEnum, TraduccionService } from '@easyrez/extranet-comun';\n`;
  contenido += `\n`;
  contenido += `@Injectable()\n`;
  contenido += `export class ${nombreModulo}Translation extends TraduccionService {\n`;
  contenido += `  public iniciar(): void {\n`;
  
  // Mapeo de códigos ISO a enum
  const isoToEnum: { [key: string]: string } = {
    'ES': 'Esp',
    'EN': 'Ing',
    'PT': 'Por',
    'FR': 'Fra',
    'DE': 'Ale',
    'IT': 'Ita'
  };
  
  // Para cada etiqueta, generar las traducciones
  etiquetas.forEach(etiqueta => {
    // Usar la nueva función que preserva acentos pero genera identificadores válidos
    const clave = generateValidTypeScriptIdentifier(etiqueta.descripcion_etiqueta);
    
    contenido += `    this.traduccion('${clave}', [\n`;
    
    // Generar campos para todos los idiomas seleccionados del módulo
    idiomas.forEach(idioma => {
      const enumIdioma = isoToEnum[idioma.codigo_iso] || 'Esp';
      
      // Buscar si existe una traducción para esta etiqueta e idioma
      const traduccionExistente = traducciones.find(t => 
        t.id_etiqueta === etiqueta.id_etiqueta && 
        t.id_idioma === idioma.id_idioma
      );
      
      let descripcion = '';
      if (traduccionExistente) {
        // Si existe traducción, usar el texto traducido
        descripcion = traduccionExistente.texto_traduccion || '';
      } else {
        // Si no existe traducción, dejar el campo vacío
        descripcion = '';
      }
      
      // Escapar comillas simples para TypeScript
      const descripcionEscapada = descripcion.replace(/'/g, "\\'");
      
      contenido += `      { idioma: IdiomaEnum.${enumIdioma}, descripcion: '${descripcionEscapada}' },\n`;
    });
    
    contenido += `    ]);\n`;
  });
  
  contenido += `  }\n`;
  contenido += `}\n`;
  
  return contenido;
}

export const etiquetasRouter = router; 