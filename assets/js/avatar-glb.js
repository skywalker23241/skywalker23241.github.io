import * as THREE from '../vendor/three/three.module.js';

// Small GLB 2.0 loader for the one-mesh Tripo head.
// No CDN/import-map dependency; supports embedded images, vertex normals,
// texture coordinates, metallic/roughness maps, and standard uncompressed indices.
export async function loadAvatarGLB(url) {
  const response = await fetch(url, { cache: 'force-cache' });
  if (!response.ok) throw new Error('3D model unavailable (HTTP ' + response.status + ')');
  const bytes = await response.arrayBuffer();
  const view = new DataView(bytes);
  if (view.byteLength < 20 ||
      view.getUint32(0, true) !== 0x46546c67 ||
      view.getUint32(4, true) !== 2 ||
      view.getUint32(8, true) > view.byteLength) {
    throw new Error('Invalid GLB 2.0 file');
  }
  let gltf = null;
  let binaryOffset = -1;
  for (let offset = 12; offset + 8 <= view.byteLength;) {
    const length = view.getUint32(offset, true);
    const type = view.getUint32(offset + 4, true);
    const start = offset + 8;
    if (start + length > view.byteLength) throw new Error('Truncated GLB chunk');
    if (type === 0x4e4f534a) {
      gltf = JSON.parse(new TextDecoder().decode(new Uint8Array(bytes, start, length)));
    } else if (type === 0x004e4942) {
      binaryOffset = start;
    }
    offset = start + length;
  }
  if (!gltf || binaryOffset < 0 || !gltf.meshes?.length) {
    throw new Error('GLB has no loadable mesh');
  }

  const components = { 5121: Uint8Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
  const widths = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
  function accessor(index) {
    const spec = gltf.accessors[index];
    const section = gltf.bufferViews[spec.bufferView];
    if (!spec || !section || section.byteStride) throw new Error('Unsupported GLB accessor');
    const Type = components[spec.componentType];
    const count = widths[spec.type];
    if (!Type || !count || spec.sparse) throw new Error('Unsupported GLB component type');
    const start = binaryOffset + (section.byteOffset || 0) + (spec.byteOffset || 0);
    const length = spec.count * count * Type.BYTES_PER_ELEMENT;
    if (start < 0 || start + length > bytes.byteLength) throw new Error('Invalid GLB buffer range');
    return { data: new Type(bytes.slice(start, start + length)), count, normalized: !!spec.normalized };
  }

  const textures = [];
  const geometry = new THREE.BufferGeometry();
  try {
    const primitive = gltf.meshes[0].primitives?.[0];
    if (!primitive || primitive.mode && primitive.mode !== 4) {
      throw new Error('Only triangle-mesh GLB files are supported');
    }
    for (const [semantic, attributeName] of [
      ['POSITION', 'position'], ['NORMAL', 'normal'], ['TEXCOORD_0', 'uv']
    ]) {
      if (primitive.attributes[semantic] === undefined) continue;
      const a = accessor(primitive.attributes[semantic]);
      geometry.setAttribute(attributeName, new THREE.BufferAttribute(a.data, a.count, a.normalized));
    }
    if (!geometry.getAttribute('position')) throw new Error('No vertices in 3D model');
    if (primitive.indices !== undefined) {
      const a = accessor(primitive.indices);
      geometry.setIndex(new THREE.BufferAttribute(a.data, 1));
    }
    if (!geometry.getAttribute('normal')) geometry.computeVertexNormals();

    async function imageTexture(textureIndex, isColor = false) {
      if (textureIndex === undefined) return null;
      const textureSpec = gltf.textures[textureIndex];
      const image = gltf.images[textureSpec.source];
      const section = gltf.bufferViews[image.bufferView];
      if (!section) throw new Error('External GLB image references are unsupported');
      const start = binaryOffset + (section.byteOffset || 0);
      if (start + section.byteLength > bytes.byteLength) throw new Error('GLB image out of range');
      const blob = new Blob(
        [new Uint8Array(bytes, start, section.byteLength)],
        { type: image.mimeType || 'image/png' }
      );
      const objectURL = URL.createObjectURL(blob);
      let texture;
      try {
        texture = await new THREE.TextureLoader().loadAsync(objectURL);
      } finally {
        URL.revokeObjectURL(objectURL);
      }
      // The uploaded model has 4K maps. The avatar renders at <=150px;
      // downsampling on upload to the GPU avoids excessive texture memory.
      const imageSource = texture.image;
      if (imageSource?.width > 1024 || imageSource?.height > 1024) {
        const scale = Math.min(1024 / imageSource.width, 1024 / imageSource.height);
        const resized = document.createElement('canvas');
        resized.width = Math.max(1, Math.round(imageSource.width * scale));
        resized.height = Math.max(1, Math.round(imageSource.height * scale));
        resized.getContext('2d').drawImage(imageSource, 0, 0, resized.width, resized.height);
        texture.image = resized;
      }
      texture.flipY = false; // glTF UV origin differs from HTML image textures.
      texture.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      texture.anisotropy = 2;
      texture.needsUpdate = true;
      textures.push(texture);
      return texture;
    }

    const materialSpec = gltf.materials?.[primitive.material || 0] || {};
    const pbr = materialSpec.pbrMetallicRoughness || {};
    const baseMap = await imageTexture(pbr.baseColorTexture?.index, true);
    const packedMap = await imageTexture(pbr.metallicRoughnessTexture?.index);
    const normalMap = await imageTexture(materialSpec.normalTexture?.index);
    const mat = new THREE.MeshStandardMaterial({
      color: pbr.baseColorFactor ? new THREE.Color().setRGB(...pbr.baseColorFactor.slice(0, 3)) : 0xffffff,
      map: baseMap,
      metalness: pbr.metallicFactor ?? 1,
      roughness: pbr.roughnessFactor ?? 1,
      metalnessMap: packedMap,
      roughnessMap: packedMap,
      normalMap,
      side: materialSpec.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
    });
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.name = 'Uploaded3DAvatarHead';
    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox;
    const center = bounds.getCenter(new THREE.Vector3());
    const extents = bounds.getSize(new THREE.Vector3());
    mesh.position.sub(center);
    const pivot = new THREE.Group();
    pivot.name = 'AnimatedHeadPivot';
    pivot.add(mesh);
    pivot.scale.setScalar(2.46 / Math.max(extents.x, extents.y, extents.z));
    return {
      pivot,
      dispose() {
        geometry.dispose();
        mat.dispose();
        textures.forEach(t => t.dispose());
      }
    };
  } catch (error) {
    geometry.dispose();
    textures.forEach(t => t.dispose());
    throw error;
  }
}
