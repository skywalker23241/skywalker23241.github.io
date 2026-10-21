import * as THREE from '../vendor/three/three.module.js';
import { createAvatarModel } from './avatar-model.js';
export { sampleGreeting, DURATIONS } from './avatar-motion.js';

export function createAvatarScene(canvas, portrait) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1.5, 1.5, 1.5, -1.5, .1, 12);
  camera.position.set(0, 0, 6);
  scene.add(new THREE.HemisphereLight(0xfff4e8, 0x8e91aa, 1.8));
  const key = new THREE.DirectionalLight(0xfff6ec, 2);
  key.position.set(-3, 4, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xdce8ff, .65);
  fill.position.set(3, 1, 2);
  scene.add(fill);

  const texture = new THREE.Texture(portrait);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  const model = createAvatarModel(texture);
  scene.add(model.root);

  return {
    setSize(size) { renderer.setSize(size, size, false); },
    render(pose) { model.applyPose(pose); renderer.render(scene, camera); },
    dispose() {
      const geometries = new Set();
      const materials = new Set();
      model.root.traverse(object => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) materials.add(object.material);
      });
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      texture.dispose();
      renderer.dispose();
    }
  };
}
