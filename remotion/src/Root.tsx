import { Composition, registerRoot } from 'remotion';
import { ModernSlideshow } from './compositions/ModernSlideshow';
import { FadeSlideshow } from './compositions/FadeSlideshow';
import { SlideshowProps } from './types';

const Root: React.FC = () => {
  const defaultProps: SlideshowProps = {
    images: [],
    musicUrl: null,
    showAddress: false,
    showPrice: false,
    showDetails: false,
    showAgent: false,
  };

  // Paramètres de base
  const fps = 30;
  const secondsPerImage = 3;
  
  // Calcul de la durée en frames
  const calculateDuration = (numberOfImages: number) => {
    // Utiliser le nombre réel d'images, pas de minimum
    return numberOfImages * secondsPerImage * fps;
  };

  // Durée basée sur le nombre réel d'images
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
