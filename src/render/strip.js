// Builds classic photo-booth strips (4 photos per strip) as canvases.
// Each design ("border") is drawn in code, so strips stay sharp when printed.

import { drawFiltered } from './filters.js';
import { stickerSlots, drawSticker } from './stickers.js';

const STICKER_SIZE = 92;

export const BORDERS = [
  { id: 'candy', name: 'Candy cane' },
  { id: 'classic', name: 'White' },
  { id: 'velvet', name: 'Red velvet' },
  { id: 'snow', name: 'Snowflakes' },
  { id: 'noir', name: 'Black' },
  { id: 'tartan', name: 'Tartan' },
  { id: 'gingham', name: 'Gingham' },
  { id: 'lights', name: 'Fairy lights' },
  { id: 'giftwrap', name: 'Gift wrap' },
  { id: 'holly', name: 'Holly' },
  { id: 'gingerbread', name: 'Gingerbread' },
  { id: 'starry', name: 'Starry night' },
  { id: 'film', name: 'Film strip' },
];

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

// Seeded random so decorations stay put when re-rendering.
function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

// True if a point sits on a photo or the caption (where decorations shouldn't go).
function busy(x, y, n, h, margin = 6) {
  for (let i = 0; i < n; i++) {
    const top = PAD + i * (PHOTO_H + GAP);
    if (x > PAD - margin && x < W - PAD + margin && y > top - margin && y < top + PHOTO_H + margin) return true;
  }
  const footerTop = h - FOOTER;
  return Math.abs(x - W / 2) < 170 && y > footerTop + 30 && y < footerTop + 150;
}

// ---------- Drawing helpers ----------

function fill(ctx, color, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawStripes(ctx, w, h) {
  ctx.save();
  fill(ctx, '#fffdf8', w, h);
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

function drawStar(ctx, x, y, outer, inner, points = 5, rotation = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 ? inner : outer;
    const a = rotation + (i * Math.PI) / points;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.closePath();
}

function velvetTexture(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, 'rgba(0,0,0,0.25)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.06)');
  g.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

// Tartan: two passes of semi-transparent bands, horizontal and vertical, make the woven look.
function drawTartan(ctx, w, h) {
  fill(ctx, '#a3172d', w, h);
  const bands = (horizontal) => {
    const len = horizontal ? h : w;
    const span = horizontal ? w : h;
    for (let p = 0; p < len; p += 120) {
      const rect = (offset, size, color) => {
        ctx.fillStyle = color;
        if (horizontal) ctx.fillRect(0, p + offset, span, size);
        else ctx.fillRect(p + offset, 0, size, span);
      };
      rect(0, 44, 'rgba(18,74,44,0.55)');
      rect(56, 10, 'rgba(18,74,44,0.4)');
      rect(80, 3, 'rgba(232,194,122,0.75)');
      rect(100, 2, 'rgba(255,255,255,0.45)');
    }
  };
  bands(true);
  bands(false);
}

function drawGingham(ctx, w, h) {
  fill(ctx, '#fffdf8', w, h);
  ctx.fillStyle = 'rgba(196,22,48,0.42)';
  for (let x = 0; x < w; x += 40) ctx.fillRect(x, 0, 20, h);
  for (let y = 0; y < h; y += 40) ctx.fillRect(0, y, w, 20);
}

function drawKraft(ctx, w, h, rand) {
  fill(ctx, '#c49a66', w, h);
  // Paper fibres
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = rand() > 0.5 ? 'rgba(90,60,30,0.12)' : 'rgba(255,240,210,0.12)';
    ctx.fillRect(rand() * w, rand() * h, 1 + rand() * 3, 1);
  }
  // Twine edging
  ctx.save();
  ctx.strokeStyle = '#f6efe2';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 7]);
  roundRect(ctx, 12, 12, w - 24, h - 24, 8);
  ctx.stroke();
  ctx.strokeStyle = '#b3142b';
  ctx.lineDashOffset = 8.5;
  ctx.stroke();
  ctx.restore();
}

function drawBow(ctx, x, y, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = '#c3132e';
  ctx.strokeStyle = '#8d0f22';
  ctx.lineWidth = 2;
  // Tails
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(dir * 26, 44);
    ctx.lineTo(dir * 14, 40);
    ctx.lineTo(dir * 8, 50);
    ctx.lineTo(dir * 4, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  // Loops
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(dir * 18, -30, dir * 52, -24, dir * 44, 2);
    ctx.bezierCurveTo(dir * 40, 18, dir * 16, 10, 0, 0);
    ctx.fill();
    ctx.stroke();
  }
  // Knot
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 8, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#a3112a';
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawHollySprig(ctx, x, y, s = 1, angle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(s, s);
  const leaf = (rot) => {
    ctx.save();
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    // Spiky edge: alternate in/out points along both sides
    const pts = [
      [10, -8], [18, -4], [24, -11], [32, -6], [40, -12], [46, -3],
      [52, 0], [46, 3], [40, 12], [32, 6], [24, 11], [18, 4], [10, 8],
    ];
    for (const [px, py] of pts) ctx.lineTo(px, py);
    ctx.closePath();
    ctx.fillStyle = '#1f6b3a';
    ctx.fill();
    ctx.strokeStyle = '#124526';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(46, 0);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.stroke();
    ctx.restore();
  };
  leaf(-0.5);
  leaf(0.6);
  leaf(-2.6);
  for (const [bx, by] of [[0, -6], [-7, 4], [7, 4]]) {
    ctx.beginPath();
    ctx.arc(bx, by, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#d1182f';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bx - 2, by - 2, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fill();
  }
  ctx.restore();
}

function drawGingerbread(ctx, w, h, rand) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#a8662f');
  g.addColorStop(1, '#8a4f22');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // Baked texture
  for (let i = 0; i < 500; i++) {
    ctx.fillStyle = 'rgba(60,30,10,0.15)';
    ctx.beginPath();
    ctx.arc(rand() * w, rand() * h, rand() * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

// White icing: a scalloped line just inside the edge, plus dots.
function drawIcing(ctx, w, h) {
  ctx.save();
  ctx.strokeStyle = '#fffaf2';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const inset = 13;
  const r = 9;
  const scallops = (x0, y0, x1, y1) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.round(len / (r * 2));
    const dx = (x1 - x0) / n;
    const dy = (y1 - y0) / n;
    const a = Math.atan2(dy, dx);
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const cx = x0 + dx * (i + 0.5);
      const cy = y0 + dy * (i + 0.5);
      ctx.moveTo(cx - Math.cos(a) * r, cy - Math.sin(a) * r);
      ctx.arc(cx, cy, r, a + Math.PI, a, false);
    }
    ctx.stroke();
  };
  scallops(inset, inset, w - inset, inset);
  scallops(w - inset, inset, w - inset, h - inset);
  scallops(w - inset, h - inset, inset, h - inset);
  scallops(inset, h - inset, inset, inset);
  ctx.restore();
}

function drawStarry(ctx, w, h, rand, n) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#0d1b3d');
  g.addColorStop(1, '#1d3363');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) {
    const x = rand() * w;
    const y = rand() * h;
    if (busy(x, y, n, h)) continue;
    const big = rand() > 0.88;
    ctx.fillStyle = big ? '#f3d58a' : `rgba(255,255,255,${0.35 + rand() * 0.5})`;
    if (big) {
      drawStar(ctx, x, y, 7 + rand() * 4, 3, 5, rand() * Math.PI);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, 0.6 + rand() * 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawFilm(ctx, w, h) {
  fill(ctx, '#0f0f10', w, h);
  ctx.fillStyle = '#e9e4d8';
  for (let y = 10; y < h - 14; y += 28) {
    roundRect(ctx, 10, y, 14, 10, 2.5);
    ctx.fill();
    roundRect(ctx, w - 24, y, 14, 10, 2.5);
    ctx.fill();
  }
}

// Fairy lights: a drooping wire with glowing bulbs down each side.
function drawLights(ctx, w, h) {
  const colors = ['#ff5a6e', '#ffd35a', '#6ee7a0', '#6ab8ff', '#ff9a4a'];
  const side = (x, flip) => {
    ctx.save();
    ctx.strokeStyle = '#2f3b2a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let y = 0; y <= h; y += 4) ctx.lineTo(x + Math.sin(y / 30) * 5 * flip, y);
    ctx.stroke();
    let k = flip > 0 ? 0 : 2;
    for (let y = 22; y < h - 10; y += 46) {
      const bx = x + Math.sin(y / 30) * 5 * flip;
      const color = colors[k++ % colors.length];
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(bx, y + 9, 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#3c3c3c';
      ctx.fillRect(bx - 3, y - 1, 6, 4);
    }
    ctx.restore();
  };
  side(17, 1);
  side(W - 17, -1);
}

/*
 * A theme can define:
 *  background(ctx, w, h, rand, n) – drawn first (photos go on top)
 *  decorate(ctx, w, h, rand, n)    – drawn after the photos
 *  mat      – colour of a thin frame around each photo
 *  label    – a card behind the caption: { fill, shadow }
 *  ink/soft – caption and date colours
 */
const THEMES = {
  classic: { background: (c, w, h) => fill(c, '#fffdf8', w, h), ink: '#1b1b1b', soft: '#8a7f74' },
  candy: {
    background: (c, w, h) => {
      drawStripes(c, w, h);
      c.fillStyle = '#fffdf8';
      c.fillRect(14, 14, w - 28, h - 28);
    },
    ink: '#9e1027',
    soft: '#b9606d',
  },
  velvet: {
    background: (c, w, h) => {
      fill(c, '#7a0c1c', w, h);
      velvetTexture(c, w, h);
    },
    ink: '#f6e3b4',
    soft: '#e8c27a',
  },
  snow: {
    background: (c, w, h) => fill(c, '#eef4fb', w, h),
    decorate: (c, w, h, rand) => {
      const footerTop = h - FOOTER;
      for (let k = 0; k < 14; k++) {
        const x = 20 + rand() * (w - 40);
        const y = footerTop + 10 + rand() * (FOOTER - 20);
        if (Math.abs(x - w / 2) < 150 && y < footerTop + 110) continue;
        drawFlake(c, x, y, 5 + rand() * 7, 'rgba(108,132,163,0.55)');
      }
    },
    ink: '#1d3557',
    soft: '#6c84a3',
  },
  noir: { background: (c, w, h) => fill(c, '#121212', w, h), ink: '#f4f1ec', soft: '#9a9a9a' },

  tartan: {
    background: drawTartan,
    mat: '#fffdf8',
    label: { fill: '#fffdf8' },
    ink: '#8d0f22',
    soft: '#2f6b47',
  },
  gingham: {
    background: drawGingham,
    mat: '#ffffff',
    label: { fill: '#ffffff' },
    ink: '#b3142b',
    soft: '#c46a78',
  },
  lights: {
    background: (c, w, h) => fill(c, '#16141c', w, h),
    decorate: drawLights,
    ink: '#fff3d6',
    soft: '#e8c27a',
  },
  giftwrap: {
    background: drawKraft,
    mat: '#fbf5ec',
    decorate: (c, w, h) => drawBow(c, w / 2, h - FOOTER + 28, 0.85),
    ink: '#4a2c14',
    soft: '#6f4a2a',
    captionShift: 18,
  },
  holly: {
    background: (c, w, h) => fill(c, '#fbf5ec', w, h),
    decorate: (c, w, h) => {
      const f = h - FOOTER;
      drawHollySprig(c, 60, f + 78, 0.95, -0.2);
      drawHollySprig(c, w - 60, f + 78, 0.95, Math.PI + 0.2);
      drawHollySprig(c, 18, 18, 0.5, 0.8);
      drawHollySprig(c, w - 18, 18, 0.5, Math.PI - 0.8);
    },
    ink: '#1f5c35',
    soft: '#b3142b',
  },
  gingerbread: {
    background: drawGingerbread,
    mat: '#fffaf2',
    decorate: (c, w, h) => {
      drawIcing(c, w, h);
      // Icing dots either side of the caption
      c.fillStyle = '#fffaf2';
      const f = h - FOOTER;
      for (const x of [70, 92, w - 92, w - 70]) {
        c.beginPath();
        c.arc(x, f + 78, 5, 0, Math.PI * 2);
        c.fill();
      }
    },
    ink: '#fffaf2',
    soft: '#f6d9b8',
  },
  starry: { background: drawStarry, ink: '#f3d58a', soft: '#aebbe0' },
  film: {
    background: drawFilm,
    decorate: (c, w, h, rand, n) => {
      c.fillStyle = '#f0a030';
      c.font = '500 11px "DM Mono", ui-monospace, monospace';
      c.textAlign = 'left';
      for (let i = 0; i < n; i++) {
        const y = PAD + i * (PHOTO_H + GAP) + PHOTO_H + 13;
        c.fillText(`▸ ${i + 1}A`, PAD, y);
        c.textAlign = 'right';
        c.fillText(`${(i + 1) * 4 + 20}`, W - PAD, y);
        c.textAlign = 'left';
      }
    },
    ink: '#f4f1ec',
    soft: '#f0a030',
  },
};

/**
 * @param {HTMLCanvasElement[]} photos raw 4:3 photo canvases
 * @returns {HTMLCanvasElement} one strip
 */
export function renderStrip(photos, { filter, border, caption, index = 0, stickers = [] }) {
  const theme = THEMES[border] ?? THEMES.classic;
  const n = photos.length;
  const h = PAD + n * PHOTO_H + (n - 1) * GAP + FOOTER;
  const footerTop = h - FOOTER;
  const rand = seeded(42 + index * 7);

  const canvas = document.createElement('canvas');
  canvas.width = W * SCALE;
  canvas.height = h * SCALE;
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);

  ctx.save();
  theme.background(ctx, W, h, rand, n);
  ctx.restore();

  // Photos (with an optional mat frame)
  photos.forEach((photo, i) => {
    const y = PAD + i * (PHOTO_H + GAP);
    if (theme.mat) {
      ctx.fillStyle = theme.mat;
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      ctx.fillRect(PAD - 7, y - 7, PHOTO_W + 14, PHOTO_H + 14);
      ctx.shadowColor = 'transparent';
    }
    drawFiltered(
      ctx,
      photo,
      { x: 0, y: 0, w: photo.width, h: photo.height },
      { x: PAD, y, w: PHOTO_W, h: PHOTO_H },
      filter,
    );
  });

  if (theme.decorate) {
    ctx.save();
    theme.decorate(ctx, W, h, rand, n);
    ctx.restore();
  }

  // Caption card for busy backgrounds
  if (theme.label) {
    ctx.save();
    ctx.fillStyle = theme.label.fill;
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    roundRect(ctx, 60, footerTop + 22, W - 120, 132, 14);
    ctx.fill();
    ctx.restore();
  }

  // Caption + date
  const shift = theme.captionShift ?? 0;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = theme.ink;
  let size = 66;
  // Leave room for stickers beside the caption (sticker slots 2 and 4).
  const maxWidth = stickers.length >= 2 ? W - 210 : theme.label ? W - 160 : W - 80;
  ctx.font = `${size}px "Pinyon Script", "Snell Roundhand", cursive`;
  while (ctx.measureText(caption).width > maxWidth && size > 30) {
    size -= 2;
    ctx.font = `${size}px "Pinyon Script", "Snell Roundhand", cursive`;
  }
  ctx.fillText(caption, W / 2, footerTop + 92 + shift);

  ctx.fillStyle = theme.soft;
  ctx.font = '500 17px "DM Mono", ui-monospace, monospace';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '4px';
  ctx.fillText(formatDate(), W / 2, footerTop + 134 + shift);

  // Stickers go on last, over photos and decorations.
  if (stickers.length) {
    const slots = stickerSlots({ W, PAD, PHOTO_W, PHOTO_H, GAP, n, footerTop });
    stickers.forEach((emoji, k) => {
      const slot = slots[k % slots.length];
      // Past the last slot, nudge so repeats don't sit exactly on top of earlier ones.
      const lap = Math.floor(k / slots.length);
      drawSticker(ctx, emoji, slot.x + lap * 26, slot.y + lap * 22, STICKER_SIZE, k);
    });
  }

  return canvas;
}

// Splits photos into strips of 4 and renders each.
// Stickers alternate between strips: 1st on strip 1, 2nd on strip 2, 3rd on strip 1…
export async function renderStrips(photos, opts) {
  await ensureFonts();
  const count = Math.ceil(photos.length / PER_STRIP);
  const all = opts.stickers ?? [];
  const strips = [];
  for (let s = 0; s < count; s++) {
    strips.push(
      renderStrip(photos.slice(s * PER_STRIP, (s + 1) * PER_STRIP), {
        ...opts,
        index: s,
        stickers: all.filter((_, j) => j % count === s),
      }),
    );
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
