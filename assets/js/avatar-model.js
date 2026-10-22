import * as THREE from '../vendor/three/three.module.js';
import { HEAD_OUTLINE } from './avatar-outline.js';

// Image-based head geometry preserves the original portrait's facial identity.
// The back of the head, eyelids, wrist, palm and fingers are actual 3D meshes.
export function createAvatarModel(texture) {
  const root = new THREE.Group();
  root.name = 'AboAvatar';
  const head = new THREE.Group();
  head.name = 'Head';
  head.position.y = -.2;
  root.add(head);
  const features = new THREE.Group();
  features.name = 'FaceFeatures';
  features.position.y = .2;
  head.add(features);

  function surfaceDepth(x, y) {
    const dome = Math.sqrt(Math.max(0, 1 - (x / .93) ** 2 - ((y + .025) / 1.18) ** 2));
    const nose = .18 * Math.exp(-((x / .17) ** 2 + ((y + .4) / .23) ** 2));
    return .08 + .64 * dome + nose;
  }

  const faceGeometry = new THREE.PlaneGeometry(3, 3, 64, 64);
  const positions = faceGeometry.attributes.position;
  for (let index = 0; index < positions.count; index += 1) {
    positions.setZ(index, surfaceDepth(positions.getX(index), positions.getY(index)));
  }
  faceGeometry.computeVertexNormals();
  const faceMaterial = new THREE.MeshBasicMaterial({
    map: texture, transparent: true, alphaTest: .02,
    premultipliedAlpha: true, side: THREE.FrontSide, toneMapped: false
  });
  faceMaterial.name = 'OriginalPortrait';
  const face = new THREE.Mesh(faceGeometry, faceMaterial);
  face.name = 'TexturedFace';
  features.add(face);

  // Keep the back just inside the PNG outline, avoiding an exposed dark seam.
  // The image plane and its UVs remain exactly the same size and position.
  const backGeometry = new THREE.BufferGeometry();
  const backVertices = [];
  const backIndices = [];
  const colors = [];
  const skin = new THREE.Color('#dfae92');
  const hair = new THREE.Color('#211b19');
  const segments = 24;
  function outlineColor(x, y, fallback) {
    const image = texture.image;
    if (!image || !image.data || !image.width || !image.height) return fallback.clone();
    const px = THREE.MathUtils.clamp(Math.round((x / 3 + .5) * (image.width - 1)), 0, image.width - 1);
    const py = THREE.MathUtils.clamp(Math.round((.5 - y / 3) * (image.height - 1)), 0, image.height - 1);
    const at = (py * image.width + px) * 4;
    if (image.data[at + 3] < 80) return fallback.clone();
    return new THREE.Color().setRGB(image.data[at] / 255, image.data[at + 1] / 255,
      image.data[at + 2] / 255, THREE.SRGBColorSpace);
  }
  HEAD_OUTLINE.forEach(([y, left, right], row) => {
    const center = (left + right) / 2;
    const radius = Math.max(.001, (right - left) / 2 - .012);
    const depth = .59 * Math.sqrt(Math.max(0, Math.sin(Math.PI * row / (HEAD_OUTLINE.length - 1))));
    const fallback = skin.clone().lerp(hair, THREE.MathUtils.smoothstep(y, -.1, .3));
    const leftColor = outlineColor(Math.min(center, left + .026), y, fallback);
    const rightColor = outlineColor(Math.max(center, right - .026), y, fallback);
    for (let column = 0; column <= segments; column += 1) {
      const angle = Math.PI * column / segments;
      const x = center + radius * Math.cos(angle);
      const rightWeight = (x - left) / Math.max(.002, right - left);
      const edgeDepth = THREE.MathUtils.lerp(surfaceDepth(left, y), surfaceDepth(right, y), rightWeight);
      backVertices.push(x, y, edgeDepth - .012 - depth * Math.sin(angle));
      const color = leftColor.clone().lerp(rightColor, rightWeight);
      colors.push(color.r, color.g, color.b);
      if (row < HEAD_OUTLINE.length - 1 && column < segments) {
        const a = row * (segments + 1) + column;
        const d = a + segments + 1;
        backIndices.push(a, d, a + 1, a + 1, d, d + 1);
      }
    }
  });
  backGeometry.setAttribute('position', new THREE.Float32BufferAttribute(backVertices, 3));
  backGeometry.setIndex(backIndices);
  backGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  backGeometry.computeVertexNormals();
  const back = new THREE.Mesh(backGeometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .85 }));
  back.name = 'HeadVolume';
  features.add(back);

  const lidMaterial = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false, side: THREE.DoubleSide });
  const creaseMaterial = new THREE.MeshBasicMaterial({ color: '#54392b', toneMapped: false });
  const lids = [];
  const creases = [];
  for (const [index, x] of [-.293, .306].entries()) {
    const y = -.121;
    const z = surfaceDepth(x, y);
    const lidGeometry = new THREE.CircleGeometry(1, 48);
    const lidPositions = lidGeometry.attributes.position;
    const lidColors = [];
    const upperSkin = new THREE.Color(index === 0 ? '#cb9e86' : '#d2a78f');
    const lowerSkin = new THREE.Color(index === 0 ? '#e0b096' : '#dcad92');
    for (let vertex = 0; vertex < lidPositions.count; vertex += 1) {
      const dx = lidPositions.getX(vertex) * .16;
      const dy = lidPositions.getY(vertex) * .105;
      lidPositions.setXYZ(vertex, dx, dy, surfaceDepth(x + dx, y + dy) - z + .015);
      const color = upperSkin.clone().lerp(lowerSkin, THREE.MathUtils.clamp(.5 - dy / .21, 0, 1));
      lidColors.push(color.r, color.g, color.b);
    }
    lidGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lidColors, 3));
    lidGeometry.computeVertexNormals();
    const lid = new THREE.Mesh(lidGeometry, lidMaterial);
    lid.name = index === 0 ? 'RightEyelid' : 'LeftEyelid';
    lid.position.set(x, y, z);
    lid.userData.baseY = y;
    lid.scale.set(1, 0, 1);
    features.add(lid);
    lids.push(lid);
    const creasePoints = [[-.12, .008], [-.06, -.016], [.05, -.016], [.12, .008]]
      .map(([dx, dy]) => new THREE.Vector3(dx, dy, surfaceDepth(x + dx, y + dy) - z + .035));
    const creaseGeometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(creasePoints), 16, .006, 6, false);
    const crease = new THREE.Mesh(creaseGeometry, creaseMaterial);
    crease.name = `${lid.name}Crease`;
    crease.position.set(x, y, z);
    crease.scale.setScalar(0);
    features.add(crease);
    creases.push(crease);
  }


  function applyPose(pose) {
    head.rotation.set(pose.pitch, 0, 0, 'YXZ');
    head.position.y = -.2 + pose.lift;
    lids.forEach(lid => {
      lid.scale.y = pose.blink;
      lid.position.y = lid.userData.baseY + .1 * (1 - pose.blink);
      lid.visible = pose.blink > .001;
    });
    creases.forEach(crease => {
      const amount = THREE.MathUtils.smoothstep(pose.blink, .65, .95);
      crease.scale.setScalar(amount);
      crease.visible = amount > .001;
    });
  }

  return { root, head, lids, creases, applyPose };
}
