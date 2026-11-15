import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function apiMiddlewarePlugin(): Plugin {
  return {
    name: 'api-server-middleware',
    configureServer(server) {
      server.middlewares.use(async (req: any, res: any, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        let body: any = {};
        if (req.method === 'POST') {
          const buffers: Buffer[] = [];
          for await (const chunk of req) {
            buffers.push(chunk);
          }
          const raw = Buffer.concat(buffers).toString('utf-8');
          try {
            body = raw ? JSON.parse(raw) : {};
          } catch {
            body = {};
          }
        }
        req.body = body;

        res.status = (code: number) => {
          res.statusCode = code;
          return res;
        };
        res.json = (data: any) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };

        try {
          if (req.url.startsWith('/api/ai/chatbot')) {
            const handler = (await import('./api/ai/chatbot.ts')).default;
            return await handler(req, res);
          }
          if (req.url.startsWith('/api/ai/inspect-material')) {
            const handler = (await import('./api/ai/inspect-material.ts')).default;
            return await handler(req, res);
          }
        } catch (err: any) {
          console.error('API route error:', err);
          return res.status(500).json({ error: err.message || 'Internal server error' });
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiMiddlewarePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

