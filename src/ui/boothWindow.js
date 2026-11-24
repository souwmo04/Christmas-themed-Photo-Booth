// The white "booth window" frame around the live camera, shared by setup and shoot screens.

export function boothWindowHtml({ flip = false } = {}) {
  return `
    <div class="window">
      <div class="window__cam" aria-hidden="true"><i></i></div>
      <div class="window__screen">
        <video class="window__video" playsinline muted autoplay></video>
        <div class="window__fx" aria-hidden="true"></div>
        <div class="window__msg" role="status"></div>
        <div class="window__count" aria-live="assertive"></div>
        <div class="window__flash" aria-hidden="true"></div>
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
