import * as THREE from '../vendor/three/three.module.js';

// A small, softly tapered hand; the watch is a child of the wrist, not an overlay.
export function createGreetingHand() {
  const hand = new THREE.Group();
  hand.name = 'LeftHand';
  const skin = new THREE.MeshStandardMaterial({ color: '#e7b397', roughness: .76, metalness: 0 });
  const strapMaterial = new THREE.MeshStandardMaterial({ color: '#252b2d', roughness: .88, metalness: 0 });
  const caseMaterial = new THREE.MeshStandardMaterial({ color: '#63696b', roughness: .34, metalness: .55 });
  const dialMaterial = new THREE.MeshStandardMaterial({ color: '#12191c', roughness: .26, metalness: .12 });
  const markerMaterial = new THREE.MeshBasicMaterial({ color: '#d8e4d9', toneMapped: false });
  const sphere = new THREE.SphereGeometry(1, 28, 20);
  function mesh(name, parent, geometry, material, position, scale = [1, 1, 1]) {
    const object = new THREE.Mesh(geometry, material);
    object.name = name;
    object.position.set(...position);
    object.scale.set(...scale);
    parent.add(object);
    return object;
  }
  function soft(name, parent, position, scale, material = skin) {
    return mesh(name, parent, sphere, material, position, scale);
  }
  function line(name, parent, points, radius, material) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    return mesh(name, parent, new THREE.TubeGeometry(curve, 12, radius, 6, false), material, [0, 0, 0]);
  }

  soft('Wrist', hand, [0, -.158, 0], [.074, .144, .059]);
  soft('Palm', hand, [0, .069, 0], [.153, .201, .066]);
  soft('ThumbBase', hand, [-.108, .008, .01], [.058, .079, .052]);

  // Rounded fingertips with a gentle taper, rather than uniform thick sausages.
  const fingerGeometry = sphere.clone();
  const positions = fingerGeometry.attributes.position;
  for (let i = 0; i < positions.count; i += 1) {
    const taper = 1 - .12 * (positions.getY(i) + 1) / 2;
    positions.setXYZ(i, positions.getX(i) * taper, positions.getY(i), positions.getZ(i) * taper);
  }
  fingerGeometry.computeVertexNormals();
  const fingers = [];
  const lengths = [.24, .282, .26, .202];
  const radii = [.034, .035, .034, .031];
  const spread = [.11, .025, -.035, -.14];
  [-.108, -.035, .039, .108].forEach((x, index) => {
    const finger = new THREE.Group();
    finger.name = `LeftFinger${index + 1}`;
    finger.position.set(x, index === 3 ? .207 : .224, 0);
    finger.rotation.z = spread[index];
    hand.add(finger);
    mesh(`${finger.name}Tip`, finger, fingerGeometry, skin,
      [0, lengths[index] / 2 - .008, .002],
      [radii[index], lengths[index] / 2 + .025, radii[index] * .91]);
    fingers.push(finger);
  });
  const thumb = new THREE.Group();
  thumb.name = 'LeftThumb';
  thumb.position.set(-.124, .016, .008);
  thumb.rotation.z = .82;
  hand.add(thumb);
  soft('Thumb', thumb, [0, .085, .008], [.039, .122, .034]);

  const watch = new THREE.Group();
  watch.name = 'WristWatch';
  watch.position.set(0, -.165, 0);
  hand.add(watch);
  // Cylinder axis is Y: this is a real strap around the XZ wrist cross-section.
  mesh('WatchStrap', watch, new THREE.CylinderGeometry(1, 1, .065, 40, 1, true),
    strapMaterial, [0, 0, 0], [.08, 1, .064]);
  for (const y of [-.030, .030]) {
    const edge = mesh('WatchStrapEdge', watch, new THREE.TorusGeometry(1, .04, 6, 40),
      strapMaterial, [0, y, 0], [.079, .063, .079]);
    edge.rotation.x = Math.PI / 2;
  }
  const body = mesh('WatchCase', watch, new THREE.CylinderGeometry(.072, .074, .024, 40),
    caseMaterial, [0, 0, .071]);
  body.rotation.x = Math.PI / 2;
  mesh('WatchDial', watch, new THREE.CircleGeometry(.061, 40), dialMaterial, [0, 0, .084]);
  mesh('WatchBezel', watch, new THREE.TorusGeometry(.065, .004, 8, 40), caseMaterial, [0, 0, .084]);
  for (let i = 0; i < 4; i += 1) {
    const angle = i * Math.PI / 2;
    line('WatchHourMarker', watch, [
      [.049 * Math.sin(angle), .049 * Math.cos(angle), .087],
      [.055 * Math.sin(angle), .055 * Math.cos(angle), .087]
    ], .0018, markerMaterial);
  }
  line('WatchHourHand', watch, [[0, 0, .088], [-.024, .018, .088]], .0028, markerMaterial);
  line('WatchMinuteHand', watch, [[0, 0, .089], [.027, .035, .089]], .0022, markerMaterial);
  soft('WatchPin', watch, [0, 0, .091], [.004, .004, .002], markerMaterial);
  soft('WatchCrown', watch, [.077, 0, .07], [.008, .009, .008], caseMaterial);

  function applyPose(pose) {
    const lift = THREE.MathUtils.clamp(pose.handLift, 0, 1);
    hand.position.set(1.06, -1.82 + 1.54 * lift, .5);
    hand.rotation.set(-.08, -.16, -.08 + .9 * pose.wave);
    hand.scale.setScalar(.001 + .98 * THREE.MathUtils.smoothstep(lift, 0, .45));
    fingers.forEach((finger, index) => {
      finger.rotation.x = pose.fingerCurl * (.75 + index * .08);
    });
  }
  return { hand, fingers, applyPose };
}
