/* Lazy-loaded nod-only 3D avatar; original portrait remains the fallback. */
(() => {
  'use strict';
  const box = document.querySelector('.avatar-box');
  if (!box) return;
  const button = box.querySelector('.avatar-button');
  const portrait = box.querySelector('img');
  const canvas = box.querySelector('canvas');
  const scriptURL = document.currentScript.src;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let scene = null;
  let library = null;
  let initialization = null;
  let playing = false;
  let animationId = 0;
  let token = 0;
  let visible = true;
  let contextLost = false;

  function neutral() { return library.sampleGreeting(0); }
  function resize() {
    if (!scene) return;
    const size = Math.round(button.getBoundingClientRect().width);
    if (size) { scene.setSize(size); scene.render(neutral()); }
  }

  async function initialize() {
    if (scene) return;
    if (initialization) return initialization;
    initialization = (async () => {
      if (!portrait.complete && portrait.decode) await portrait.decode();
      if (!portrait.naturalWidth) throw new Error('Portrait unavailable');
      library = await import(new URL('./avatar-scene.js?v=tripo-glb-1', scriptURL).href);
      scene = await library.createAvatarScene(canvas);
      resize();
      box.classList.add('is-animated');
    })().catch(error => {
      if (scene) scene.dispose();
      scene = null;
      initialization = null;
      box.classList.remove('is-animated');
      console.warn('3D avatar unavailable; keeping the original portrait.', error);
      throw error;
    });
    return initialization;
  }

  function stop(renderNeutral = true) {
    cancelAnimationFrame(animationId);
    animationId = 0;
    token += 1;
    playing = false;
    if (renderNeutral && scene && !contextLost) scene.render(neutral());
  }

  async function play(kind = 'full') {
    if (playing || motion.matches || document.hidden || !visible || contextLost) return;
    stop(false);
    const run = ++token;
    playing = true;
    try { await initialize(); } catch { playing = false; return; }
    if (run !== token) return;
    if (motion.matches || document.hidden || !visible) { stop(); return; }
    box.classList.add('is-animated');
    const start = performance.now();
    function tick(now) {
      if (run !== token) return;
      const seconds = (now - start) / 1000;
      if (seconds >= library.DURATIONS[kind]) { stop(); return; }
      scene.render(library.sampleGreeting(seconds, kind));
      animationId = requestAnimationFrame(tick);
    }
    animationId = requestAnimationFrame(tick);
  }

  button.addEventListener('click', () => play('intro'));
  motion.addEventListener('change', () => {
    stop();
    if (motion.matches) { initialize().then(() => scene?.render(neutral())).catch(() => {}); }
    else play('intro');
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    contextLost = true;
    stop(false);
    box.classList.remove('is-animated');
  });
  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    play('intro');
  });
  new ResizeObserver(resize).observe(button);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (!visible) stop();
    }).observe(button);
  }
  window.addEventListener('pagehide', event => { if (!event.persisted && scene) scene.dispose(); });

  function scheduleGreeting() {
    if (motion.matches) { initialize().catch(() => {}); return; }
    if ('requestIdleCallback' in window) window.requestIdleCallback(() => play('intro'), { timeout: 1200 });
    else window.setTimeout(() => play('intro'), 300);
  }
  if (portrait.complete && portrait.naturalWidth) scheduleGreeting();
  else portrait.addEventListener('load', scheduleGreeting, { once: true });
})();
