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
  const minImages = 1;  // Pour éviter une durée de 0
  
  // Calcul de la durée en frames
  const calculateDuration = (numberOfImages: number) => {
    const imageCount = Math.max(numberOfImages, minImages);
    return imageCount * secondsPerImage * fps;
  };

  // Durée basée sur le nombre d'images dans les props
  const durationInFrames = calculateDuration(defaultProps.images.length || 5); // Par défaut 5 images = 15 secondes

  return (
    <>
      <Composition
        id="modern"
        component={ModernSlideshow}
        durationInFrames={durationInFrames}
        fps={fps}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />
      <Composition
        id="fade"
        component={FadeSlideshow}
        durationInFrames={durationInFrames}
        fps={fps}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />
    </>
  );
};

registerRoot(Root);
