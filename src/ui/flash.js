// Flash for photos.
// - Back camera with a controllable flashlight: turns the real torch on for the shot.
// - Front camera / laptop: "screen flash", the whole screen goes bright warm white to light your face.

import { hasTorch, setTorch, isFrontCamera } from '../camera/camera.js';
import { wait, icons } from '../utils/dom.js';

const TORCH_WARMUP = 450; // ms for the camera to adjust to the light
const SCREEN_WARMUP = 400;

let overlay;
function screenOverlay() {
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'screen-flash';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.append(overlay);
  }
  return overlay;
}

/** 'torch' | 'screen' | 'none' (back camera without a controllable flashlight) */
export function flashKind() {
  if (isFrontCamera()) return 'screen';
  return hasTorch() ? 'torch' : 'none';
}

/** Turns the light on, gives the camera a moment to adjust, runs `take`, then turns the light off. */
export async function withFlash(take) {
  const kind = flashKind();
  if (kind === 'torch') {
    await setTorch(true);
    await wait(TORCH_WARMUP);
    try {
      return take();
    } finally {
      setTorch(false);
    }
  }
  if (kind === 'screen') {
    const el = screenOverlay();
    el.classList.add('is-on');
    await wait(SCREEN_WARMUP);
    try {
      return take();
    } finally {
      setTimeout(() => el.classList.remove('is-on'), 120);
    }
  }
  return take();
}

export function turnFlashOff() {
  overlay?.classList.remove('is-on');
  setTorch(false);
}

// Updates the flash button in a booth window.
export function renderFlashButton(root, on) {
  const btn = root.querySelector('.flash-toggle');
  if (!btn) return;
  const kind = flashKind();
  btn.hidden = kind === 'none';
  btn.innerHTML = on ? icons.flashOn : icons.flashOff;
  btn.setAttribute('aria-pressed', String(on));
  btn.setAttribute('aria-label', on ? 'Flash on' : 'Flash off');
  btn.title = on ? (kind === 'torch' ? 'Flash on (flashlight)' : 'Flash on (screen lights up)') : 'Flash off';
}
