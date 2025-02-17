// Service de rendu Remotion
import express from 'express';
import { bundle } from '@remotion/bundler';
import { renderMedia, getCompositions } from '@remotion/renderer';
import path from 'path';

const app = express();
app.use(express.json());

app.post('/render', async (req, res) => {
  try {
    const { images, config } = req.body;
    
    console.log('Starting render process with', images.length, 'images');
    
    // Calcul de la durée basée sur le nombre d'images
    const fps = 30;
    const secondsPerImage = 3;
    const durationInFrames = images.length * secondsPerImage * fps;
    
    console.log('Calculated duration:', durationInFrames, 'frames for', images.length, 'images');
    
    // Configuration du bundler avec options étendues et optimisations
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

    // Configuration du rendu avec optimisations de mémoire et performance
    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: 'h264',
      outputLocation,
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
        durationInFrames, // Ajout de la durée calculée
        ...config
      },
    });

    console.log('Render completed, sending file...');

    // Envoyer la vidéo en réponse
    res.sendFile(outputLocation);
  } catch (error) {
    console.error('Error in render:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

// Gestionnaire d'erreurs global
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
