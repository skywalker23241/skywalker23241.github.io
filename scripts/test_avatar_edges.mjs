import test from 'node:test';
import assert from 'node:assert/strict';
import { bleedTransparentRGB } from '../assets/js/avatar-texture.js';

const rgba = (...pixels) => Uint8Array.from(pixels.flat());
test('input, dimensions and every alpha value are preserved', () => {
  const source = rgba([0, 0, 0, 0], [210, 140, 90, 64], [80, 50, 40, 255], [0, 0, 0, 0]);
  const before = source.slice();
  const output = bleedTransparentRGB(source, 2, 2);
  assert.deepEqual(source, before);
  assert.equal(output.length, source.length);
  for (let i = 3; i < source.length; i += 4) assert.equal(output[i], source[i]);
});
test('visible RGB, including translucent edge colors, is untouched', () => {
  const source = rgba([10, 20, 30, 1], [40, 50, 60, 90], [70, 80, 90, 255]);
  assert.deepEqual(bleedTransparentRGB(source, 3, 1), source);
});
test('hidden RGB inherits nearby edge color without making pixels opaque', () => {
  const output = bleedTransparentRGB(rgba([220, 170, 140, 255], [0, 0, 0, 0], [0, 0, 0, 0]), 3, 1);
  assert.deepEqual([...output], [220, 170, 140, 255, 220, 170, 140, 0, 220, 170, 140, 0]);
});
test('bleed radius is bounded', () => {
  const output = bleedTransparentRGB(rgba([220, 170, 140, 255], [0, 0, 0, 0], [0, 0, 0, 0]), 3, 1, 1);
  assert.deepEqual([...output.slice(8)], [0, 0, 0, 0]);
});
test('neighbors do not wrap to the next row', () => {
  const source = new Uint8Array(3 * 2 * 4);
  source.set([255, 40, 30, 255], 2 * 4);
  const output = bleedTransparentRGB(source, 3, 2, 1);
  assert.deepEqual([...output.slice(3 * 4, 4 * 4)], [0, 0, 0, 0]);
});
test('an empty transparent image stays empty', () => {
  const source = new Uint8Array(5 * 5 * 4);
  assert.deepEqual(bleedTransparentRGB(source, 5, 5), source);
});
test('radius zero leaves all pixels untouched', () => {
  const source = rgba([20, 30, 40, 255], [0, 0, 0, 0]);
  assert.deepEqual(bleedTransparentRGB(source, 2, 1, 0), source);
});
test('invalid dimensions are rejected', () => {
  assert.throws(() => bleedTransparentRGB(new Uint8Array(4), 2, 1), TypeError);
  assert.throws(() => bleedTransparentRGB(new Uint8Array(0), 0, 0), TypeError);
});
