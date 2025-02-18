import { Composition, registerRoot } from 'remotion';
import { ModernSlideshow } from './compositions/ModernSlideshow';
import { FadeSlideshow } from './compositions/FadeSlideshow';
import { SlideshowProps } from './types';

const Root: React.FC = () => {
  // Paramètres de base
  const fps = 30;
  const secondsPerImage = 3;
  const minDurationInFrames = fps * secondsPerImage; // 90 frames minimum (3 secondes)

  // Pour le développement, utiliser 5 images par défaut
  const defaultNumberOfImages = 5;
  const defaultDurationInFrames = Math.max(
    defaultNumberOfImages * secondsPerImage * fps,
    minDurationInFrames
  );

  // Props par défaut pour le développement
  const defaultProps: SlideshowProps = {
    images: Array(defaultNumberOfImages).fill('/placeholder.png'), // Utiliser un placeholder pour le dev
    musicUrl: null,
    showAddress: false,
    showPrice: false,
    showDetails: false,
    showAgent: false,
    durationInFrames: defaultDurationInFrames, // La durée par défaut pour le développement
  };

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
