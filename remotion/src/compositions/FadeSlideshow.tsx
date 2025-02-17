
import { useCurrentFrame, useVideoConfig, Audio, Img, delayRender, continueRender } from 'remotion';
import { useEffect, useState } from 'react';
import { SlideshowProps } from '../types';

export const FadeSlideshow: React.FC<SlideshowProps> = ({
  images,
  musicUrl,
  showAddress,
  showPrice,
  showDetails,
  showAgent,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const [handle] = useState(() => delayRender());
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const secondsPerImage = 3;
  const framesPerImage = secondsPerImage * fps;
  const currentImageIndex = Math.floor(frame / framesPerImage) % images.length;
  const fadeProgress = (frame % framesPerImage) / framesPerImage;

  // Précharger toutes les images
  useEffect(() => {
    let loadedCount = 0;
    const imageElements = images.map((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === images.length) {
          setImagesLoaded(true);
          continueRender(handle);
        }
      };
      img.onerror = (error) => {
        console.error('Error loading image:', src, error);
      };
      return img;
    });

    return () => {
      imageElements.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [images, handle]);

  return (
    <div style={{ flex: 1, backgroundColor: 'black' }}>
      {images.map((src, index) => {
        const isCurrentImage = index === currentImageIndex;
        const isNextImage = index === (currentImageIndex + 1) % images.length;
        
        if (!isCurrentImage && !isNextImage) return null;

        const opacity = isCurrentImage 
          ? 1 - (fadeProgress * 2)
          : fadeProgress * 2;

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
            }}
          >
            <Img
              src={src}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
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
