import express from 'express';
import cors from 'cors';
import { etiquetasRouter } from './routes/etiquetas.routes';
import { idiomasRouter } from './routes/idiomas.routes';
import { modulosRouter } from './routes/modulos.routes';
import { traduccionesRouter } from './routes/traducciones.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/etiquetas', etiquetasRouter);
app.use('/api/idiomas', idiomasRouter);
app.use('/api/modulos', modulosRouter);
app.use('/api/traducciones', traduccionesRouter);

const port = process.env['PORT'] || 3001; // Cambiado de 3000 a 3001

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
}); 