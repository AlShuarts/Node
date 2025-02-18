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
  const { fps } = useVideoConfig();
  const [handle] = useState(() => delayRender());
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Log initial des props reçues
  console.log('ModernSlideshow initialized with props:', {
    numberOfImages: images?.length,
    hasMusic: !!musicUrl,
    durationInFrames,
    fps,
    showAddress,
    showPrice,
    showDetails,
    showAgent,
  });

  // Vérification immédiate des images avant tout calcul
  if (!images || images.length === 0) {
    console.log('No images available for rendering, showing placeholder');
    return (
      <div style={{ flex: 1, backgroundColor: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'white' }}>Aucune image disponible</p>
      </div>
    );
  }

  const secondsPerImage = 3;
  const framesPerImage = secondsPerImage * fps;
  const totalFrames = images.length * framesPerImage;

  // Log des paramètres de calcul
  console.log('Slideshow parameters:', {
    secondsPerImage,
    framesPerImage,
    totalFrames,
    providedDurationInFrames: durationInFrames,
    fps,
  });

  // Calcul de l'index de l'image courante avec modulo pour boucler
  const currentFrame = frame % totalFrames;
  const currentImageIndex = Math.floor(currentFrame / framesPerImage) % images.length;
  
  // Calcul de la progression de la transition
  const transitionProgress = (currentFrame % framesPerImage) / framesPerImage;

  // Log détaillé de l'état actuel
  console.log('Current frame state:', {
    globalFrame: frame,
    currentFrame,
    framesPerImage,
    currentImageIndex,
    currentImage: images[currentImageIndex],
    nextImage: images[(currentImageIndex + 1) % images.length],
    transitionProgress,
    totalImages: images.length,
    totalFrames,
    isTransitioning: transitionProgress > 0,
  });

  // Chargement des images
  useEffect(() => {
    const LOAD_TIMEOUT = 30000;
    let loadedCount = 0;
    let errorCount = 0;
    let isMounted = true;

    console.log('Starting image preload process:', {
      numberOfImages: images.length,
      timeout: LOAD_TIMEOUT,
      imageUrls: images,
    });

    const timeoutId = setTimeout(() => {
      console.log('Loading timeout reached:', {
        loadedCount,
        errorCount,
        remainingImages: images.length - (loadedCount + errorCount),
      });
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
        console.log('Image loading complete:', {
          successful: loadedCount,
          failed: errorCount,
          total: images.length,
          duration: Date.now() - startTime,
        });
      }
    };

    const startTime = Date.now();
    const imageElements = images.map((src, index) => {
      const img = new Image();
      
      img.onload = () => {
        loadedCount++;
        console.log('Image loaded successfully:', {
          index,
          url: src,
          progress: `${loadedCount}/${images.length}`,
          timeElapsed: Date.now() - startTime,
        });
        checkComplete();
      };

      img.onerror = (error) => {
        errorCount++;
        console.error('Error loading image:', {
          index,
          url: src,
          error,
          progress: `${loadedCount}/${images.length}`,
          timeElapsed: Date.now() - startTime,
        });
        checkComplete();
      };

      img.src = src;
      return img;
    });

    return () => {
      console.log('Cleaning up image loading:', {
        loadedCount,
        errorCount,
        timeElapsed: Date.now() - startTime,
      });
      isMounted = false;
      clearTimeout(timeoutId);
      imageElements.forEach((img) => {
        img.onload = null;
        img.onerror = null;
        img.src = '';
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
          ? 1 - transitionProgress
          : transitionProgress;

        console.log('Rendering image:', {
          index,
          url: src,
          isCurrentImage,
          isNextImage,
          opacity,
        });

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
