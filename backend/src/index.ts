import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { modulosRouter } from './routes/modulos.routes';
import { etiquetasRouter } from './routes/etiquetas.routes';
import { idiomasRouter } from './routes/idiomas.routes';
import { pool } from './config/database';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/modulos', modulosRouter);
app.use('/api/etiquetas', etiquetasRouter);
app.use('/api/idiomas', idiomasRouter);

app.listen(port, async () => {
  try {
    await pool.getConnection();
    console.log('✅ Conexión a la base de datos establecida correctamente');
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
  }
  console.log(`Servidor corriendo en el puerto ${port}`);
}); 