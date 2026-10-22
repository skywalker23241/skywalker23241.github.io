import * as THREE from '../vendor/three/three.module.js';
import { loadAvatarGLB } from './avatar-glb.js';
export { sampleGreeting, DURATIONS } from './avatar-motion.js?v=nod-only-1';

export async function createAvatarScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas, alpha: true, antialias: true, powerPreference: 'low-power'
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1.5, 1.5, 1.5, -1.5, .1, 12);
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight(0xfff4e8, 0x8e91aa, 1.9));
  const key = new THREE.DirectionalLight(0xfff6ec, 2.2);
  key.position.set(-3, 4, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xdce8ff, .75);
  fill.position.set(3, 1, 2);
  scene.add(fill);

  let avatar;
  try {
    avatar = await loadAvatarGLB(new URL('../models/3d-avatar-head.glb', import.meta.url));
    scene.add(avatar.pivot);
  } catch (error) {
    renderer.dispose();
    throw error;
  }
  let disposed = false;
  return {
    setSize(size) {
      if (!disposed) renderer.setSize(size, size, false);
    },
    render(pose) {
      if (disposed) return;
      avatar.pivot.rotation.set(pose.pitch || 0, pose.yaw || 0, 0, 'YXZ');
      avatar.pivot.position.set(0, pose.lift || 0, 0);
      renderer.render(scene, camera);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      avatar.dispose();
      renderer.dispose();
    }
  };
}
