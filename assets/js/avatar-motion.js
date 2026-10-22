// Continuous, time-based motion shared by the website and exported model.
export const DURATIONS = Object.freeze({ intro: 1.7, full: 4.8 });

const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const x = clamp(value); return x * x * (3 - 2 * x); };

function pulse(time, start, end) {
  if (time <= start || time >= end) return 0;
  return Math.sin(Math.PI * (time - start) / (end - start)) ** 2;
}

function track(time, keys) {
  for (let index = 1; index < keys.length; index += 1) {
    if (time <= keys[index][0]) {
      const [start, from] = keys[index - 1];
      const [end, to] = keys[index];
      return from + (to - from) * smooth((time - start) / (end - start));
    }
  }
  return keys[keys.length - 1][1];
}

export function sampleGreeting(time, kind = 'full') {
  const full = kind === 'full';
  const duration = DURATIONS[full ? 'full' : 'intro'];
  const t = Math.max(0, Math.min(duration, time));
  const envelope = smooth(t / .3) * smooth((duration - t) / .35);
  const handLift = full ? track(t, [[0, 0], [2.1, 0], [2.7, 1], [4.05, 1], [4.65, 0], [4.8, 0]]) : 0;
  return {
    pitch: .145 * pulse(t, .2, 1.05) - .025 * pulse(t, 1.05, 1.5),
    yaw: 0,
    roll: 0,
    lift: .018 * envelope,
    blink: Math.max(pulse(t, .73, .95), full ? pulse(t, 2.24, 2.46) : 0, full ? pulse(t, 4.12, 4.34) : 0),
    handLift,
    wave: full ? .23 * Math.sin((t - 2.65) * Math.PI * 5) * pulse(t, 2.55, 4.2) : 0,
    fingerCurl: handLift * (.065 + .025 * Math.sin(t * 4))
  };
}
