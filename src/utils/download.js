// Saving files: Share sheet on phones (lets iPhone users "Save Image" to Photos), downloads elsewhere.

import { isMobile } from './device.js';
import { wait } from './dom.js';

// Show a Share button only on phones that can share files (Android Chrome, iPhone Safari).
export const shareAvailable = () => isMobile && typeof navigator.canShare === 'function';

export const canvasToBlob = (canvas, type = 'image/png', quality) =>
  new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create image'))), type, quality),
  );

export function fileStamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.rel = 'noopener';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function canShareFiles(files) {
  try {
    return !!navigator.canShare?.({ files });
  } catch {
    return false;
  }
}

/**
 * Saves files. Downloads them directly by default; with `preferShare` opens the phone share sheet instead.
 * Sharing must be called straight from a tap (no long awaits before it) or phones block the share sheet.
 * @returns {'shared'|'downloaded'|'cancelled'}
 */
export async function saveFiles(files, { preferShare = false } = {}) {
  if (preferShare && canShareFiles(files)) {
    try {
      await navigator.share({ files, title: 'Christmas Photo Booth' });
      return 'shared';
    } catch (err) {
      if (err.name === 'AbortError') return 'cancelled';
      // Share failed (e.g. not allowed): fall back to downloading.
    }
  }
  for (const f of files) {
    downloadBlob(f, f.name);
    if (files.length > 1) await wait(400);
  }
  return 'downloaded';
}
