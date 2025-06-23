import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    nodePolyfills({
      // Para polyfills específicos, añade sus nombres aquí. Si se omite, añade todos los polyfills.
      include: [
        'buffer',
        'events',
        'stream',
        'process'
      ],
      // Para polyfills globales, añade sus nombres aquí
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
}); 