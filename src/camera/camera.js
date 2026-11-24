// Camera access: start, switch front/back, real 0.5x zoom, stop, and grab a cropped frame.

let stream = null;
let currentFacing = 'user';
let zoomSupport = { type: 'none' };

export const getStream = () => stream;

export async function startCamera(facing = 'user', { deviceId } = {}) {
  stopCamera();
  currentFacing = facing;
  // Ask for 4:3: phone sensors are 4:3, and 16:9 is a crop of it, so 4:3 gives the widest view.
  // `zoom: true` asks Chrome to expose the camera's real zoom range (some phones go below 1x).
  const base = { width: { ideal: 1280 }, height: { ideal: 960 }, frameRate: { ideal: 30 }, zoom: true };
  const which = deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: facing } };
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { ...base, ...which }, audio: false });
  } catch (err) {
    // Some laptops reject facingMode or zoom; retry with any camera.
    if (err.name === 'OverconstrainedError' || err.name === 'TypeError') {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: base.width, height: base.height },
        audio: false,
      });
    } else {
      throw err;
    }
  }
  zoomSupport = await detectZoom();
  return stream;
}

// ---------- Real 0.5x ----------
// A phone's 0.5x is a different (ultra-wide) lens or a zoom range below 1x. The browser can only
// use it when the phone exposes it, so we look for both and hide 0.5x if neither exists.

const track = () => stream?.getVideoTracks()[0];

async function detectZoom() {
  const t = track();
  const caps = t?.getCapabilities?.() ?? {};
  // 1) Hardware zoom that goes below 1x (some Android phones' back cameras).
  if (caps.zoom && caps.zoom.min < 1) {
    return { type: 'hardware', min: caps.zoom.min, max: caps.zoom.max };
  }
  // 2) A separate ultra-wide lens with the same facing (iPhone Safari lists "Back Ultra Wide Camera").
  try {
    const current = t?.getSettings?.().deviceId;
    const devices = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput');
    const isBack = (label) => /back|rear|environment/i.test(label);
    const sameSide = (d) => (currentFacing === 'user' ? !isBack(d.label) : isBack(d.label));
    const wide = devices.find((d) => /ultra\s*wide/i.test(d.label) && sameSide(d));
    if (wide) {
      const normal =
        wide.deviceId === current
          ? zoomSupport.normalId // we're already on the wide lens: keep the 1x lens we came from
          : current;
      return { type: 'lens', wideId: wide.deviceId, normalId: normal, onWide: wide.deviceId === current };
    }
  } catch {
    /* labels unavailable */
  }
  return { type: 'none' };
}

export const getZoomSupport = () => zoomSupport;
export const hasWideZoom = () => zoomSupport.type !== 'none';

// The zoom the camera is at right now (1 or 0.5).
export function currentZoom() {
  if (zoomSupport.type === 'hardware') return (track()?.getSettings?.().zoom ?? 1) < 1 ? 0.5 : 1;
  if (zoomSupport.type === 'lens') return zoomSupport.onWide ? 0.5 : 1;
  return 1;
}

/**
 * Sets 1x or 0.5x. Hardware zoom changes the same stream (safe while recording);
 * a lens switch restarts the camera and returns the new stream.
 * @returns {Promise<MediaStream|null>} new stream if the camera was restarted
 */
export async function setZoom(zoom) {
  const s = zoomSupport;
  if (s.type === 'hardware') {
    const value = zoom < 1 ? Math.max(s.min, 0.5) : Math.min(Math.max(1, s.min), s.max);
    await track().applyConstraints({ advanced: [{ zoom: value }] });
    return null;
  }
  if (s.type === 'lens') {
    const wantWide = zoom < 1;
    if (wantWide === s.onWide) return null;
    const id = wantWide ? s.wideId : s.normalId;
    const facing = currentFacing;
    await startCamera(facing, id ? { deviceId: id } : {});
    return stream;
  }
  return null;
}

// ---------- Flash ----------
// The phone's flashlight ("torch"), which Chrome on Android can control on the back camera.
export const hasTorch = () => !!track()?.getCapabilities?.().torch;

export async function setTorch(on) {
  if (!hasTorch()) return false;
  // applyConstraints replaces earlier ones, so keep the current hardware zoom alongside the torch.
  const keep = zoomSupport.type === 'hardware' ? { zoom: track().getSettings?.().zoom ?? 1 } : {};
  try {
    await track().applyConstraints({ advanced: [{ torch: on, ...keep }] });
    return true;
  } catch {
    return false;
  }
}

export function stopCamera() {
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
}

export async function countCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === 'videoinput').length;
  } catch {
    return 1;
  }
}

export const isFrontCamera = () => currentFacing === 'user';

// Friendly text for camera errors.
export function cameraErrorMessage(err) {
  switch (err?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Camera access was blocked. Allow the camera in your browser settings (the 🔒 or ⓘ icon next to the address), then try again.';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return "We couldn't find a camera on this device.";
    case 'NotReadableError':
    case 'TrackStartError':
      return 'Your camera is being used by another app. Close it (Zoom, Teams, FaceTime…) and try again.';
    default:
      return "The camera couldn't start. Try reloading the page, or open it in Safari or Chrome.";
  }
}

// Works out the centre crop that makes a `sw × sh` source fill a `tw × th` box (like object-fit: cover).
export function coverCrop(sw, sh, tw, th) {
  const scale = Math.max(tw / sw, th / sh);
  const w = tw / scale;
  const h = th / scale;
  return { sx: (sw - w) / 2, sy: (sh - h) / 2, sw: w, sh: h };
}

// Grabs the current video frame as a 4:3 canvas (unfiltered), mirrored if asked.
// Zoom is done by the camera itself (see setZoom), so the photo always shows what the camera sees.
export function captureFrame(video, { width = 1200, mirror = false } = {}) {
  const height = Math.round((width * 3) / 4);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const c = coverCrop(video.videoWidth, video.videoHeight, width, height);
  if (mirror) {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, c.sx, c.sy, c.sw, c.sh, 0, 0, width, height);
  return canvas;
}
