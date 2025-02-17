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
    
    // Configuration du bundler
    const bundled = await bundle({
      entryPoint: path.join(process.cwd(), './src/index.ts'),
      // Augmenter le timeout si nécessaire
      timeout: 60000,
    });

    const compositions = await getCompositions(bundled);
    const composition = compositions.find((c) => c.id === 'modern');

    if (!composition) {
      throw new Error('Composition not found');
    }

    const outputLocation = `/tmp/video.mp4`;

    // Configuration du rendu avec timeouts augmentés
    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: 'h264',
      outputLocation,
      browserTimeout: 60000, // Augmenté à 60 secondes
      chromiumOptions: {
        timeout: 60000,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      },
      inputProps: {
        images,
        ...config
      },
    });

    // Envoyer la vidéo en réponse
    res.sendFile(outputLocation);
  } catch (error) {
    console.error('Error in render:', error);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
