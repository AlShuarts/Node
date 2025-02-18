import express from 'express';
import { bundle } from '@remotion/bundler';
import { renderMedia, getCompositions } from '@remotion/renderer';
import path from 'path';

const app = express();
app.use(express.json());

app.post('/render', async (req, res) => {
  try {
    let { images, config } = req.body;
    
    // Assurer que images est au moins un tableau vide
    images = images || [];
    
    // Paramètres de base
    const fps = 30;
    const secondsPerImage = 3;
    const minDurationInFrames = fps * secondsPerImage; // 90 frames minimum (3 secondes)
    
    // Calcul de la durée avec un minimum garanti
    const durationInFrames = Math.max(images.length * secondsPerImage * fps, minDurationInFrames);
    
    // Logs détaillés pour le débogage
    console.log({
      numberOfImages: images.length,
      calculatedDuration: durationInFrames,
      framesPerImage: secondsPerImage * fps,
      minimumDuration: minDurationInFrames,
    });
    
    console.log('Starting render process with', images.length, 'images');
    console.log('Calculated duration:', durationInFrames, 'frames');
    
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

    console.log('Bundle completed, fetching compositions...');

    const compositions = await getCompositions(bundled);
    const composition = compositions.find((c) => c.id === 'modern');

    if (!composition) {
      throw new Error('Composition not found');
    }

    console.log('Starting media render with composition:', composition.id);

    const outputLocation = `/tmp/video.mp4`;

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

    console.log('Render completed, sending file...');

    res.sendFile(outputLocation);
  } catch (error) {
    console.error('Error in render:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Render server running on port ${port}`);
  console.log('Memory limit:', process.env.NODE_OPTIONS || 'default');
});
