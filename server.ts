import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fetchNajafabadDivar24h } from './src/utils/divarCrawler';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route: Get last 24 hours real estate in Najaf Abad from divar.ir
  app.get('/api/divar/najafabad-24h', async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === 'true';
      const result = await fetchNajafabadDivar24h(forceRefresh);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err?.message || 'Error fetching Divar data',
      });
    }
  });

  // API route: Force refresh from divar.ir
  app.post('/api/divar/refresh', async (req, res) => {
    try {
      const result = await fetchNajafabadDivar24h(true);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err?.message || 'Error refreshing Divar data',
      });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'divar-najafabad-24h',
      timestamp: new Date().toISOString(),
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
