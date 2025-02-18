import { Composition, registerRoot } from 'remotion';
import { ModernSlideshow } from './compositions/ModernSlideshow';
import { FadeSlideshow } from './compositions/FadeSlideshow';
import { SlideshowProps } from './types';

const Root: React.FC = () => {
  // Paramètres de base
  const fps = 30;
  const secondsPerImage = 3;
  const minDurationInFrames = fps * secondsPerImage; // Durée minimale de 3 secondes
  
  // Props par défaut
  const defaultProps: SlideshowProps = {
    images: [],
    musicUrl: null,
    showAddress: false,
    showPrice: false,
    showDetails: false,
    showAgent: false,
  };

  // Calcul de la durée en frames avec une durée minimale
  const calculateDuration = (numberOfImages: number) => {
    if (numberOfImages === 0) {
      return minDurationInFrames; // Retourne la durée minimale si pas d'images
    }
    return numberOfImages * secondsPerImage * fps;
  };

  // Durée basée sur le nombre d'images avec un minimum garanti
  const durationInFrames = calculateDuration(defaultProps.images.length);

  return (
    <>
      <Composition
        id="modern"
        component={ModernSlideshow}
        durationInFrames={durationInFrames}
        fps={fps}
        width={1920}
        height={1080}
        defaultProps={{
          ...defaultProps,
          durationInFrames,
        }}
      />
      <Composition
        id="fade"
        component={FadeSlideshow}
        durationInFrames={durationInFrames}
        fps={fps}
        width={1920}
        height={1080}
        defaultProps={{
          ...defaultProps,
          durationInFrames,
        }}
      />
    </>
  );
};

registerRoot(Root);
