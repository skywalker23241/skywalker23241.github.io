import * as THREE from '../vendor/three/three.module.js';
import { createAvatarModel } from './avatar-model.js?v=wave2d-1';
import { bleedTransparentRGB } from './avatar-texture.js?v=edges-watch-1';
export { sampleGreeting, DURATIONS } from './avatar-motion.js?v=wave2d-1';

function portraitTexture(portrait) {
  const width = portrait.naturalWidth || portrait.width;
  const height = portrait.naturalHeight || portrait.height;
  if (!width || !height) throw new Error('Portrait is not decoded');
  let texture;
  try {
    const buffer = document.createElement('canvas');
    buffer.width = width; buffer.height = height;
    const context = buffer.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('2D canvas unavailable');
    context.drawImage(portrait, 0, 0);
    const rgba = context.getImageData(0, 0, width, height).data;
    const pixels = bleedTransparentRGB(rgba, width, height, Math.max(8, Math.ceil(width / 80)));
    texture = new THREE.DataTexture(pixels, width, height, THREE.RGBAFormat, THREE.UnsignedByteType);
    texture.flipY = true;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
  } catch (error) {
    // A canvas/privacy restriction must not remove the existing avatar.
    console.warn('Portrait edge preprocessing unavailable; using the original image.', error);
    texture = new THREE.Texture(portrait);
  }
  texture.colorSpace = THREE.SRGBColorSpace;
  // The material premultiplies once AFTER color conversion, not the source PNG.
  texture.premultiplyAlpha = false;
  texture.needsUpdate = true;
  return texture;
}

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

  let texture, model;
  try {
    texture = portraitTexture(portrait);
    model = createAvatarModel(texture);
    scene.add(model.root);
  } catch (error) {
    if (texture) texture.dispose();
    renderer.dispose();
    throw error;
  }
  let disposed = false;
  return {
    setSize(size) { if (!disposed) renderer.setSize(size, size, false); },
    render(pose) { if (!disposed) { model.applyPose(pose); renderer.render(scene, camera); } },
    dispose() {
      if (disposed) return;
      disposed = true;
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
