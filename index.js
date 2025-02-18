import express from 'express';
import { bundle } from '@remotion/bundler';
import { renderMedia, getCompositions } from '@remotion/renderer';
import path from 'path';

const app = express();
app.use(express.json());

app.post('/render', async (req, res) => {
  const startTime = Date.now();
  console.log('Render request received at:', new Date().toISOString());

  try {
    let { images, config } = req.body;
    
    // Log de la requête reçue
    console.log('Received render request:', {
      hasImages: !!images,
      numberOfImages: images?.length,
      config: {
        ...config,
        musicUrl: config?.musicUrl ? 'present' : 'absent',
      },
    });
    
    // Assurer que images est au moins un tableau vide
    images = images || [];
    
    // Paramètres de base
    const fps = 30;
    const secondsPerImage = 3;
    const minDurationInFrames = fps * secondsPerImage;
    const durationInFrames = Math.max(images.length * secondsPerImage * fps, minDurationInFrames);
    
    // Logs détaillés des paramètres de rendu
    console.log('Render parameters:', {
      numberOfImages: images.length,
      imageUrls: images,
      fps,
      secondsPerImage,
      minDurationInFrames,
      calculatedDuration: durationInFrames,
      totalSeconds: durationInFrames / fps,
    });
    
    console.log('Starting bundle process...');
    const bundleStartTime = Date.now();
    
    const bundled = await bundle({
      entryPoint: path.join(process.cwd(), './remotion/src/Root.tsx'),
      timeout: 180000,
      webpackOverride: (config) => {
        return {
          ...config,
          optimization: {
            ...config.optimization,
            minimize: true,
          }
        };
      }
    });

    console.log('Bundle completed:', {
      duration: Date.now() - bundleStartTime,
      entryPoint: path.join(process.cwd(), './remotion/src/Root.tsx'),
    });

    const compositions = await getCompositions(bundled);
    const composition = compositions.find((c) => c.id === 'modern');

    if (!composition) {
      console.error('Available compositions:', compositions.map(c => c.id));
      throw new Error('Composition "modern" not found');
    }

    console.log('Starting media render:', {
      compositionId: composition.id,
      durationInFrames,
      numberOfImages: images.length,
    });

    const outputLocation = `/tmp/video.mp4`;
    const renderStartTime = Date.now();

    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: 'h264',
      outputLocation,
      durationInFrames,
      browserTimeout: 180000,
      chromiumOptions: {
        timeout: 180000,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--js-flags=--max-old-space-size=1024',
          '--memory-pressure-off',
          '--single-process',
          '--disable-software-rasterizer'
        ]
      },
      ffmpegOptions: {
        vcodec: 'libx264',
        preset: 'ultrafast',
        crf: 28,
        threads: 2
      },
      imageFormat: 'jpeg',
      pixelFormat: 'yuv420p',
      inputProps: {
        images,
        durationInFrames,
        musicUrl: config?.musicUrl || null,
        showAddress: config?.showAddress || false,
        showPrice: config?.showPrice || false,
        showDetails: config?.showDetails || false,
        showAgent: config?.showAgent || false,
      },
    });

    const renderDuration = Date.now() - renderStartTime;
    console.log('Render completed:', {
      duration: renderDuration,
      framesPerSecond: durationInFrames / (renderDuration / 1000),
      outputLocation,
    });

    console.log('Total process duration:', Date.now() - startTime, 'ms');
    res.sendFile(outputLocation);
  } catch (error) {
    console.error('Error in render process:', {
      error: error.message,
      stack: error.stack,
      timeSinceStart: Date.now() - startTime,
    });
    
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

// Middleware de gestion d'erreur
app.use((error, req, res, next) => {
  console.error('Unhandled server error:', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Render server started:', {
    port,
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    memoryLimit: process.env.NODE_OPTIONS || 'default',
    environment: process.env.NODE_ENV || 'development',
  });
});
