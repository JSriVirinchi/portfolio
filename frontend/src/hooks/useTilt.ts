import { useCallback, useEffect, useRef, useState } from 'react';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function useTilt(maxTilt = 8) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState({ transform: 'rotateX(0deg) rotateY(0deg)' });

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const node = ref.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      const percentX = clamp(offsetX / rect.width, 0, 1);
      const percentY = clamp(offsetY / rect.height, 0, 1);
      const tiltX = (0.5 - percentY) * maxTilt;
      const tiltY = (percentX - 0.5) * maxTilt;

      setStyle({ transform: `rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)` });
    },
    [maxTilt],
  );

  const reset = useCallback(() => {
    setStyle({ transform: 'rotateX(0deg) rotateY(0deg)' });
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.addEventListener('pointermove', handlePointerMove);
    node.addEventListener('pointerleave', reset);
    node.addEventListener('pointerdown', reset);

    return () => {
      node.removeEventListener('pointermove', handlePointerMove);
      node.removeEventListener('pointerleave', reset);
      node.removeEventListener('pointerdown', reset);
    };
  }, [handlePointerMove, reset]);

  return { ref, style } as const;
}
