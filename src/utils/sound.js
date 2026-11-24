// Booth sounds made with the Web Audio API, so no audio files are needed.

import { state } from '../state.js';

let ctx;

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Call once from a tap so phones allow sound later.
export function unlockAudio() {
  audio();
}

export function beep(freq = 880, duration = 0.09) {
  if (!state.sound) return;
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, ac.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration + 0.02);
}

// A short mechanical "click-chk" shutter.
export function shutter() {
  if (!state.sound) return;
  const ac = audio();
  if (!ac) return;
  const make = (at, length, level) => {
    const frames = Math.floor(ac.sampleRate * length);
    const buffer = ac.createBuffer(1, frames, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / frames, 3);
    const src = ac.createBufferSource();
    src.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2400;
    const gain = ac.createGain();
    gain.gain.value = level;
    src.connect(filter).connect(gain).connect(ac.destination);
    src.start(ac.currentTime + at);
  };
  make(0, 0.05, 0.9);
  make(0.09, 0.08, 0.6);
}
