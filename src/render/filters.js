// Filters: one definition used for the live preview (CSS) and the saved photos/video (canvas).
// Browsers without canvas `ctx.filter` support (older Safari) get a colour-matrix fallback
// that produces the same look.

export const FILTERS = [
  {
    id: 'classic',
    name: 'Classic B&W',
    ops: [['grayscale', 1], ['contrast', 1.3], ['brightness', 1.05]],
    vignette: 0.28,
    grain: 0.1,
  },
  {
    id: 'vintage',
    name: 'Vintage',
    ops: [['sepia', 0.45], ['contrast', 0.95], ['saturate', 0.8], ['brightness', 1.04]],
    tint: [255, 214, 170, 0.12],
    vignette: 0.32,
    grain: 0.12,
  },
  {
    id: 'candy',
    name: 'Candy Cane',
    ops: [['saturate', 1.4], ['contrast', 1.1]],
    tint: [255, 40, 70, 0.07],
    vignette: 0.15,
  },
  {
    id: 'frosty',
    name: 'Frosty',
    ops: [['hue-rotate', -10], ['saturate', 0.8], ['brightness', 1.1]],
    tint: [130, 185, 255, 0.14],
    vignette: 0.12,
  },
  {
    id: 'warm',
    name: 'Warm Glow',
    ops: [['sepia', 0.2], ['saturate', 1.2], ['brightness', 1.05]],
    tint: [255, 140, 40, 0.1],
    vignette: 0.35,
  },
  {
    id: 'noir',
    name: 'Film Noir',
    ops: [['grayscale', 1], ['contrast', 1.7], ['brightness', 0.9]],
    vignette: 0.55,
    grain: 0.14,
  },
  // ---- Warm & cosy ----
  {
    id: 'gingerbread',
    name: 'Gingerbread',
    ops: [['sepia', 0.55], ['saturate', 1.3], ['contrast', 1.05], ['brightness', 1.02]],
    tint: [180, 100, 40, 0.1],
    vignette: 0.25,
    grain: 0.06,
  },
  {
    id: 'cocoa',
    name: 'Hot Cocoa',
    ops: [['sepia', 0.7], ['contrast', 1.1], ['brightness', 0.95], ['saturate', 1.1]],
    vignette: 0.42,
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    ops: [['sepia', 0.3], ['saturate', 1.3], ['brightness', 1.08]],
    tint: [255, 190, 90, 0.14],
    vignette: 0.25,
  },
  {
    id: 'mistletoe',
    name: 'Mistletoe',
    ops: [['saturate', 1.15], ['brightness', 1.05], ['contrast', 0.97]],
    tint: [255, 120, 160, 0.12],
    vignette: 0.18,
  },
  {
    id: 'polaroid',
    name: 'Polaroid',
    ops: [['sepia', 0.15], ['contrast', 0.9], ['brightness', 1.08], ['saturate', 0.85]],
    tint: [255, 240, 200, 0.1],
    vignette: 0.2,
    grain: 0.08,
  },
  // ---- Cool, bold & mono ----
  {
    id: 'pine',
    name: 'Pine Forest',
    ops: [['saturate', 0.9], ['contrast', 1.05], ['hue-rotate', -8]],
    tint: [40, 120, 70, 0.12],
    vignette: 0.3,
  },
  {
    id: 'midnight',
    name: 'Silent Night',
    ops: [['brightness', 0.88], ['contrast', 1.15], ['saturate', 0.7]],
    tint: [30, 40, 110, 0.22],
    vignette: 0.5,
  },
  {
    id: 'silver',
    name: 'Silver Bells',
    ops: [['grayscale', 1], ['contrast', 1.1], ['brightness', 1.12]],
    tint: [200, 220, 255, 0.1],
    grain: 0.05,
  },
  {
    id: 'tinsel',
    name: 'Tinsel Pop',
    ops: [['saturate', 1.6], ['contrast', 1.2], ['brightness', 1.05]],
    vignette: 0.1,
  },
  {
    id: 'retro',
    name: 'Retro 90s',
    ops: [['contrast', 1.15], ['saturate', 1.25], ['hue-rotate', 8]],
    tint: [255, 80, 200, 0.06],
    vignette: 0.2,
    grain: 0.14,
  },
  { id: 'none', name: 'No filter', ops: [] },
];

export const getFilter = (id) => FILTERS.find((f) => f.id === id) ?? FILTERS[0];

export function cssFilter(filter) {
  if (!filter.ops.length) return 'none';
  return filter.ops.map(([op, v]) => (op === 'hue-rotate' ? `${op}(${v}deg)` : `${op}(${v})`)).join(' ');
}

// ---------- Feature test: does canvas ctx.filter really work here? ----------
export const supportsCanvasFilter = (() => {
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!('filter' in ctx)) return false;
    ctx.filter = 'grayscale(1)';
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 1, 1);
    const [r, g] = ctx.getImageData(0, 0, 1, 1).data;
    return Math.abs(r - g) < 10;
  } catch {
    return false;
  }
})();

// ---------- Colour matrix fallback (same maths as the CSS filter spec) ----------
const ID = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0]; // 3×4, last column = offset (0-255)

function multiply(a, b) {
  // returns a ∘ b (apply b first, then a)
  const out = new Array(12);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      let v = 0;
      for (let k = 0; k < 3; k++) v += a[r * 4 + k] * b[k * 4 + c];
      if (c === 3) v += a[r * 4 + 3];
      out[r * 4 + c] = v;
    }
  }
  return out;
}

function opMatrix(op, v) {
  switch (op) {
    case 'grayscale': {
      const a = 1 - Math.min(1, v);
      return [
        0.2126 + 0.7874 * a, 0.7152 - 0.7152 * a, 0.0722 - 0.0722 * a, 0,
        0.2126 - 0.2126 * a, 0.7152 + 0.2848 * a, 0.0722 - 0.0722 * a, 0,
        0.2126 - 0.2126 * a, 0.7152 - 0.7152 * a, 0.0722 + 0.9278 * a, 0,
      ];
    }
    case 'sepia': {
      const a = 1 - Math.min(1, v);
      return [
        0.393 + 0.607 * a, 0.769 - 0.769 * a, 0.189 - 0.189 * a, 0,
        0.349 - 0.349 * a, 0.686 + 0.314 * a, 0.168 - 0.168 * a, 0,
        0.272 - 0.272 * a, 0.534 - 0.534 * a, 0.131 + 0.869 * a, 0,
      ];
    }
    case 'saturate':
      return [
        0.213 + 0.787 * v, 0.715 - 0.715 * v, 0.072 - 0.072 * v, 0,
        0.213 - 0.213 * v, 0.715 + 0.285 * v, 0.072 - 0.072 * v, 0,
        0.213 - 0.213 * v, 0.715 - 0.715 * v, 0.072 + 0.928 * v, 0,
      ];
    case 'hue-rotate': {
      const r = (v * Math.PI) / 180;
      const cos = Math.cos(r);
      const sin = Math.sin(r);
      return [
        0.213 + cos * 0.787 - sin * 0.213, 0.715 - cos * 0.715 - sin * 0.715, 0.072 - cos * 0.072 + sin * 0.928, 0,
        0.213 - cos * 0.213 + sin * 0.143, 0.715 + cos * 0.285 + sin * 0.14, 0.072 - cos * 0.072 - sin * 0.283, 0,
        0.213 - cos * 0.213 - sin * 0.787, 0.715 - cos * 0.715 + sin * 0.715, 0.072 + cos * 0.928 + sin * 0.072, 0,
      ];
    }
    case 'contrast': {
      const o = (0.5 - 0.5 * v) * 255;
      return [v, 0, 0, o, 0, v, 0, o, 0, 0, v, o];
    }
    case 'brightness':
      return [v, 0, 0, 0, 0, v, 0, 0, 0, 0, v, 0];
    default:
      return ID;
  }
}

const matrixCache = new Map();
function matrixFor(filter) {
  if (!matrixCache.has(filter.id)) {
    matrixCache.set(
      filter.id,
      filter.ops.reduce((m, [op, v]) => multiply(opMatrix(op, v), m), ID),
    );
  }
  return matrixCache.get(filter.id);
}

function applyMatrix(ctx, x, y, w, h, m) {
  const img = ctx.getImageData(x, y, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    d[i] = m[0] * r + m[1] * g + m[2] * b + m[3];
    d[i + 1] = m[4] * r + m[5] * g + m[6] * b + m[7];
    d[i + 2] = m[8] * r + m[9] * g + m[10] * b + m[11];
  }
  ctx.putImageData(img, x, y);
}

// ---------- Grain texture (shared by preview and canvas) ----------
let grainCanvas;
export function getGrain() {
  if (!grainCanvas) {
    grainCanvas = document.createElement('canvas');
    grainCanvas.width = grainCanvas.height = 160;
    const g = grainCanvas.getContext('2d');
    const img = g.createImageData(160, 160);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }
  return grainCanvas;
}

let grainUrl;
export const grainDataUrl = () => (grainUrl ??= getGrain().toDataURL('image/png'));

// ---------- Draw a source into a box with the filter baked in ----------
// `src` = { x, y, w, h } crop of the source; `dst` = { x, y, w, h } box on ctx.
export function drawFiltered(ctx, source, src, dst, filterId) {
  const filter = getFilter(filterId);
  ctx.save();
  if (supportsCanvasFilter) {
    ctx.filter = cssFilter(filter);
    ctx.drawImage(source, src.x, src.y, src.w, src.h, dst.x, dst.y, dst.w, dst.h);
    ctx.filter = 'none';
  } else {
    ctx.drawImage(source, src.x, src.y, src.w, src.h, dst.x, dst.y, dst.w, dst.h);
    if (filter.ops.length) {
      const t = ctx.getTransform();
      // getImageData works in device pixels, so map the box through the current transform.
      // abs/min keep this correct when the canvas is mirrored (negative scale).
      const x = Math.round(Math.min(t.a * dst.x, t.a * (dst.x + dst.w)) + t.e);
      const y = Math.round(Math.min(t.d * dst.y, t.d * (dst.y + dst.h)) + t.f);
      const w = Math.round(Math.abs(t.a * dst.w));
      const h = Math.round(Math.abs(t.d * dst.h));
      applyMatrix(ctx, x, y, w, h, matrixFor(filter));
    }
  }
  ctx.restore();
  drawFinish(ctx, dst, filter);
}

// Tint, vignette and grain layers on top of a filtered image.
export function drawFinish(ctx, box, filter) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.w, box.h);
  ctx.clip();
  if (filter.tint) {
    const [r, g, b, a] = filter.tint;
    ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
    ctx.fillRect(box.x, box.y, box.w, box.h);
  }
  if (filter.vignette) {
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    const rad = Math.hypot(box.w, box.h) / 2;
    const grad = ctx.createRadialGradient(cx, cy, rad * 0.45, cx, cy, rad);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(0,0,0,${filter.vignette})`);
    ctx.fillStyle = grad;
    ctx.fillRect(box.x, box.y, box.w, box.h);
  }
  if (filter.grain) {
    ctx.globalAlpha = filter.grain;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = ctx.createPattern(getGrain(), 'repeat');
    ctx.translate(box.x, box.y);
    ctx.fillRect(0, 0, box.w, box.h);
  }
  ctx.restore();
}

// Returns a new canvas with the filter applied to a whole image.
export function filteredCopy(source, filterId) {
  const w = source.width;
  const h = source.height;
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  drawFiltered(out.getContext('2d'), source, { x: 0, y: 0, w, h }, { x: 0, y: 0, w, h }, filterId);
  return out;
}

// Applies the live-preview version of a filter to a <video> plus its overlay element.
export function applyPreview(videoEl, overlayEl, filterId) {
  const f = getFilter(filterId);
  videoEl.style.filter = cssFilter(f);
  const layers = [];
  if (f.vignette) {
    layers.push(`radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,${f.vignette}) 100%)`);
  }
  if (f.tint) {
    const [r, g, b, a] = f.tint;
    layers.push(`linear-gradient(rgba(${r},${g},${b},${a}), rgba(${r},${g},${b},${a}))`);
  }
  overlayEl.style.backgroundImage = layers.join(', ') || 'none';
  overlayEl.dataset.grain = f.grain ? 'on' : 'off';
  overlayEl.style.setProperty('--grain', f.grain ?? 0);
  overlayEl.style.setProperty('--grain-url', `url(${grainDataUrl()})`);
}
