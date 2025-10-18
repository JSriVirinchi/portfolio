import { useEffect, useMemo, useRef, useState } from 'react';
import type { SpotlightItem } from '../types';
import { SectionHeader } from './SectionHeader';

interface Props {
  items: SpotlightItem[];
}

export function SpotlightGallery({ items }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [metrics, setMetrics] = useState({ cardWidth: 0, gap: 0, viewportWidth: 0 });

  const { cardWidth, gap, viewportWidth } = metrics;
  const step = cardWidth + gap;
  const visibleCount =
    step > 0 && viewportWidth > 0 ? Math.max(1, Math.round((viewportWidth + gap) / step)) : 1;
  const bufferEstimate = Math.max(1, Math.ceil((visibleCount + 1) / 2));
  const sideBuffer =
    items.length > 1 ? Math.min(items.length, bufferEstimate) : 0;

  const { carouselItems, baseCount } = useMemo(() => {
    if (!items.length) {
      return { carouselItems: [] as Array<{ item: SpotlightItem; key: string; clone: boolean }>, baseCount: 0 };
    }

    const base = items.map((item, idx) => ({
      item,
      key: `${item.title}-${idx}`,
      clone: false,
    }));

    if (base.length === 1 || sideBuffer === 0) {
      return { carouselItems: base, baseCount: base.length };
    }

    const head = base.slice(-sideBuffer).map((entry, cloneIdx) => ({
      item: entry.item,
      key: `${entry.key}-clone-head-${cloneIdx}`,
      clone: true,
    }));

    const tail = base.slice(0, sideBuffer).map((entry, cloneIdx) => ({
      item: entry.item,
      key: `${entry.key}-clone-tail-${cloneIdx}`,
      clone: true,
    }));

    return { carouselItems: [...head, ...base, ...tail], baseCount: base.length };
  }, [items, sideBuffer]);

  const totalItems = carouselItems.length;

  // Ensure the carousel starts on the first real card whenever data changes.
  useEffect(() => {
    if (totalItems <= 1) {
      setActiveIndex(0);
    } else {
      setActiveIndex(sideBuffer || 0);
    }
  }, [sideBuffer, totalItems]);

  // Measure a card and the track gap to compute translation offsets.
  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    const updateMetrics = () => {
      const firstCard = track.querySelector<HTMLElement>('[data-carousel-card]');
      if (!firstCard) return;

      const style = window.getComputedStyle(track);
      const gapValue =
        parseFloat(style.columnGap || style.gap || style.rowGap || '0') || 0;

      setMetrics({
        cardWidth: firstCard.offsetWidth,
        gap: gapValue,
        viewportWidth: viewport.clientWidth,
      });
    };

    updateMetrics();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateMetrics);
      return () => window.removeEventListener('resize', updateMetrics);
    }

    const observer = new ResizeObserver(updateMetrics);
    observer.observe(viewport);
    observer.observe(track);
    Array.from(track.children).forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [totalItems]);

  // Auto-advance while respecting pause state.
  useEffect(() => {
    if (totalItems <= 1 || isPaused) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsTransitioning(true);
      setActiveIndex((prev) => prev + 1);
    }, 5200);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isPaused, totalItems]);

  // Restore transitions after an instant jump.
  useEffect(() => {
    if (isTransitioning) return;
    const frame = requestAnimationFrame(() => setIsTransitioning(true));
    return () => cancelAnimationFrame(frame);
  }, [isTransitioning]);

  const handleTransitionEnd = () => {
    if (totalItems <= 1 || sideBuffer === 0) return;

    const tailStart = totalItems - sideBuffer;

    if (activeIndex >= tailStart) {
      setIsTransitioning(false);
      setActiveIndex(sideBuffer);
    } else if (activeIndex < sideBuffer) {
      setIsTransitioning(false);
      setActiveIndex(tailStart - 1);
    }
  };

  const goToIndex = (target: number) => {
    if (!totalItems) return;
    const clamped = Math.max(0, Math.min(target, totalItems - 1));
    setIsTransitioning(true);
    setActiveIndex(clamped);
  };

  const goToRealIndex = (realIndex: number) => {
    if (!totalItems) return;
    if (sideBuffer === 0) {
      goToIndex(realIndex);
      return;
    }
    const target = sideBuffer + realIndex;
    goToIndex(target);
  };

  const goToNext = () => {
    if (!totalItems) return;
    goToIndex(activeIndex + 1);
  };

  const goToPrev = () => {
    if (!totalItems) return;
    goToIndex(activeIndex - 1);
  };

  const centerOffset =
    cardWidth > 0 && viewportWidth > 0 ? (viewportWidth - cardWidth) / 2 : 0;
  const translateX = cardWidth > 0 ? -activeIndex * step + centerOffset : 0;

  const trackStyle =
    cardWidth > 0
      ? {
          transform: `translate3d(${translateX}px, 0, 0)`,
          transition: isTransitioning ? 'transform 0.78s cubic-bezier(0.32, 0.72, 0, 1)' : 'none',
        }
      : undefined;

  const realCount = baseCount;
  const currentRealIndex =
    realCount > 0
      ? sideBuffer === 0
        ? Math.max(0, Math.min(activeIndex, realCount - 1))
        : ((activeIndex - sideBuffer) % realCount + realCount) % realCount
      : 0;

  return (
    <section className="section" id="spotlight">
      <SectionHeader
        eyebrow="Spotlight"
        title="Experiences I'm proud of"
        description="Selective highlights where product thinking, data, and craftsmanship intersect."
      />
      {carouselItems.length > 0 && (
        <div
          className={`gallery auto${isPaused ? ' is-paused' : ''}`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
          onPointerDown={() => setIsPaused(true)}
          onPointerUp={() => setIsPaused(false)}
          onPointerCancel={() => setIsPaused(false)}
        >
          {carouselItems.length > 1 && (
            <>
              <button
                type="button"
                className="gallery-arrow gallery-arrow--prev"
                onClick={goToPrev}
                aria-label="Show previous spotlight project"
              >
                <span aria-hidden>‹</span>
              </button>
              <button
                type="button"
                className="gallery-arrow gallery-arrow--next"
                onClick={goToNext}
                aria-label="Show next spotlight project"
              >
                <span aria-hidden>›</span>
              </button>
            </>
          )}
          <div className="gallery-viewport" ref={viewportRef}>
            <div
              className="gallery-track"
              ref={trackRef}
              role="list"
              aria-label="Spotlight project stories"
              style={trackStyle}
              onTransitionEnd={handleTransitionEnd}
            >
              {carouselItems.map((entry, index) => {
                const isClone = entry.clone;
                const isActive = !isClone && activeIndex === index;

                return (
                  <article
                    key={entry.key}
                    className={`gallery-card${isActive ? ' is-active' : ''}`}
                    role="listitem"
                    tabIndex={isClone ? -1 : 0}
                    aria-hidden={isClone || undefined}
                    data-carousel-card
                  >
                    <div className="gallery-image" style={{ backgroundImage: `url(${entry.item.image})` }} />
                    <div className="gallery-body">
                      <h3>{entry.item.title}</h3>
                      <p>{entry.item.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
          {realCount > 1 && (
            <div className="gallery-dots" role="tablist" aria-label="Spotlight carousel pagination">
              {items.map((item, index) => {
                const isActive = currentRealIndex === index;
                return (
                  <button
                    key={item.title}
                    type="button"
                    className={`gallery-dot${isActive ? ' is-active' : ''}`}
                    onClick={() => goToRealIndex(index)}
                    aria-label={`Go to spotlight card ${index + 1} of ${items.length}: ${item.title}`}
                    aria-selected={isActive}
                    role="tab"
                    tabIndex={isActive ? 0 : -1}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
