// The white "booth window" frame around the live camera, shared by setup and shoot screens.

export const ZOOMS = [0.5, 1];

export function boothWindowHtml({ flip = false } = {}) {
  return `
    <div class="window">
      <div class="window__cam" aria-hidden="true"><i></i></div>
      <div class="window__screen">
        <div class="window__feed">
          <video class="window__video" playsinline muted autoplay></video>
        </div>
        <div class="window__fx" aria-hidden="true"></div>
        <div class="window__msg" role="status"></div>
        <div class="window__count" aria-live="assertive"></div>
        <div class="window__flash" aria-hidden="true"></div>
        <div class="zoom" role="group" aria-label="Zoom" hidden>
          ${ZOOMS.map((z) => `<button class="zoom__btn" data-zoom="${z}" aria-pressed="false">${z}x</button>`).join('')}
        </div>
        <button class="icon-btn flash-toggle" aria-pressed="false" aria-label="Flash off" hidden></button>
        ${flip ? '<button class="icon-btn window__flip" hidden aria-label="Switch camera"></button>' : ''}
      </div>
    </div>`;
}

export async function attachStream(video, stream, mirror) {
  video.srcObject = stream;
  video.classList.toggle('is-mirrored', !!mirror);
  try {
    await video.play();
  } catch {
    /* autoplay with muted+playsinline normally works; the stream still shows on first tap */
  }
  if (!video.videoWidth) {
    await new Promise((r) => video.addEventListener('loadedmetadata', r, { once: true }));
  }
}

// Shows the 0.5x/1x switch only when the camera really supports going wider.
export function setView(root, { zoom = 1, mirror = false, zoomAvailable = false }) {
  root.querySelector('.window__video').classList.toggle('is-mirrored', mirror);
  const control = root.querySelector('.zoom');
  if (control) control.hidden = !zoomAvailable;
  root.querySelectorAll('[data-zoom]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.zoom) === zoom)));
}

// Calls onChange(zoom) when a zoom button is tapped.
export function bindZoom(root, onChange) {
  root.querySelector('.zoom')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-zoom]');
    if (btn) onChange(Number(btn.dataset.zoom));
  });
}

export function setWindowMessage(root, text) {
  const msg = root.querySelector('.window__msg');
  msg.textContent = text || '';
  msg.classList.toggle('is-visible', !!text);
}

export function flash(root) {
  const el = root.querySelector('.window__flash');
  el.classList.remove('is-on');
  void el.offsetWidth; // restart the animation
  el.classList.add('is-on');
}
