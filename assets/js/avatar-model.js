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
  const faceMaterial = new THREE.MeshBasicMaterial({ map: texture, alphaTest: .2, side: THREE.DoubleSide, toneMapped: false });
  faceMaterial.name = 'OriginalPortrait';
  const face = new THREE.Mesh(faceGeometry, faceMaterial);
  face.name = 'TexturedFace';
  features.add(face);

  // Join the back volume to the actual hair, ear and jaw silhouette, rather
  // than placing an unrelated ellipsoid behind the face.
  const backGeometry = new THREE.BufferGeometry();
  const backVertices = [];
  const backIndices = [];
  const colors = [];
  const skin = new THREE.Color('#dfae92');
  const hair = new THREE.Color('#211b19');
  const segments = 24;
  HEAD_OUTLINE.forEach(([y, left, right], row) => {
    const center = (left + right) / 2;
    const radius = Math.max(.001, (right - left) / 2);
    const depth = .59 * Math.sqrt(Math.max(0, Math.sin(Math.PI * row / (HEAD_OUTLINE.length - 1))));
    const color = skin.clone().lerp(hair, THREE.MathUtils.smoothstep(y, -.1, .3));
    for (let column = 0; column <= segments; column += 1) {
      const angle = Math.PI * column / segments;
      const x = center + radius * Math.cos(angle);
      const rightWeight = (x - left) / Math.max(.002, right - left);
      const edgeDepth = THREE.MathUtils.lerp(surfaceDepth(left, y), surfaceDepth(right, y), rightWeight);
      backVertices.push(x, y, edgeDepth - depth * Math.sin(angle));
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

  const hand = new THREE.Group();
  hand.name = 'LeftHand';
  root.add(hand);
  const handMaterial = new THREE.MeshStandardMaterial({ color: '#e7b397', roughness: .65, metalness: 0 });
  const handSphere = new THREE.SphereGeometry(1, 20, 14);
  function ellipsoid(name, parent, position, scale) {
    const mesh = new THREE.Mesh(handSphere, handMaterial);
    mesh.name = name;
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    parent.add(mesh);
    return mesh;
  }
  ellipsoid('Wrist', hand, [0, -.13, 0], [.09, .145, .065]);
  ellipsoid('Palm', hand, [0, .09, 0], [.165, .23, .075]);
  const fingers = [];
  const fingerLengths = [.25, .3, .275, .215];
  [-.112, -.037, .043, .115].forEach((x, index) => {
    const finger = new THREE.Group();
    finger.name = `LeftFinger${index + 1}`;
    finger.position.set(x, .245, 0);
    finger.rotation.z = (.5 - index / 3) * .2;
    hand.add(finger);
    const length = fingerLengths[index];
    ellipsoid(`${finger.name}Tip`, finger, [0, length / 2, 0], [.038, length / 2 + .025, .036]);
    fingers.push(finger);
  });
  const thumb = new THREE.Group();
  thumb.name = 'LeftThumb';
  thumb.position.set(-.125, .02, .01);
  thumb.rotation.z = .8;
  hand.add(thumb);
  ellipsoid('Thumb', thumb, [0, .095, .012], [.043, .145, .04]);

  function applyPose(pose) {
    head.rotation.set(pose.pitch, pose.yaw, pose.roll, 'YXZ');
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
    hand.position.set(1.1, -1.9 + 1.57 * pose.handLift, .48);
    hand.rotation.set(-.12, -.13, -.1 + pose.wave);
    hand.scale.setScalar(.001 + 1.1 * THREE.MathUtils.smoothstep(pose.handLift, 0, .45));
    fingers.forEach((finger, index) => { finger.rotation.x = pose.fingerCurl * (1 + index * .12); });
  }

  return { root, head, hand, lids, creases, fingers, applyPose };
}
