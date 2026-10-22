// Minimal vertical nod animation. No waving, lateral head movement or blinking.
export const DURATIONS = Object.freeze({ intro: 1.6, full: 1.6 });
const clamp = value => Math.max(0, Math.min(1, value));
function pulse(time, start, end) {
  if (time <= start || time >= end) return 0;
  return Math.sin(Math.PI * (time - start) / (end - start)) ** 2;
}
export function sampleGreeting(time) {
  const t = clamp(time / DURATIONS.intro) * DURATIONS.intro;
  return {
    pitch: .14 * pulse(t, .18, 1.31),
    yaw: 0,
    roll: 0,
    lift: .012 * pulse(t, .18, 1.31),
    blink: 0,
    handLift: 0,
    wave: 0,
    fingerCurl: 0
  };
}
