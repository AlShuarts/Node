import { Composition, registerRoot } from 'remotion';
import { ModernSlideshow } from './compositions/ModernSlideshow';
import { FadeSlideshow } from './compositions/FadeSlideshow';
import { SlideshowProps } from './types';

const Root: React.FC = () => {
  // Paramètres de base
  const fps = 30;
  const secondsPerImage = 3;
  const minDurationInFrames = fps * secondsPerImage; // 90 frames minimum (3 secondes)

  // Image placeholder par défaut (utilisation d'une image Unsplash stable)
  const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b';

  // Pour le développement, utiliser 5 images par défaut
  const defaultNumberOfImages = 5;
  const defaultDurationInFrames = Math.max(
    defaultNumberOfImages * secondsPerImage * fps,
    minDurationInFrames
  );

  // Props par défaut pour le développement
  const defaultProps: SlideshowProps = {
    images: Array(defaultNumberOfImages).fill(PLACEHOLDER_IMAGE), // Utiliser une image Unsplash stable
    musicUrl: null,
    showAddress: false,
    showPrice: false,
    showDetails: false,
    showAgent: false,
    durationInFrames: defaultDurationInFrames, // La durée par défaut pour le développement
  };

  console.log('Root component initialized with:', {
    defaultNumberOfImages,
    defaultDurationInFrames,
    framesPerImage: secondsPerImage * fps,
    placeholderImage: PLACEHOLDER_IMAGE
  });

  return (
    <>
      <Composition
        id="modern"
        component={ModernSlideshow}
        durationInFrames={defaultDurationInFrames}
        fps={fps}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />
      <Composition
        id="fade"
        component={FadeSlideshow}
        durationInFrames={defaultDurationInFrames}
        fps={fps}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />
    </>
  );
};

registerRoot(Root);
