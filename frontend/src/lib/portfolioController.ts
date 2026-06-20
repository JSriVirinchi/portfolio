// Imperative animation controller for the portfolio — a port of the original
// design runtime. Owns the pointer-reactive canvas dot-grid, layered parallax,
// scroll reveals, the pinned horizontal "experience dolly" with its timeline
// scrubber, the coverflow carousels, the typewriter, and metric count-ups.
//
// It operates on the already-mounted DOM via refs + scoped querySelectors, and
// returns a destroy() that removes every listener / animation frame so it is
// safe under React StrictMode's double-invoke.

export interface ControllerRefs {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  parallax: HTMLElement;
  expSection: HTMLElement;
  expSticky: HTMLElement;
  expTrack: HTMLElement;
  timeline: HTMLElement;
  typed: HTMLElement;
  mobileMenu: HTMLElement;
  burger: HTMLElement;
  statements: string[];
  expCount: number;
}

interface Carousel {
  root: HTMLElement;
  track: HTMLElement;
  cards: HTMLElement[];
  dotsWrap: HTMLElement | null;
  active: number;
  raf: number;
  progress: number;
  duration: number;
  lastT: number;
  dots: HTMLButtonElement[];
  fills: HTMLElement[];
}

export function createController(refs: ControllerRefs) {
  const { root, canvas, parallax, expSection, expSticky, expTrack, timeline, typed, mobileMenu, burger, statements, expCount } = refs;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let menuOpen = false;

  // True layout-viewport width. `window.innerWidth` is unreliable on mobile:
  // any horizontal overflow inflates it, which would flip the breakpoint back
  // to "desktop" and re-create the overflow (a feedback loop). clientWidth
  // always reflects the real viewport and matches the CSS media queries.
  const vpw = () => document.documentElement.clientWidth || window.innerWidth;

  // Capture the original (desktop) inline styles for the experience block so we
  // can restore them verbatim when switching layouts — no drift, no guesswork.
  const expHead = expSticky.children[0] as HTMLElement | undefined;
  const expPanels = Array.from(expTrack.children) as HTMLElement[];
  const orig = {
    section: expSection.getAttribute('style') || '',
    sticky: expSticky.getAttribute('style') || '',
    track: expTrack.getAttribute('style') || '',
    timeline: timeline.getAttribute('style') || '',
    head: expHead ? expHead.getAttribute('style') || '' : '',
    panels: expPanels.map((p) => p.getAttribute('style') || ''),
    grids: expPanels.map((p) => p.querySelector('[data-xp-grid]')?.getAttribute('style') || ''),
  };

  let ctx: CanvasRenderingContext2D | null = null;
  let cw = 0, ch = 0;
  let raf = 0, cRaf = 0, typeTimer: ReturnType<typeof setTimeout> | undefined;
  let scrollY = 0, activeIdx = -1, isMobile = false;
  const pointer = { x: -9999, y: -9999 };
  const eased = { x: -9999, y: -9999 };
  let hasPointer = false;
  const carousels: Carousel[] = [];
  let carouselsInit = false;

  /* ---------- canvas dot-grid ---------- */
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = window.innerWidth; ch = window.innerHeight;
    canvas.width = Math.floor(cw * dpr); canvas.height = Math.floor(ch * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function drawCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, cw, ch);
    const GAP = 30, RADIUS = 150;
    const drift = (scrollY * 0.12) % GAP;
    const cx = eased.x, cy = eased.y, has = hasPointer;
    for (let y = GAP / 2 - GAP + (GAP - drift); y < ch + GAP; y += GAP) {
      for (let x = GAP / 2; x < cw; x += GAP) {
        let t = 0;
        if (has) { const dx = x - cx, dy = y - cy; const lin = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / RADIUS); t = lin * lin * (3 - 2 * lin); }
        const r = 1 + t * 1.6;
        const alpha = 0.07 + t * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + Math.round(124 + t * 30) + ',' + Math.round(150 - t * 14) + ',255,' + alpha + ')';
        ctx.fill();
      }
    }
  }
  function onPointerMove(e: PointerEvent) {
    pointer.x = e.clientX; pointer.y = e.clientY;
    if (!hasPointer) { hasPointer = true; eased.x = e.clientX; eased.y = e.clientY; }
    if (!reduced && !cRaf) cRaf = requestAnimationFrame(cLoop);
  }
  function cLoop() {
    eased.x += (pointer.x - eased.x) * 0.14;
    eased.y += (pointer.y - eased.y) * 0.14;
    drawCanvas();
    if (Math.hypot(pointer.x - eased.x, pointer.y - eased.y) < 0.4) { cRaf = 0; return; }
    cRaf = requestAnimationFrame(cLoop);
  }

  /* ---------- typewriter ---------- */
  function setTyped(t: string) { typed.textContent = t; }
  function startTypewriter() {
    if (reduced) { setTyped(statements[0]); return; }
    let si = 0, c = 0, deleting = false;
    const tick = () => {
      const full = statements[si];
      c += deleting ? -1 : 1;
      setTyped(full.slice(0, c));
      let delay = deleting ? 35 : 65;
      if (!deleting && c === full.length) { delay = 1900; typeTimer = setTimeout(() => { deleting = true; tick(); }, delay); return; }
      if (deleting && c === 0) { deleting = false; si = (si + 1) % statements.length; delay = 320; }
      typeTimer = setTimeout(tick, delay);
    };
    typeTimer = setTimeout(tick, 700);
  }

  /* ---------- reveals ---------- */
  function initReveals() {
    const vh = window.innerHeight;
    root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      if (reduced || el.getBoundingClientRect().top < vh * 0.92) { el.style.opacity = '1'; el.style.transform = 'none'; return; }
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity .8s cubic-bezier(.22,.61,.36,1), transform .8s cubic-bezier(.22,.61,.36,1)';
      const base = parseInt(el.dataset.delay || '0', 10);
      let i = 0;
      const parent = el.parentElement;
      if (parent) { const sibs = Array.from(parent.children).filter((c) => c.hasAttribute('data-reveal')); i = Math.max(0, sibs.indexOf(el)); }
      el.style.transitionDelay = base + Math.min(i, 5) * 85 + 'ms';
    });
    root.querySelectorAll<HTMLElement>('[data-chip]').forEach((el) => {
      if (reduced || el.getBoundingClientRect().top < vh * 0.92) { el.style.opacity = '1'; el.style.transform = 'none'; return; }
      const parent = el.parentElement;
      const sibs = parent ? Array.from(parent.querySelectorAll<HTMLElement>('[data-chip]')) : [el];
      const i = Math.max(0, sibs.indexOf(el));
      el.style.opacity = '0';
      el.style.transform = 'translateY(14px) scale(.92)';
      el.style.transition = 'opacity .5s ease, transform .5s cubic-bezier(.22,.61,.36,1)';
      el.style.transitionDelay = i * 60 + 'ms';
    });
    revealCheck();
  }
  function revealCheck() {
    if (reduced) return;
    const trig = window.innerHeight * 0.92;
    root.querySelectorAll<HTMLElement>('[data-reveal],[data-chip]').forEach((el) => {
      if (el.style.opacity === '1') return;
      if (el.getBoundingClientRect().top < trig) { el.style.opacity = '1'; el.style.transform = 'none'; }
    });
  }

  /* ---------- mobile menu ---------- */
  function openMenu() {
    menuOpen = true;
    mobileMenu.style.opacity = '1'; mobileMenu.style.pointerEvents = 'auto'; mobileMenu.style.transform = 'none';
    document.body.style.overflow = 'hidden';
    const ls = burger.querySelectorAll<HTMLElement>('[data-bl]');
    if (ls[0]) ls[0].style.transform = 'translateY(7px) rotate(45deg)';
    if (ls[1]) ls[1].style.opacity = '0';
    if (ls[2]) ls[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  }
  function closeMenu() {
    menuOpen = false;
    mobileMenu.style.opacity = '0'; mobileMenu.style.pointerEvents = 'none'; mobileMenu.style.transform = 'translateY(-12px)';
    document.body.style.overflow = '';
    burger.querySelectorAll<HTMLElement>('[data-bl]').forEach((l) => { l.style.transform = 'none'; l.style.opacity = '1'; });
  }
  function toggleMenu() { menuOpen ? closeMenu() : openMenu(); }

  /* ---------- layout (desktop pin vs mobile horizontal swipe) ---------- */
  function applyLayout() {
    const mob = vpw() <= 860;
    isMobile = mob;
    if (!mob && menuOpen) closeMenu();
    const n = expCount;
    const panels = Array.from(expTrack.children) as HTMLElement[];
    if (mob) {
      // Mobile: a native horizontal scroll-snap carousel — the desktop "dolly"
      // re-expressed as a touch swipe, with the timeline scrubber pinned below.
      expSection.setAttribute('style', orig.section); expSection.style.height = 'auto';
      expSticky.setAttribute('style', orig.sticky);
      expSticky.style.position = 'relative'; expSticky.style.top = 'auto'; expSticky.style.height = 'auto'; expSticky.style.overflow = 'visible';
      expTrack.setAttribute('style', orig.track);
      expTrack.style.flexDirection = 'row'; expTrack.style.width = '100%'; expTrack.style.height = 'auto'; expTrack.style.transform = 'none';
      expTrack.style.overflowX = 'auto'; expTrack.style.overflowY = 'hidden'; expTrack.style.scrollSnapType = 'x mandatory';
      expTrack.style.setProperty('-webkit-overflow-scrolling', 'touch');
      if (expHead) { expHead.setAttribute('style', orig.head); expHead.style.position = 'relative'; expHead.style.padding = '92px 22px 14px'; }
      panels.forEach((p, i) => {
        p.setAttribute('style', orig.panels[i]);
        p.style.flex = '0 0 100%'; p.style.width = '100%'; p.style.height = 'auto'; p.style.minHeight = '0'; p.style.padding = '26px 22px 30px'; p.style.scrollSnapAlign = 'center';
        const g = p.querySelector<HTMLElement>('[data-xp-grid]');
        if (g) { g.setAttribute('style', orig.grids[i]); g.style.gridTemplateColumns = 'minmax(0,1fr)'; g.style.opacity = '1'; g.style.transform = 'none'; g.removeAttribute('data-reveal'); g.dataset.mobReveal = ''; }
      });
      timeline.setAttribute('style', orig.timeline);
      timeline.style.position = 'relative'; timeline.style.bottom = 'auto'; timeline.style.display = 'flex'; timeline.style.padding = '4px 22px 26px';
      syncMobileTimeline();
    } else {
      expSection.setAttribute('style', orig.section); expSection.style.height = n * 100 + 'vh';
      expSticky.setAttribute('style', orig.sticky);
      expTrack.setAttribute('style', orig.track); expTrack.style.width = n * 100 + 'vw'; expTrack.style.transform = 'translate3d(0,0,0)';
      if (expHead) expHead.setAttribute('style', orig.head);
      panels.forEach((p, i) => { p.setAttribute('style', orig.panels[i]); const g = p.querySelector<HTMLElement>('[data-xp-grid]'); if (g) { g.setAttribute('style', orig.grids[i]); g.removeAttribute('data-reveal'); g.dataset.mobReveal = ''; } });
      timeline.setAttribute('style', orig.timeline); timeline.style.display = 'flex';
    }
  }

  // Mobile only: drive the timeline scrubber from the horizontal scroll offset.
  function syncMobileTimeline() {
    const max = expTrack.scrollWidth - expTrack.clientWidth;
    const p = max > 0 ? Math.min(1, Math.max(0, expTrack.scrollLeft / max)) : 0;
    const idx = Math.round(p * (expCount - 1));
    updateTimeline(p, idx);
    if (idx !== activeIdx) { activeIdx = idx; animatePanel(idx); }
  }
  function onExpScroll() { if (isMobile) syncMobileTimeline(); }

  /* ---------- main scroll frame ---------- */
  function onScroll() { if (!raf) raf = requestAnimationFrame(frame); }
  function frame() {
    raf = 0;
    scrollY = window.scrollY || window.pageYOffset || 0;
    drawCanvas();
    revealCheck();
    updateParallax();
    if (isMobile) return;
    const vh = window.innerHeight;
    const total = expSection.offsetHeight - vh;
    let p = total > 0 ? (scrollY - expSection.offsetTop) / total : 0;
    p = Math.min(1, Math.max(0, p));
    const n = expCount;
    expTrack.style.transform = 'translate3d(' + -p * (n - 1) * 100 + 'vw,0,0)';
    const idx = Math.round(p * (n - 1));
    updateTimeline(p, idx);
    const children = expTrack.children;
    for (let i = 0; i < children.length; i++) {
      const g = children[i].querySelector<HTMLElement>('[data-xp-grid]');
      if (!g) continue;
      const dist = p * (n - 1) - i;
      const ad = Math.min(Math.abs(dist), 1.25);
      g.style.opacity = String(Math.max(0.04, 1 - ad * 1.12));
      g.style.transform = 'scale(' + (1 - Math.min(ad, 1) * 0.13) + ') translateX(' + dist * -28 + 'px)';
    }
    if (idx !== activeIdx) { activeIdx = idx; animatePanel(idx); }
  }
  function updateParallax() {
    parallax.style.opacity = String(Math.max(0, Math.min(1, 1 - scrollY / (window.innerHeight * 1.5))));
    parallax.querySelectorAll<HTMLElement>('[data-par]').forEach((el) => {
      const sp = parseFloat(el.dataset.par || '0') || 0;
      el.style.transform = 'translate3d(0,' + scrollY * sp + 'px,0)';
    });
  }
  function updateTimeline(p: number, idx: number) {
    const fill = timeline.querySelector<HTMLElement>('[data-tl-fill]');
    if (fill) fill.style.width = p * 100 + '%';
    timeline.querySelectorAll<HTMLElement>('[data-tl-tick]').forEach((t, i) => {
      const dot = t.querySelector<HTMLElement>('[data-tl-dot]');
      const label = t.querySelector<HTMLElement>('[data-tl-label]');
      const active = i === idx, passed = i <= idx;
      if (dot) {
        dot.style.background = passed ? 'linear-gradient(120deg,#89b4ff,#7c5cff)' : '#0b1024';
        dot.style.borderColor = passed ? 'rgba(159,192,255,.9)' : 'rgba(124,160,255,.4)';
        dot.style.transform = active ? 'scale(1.35)' : 'scale(1)';
        dot.style.boxShadow = active ? '0 0 14px rgba(124,160,255,.7)' : 'none';
      }
      if (label) label.style.color = active ? '#eaf0ff' : passed ? 'rgba(200,212,255,.7)' : 'rgba(180,196,235,.5)';
    });
  }
  function animatePanel(idx: number) {
    if (reduced) return;
    const child = expTrack.children[idx];
    if (!child) return;
    child.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => countUp(el));
  }
  function countUp(el: HTMLElement) {
    const target = parseFloat(el.dataset.target || '0') || 0;
    const suffix = el.dataset.suffix || '';
    const dur = 1200, start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      const val = Math.round(target * e);
      el.textContent = (val >= 1000 ? val.toLocaleString() : val) + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function onTick(e: Event) {
    const i = parseInt((e.currentTarget as HTMLElement).dataset.idx || '0', 10) || 0;
    if (isMobile) {
      const panel = expTrack.children[i] as HTMLElement | undefined;
      if (panel) expTrack.scrollTo({ left: panel.offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
      return;
    }
    const total = expSection.offsetHeight - window.innerHeight;
    const n = expCount;
    const y = expSection.offsetTop + (i / (n - 1)) * total;
    window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  }

  /* ---------- coverflow carousels ---------- */
  function initCarouselsWhenReady(tries: number) {
    if (root.querySelector('[data-carousel] [data-card]')) { initCarousels(); return; }
    if (tries > 40) return;
    requestAnimationFrame(() => initCarouselsWhenReady(tries + 1));
  }
  function initCarousels() {
    if (carouselsInit) return;
    carouselsInit = true;
    root.querySelectorAll<HTMLElement>('[data-carousel]').forEach((croot) => {
      const track = croot.querySelector<HTMLElement>('[data-carousel-track]');
      if (!track) return;
      const cards = Array.from(track.querySelectorAll<HTMLElement>('[data-card]'));
      if (!cards.length) return;
      const dotsWrap = croot.querySelector<HTMLElement>('[data-carousel-dots]');
      const c: Carousel = { root: croot, track, cards, dotsWrap, active: 0, raf: 0, progress: 0, duration: 5000, lastT: 0, dots: [], fills: [] };
      if (dotsWrap) {
        dotsWrap.innerHTML = '';
        cards.forEach((_, i) => {
          const d = document.createElement('button');
          d.setAttribute('aria-label', 'Go to ' + (i + 1));
          d.style.cssText = 'position:relative;height:9px;width:9px;border-radius:999px;border:none;padding:0;cursor:pointer;overflow:hidden;background:rgba(124,160,255,.28);transition:width .45s cubic-bezier(.4,0,.15,1),background .4s ease';
          const fill = document.createElement('i');
          fill.style.cssText = 'position:absolute;left:0;top:0;bottom:0;width:0%;border-radius:999px;background:linear-gradient(90deg,#89b4ff,#7c5cff)';
          d.appendChild(fill);
          d.addEventListener('click', () => { goCarousel(c, i); restartAutoplay(c); });
          dotsWrap.appendChild(d);
          c.dots.push(d);
          c.fills.push(fill);
        });
      }
      const prev = croot.querySelector('[data-carousel-prev]');
      const next = croot.querySelector('[data-carousel-next]');
      if (prev) prev.addEventListener('click', () => { goCarousel(c, c.active - 1); restartAutoplay(c); });
      if (next) next.addEventListener('click', () => { goCarousel(c, c.active + 1); restartAutoplay(c); });
      cards.forEach((card, i) => card.addEventListener('click', () => { if (i !== c.active) { goCarousel(c, i); restartAutoplay(c); } }));
      croot.addEventListener('mouseenter', () => stopAutoplay(c));
      croot.addEventListener('mouseleave', () => startAutoplay(c));
      carousels.push(c);
      positionCarousel(c);
      startAutoplay(c);
    });
    requestAnimationFrame(() => requestAnimationFrame(() => repositionCarousels()));
    setTimeout(() => repositionCarousels(), 350);
  }
  function goCarousel(c: Carousel, idx: number) {
    const n = c.cards.length;
    c.active = ((idx % n) + n) % n;
    c.progress = 0;
    positionCarousel(c);
    renderDotFill(c);
  }
  function positionCarousel(c: Carousel) {
    const n = c.cards.length;
    const active = c.active;
    const vw = vpw();
    const mob = vw <= 760;
    const clamp = (lo: number, val: number, hi: number) => Math.max(lo, Math.min(val, hi));
    const sidePx = mob ? clamp(96, 0.3 * vw, 150) : clamp(150, 0.15 * vw, 230);
    const activePx = mob ? Math.min(0.92 * vw, 560) : Math.min(0.7 * vw, 800);
    const sideW = sidePx + 'px';
    const activeW = activePx + 'px';
    c.cards.forEach((card, i) => {
      let d = i - active; if (d > n / 2) d -= n; if (d < -n / 2) d += n;
      (card as HTMLElement & { _d?: number })._d = d;
      const isActive = d === 0;
      const inner = card.querySelector<HTMLElement>('[data-card-inner]');
      const mini = card.querySelector<HTMLElement>('[data-card-mini]');
      if (isActive) { card.style.width = activeW; if (inner) { inner.style.opacity = '1'; inner.style.transform = 'none'; inner.style.pointerEvents = 'auto'; } if (mini) { mini.style.opacity = '0'; mini.style.transform = 'scale(1.06)'; mini.style.pointerEvents = 'none'; } }
      else { card.style.width = sideW; if (inner) { inner.style.opacity = '0'; inner.style.transform = 'scale(.94)'; inner.style.pointerEvents = 'none'; } if (mini) { mini.style.opacity = '1'; mini.style.transform = 'none'; mini.style.pointerEvents = 'none'; } }
      if (inner) {
        inner.style.flexDirection = mob ? 'column' : 'row';
        const div = inner.querySelector<HTMLElement>('[data-divider]');
        if (div) div.style.background = mob ? 'linear-gradient(90deg,transparent,rgba(124,160,255,.32),transparent)' : 'linear-gradient(180deg,transparent,rgba(124,160,255,.32),transparent)';
      }
    });
    const aw = activePx, rwAll = sidePx;
    const gap = mob ? 12 : 26;
    const maxSide = mob ? 1 : 2;
    const place = (card: HTMLElement, x: number, sc: number, op: number, z: number) => {
      card.style.transform = 'translate(-50%,-50%) translateX(' + x + 'px) scale(' + sc + ')';
      card.style.opacity = String(op); card.style.zIndex = String(z);
      card.style.pointerEvents = op > 0 ? 'auto' : 'none';
      card.style.filter = sc < 1 ? 'brightness(.82)' : 'none';
    };
    place(c.cards[active], 0, 1, 1, 30);
    let edgeR = aw / 2, edgeL = -aw / 2;
    for (let k = 1; k <= maxSide; k++) {
      const sc = k === 1 ? 0.9 : 0.78;
      const op = k === 1 ? 0.72 : 0.36;
      const z = 20 - k;
      const rc = c.cards[(active + k) % n]; const rw = rwAll;
      place(rc, edgeR + gap + rw / 2, sc, op, z); edgeR += gap + rw;
      const lc = c.cards[(active - k + n) % n]; const lw = rwAll;
      place(lc, edgeL - gap - lw / 2, sc, op, z); edgeL -= gap + lw;
    }
    c.cards.forEach((card) => { const d = (card as HTMLElement & { _d?: number })._d ?? 0; if (Math.abs(d) > maxSide) { card.style.opacity = '0'; card.style.pointerEvents = 'none'; card.style.transform = 'translate(-50%,-50%) scale(.6)'; } });
    c.dots.forEach((d, i) => {
      const on = i === active;
      d.style.width = on ? '34px' : '9px';
      d.style.background = on ? 'rgba(124,160,255,.2)' : 'rgba(124,160,255,.28)';
      if (!on && c.fills[i]) c.fills[i].style.width = '0%';
    });
    renderDotFill(c);
    if (!reduced) c.cards[active].querySelectorAll<HTMLElement>('[data-count]').forEach((el) => countUp(el));
  }
  function renderDotFill(c: Carousel) {
    const fill = c.fills[c.active];
    if (fill) fill.style.width = Math.min(1, Math.max(0, c.progress)) * 100 + '%';
  }
  function startAutoplay(c: Carousel) {
    if (reduced || c.raf) return;
    c.lastT = performance.now();
    const tick = (now: number) => {
      const dt = now - c.lastT; c.lastT = now;
      c.progress += dt / c.duration;
      if (c.progress >= 1) { goCarousel(c, c.active + 1); c.lastT = performance.now(); }
      else renderDotFill(c);
      c.raf = requestAnimationFrame(tick);
    };
    c.raf = requestAnimationFrame(tick);
  }
  function stopAutoplay(c: Carousel) { if (c.raf) { cancelAnimationFrame(c.raf); c.raf = 0; } }
  function restartAutoplay(c: Carousel) { stopAutoplay(c); c.progress = 0; renderDotFill(c); startAutoplay(c); }
  function repositionCarousels() { carousels.forEach((c) => positionCarousel(c)); }

  function onResize() { applyLayout(); resizeCanvas(); repositionCarousels(); if (!raf) raf = requestAnimationFrame(frame); }

  /* ---------- lifecycle ---------- */
  ctx = canvas.getContext('2d');
  resizeCanvas();
  // wire timeline tick buttons
  timeline.querySelectorAll<HTMLElement>('[data-tl-tick]').forEach((b) => b.addEventListener('click', onTick));
  startTypewriter();
  initReveals();
  applyLayout();
  initCarouselsWhenReady(0);
  if (!reduced) expTrack.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => { el.textContent = '0' + (el.dataset.suffix || ''); });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  expTrack.addEventListener('scroll', onExpScroll, { passive: true });
  drawCanvas();
  frame();

  return {
    destroy() {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      expTrack.removeEventListener('scroll', onExpScroll);
      timeline.querySelectorAll<HTMLElement>('[data-tl-tick]').forEach((b) => b.removeEventListener('click', onTick));
      carousels.forEach((c) => stopAutoplay(c));
      if (raf) cancelAnimationFrame(raf);
      if (cRaf) cancelAnimationFrame(cRaf);
      if (typeTimer) clearTimeout(typeTimer);
      document.body.style.overflow = '';
    },
    toggleMenu,
    closeMenu,
  };
}
