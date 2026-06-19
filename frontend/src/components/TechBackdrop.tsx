import { useEffect, useRef } from 'react';

/**
 * Glowing interactive dot grid (Osmo-style). A faint grid of dots sits in the
 * background; dots near the cursor brighten and grow with a smooth trailing
 * ease. It redraws only while the pointer moves and then settles — so it stays
 * performant and doesn't animate continuously.
 */
export function TechBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const GAP = 25; // dot spacing (css px) — denser grid
    const BASE_R = 1; // base dot radius
    const GLOW_R = 2.4; // dot radius right under the cursor (subtler)
    const RADIUS = 150; // influence radius (css px)

    let width = 0;
    let height = 0;
    const pointer = { x: -9999, y: -9999 };
    const eased = { x: -9999, y: -9999 };
    let hasPointer = false;
    let raf = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const cx = eased.x;
      const cy = eased.y;
      for (let y = GAP / 2; y < height; y += GAP) {
        for (let x = GAP / 2; x < width; x += GAP) {
          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const lin = hasPointer ? Math.max(0, 1 - dist / RADIUS) : 0;
          const t = lin * lin * (3 - 2 * lin); // smoothstep falloff
          const r = BASE_R + t * (GLOW_R - BASE_R);
          const alpha = 0.08 + t * 0.5;
          const rC = Math.round(124 + t * 20);
          const gC = Math.round(150 - t * 16);
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rC}, ${gC}, 255, ${alpha})`;
          ctx.fill();
        }
      }
    };

    const loop = () => {
      eased.x += (pointer.x - eased.x) * 0.14;
      eased.y += (pointer.y - eased.y) * 0.14;
      draw();
      if (Math.hypot(pointer.x - eased.x, pointer.y - eased.y) < 0.4) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!hasPointer) {
        hasPointer = true;
        eased.x = pointer.x;
        eased.y = pointer.y;
      }
      if (!reduced && !raf) raf = requestAnimationFrame(loop);
    };

    const onLeave = () => {
      hasPointer = false;
      draw();
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerout', onLeave);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerout', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="tech-backdrop" aria-hidden>
      <div className="tech-glow" />
      <canvas ref={canvasRef} className="dots-canvas" />
    </div>
  );
}
