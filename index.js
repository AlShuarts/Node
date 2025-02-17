import express from 'express';
import { bundle } from '@remotion/bundler';
import { getCompositions, renderMedia } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// Route de test
app.get('/', (req, res) => {
  res.json({ status: 'Remotion render service is running' });
});

// Route principale pour le rendu
app.post('/render', async (req, res) => {
  try {
    const { images, config } = req.body;
    
    // Valider les entrées d'abord
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Invalid images array' });
    }

    console.log('Received render request with:', { 
      imageCount: images.length,
      config 
    });

    // Nettoyer les URLs des images
    const cleanImages = images.map(url => url.replace(/;$/, ''));
    console.log('Cleaned image URLs, first image:', cleanImages[0]);

    // Créer le bundle Remotion avec la configuration améliorée
    const bundleConfiguration = {
      entryPoint: path.join(__dirname, 'remotion', 'src', 'Root.tsx'),
      webpackOverride: (config) => {
        return {
          ...config,
          plugins: config.plugins.map(plugin => {
            if (plugin.constructor.name === 'ProgressPlugin') {
              return new plugin.constructor({
                onProgress: () => {} // Fix pour l'erreur onProgress
              });
            }
            return plugin;
          })
        };
      }
    };

    console.log('Starting bundle process...');
    const bundled = await bundle(bundleConfiguration);
    console.log('Bundle completed successfully');

    const compositions = await getCompositions(bundled);
    console.log('Found compositions:', compositions.map(c => c.id).join(', '));
    
    const composition = compositions.find((c) => c.id === 'modern');

    if (!composition) {
      console.error('Available compositions:', compositions.map(c => c.id));
      throw new Error('Could not find modern composition');
    }

    console.log('Starting video render with composition:', composition.id);

    // Rendre la vidéo
    const videoData = await renderMedia({
      composition,
      serveUrl: bundled,
      codec: 'h264',
      outputLocation: null,
      inputProps: {
        images: cleanImages,
        ...config
      },
    });

    console.log('Video rendering complete, sending response');

    // Envoyer la vidéo
    res.set('Content-Type', 'video/mp4');
    res.send(videoData);

  } catch (err) {
    console.error('Detailed error:', err);
    res.status(500).json({ 
      error: 'Render failed', 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Important pour Railway : écouter sur toutes les interfaces
app.listen(port, '0.0.0.0', () => {
  console.log(`Render service listening on port ${port}`);
});
