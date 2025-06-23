import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { modulosRouter } from './routes/modulos.routes';
import { etiquetasRouter } from './routes/etiquetas.routes';
import { idiomasRouter } from './routes/idiomas.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/modulos', modulosRouter);
app.use('/api/etiquetas', etiquetasRouter);
app.use('/api/idiomas', idiomasRouter);

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
}); 