import { useState, useEffect, RefObject } from 'react';
import { AspectRatio } from '@ai-slide-studio/shared';

export function useFitScale(
  containerRef: RefObject<HTMLElement | null>,
  aspectRatio: AspectRatio = '16:9',
) {
  const [scale, setScale] = useState<number>(0.5);

  const baseWidth = aspectRatio === '4:3' ? 1440 : 1920;
  const baseHeight = 1080;

  useEffect(() => {
    function calculateScale() {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth === 0 || clientHeight === 0) return;

      // Leave a small margin (e.g. 40px)
      const padding = 40;
      const availableW = Math.max(clientWidth - padding, 200);
      const availableH = Math.max(clientHeight - padding, 200);

      const s = Math.min(availableW / baseWidth, availableH / baseHeight);
      setScale(Math.max(0.1, Math.min(s, 1.2)));
    }

    calculateScale();

    const resizeObserver = new ResizeObserver(() => {
      calculateScale();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', calculateScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculateScale);
    };
  }, [containerRef, baseWidth, baseHeight, aspectRatio]);

  return { scale, baseWidth, baseHeight };
}
