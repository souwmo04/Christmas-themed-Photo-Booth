// Builds the "viral edit": the session recording plays (with the filter) and each photo
// drops onto it at the moment it was taken. It ends on the finished strip(s).

import { drawFiltered, filteredCopy, supportsCanvasFilter } from './filters.js';
import { coverCrop } from '../camera/camera.js';
import { pickVideoMime } from '../utils/device.js';

const W = 720;
const H = 1280;
const FPS = 30;
const OUTRO = 3; // seconds showing the strip at the end
const DROP = 0.35; // seconds for a photo to land

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const easeOut = (p) => 1 - Math.pow(1 - p, 3);

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCard(ctx, photo, i, age) {
  const p = easeOut(clamp01(age / DROP));
  const border = 14;
  const cardW = W * 0.8;
  const innerW = cardW - border * 2;
  const innerH = innerW * 0.75;
  const cardH = innerH + border + 46;
  const dir = i % 2 ? 1 : -1;
  const cx = W / 2 + dir * 16;
  const cy = H * 0.42 + ((i % 3) - 1) * 14;
  const rot = ((dir * 2.5 + ((i % 3) - 1)) * Math.PI) / 180;
  const scale = 1.3 - 0.3 * p;

  ctx.save();
  ctx.globalAlpha = p;
  ctx.translate(cx, cy);
  ctx.rotate(rot * p);
  ctx.scale(scale, scale);
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = '#fffdf8';
  roundRect(ctx, -cardW / 2, -cardH / 2, cardW, cardH, 6);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.drawImage(photo, -cardW / 2 + border, -cardH / 2 + border, innerW, innerH);
  ctx.restore();
}

/**
 * @param {object} o
 * @param {{blob: Blob, duration: number}} o.raw recording from the shoot
 * @param {HTMLCanvasElement[]} o.shots raw photos
 * @param {number[]} o.times seconds into the recording each photo was taken
 * @param {string} o.filter filter id
 * @param {boolean} o.mirror mirror the recording to match the photos
 * @param {HTMLCanvasElement} o.strip combined strip image for the ending
 * @param {HTMLCanvasElement} [o.canvas] canvas to draw on (shown as a live preview)
 * @param {(p:number)=>void} [o.onProgress]
 * @param {AbortSignal} [o.signal]
 * @returns {Promise<{blob: Blob, mimeType: string}>}
 */
export async function renderOverlayVideo(o) {
  const canvas = o.canvas ?? document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Hidden player for the raw recording (must be in the page for iPhone to play it).
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;opacity:0.01;pointer-events:none';
  const srcUrl = URL.createObjectURL(o.raw.blob);
  video.src = srcUrl;
  document.body.append(video);

  const cleanup = () => {
    video.pause();
    video.remove();
    URL.revokeObjectURL(srcUrl);
  };

  try {
    await new Promise((resolve, reject) => {
      video.addEventListener('loadeddata', resolve, { once: true });
      video.addEventListener('error', () => reject(new Error('Could not read the recording')), { once: true });
    });
  } catch (err) {
    cleanup();
    throw err;
  }

  const photos = o.shots.map((s) => filteredCopy(s, o.filter));
  const total = o.raw.duration + OUTRO;

  // Without canvas filters (older Safari) filter a half-size frame, then scale up: much faster.
  const scratch = supportsCanvasFilter ? null : document.createElement('canvas');
  if (scratch) {
    scratch.width = W / 2;
    scratch.height = H / 2;
  }

  const stream = canvas.captureStream(FPS);
  const mimeType = pickVideoMime();
  const recorder = new MediaRecorder(stream, {
    ...(mimeType ? { mimeType } : {}),
    videoBitsPerSecond: 5_000_000,
  });
  const chunks = [];
  recorder.ondataavailable = (e) => e.data?.size && chunks.push(e.data);
  const stopped = new Promise((r) => (recorder.onstop = r));

  function drawFrame() {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;
    const target = scratch ? scratch.getContext('2d') : ctx;
    const tw = scratch ? scratch.width : W;
    const th = scratch ? scratch.height : H;
    const c = coverCrop(vw, vh, tw, th);
    target.save();
    if (o.mirror) {
      target.translate(tw, 0);
      target.scale(-1, 1);
    }
    drawFiltered(target, video, { x: c.sx, y: c.sy, w: c.sw, h: c.sh }, { x: 0, y: 0, w: tw, h: th }, o.filter);
    target.restore();
    if (scratch) ctx.drawImage(scratch, 0, 0, W, H);
  }

  function drawOverlays(t) {
    let flashAlpha = 0;
    o.times.forEach((at, i) => {
      if (t < at || !photos[i]) return;
      const age = t - at;
      drawCard(ctx, photos[i], i, age);
      if (age < 0.25) flashAlpha = Math.max(flashAlpha, 0.85 * (1 - age / 0.25));
    });
    if (flashAlpha) {
      ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  function drawOutro(elapsed) {
    const p = easeOut(clamp01(elapsed / 0.6));
    ctx.fillStyle = `rgba(14,6,10,${0.7 * p})`;
    ctx.fillRect(0, 0, W, H);
    const s = o.strip;
    const scale = Math.min((W * 0.86) / s.width, (H * 0.84) / s.height);
    const sw = s.width * scale;
    const sh = s.height * scale;
    const y = (H - sh) / 2 + (1 - p) * H * 0.6;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 16;
    ctx.drawImage(s, (W - sw) / 2, y, sw, sh);
    ctx.restore();
  }

  recorder.start(250);
  await video.play();

  await new Promise((resolve, reject) => {
    let endedAt = null;
    let lastFrame = null;

    const onAbort = () => reject(new DOMException('Cancelled', 'AbortError'));
    o.signal?.addEventListener('abort', onAbort, { once: true });

    video.addEventListener('ended', () => (endedAt ??= performance.now()), { once: true });

    const tick = () => {
      if (o.signal?.aborted) return;
      // Some recordings report no duration; stop at the measured length instead.
      if (endedAt === null && video.currentTime >= o.raw.duration + 0.5) {
        video.pause();
        endedAt = performance.now();
      }

      if (endedAt === null) {
        drawFrame();
        drawOverlays(video.currentTime);
        o.onProgress?.(clamp01(video.currentTime / total));
      } else {
        if (!lastFrame) {
          // Freeze the final frame with all photos on it, then play the outro over it.
          drawFrame();
          drawOverlays(Infinity);
          lastFrame = document.createElement('canvas');
          lastFrame.width = W;
          lastFrame.height = H;
          lastFrame.getContext('2d').drawImage(canvas, 0, 0);
        }
        const elapsed = (performance.now() - endedAt) / 1000;
        ctx.drawImage(lastFrame, 0, 0);
        drawOutro(elapsed);
        o.onProgress?.(clamp01((o.raw.duration + elapsed) / total));
        if (elapsed >= OUTRO) return resolve();
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }).catch((err) => {
    recorder.stop();
    stream.getTracks().forEach((t) => t.stop());
    cleanup();
    throw err;
  });

  recorder.stop();
  await stopped;
  stream.getTracks().forEach((t) => t.stop());
  cleanup();

  const type = recorder.mimeType || mimeType || 'video/webm';
  return { blob: new Blob(chunks, { type }), mimeType: type };
}
