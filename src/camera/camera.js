// Camera access: start, switch front/back, stop, and grab a cropped frame.

let stream = null;
let currentFacing = 'user';

export const getStream = () => stream;

export async function startCamera(facing = 'user') {
  stopCamera();
  currentFacing = facing;
  // Ask for 4:3: phone sensors are 4:3, and 16:9 is a crop of it, so 4:3 gives the widest view.
  const base = { width: { ideal: 1280 }, height: { ideal: 960 }, frameRate: { ideal: 30 } };
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

/**
 * Draws a video frame into a w×h box at a zoom level.
 * zoom 1 = fills the box (edges cropped); zoom 0.5 = zoomed out, showing more of the frame.
 * Any empty space around the frame is filled with a soft blurred copy of it.
 */
export function drawZoomed(ctx, video, w, h, { zoom = 1, mirror = false } = {}) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const scale = Math.max(w / vw, h / vh) * zoom;
  const dw = vw * scale;
  const dh = vh * scale;
  ctx.save();
  if (mirror) {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }
  if (dw < w - 1 || dh < h - 1) {
    // Blur by shrinking a cover crop to a few pixels and stretching it back up (works in every browser).
    const tiny = document.createElement('canvas');
    tiny.width = 48;
    tiny.height = Math.max(1, Math.round((48 * h) / w));
    const c = coverCrop(vw, vh, tiny.width, tiny.height);
    tiny.getContext('2d').drawImage(video, c.sx, c.sy, c.sw, c.sh, 0, 0, tiny.width, tiny.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(tiny, 0, 0, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(video, (w - dw) / 2, (h - dh) / 2, dw, dh);
  ctx.restore();
}

// Grabs the current video frame as a 4:3 canvas (unfiltered), mirrored and zoomed as asked.
export function captureFrame(video, { width = 1200, mirror = false, zoom = 1 } = {}) {
  const height = Math.round((width * 3) / 4);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  drawZoomed(canvas.getContext('2d'), video, width, height, { zoom, mirror });
  return canvas;
}
