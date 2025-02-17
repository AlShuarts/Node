import express from 'express';
import multer from 'multer';
import { bundle } from '@remotion/bundler';
import { renderFrames, stitchFramesToVideo } from '@remotion/renderer';
import { getCompositions } from '@remotion/renderer';
import os from 'os';
import path from 'path';

const app = express();
const upload = multer({ dest: os.tmpdir() });
const port = process.env.PORT || 3000;

app.use(express.json());
// Ajoutez cette route avant app.post('/render')
app.get('/', (req, res) => {
  res.json({ status: 'Remotion render service is running' });
});

app.post('/render', async (req, res) => {
  try {
    const { images, config } = req.body;

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ error: 'Images array is required' });
    }

    console.log('Starting render with images:', images.length);

    const bundleLocation = await bundle({
      entryPoint: path.join(process.cwd(), 'remotion', 'src', 'Root.tsx'),
      webpackOverride: (config) => config,
    });

    const compositions = await getCompositions(bundleLocation);
    const composition = compositions.find((c) => c.id === 'Slideshow');

    if (!composition) {
      return res.status(404).json({ error: 'Composition not found' });
    }

    const outputDir = path.join(os.tmpdir(), 'frames');
    const outputLocation = path.join(os.tmpdir(), 'output.mp4');

    const inputProps = {
      images,
      config,
    };

    await renderFrames({
      config: composition,
      webpackBundle: bundleLocation,
      onStart: () => console.log('Starting frame rendering...'),
      onFrameUpdate: (f) => console.log(`Rendered frame ${f}`),
      inputProps,
      outputDir,
      imageFormat: "jpeg",
      concurrency: 1,
      durationInFrames: composition.durationInFrames,
      fps: composition.fps,
    });

    console.log('Frames rendered, stitching video...');

    const videoFile = await stitchFramesToVideo({
      dir: outputDir,
      fps: composition.fps,
      width: composition.width,
      height: composition.height,
      outputLocation,
      imageFormat: "jpeg",
      codec: "h264",
    });

    console.log('Video rendered:', outputLocation);
    res.sendFile(outputLocation);
  } catch (error) {
    console.error('Error rendering video:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Render service listening on port ${port}`);
});
