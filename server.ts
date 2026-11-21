import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chatbotHandler from './api/ai/chatbot.ts';
import inspectMaterialHandler from './api/ai/inspect-material.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Parse JSON request bodies (supports compressed base64 images up to 15MB)
  app.use(express.json({ limit: '15mb' }));

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: 'matlink-pune-api' });
  });

  // AI API Routes
  app.all('/api/ai/chatbot', (req: Request, res: Response) => {
    return chatbotHandler(req, res);
  });

  app.all('/api/ai/inspect-material', (req: Request, res: Response) => {
    return inspectMaterialHandler(req, res);
  });

  // Catch-all for unknown /api/* routes so they always return JSON (never SPA HTML)
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      error: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // JSON error handler for /api/* middleware errors (e.g. invalid JSON, payload too large)
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl?.startsWith('/api/')) {
      const statusCode = err?.status || err?.statusCode || 500;
      return res.status(statusCode).json({
        error: err?.message || 'Internal API server error',
      });
    }
    return next(err);
  });

  const distPath = path.resolve(__dirname, 'dist');
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.get('*', (_req: Request, res: Response) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
      } else {
        throw viteErr;
      }
    }
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MatLink server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
