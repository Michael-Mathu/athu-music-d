import { useEffect, useRef, useState } from 'react';

export const useDominantColor = (imageSrc: string | null | undefined, enabled = true) => {
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled || !imageSrc) {
      setDominantColor(null);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvasRef.current = canvas;
    canvas.width = 64;
    canvas.height = 64;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    const handleLoad = () => {
      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let r = 0, g = 0, b = 0, count = 0;

        for (let i = 0; i < data.length; i += 16) {
          const red = data[i];
          const green = data[i + 1];
          const blue = data[i + 2];
          const alpha = data[i + 3];

          if (alpha > 128) {
            const brightness = (red + green + blue) / 3;
            if (brightness > 20 && brightness < 235) {
              r += red;
              g += green;
              b += blue;
              count++;
            }
          }
        }

        if (count > 0) {
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);
          setDominantColor(`rgb(${r}, ${g}, ${b})`);
        }
      } catch {
        setDominantColor(null);
      }
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', () => setDominantColor(null));

    return () => {
      img.removeEventListener('load', handleLoad);
    };
  }, [imageSrc, enabled]);

  return dominantColor;
};
