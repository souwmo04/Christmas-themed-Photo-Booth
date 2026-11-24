// Builds classic photo-booth strips (4 photos per strip) as canvases.

import { drawFiltered } from './filters.js';

export const BORDERS = [
  { id: 'candy', name: 'Candy cane' },
  { id: 'classic', name: 'White' },
  { id: 'velvet', name: 'Red velvet' },
  { id: 'snow', name: 'Snowflakes' },
  { id: 'noir', name: 'Black' },
];

const THEMES = {
  classic: { paper: '#fffdf8', ink: '#1b1b1b', soft: '#8a7f74' },
  candy: { paper: '#fffdf8', ink: '#9e1027', soft: '#b9606d', stripes: true },
  velvet: { paper: '#7a0c1c', ink: '#f6e3b4', soft: '#e8c27a', texture: true },
  snow: { paper: '#eef4fb', ink: '#1d3557', soft: '#6c84a3', flakes: true },
  noir: { paper: '#121212', ink: '#f4f1ec', soft: '#9a9a9a' },
};

// Base layout in "strip units"; everything is multiplied by SCALE for a sharp, printable file.
const SCALE = 2;
const W = 600;
const PAD = 36;
const PHOTO_W = W - PAD * 2;
const PHOTO_H = Math.round((PHOTO_W * 3) / 4);
const GAP = 18;
const FOOTER = 176;
export const PER_STRIP = 4;

export async function ensureFonts() {
  if (!document.fonts?.load) return;
  try {
    await Promise.all([
      document.fonts.load('64px "Pinyon Script"'),
      document.fonts.load('500 20px "DM Mono"'),
    ]);
  } catch {
    /* fall back to system fonts */
  }
}

function formatDate(d = new Date()) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd} · ${mm} · ${d.getFullYear()}`;
}

function drawStripes(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = '#fffdf8';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#c3132e';
  const band = 14;
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-Math.PI / 4);
  const size = Math.hypot(w, h);
  for (let x = -size; x < size; x += band * 2) ctx.fillRect(x, -size, band, size * 2);
  ctx.restore();
}

function drawFlake(ctx, x, y, r, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, r / 5);
  ctx.lineCap = 'round';
  for (let k = 0; k < 6; k++) {
    ctx.rotate(Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -r);
    ctx.moveTo(0, -r * 0.55);
    ctx.lineTo(r * 0.25, -r * 0.8);
    ctx.moveTo(0, -r * 0.55);
    ctx.lineTo(-r * 0.25, -r * 0.8);
    ctx.stroke();
  }
  ctx.restore();
}

// Seeded random so the snowflakes stay put when re-rendering.
function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function velvetTexture(ctx, w, h) {
  ctx.save();
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, 'rgba(0,0,0,0.25)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.06)');
  g.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/**
 * @param {HTMLCanvasElement[]} photos raw 4:3 photo canvases
 * @returns {HTMLCanvasElement} one strip
 */
export function renderStrip(photos, { filter, border, caption, index = 0 }) {
  const theme = THEMES[border] ?? THEMES.classic;
  const n = photos.length;
  const h = PAD + n * PHOTO_H + (n - 1) * GAP + FOOTER;

  const canvas = document.createElement('canvas');
  canvas.width = W * SCALE;
  canvas.height = h * SCALE;
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);

  // Paper
  if (theme.stripes) {
    drawStripes(ctx, W, h);
    ctx.fillStyle = theme.paper;
    ctx.fillRect(14, 14, W - 28, h - 28);
  } else {
    ctx.fillStyle = theme.paper;
    ctx.fillRect(0, 0, W, h);
  }
  if (theme.texture) velvetTexture(ctx, W, h);

  // Photos
  photos.forEach((photo, i) => {
    const y = PAD + i * (PHOTO_H + GAP);
    drawFiltered(
      ctx,
      photo,
      { x: 0, y: 0, w: photo.width, h: photo.height },
      { x: PAD, y, w: PHOTO_W, h: PHOTO_H },
      filter,
    );
  });

  // Snowflakes in the margins and footer
  if (theme.flakes) {
    const rand = seeded(42 + index);
    const footerTop = h - FOOTER;
    for (let k = 0; k < 14; k++) {
      const x = 20 + rand() * (W - 40);
      const y = footerTop + 10 + rand() * (FOOTER - 20);
      if (Math.abs(x - W / 2) < 150 && y < footerTop + 110) continue; // keep the caption clear
      drawFlake(ctx, x, y, 5 + rand() * 7, 'rgba(108,132,163,0.55)');
    }
  }

  // Footer text
  const footerTop = h - FOOTER;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = theme.ink;
  let size = 66;
  ctx.font = `${size}px "Pinyon Script", "Snell Roundhand", cursive`;
  while (ctx.measureText(caption).width > W - 80 && size > 30) {
    size -= 2;
    ctx.font = `${size}px "Pinyon Script", "Snell Roundhand", cursive`;
  }
  ctx.fillText(caption, W / 2, footerTop + 92);

  ctx.fillStyle = theme.soft;
  ctx.font = '500 17px "DM Mono", ui-monospace, monospace';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '4px';
  ctx.fillText(formatDate(), W / 2, footerTop + 134);

  return canvas;
}

// Splits photos into strips of 4 and renders each.
export async function renderStrips(photos, opts) {
  await ensureFonts();
  const strips = [];
  for (let i = 0; i < photos.length; i += PER_STRIP) {
    strips.push(renderStrip(photos.slice(i, i + PER_STRIP), { ...opts, index: i / PER_STRIP }));
  }
  return strips;
}

// All strips side by side on one canvas (used at the end of the video).
export function combineStrips(strips, gap = 40) {
  const w = strips.reduce((s, c) => s + c.width, 0) + gap * (strips.length - 1);
  const h = Math.max(...strips.map((c) => c.height));
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const ctx = out.getContext('2d');
  let x = 0;
  for (const c of strips) {
    ctx.drawImage(c, x, 0);
    x += c.width + gap;
  }
  return out;
}
