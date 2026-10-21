// Export the same head/hand geometry and continuous motions as a portable GLB.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from '../assets/vendor/three/three.module.js';
import { createAvatarModel } from '../assets/js/avatar-model.js';
import { sampleGreeting, DURATIONS } from '../assets/js/avatar-motion.js';

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const model = createAvatarModel(new THREE.Texture());
model.applyPose(sampleGreeting(0));
const gltf = {
  asset: { version: '2.0', generator: 'Abo avatar model builder' },
  scene: 0, scenes: [{ nodes: [0] }], nodes: [], meshes: [], materials: [],
  accessors: [], bufferViews: [], buffers: [], animations: [],
  textures: [{ source: 0, sampler: 0 }],
  samplers: [{ magFilter: 9729, minFilter: 9987, wrapS: 33071, wrapT: 33071 }],
  images: [], extensionsUsed: ['KHR_materials_unlit']
};
const chunks = [];
let byteLength = 0;
function append(bytes, target) {
  const padding = (4 - byteLength % 4) % 4;
  if (padding) { chunks.push(Buffer.alloc(padding)); byteLength += padding; }
  const view = { buffer: 0, byteOffset: byteLength, byteLength: bytes.length };
  if (target) view.target = target;
  gltf.bufferViews.push(view);
  chunks.push(bytes);
  byteLength += bytes.length;
  return gltf.bufferViews.length - 1;
}

function accessor(array, dimensions, target) {
  const componentType = array instanceof Float32Array ? 5126 : array instanceof Uint32Array ? 5125 : 5123;
  const count = array.length / dimensions;
  const min = Array(dimensions).fill(Infinity);
  const max = Array(dimensions).fill(-Infinity);
  for (let index = 0; index < array.length; index += 1) {
    min[index % dimensions] = Math.min(min[index % dimensions], array[index]);
    max[index % dimensions] = Math.max(max[index % dimensions], array[index]);
  }
  gltf.accessors.push({
    bufferView: append(Buffer.from(array.buffer, array.byteOffset, array.byteLength), target),
    componentType, count, type: ['SCALAR', 'VEC2', 'VEC3', 'VEC4'][dimensions - 1], min, max
  });
  return gltf.accessors.length - 1;
}

const materialIndices = new Map();
function materialIndex(material) {
  if (materialIndices.has(material.uuid)) return materialIndices.get(material.uuid);
  const result = {
    name: material.name || material.type,
    pbrMetallicRoughness: {
      baseColorFactor: [...material.color.toArray(), material.opacity],
      metallicFactor: material.metalness ?? 0, roughnessFactor: material.roughness ?? 1
    }
  };
  if (material.map) result.pbrMetallicRoughness.baseColorTexture = { index: 0 };
  if (material.alphaTest) { result.alphaMode = 'MASK'; result.alphaCutoff = material.alphaTest; }
  if (material.side === THREE.DoubleSide) result.doubleSided = true;
  if (material.isMeshBasicMaterial) result.extensions = { KHR_materials_unlit: {} };
  const index = gltf.materials.push(result) - 1;
  materialIndices.set(material.uuid, index);
  return index;
}

const geometries = new Map();
const meshes = new Map();
function meshIndex(mesh) {
  const key = mesh.geometry.uuid + mesh.material.uuid;
  if (meshes.has(key)) return meshes.get(key);
  let geometry = geometries.get(mesh.geometry.uuid);
  if (!geometry) {
    geometry = { attributes: {} };
    const names = { position: 'POSITION', normal: 'NORMAL', uv: 'TEXCOORD_0', color: 'COLOR_0' };
    for (const [name, attribute] of Object.entries(mesh.geometry.attributes)) {
      if (names[name]) geometry.attributes[names[name]] = accessor(attribute.array, attribute.itemSize, 34962);
    }
    if (mesh.geometry.index) geometry.indices = accessor(mesh.geometry.index.array, 1, 34963);
    geometries.set(mesh.geometry.uuid, geometry);
  }
  const index = gltf.meshes.push({ name: mesh.name, primitives: [{ ...geometry, material: materialIndex(mesh.material) }] }) - 1;
  meshes.set(key, index);
  return index;
}

const nodeIndices = new Map();
function addNode(object) {
  const index = gltf.nodes.length;
  nodeIndices.set(object, index);
  const node = { name: object.name, translation: object.position.toArray(), rotation: object.quaternion.toArray(), scale: object.scale.toArray() };
  gltf.nodes.push(node);
  if (object.isMesh) node.mesh = meshIndex(object);
  if (object.children.length) node.children = object.children.map(addNode);
  return index;
}
addNode(model.root);

const tracks = [
  [model.head, 'rotation', 'quaternion', 4], [model.head, 'translation', 'position', 3],
  [model.hand, 'rotation', 'quaternion', 4], [model.hand, 'translation', 'position', 3],
  [model.hand, 'scale', 'scale', 3],
  ...model.lids.map(object => [object, 'scale', 'scale', 3]),
  ...model.lids.map(object => [object, 'translation', 'position', 3]),
  ...model.creases.map(object => [object, 'scale', 'scale', 3]),
  ...model.fingers.map(object => [object, 'rotation', 'quaternion', 4])
];
for (const kind of ['intro', 'full']) {
  const frames = Math.round(DURATIONS[kind] * 30);
  const times = Float32Array.from({ length: frames + 1 }, (_, index) => index * DURATIONS[kind] / frames);
  const values = tracks.map(([, , , width]) => new Float32Array(times.length * width));
  for (let index = 0; index < times.length; index += 1) {
    model.applyPose(sampleGreeting(times[index], kind));
    tracks.forEach(([object, , property, width], track) => values[track].set(object[property].toArray(), index * width));
  }
  const input = accessor(times, 1);
  const animation = { name: kind === 'intro' ? 'NodAndBlink' : 'FullGreeting', channels: [], samplers: [] };
  tracks.forEach(([object, targetPath, , width], index) => {
    animation.samplers.push({ input, output: accessor(values[index], width), interpolation: 'LINEAR' });
    animation.channels.push({ sampler: index, target: { node: nodeIndices.get(object), path: targetPath } });
  });
  gltf.animations.push(animation);
}
gltf.images.push({ name: 'Original portrait', bufferView: append(fs.readFileSync(path.join(rootDirectory, 'assets/images/my-avatar.png'))), mimeType: 'image/png' });
const bin = Buffer.concat(chunks);
const binPadding = (4 - bin.length % 4) % 4;
const binary = Buffer.concat([bin, Buffer.alloc(binPadding)]);
gltf.buffers.push({ byteLength: binary.length });
const text = Buffer.from(JSON.stringify(gltf));
const json = Buffer.concat([text, Buffer.alloc((4 - text.length % 4) % 4, 0x20)]);
const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + 8 + json.length + 8 + binary.length, 8);
const jsonHeader = Buffer.alloc(8);
jsonHeader.writeUInt32LE(json.length, 0);
jsonHeader.writeUInt32LE(0x4e4f534a, 4);
const binHeader = Buffer.alloc(8);
binHeader.writeUInt32LE(binary.length, 0);
binHeader.writeUInt32LE(0x004e4942, 4);
const directory = path.join(rootDirectory, 'assets/models');
fs.mkdirSync(directory, { recursive: true });
const destination = path.join(directory, 'abo-avatar.glb');
fs.writeFileSync(destination, Buffer.concat([header, jsonHeader, json, binHeader, binary]));
console.log(`Exported ${gltf.nodes.length} nodes, ${gltf.meshes.length} meshes and ${gltf.animations.length} animation clips to ${destination}`);
