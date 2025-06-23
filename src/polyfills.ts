import 'zone.js';

// Definir global y process para compatibilidad con librerías de Node.js
(window as any).global = window;
(window as any).process = (window as any).process || { env: { NODE_DEBUG: undefined } };

// Importar polyfills para módulos nativos de Node.js
import 'events';
import 'buffer';
import 'stream-browserify';

import 'stream-browserify'; 