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
    
    console.log('Received render request with:', { 
      imageCount: images?.length,
      config 
    });

    // Valider les entrées
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Invalid images array' });
    }

    // Créer le bundle Remotion
    const bundled = await bundle(path.join(__dirname, 'remotion', 'src', 'Root.tsx'), {
      webpackOverride: (config) => config,
    });

    const compositions = await getCompositions(bundled);
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
        images,
        ...config
      },
    });

    console.log('Video rendering complete, sending response');

    // Envoyer la vidéo
    res.set('Content-Type', 'video/mp4');
    res.send(videoData);

  } catch (err) {
    console.error('Error rendering video:', err);
    res.status(500).json({ error: `Error rendering video: ${err.message}` });
  }
});

// Important pour Railway : écouter sur toutes les interfaces
app.listen(port, '0.0.0.0', () => {
  console.log(`Render service listening on port ${port}`);
});
