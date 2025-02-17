
import { Composition } from 'remotion';
import { ModernSlideshow } from './compositions/ModernSlideshow';
import { FadeSlideshow } from './compositions/FadeSlideshow';
import { SlideshowProps } from './types';

export const Root: React.FC = () => {
  const defaultProps: SlideshowProps = {
    images: [],
    musicUrl: null,
    showAddress: false,
    showPrice: false,
    showDetails: false,
    showAgent: false,
  };

  return (
    <>
      <Composition
        id="modern"
        component={ModernSlideshow}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />
      <Composition
        id="fade"
        component={FadeSlideshow}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />
    </>
  );
};
