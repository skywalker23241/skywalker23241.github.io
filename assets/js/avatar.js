/* Lazy-loaded 3D avatar with a gentle nod and smooth cursor tracking. */
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
  let followFrameId = 0;
  let lastFollowFrame = 0;
  // In radians: about 8 degrees horizontally and 5 degrees vertically.
  const gaze = { yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0 };

  function neutral() { return library.sampleGreeting(0); }

  function drawIdle() {
    if (!scene || contextLost) return;
    const pose = neutral();
    pose.yaw = gaze.yaw;
    pose.pitch += gaze.pitch;
    scene.render(pose);
  }

  function followFrame(now) {
    followFrameId = 0;
    if (!scene || playing || motion.matches || document.hidden || !visible || contextLost) return;
    const elapsed = lastFollowFrame ? Math.min(0.05, (now - lastFollowFrame) / 1000) : 1 / 60;
    lastFollowFrame = now;
    const smooth = 1 - Math.exp(-10 * elapsed);
    gaze.yaw += (gaze.targetYaw - gaze.yaw) * smooth;
    gaze.pitch += (gaze.targetPitch - gaze.pitch) * smooth;
    drawIdle();
    if (Math.abs(gaze.targetYaw - gaze.yaw) + Math.abs(gaze.targetPitch - gaze.pitch) > 0.0006) {
      followFrameId = requestAnimationFrame(followFrame);
    }
  }

  function scheduleFollow() {
    if (followFrameId || !scene || playing || motion.matches || document.hidden || !visible || contextLost) return;
    lastFollowFrame = 0;
    followFrameId = requestAnimationFrame(followFrame);
  }

  function resetPointer() {
    gaze.targetYaw = gaze.targetPitch = 0;
    scheduleFollow();
  }
  function resize() {
    if (!scene) return;
    const size = Math.round(button.getBoundingClientRect().width);
    if (size) { scene.setSize(size); drawIdle(); }
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
    cancelAnimationFrame(followFrameId);
    animationId = 0;
    followFrameId = 0;
    lastFollowFrame = 0;
    token += 1;
    playing = false;
    if (!renderNeutral) {
      // The nod remains straight ahead; mouse tracking eases back afterward.
      gaze.yaw = gaze.pitch = 0;
    } else if (scene && !contextLost) {
      drawIdle();
      scheduleFollow();
    }
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

  // Follow a desktop pointer across the page, not only inside the avatar tile.
  // Render only while easing toward a new target; do not run a permanent loop.
  window.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || motion.matches || document.hidden || !visible) return;
    const rect = button.getBoundingClientRect();
    if (!rect.width) return;
    const x = (event.clientX - rect.left - rect.width / 2) / Math.max(window.innerWidth * .42, 280);
    const y = (event.clientY - rect.top - rect.height / 2) / Math.max(window.innerHeight * .5, 260);
    gaze.targetYaw = Math.max(-.14, Math.min(.14, x * .14));
    gaze.targetPitch = Math.max(-.085, Math.min(.085, y * .085));
    scheduleFollow();
  }, { passive: true });
  window.addEventListener('pointerout', event => {
    if (!event.relatedTarget) resetPointer();
  });
  window.addEventListener('blur', resetPointer);

  button.addEventListener('click', () => play('intro'));
  motion.addEventListener('change', () => {
    stop();
    if (motion.matches) {
      gaze.yaw = gaze.pitch = gaze.targetYaw = gaze.targetPitch = 0;
      initialize().then(() => drawIdle()).catch(() => {});
    } else {
      play('intro');
    }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { resetPointer(); stop(); } });
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
      if (!visible) { resetPointer(); stop(); } else scheduleFollow();
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
