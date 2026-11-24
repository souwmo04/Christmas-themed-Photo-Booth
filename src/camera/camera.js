// Camera access: start, switch front/back, stop, and grab a cropped frame.

let stream = null;
let currentFacing = 'user';

export const getStream = () => stream;

export async function startCamera(facing = 'user') {
  stopCamera();
  currentFacing = facing;
  const base = { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } };
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { ...base, facingMode: { ideal: facing } },
      audio: false,
    });
  } catch (err) {
    // Some laptops reject facingMode; retry with any camera.
    if (err.name === 'OverconstrainedError') {
      stream = await navigator.mediaDevices.getUserMedia({ video: base, audio: false });
    } else {
      throw err;
    }
  }
  return stream;
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
