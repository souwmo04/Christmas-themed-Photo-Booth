// Emoji stickers for the photo strips, drawn with a white die-cut edge like real stickers.

export const STICKERS = [
  // Christmas
  '🎄', '⛄', '🎅', '🤶', '🦌', '🎁', '❄️', '⭐', '🌟', '✨', '🔔', '🧦',
  '🍪', '🥛', '☕', '🍭', '🎀', '🕯️', '🧣', '🧤', '🍫', '🎉',
  // Love
  '💝', '❤️', '💕', '💌', '🌹', '💋', '🥂', '💍',
  '💖', '💗', '💞', '💘', '💓', '❣️', '🤍', '💜',
  '🥰', '😍', '😘', '🫶', '💑', '💐', '🌷', '🌸',
  '🦋', '🍓', '🍷', '🍾', '🧸', '🕊️', '🌙', '🔒',
];

const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", sans-serif';

/**
 * Spots on a strip where stickers look good, in strip units (see strip.js), in the order they're used:
 * overlapping photo corners and beside the caption, alternating sides.
 */
export function stickerSlots({ W, PAD, PHOTO_W, PHOTO_H, GAP, n, footerTop }) {
  const top = (i) => PAD + Math.min(i, n - 1) * (PHOTO_H + GAP);
  const L = PAD + 6;
  const R = PAD + PHOTO_W - 6;
  return [
    { x: R, y: top(0) + 6 }, // photo 1, top-right
    { x: 58, y: footerTop + 72 }, // beside caption, left
    { x: L, y: top(1) + PHOTO_H - 6 }, // photo 2, bottom-left
    { x: W - 58, y: footerTop + 72 }, // beside caption, right
    { x: L, y: top(2) + 6 }, // photo 3, top-left
    { x: R, y: top(n - 1) + PHOTO_H - 6 }, // last photo, bottom-right
    { x: R, y: top(1) + PHOTO_H / 2 }, // photo 2, right edge
    { x: L, y: top(0) + PHOTO_H - 6 }, // photo 1, bottom-left
    { x: R, y: top(2) + PHOTO_H - 6 }, // photo 3, bottom-right
    { x: L, y: top(n - 1) + PHOTO_H / 2 }, // last photo, left edge
    { x: W / 2, y: footerTop + 10 }, // above the caption
    { x: R, y: top(n - 1) + 6 }, // last photo, top-right
  ];
}

// Small, stable tilt for each slot so stickers look hand-placed.
const TILTS = [-14, 10, -8, 16, 12, -12, 8, -16, 6, -6, 0, 14];

// Builds a sticker image once (emoji + white die-cut edge) and caches it.
const cache = new Map();
function stickerImage(emoji, px) {
  const key = `${emoji}|${px}`;
  if (cache.has(key)) return cache.get(key);
  const edge = Math.max(3, Math.round(px * 0.07));
  const size = Math.ceil(px * 1.35 + edge * 2);

  // 1) The emoji on its own
  const glyph = document.createElement('canvas');
  glyph.width = glyph.height = size;
  const g = glyph.getContext('2d');
  g.font = `${px}px ${EMOJI_FONT}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(emoji, size / 2, size / 2 + px * 0.06);

  // 2) A white silhouette of it
  const white = document.createElement('canvas');
  white.width = white.height = size;
  const w = white.getContext('2d');
  w.drawImage(glyph, 0, 0);
  w.globalCompositeOperation = 'source-in';
  w.fillStyle = '#fff';
  w.fillRect(0, 0, size, size);

  // 3) Silhouette stamped in a ring = the die-cut edge, emoji on top
  const out = document.createElement('canvas');
  out.width = out.height = size;
  const o = out.getContext('2d');
  for (let a = 0; a < 24; a++) {
    const t = (a / 24) * Math.PI * 2;
    o.drawImage(white, Math.cos(t) * edge, Math.sin(t) * edge);
  }
  o.drawImage(glyph, 0, 0);

  cache.set(key, out);
  return out;
}

/** Draws one sticker centred on (x, y), `size` tall, tilted by its slot. */
export function drawSticker(ctx, emoji, x, y, size, slotIndex = 0) {
  // Build at the canvas's real pixel scale so it stays sharp.
  const scale = Math.hypot(ctx.getTransform().a, ctx.getTransform().b) || 1;
  const img = stickerImage(emoji, Math.round(size * scale));
  const drawSize = img.width / scale;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(((TILTS[slotIndex % TILTS.length] ?? 0) * Math.PI) / 180);
  ctx.shadowColor = 'rgba(0,0,0,0.28)';
  ctx.shadowBlur = size * 0.12 * scale;
  ctx.shadowOffsetY = size * 0.05 * scale;
  ctx.drawImage(img, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
  ctx.restore();
}
