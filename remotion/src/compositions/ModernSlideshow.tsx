import { useCurrentFrame, useVideoConfig, Audio, Img, delayRender, continueRender } from 'remotion';
import { useEffect, useState } from 'react';
import { SlideshowProps } from '../types';

export const ModernSlideshow: React.FC<SlideshowProps> = ({
  images,
  musicUrl,
  showAddress,
  showPrice,
  showDetails,
  showAgent,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig(); // Ne plus destructurer durationInFrames ici
  const [handle] = useState(() => delayRender());
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const secondsPerImage = 3;
  const framesPerImage = secondsPerImage * fps;
  
  // Utiliser modulo pour s'assurer que currentImageIndex reste dans les limites
  const currentImageIndex = Math.min(
    Math.floor(frame / framesPerImage),
    images.length - 1
  );
  
  const transitionProgress = (frame % framesPerImage) / framesPerImage;

  // Vérification initiale des images
  useEffect(() => {
    if (!images || images.length === 0) {
      console.log('No images provided, continuing render immediately');
      continueRender(handle);
      return;
    }

    const LOAD_TIMEOUT = 30000;
    let loadedCount = 0;
    let errorCount = 0;
    let isMounted = true;

    console.log(`Starting to load ${images.length} images...`);

    const timeoutId = setTimeout(() => {
      console.log('Loading timeout reached, continuing render');
      if (isMounted) {
        setImagesLoaded(true);
        continueRender(handle);
      }
    }, LOAD_TIMEOUT);

    const checkComplete = () => {
      if (loadedCount + errorCount === images.length && isMounted) {
        clearTimeout(timeoutId);
        setImagesLoaded(true);
        continueRender(handle);
        console.log(`Loading complete: ${loadedCount} loaded, ${errorCount} failed`);
      }
    };

    const imageElements = images.map((src) => {
      const img = new Image();
      
      img.onload = () => {
        loadedCount++;
        console.log(`Image loaded ${loadedCount}/${images.length}: ${src}`);
        checkComplete();
      };

      img.onerror = (error) => {
        errorCount++;
        console.error('Error loading image:', src, error);
        checkComplete();
      };

      img.src = src;
      return img;
    });

    return () => {
      console.log('Cleaning up image loading');
      isMounted = false;
      clearTimeout(timeoutId);
      imageElements.forEach((img) => {
        img.onload = null;
        img.onerror = null;
        img.src = '';
      });
    };
  }, [images, handle]);

  if (!images || images.length === 0) {
    return (
      <div style={{ flex: 1, backgroundColor: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'white' }}>Aucune image disponible</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, backgroundColor: 'black' }}>
      {images.map((src, index) => {
        const isCurrentImage = index === currentImageIndex;
        const isNextImage = index === (currentImageIndex + 1) % images.length;
        
        if (!isCurrentImage && !isNextImage) return null;

        const opacity = isCurrentImage
          ? 1 - transitionProgress
          : transitionProgress;

        return (
          <div
            key={src}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity,
              transition: 'opacity 1s ease-in-out',
            }}
          >
            <Img
              src={src}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
              pixelFormat="yuv420p"
              imageFormat="jpeg"
            />
          </div>
        );
      })}

      {musicUrl && (
        <Audio src={musicUrl} volume={1} />
      )}
    </div>
  );
};
