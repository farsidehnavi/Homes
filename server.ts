import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fetchNajafabadDivar } from './src/utils/divarCrawler';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Cache for Divar post images
  const postImagesCache = new Map<string, string[]>();

  // API route: Get all real images directly from Divar for a specific post token
  app.get('/api/divar/post/:token/images', async (req, res) => {
    try {
      const token = req.params.token;
      if (!token) {
        return res.status(400).json({ success: false, images: [] });
      }

      if (postImagesCache.has(token)) {
        return res.json({ success: true, images: postImagesCache.get(token) });
      }

      const response = await fetch(`https://api.divar.ir/v8/posts-v2/web/${token}`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
      });

      if (!response.ok) {
        return res.json({ success: false, images: [] });
      }

      const json: any = await response.json();
      const widgets = json.sections?.flatMap((s: any) => s.widgets || []) || [];
      const carousel = widgets.find(
        (w: any) => w.widget_type === 'IMAGE_CAROUSEL' || w.widget_type === 'IMAGES_SLIDER'
      );
      const images: string[] =
        carousel?.data?.items?.map((it: any) => it.image?.url || it.image?.thumbnail_url).filter(Boolean) || [];

      postImagesCache.set(token, images);
      res.json({ success: true, images });
    } catch (err: any) {
      res.status(500).json({ success: false, images: [], error: err?.message });
    }
  });

  // API route: Get real estate in Najaf Abad from divar.ir with selectable time range
  app.get('/api/divar/najafabad-24h', async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === 'true';
      const timeRange = (req.query.timeRange as any) || '24h';
      const result = await fetchNajafabadDivar(timeRange, forceRefresh);
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
      const timeRange = (req.body?.timeRange || req.query.timeRange || '24h') as any;
      const result = await fetchNajafabadDivar(timeRange, true);
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
      service: 'divar-najafabad-explorer',
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
