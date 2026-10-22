/* Lazy-loaded live 3D avatar, with the original portrait as its fallback. */
(() => {
  'use strict';
  const box = document.querySelector('.avatar-box');
  if (!box) return;
  const button = box.querySelector('.avatar-button');
  const portrait = box.querySelector('img');
  const canvas = box.querySelector('canvas');
  const waveHand = box.querySelector('.avatar-wave-hand');
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
  const gaze = { y: 0, targetY: 0 };

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
      library = await import(new URL('./avatar-scene.js?v=wave2d-1', scriptURL).href);
      scene = library.createAvatarScene(canvas, portrait);
      resize();
      if (!motion.matches) box.classList.add('is-animated');
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
    gaze.y = gaze.targetY = 0;
    box.classList.remove('is-waving');
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
    if (kind === 'full' && waveHand?.complete && waveHand.naturalWidth) {
      box.classList.remove('is-waving');
      void waveHand.offsetWidth;
      box.classList.add('is-waving');
    }
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

  function followPointer() {
    if (animationId || playing || !scene || motion.matches || document.hidden || !visible || contextLost) return;
    let previous = performance.now();
    function tick(now) {
      const blend = 1 - Math.exp(-Math.min(.05, (now - previous) / 1000) * 14);
      previous = now;
      gaze.y += (gaze.targetY - gaze.y) * blend;
      const pose = neutral();
      pose.yaw = 0;
      pose.pitch = gaze.y * .1;
      pose.roll = 0;
      scene.render(pose);
      if (Math.abs(gaze.targetY - gaze.y) > .001) {
        animationId = requestAnimationFrame(tick);
      } else animationId = 0;
    }
    animationId = requestAnimationFrame(tick);
  }

  button.addEventListener('click', () => play('full'));
  button.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || playing) return;
    const bounds = button.getBoundingClientRect();
    gaze.targetY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    followPointer();
  });
  button.addEventListener('pointerleave', () => {
    gaze.targetY = 0;
    followPointer();
  });
  motion.addEventListener('change', () => {
    stop();
    if (motion.matches) box.classList.remove('is-animated');
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
    if (motion.matches) return;
    if ('requestIdleCallback' in window) window.requestIdleCallback(() => play('intro'), { timeout: 1200 });
    else window.setTimeout(() => play('intro'), 300);
  }
  if (portrait.complete && portrait.naturalWidth) scheduleGreeting();
  else portrait.addEventListener('load', scheduleGreeting, { once: true });
})();
