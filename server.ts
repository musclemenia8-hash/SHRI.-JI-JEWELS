import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import {
  imagePipelineManager,
  UPLOADS_DIR,
  CLEAN_SOURCES_DIR,
} from './server/imagePipeline.ts';

const PORT = 3000;
const ROOT_DIR = process.cwd();

// Multer storage for newly uploaded original product images (never overwrites existing files)
const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 48);
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});

const cleanSourceStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(CLEAN_SOURCES_DIR)) fs.mkdirSync(CLEAN_SOURCES_DIR, { recursive: true });
    cb(null, CLEAN_SOURCES_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `.tmp_clean_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const uploadMiddleware = multer({
  storage: uploadStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|jpg|png|webp)$/i.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WebP images are supported'));
    }
  },
});

const cleanUploadMiddleware = multer({
  storage: cleanSourceStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|jpg|png|webp)$/i.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WebP images are supported'));
    }
  },
});

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Serve public assets directly for ultra-fast processed & original image delivery
  app.use('/assets', express.static(path.join(ROOT_DIR, 'public', 'assets')));

  // 1. Get complete centralized image pipeline manifest & verification summary
  app.get('/api/images/manifest', (_req, res) => {
    const manifest = imagePipelineManager.getManifest();
    // Auto-process if there are undiscovered/unprocessed items
    if (manifest.summary.totalProcessed < manifest.summary.totalDiscovered && !manifest.summary.isProcessing) {
      imagePipelineManager.runFullPipeline(false).catch((err) => {
        console.error('[Server] Background auto-pipeline error:', err);
      });
    }
    res.json(manifest);
  });

  // 1B. Get complete verification report across entire asset library
  app.get('/api/images/report', (_req, res) => {
    res.json(imagePipelineManager.getVerificationReport());
  });

  // 1C. Perform mandatory second complete verification scan & auto-requeue any incomplete assets
  app.post('/api/images/verify', async (_req, res) => {
    try {
      const verification = await imagePipelineManager.runSecondPassVerificationScan();
      res.json(verification);
    } catch (err: any) {
      console.error('[Server] verify error:', err);
      res.status(500).json({ error: err?.message || 'Second-pass verification scan failed' });
    }
  });

  // 2. Scan entire website library and process all eligible images
  app.post('/api/images/process-all', async (req, res) => {
    try {
      const force = Boolean(req.body?.force);
      const manifest = await imagePipelineManager.runFullPipeline(force);
      res.json(manifest);
    } catch (err: any) {
      console.error('[Server] process-all error:', err);
      res.status(500).json({ error: err?.message || 'Batch image processing failed' });
    }
  });

  // 3. Process a single existing or dynamically linked image through the same pipeline
  app.post('/api/images/process-one', async (req, res) => {
    try {
      const { imageUrl, productId, productName, category, sourceTag } = req.body || {};
      if (!imageUrl || typeof imageUrl !== 'string') {
        res.status(400).json({ error: 'imageUrl is required' });
        return;
      }

      const record = await imagePipelineManager.processAndRegisterImage(imageUrl, {
        productId,
        productName,
        category,
        sourceTag,
      });

      res.json({
        record,
        manifest: imagePipelineManager.getManifest(),
      });
    } catch (err: any) {
      console.error('[Server] process-one error:', err);
      res.status(500).json({ error: err?.message || 'Image processing failed' });
    }
  });

  // 4. Upload a brand new product image -> preserve original in /uploads -> auto-run AI pipeline -> return processed URL
  app.post('/api/images/upload', uploadMiddleware.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No image file provided' });
        return;
      }

      const originalUrl = `/assets/uploads/${req.file.filename}`;
      const record = await imagePipelineManager.processAndRegisterImage(originalUrl, {
        productId: req.body?.productId,
        productName: req.body?.productName,
        category: req.body?.category,
        sourceTag: 'uploads',
      });

      res.json({
        originalUrl,
        processedUrl: record.processedUrl || originalUrl,
        record,
        manifest: imagePipelineManager.getManifest(),
      });
    } catch (err: any) {
      console.error('[Server] upload error:', err);
      res.status(500).json({ error: err?.message || 'Upload processing failed' });
    }
  });

  // 5. Upload & validate an authorized clean unwatermarked replacement preserving exact design
  app.post('/api/images/upload-clean', cleanUploadMiddleware.single('file'), async (req, res) => {
    try {
      const originalUrl = String(req.body?.originalUrl || '');
      if (!originalUrl || !req.file) {
        if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(400).json({ error: 'originalUrl and clean image file are required' });
        return;
      }

      const result = await imagePipelineManager.validateAndCommitCleanUpload(originalUrl, req.file.path);
      if (!result.accepted) {
        res.status(422).json({
          error: result.verification.note,
          verification: result.verification,
        });
        return;
      }

      res.json({
        record: result.record,
        verification: result.verification,
        manifest: imagePipelineManager.getManifest(),
      });
    } catch (err: any) {
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      console.error('[Server] upload-clean error:', err);
      res.status(500).json({ error: err?.message || 'Clean source upload failed' });
    }
  });

  // Vite middleware for dev, or built static files in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(ROOT_DIR, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SHRI JI JEWELS] Server running at http://localhost:${PORT}`);
    // Automatically run full discovery, processing, and second-pass completeness check on startup
    imagePipelineManager
      .runFullPipeline(false)
      .then(() => imagePipelineManager.runSecondPassVerificationScan())
      .then((res) => {
        console.log('[SHRI JI JEWELS] 2-Pass Pipeline Ready:', res.report.metrics);
      })
      .catch((err) => {
        console.error('[SHRI JI JEWELS] Startup pipeline error:', err);
      });
  });
}

startServer();
