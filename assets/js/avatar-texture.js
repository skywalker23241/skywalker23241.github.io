// Extend hidden RGB only. Never pad, resize, blur or change portrait alpha.
export function bleedTransparentRGB(input, width, height, radius = 12) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || input.length !== width * height * 4) {
    throw new TypeError('Expected width * height RGBA pixels');
  }
  const pixels = new Uint8Array(input);
  const distance = new Uint8Array(width * height).fill(255);
  const queue = new Int32Array(width * height);
  const limit = Math.max(0, Math.min(32, Math.floor(radius)));
  let tail = 0;
  for (let p = 0; p < distance.length; p += 1) {
    if (pixels[p * 4 + 3] !== 0) { distance[p] = 0; queue[tail++] = p; }
  }
  function visit(from, to) {
    if (distance[to] !== 255) return;
    distance[to] = distance[from] + 1;
    const a = from * 4, b = to * 4;
    pixels[b] = pixels[a]; pixels[b + 1] = pixels[a + 1]; pixels[b + 2] = pixels[a + 2];
    // Keep pixels[b + 3] exactly as supplied, including fully transparent pixels.
    queue[tail++] = to;
  }
  for (let head = 0; head < tail; head += 1) {
    const p = queue[head];
    if (distance[p] >= limit) continue;
    const x = p % width;
    if (x > 0) visit(p, p - 1);
    if (x + 1 < width) visit(p, p + 1);
    if (p >= width) visit(p, p - width);
    if (p + width < distance.length) visit(p, p + width);
  }
  return pixels;
}
