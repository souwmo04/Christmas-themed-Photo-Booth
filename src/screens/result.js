import { html, $, $$, icons, escapeHtml, toast } from '../utils/dom.js';
import { state, savePrefs } from '../state.js';
import { getPoseSet } from '../data/poses.js';
import { FILTERS, filteredCopy } from '../render/filters.js';
import { BORDERS, renderStrips, combineStrips } from '../render/strip.js';
import { renderOverlayVideo } from '../render/overlayVideo.js';
import { stopCamera } from '../camera/camera.js';
import { canvasToBlob, fileStamp, saveFiles, canShareFiles, shareAvailable } from '../utils/download.js';
import { extensionFor } from '../utils/device.js';

export function mountResult(root, { go }) {
  // Photos are taken: turn the camera light off.
  stopCamera();

  const shots = state.shots.filter(Boolean);
  if (!shots.length) {
    go('setup');
    return;
  }
  const set = getPoseSet(state.poseSet);
  if (!state.footerText) state.footerText = set.footer;
  const stamp = fileStamp();
  const hasRaw = !!state.rawVideo?.blob;

  root.append(html`
    <section class="screen result">
      <header class="topbar">
        <button class="btn btn--link" id="home">Home</button>
        <span class="label">Your photos</span>
        <span class="topbar__spacer"></span>
      </header>

      <h2 class="script result__title">${escapeHtml(set.footer)}!</h2>

      <div class="result__grid">
        <div class="developer">
          <div class="developer__slot" aria-hidden="true"><span class="label">photos</span></div>
          <div class="developer__tray" id="strips" aria-label="Your photo strips"></div>
        </div>

        <div class="result__panel">
          <div class="actions">
            <button class="btn btn--primary" id="dl-strip">${icons.download} Save strip${shots.length > 4 ? 's' : ''}</button>
            <button class="btn btn--ghost" id="dl-photos">${icons.download} Single photos</button>
            <button class="btn btn--ghost" id="share" hidden>${icons.share} Share</button>
          </div>

          <div class="card video-card" id="video-card">
            <div class="video-card__head">
              <span class="video-card__icon">${icons.video}</span>
              <div>
                <b>Video edit</b>
                <p>${hasRaw ? 'Your photos pop onto the clip, like the viral edits.' : 'Video was off for this session. Turn on “Record a video too” before shooting.'}</p>
              </div>
            </div>
            <div class="video-card__stage" id="video-stage" hidden></div>
            <div class="progress" id="progress" hidden><i></i></div>
            <div class="actions">
              <button class="btn btn--ghost" id="make-video" ${hasRaw ? '' : 'disabled'}>Make video</button>
              <button class="btn btn--primary" id="dl-video" hidden>${icons.download} Save video</button>
            </div>
          </div>

          <div class="field">
            <span class="label">Filter</span>
            <div class="chips" id="filters">
              ${FILTERS.map(
                (f) => `<button class="chip" data-filter="${f.id}" aria-pressed="${f.id === state.filter}">${escapeHtml(f.name)}</button>`,
              ).join('')}
            </div>
          </div>

          <div class="field">
            <span class="label">Border</span>
            <div class="chips" id="borders">
              ${BORDERS.map(
                (b) => `<button class="chip" data-border="${b.id}" aria-pressed="${b.id === state.border}">${escapeHtml(b.name)}</button>`,
              ).join('')}
            </div>
          </div>

          <label class="field">
            <span class="label">Caption</span>
            <input class="input" id="caption" maxlength="28" value="${escapeHtml(state.footerText)}" />
          </label>

          <button class="btn btn--ghost" id="again">${icons.retake} Take new photos</button>
        </div>
      </div>
    </section>
  `);

  const tray = $('#strips', root);
  const progress = $('#progress', root);
  const stage = $('#video-stage', root);
  const makeBtn = $('#make-video', root);
  const dlVideoBtn = $('#dl-video', root);

  let strips = [];
  let stripFiles = []; // ready-made files so the share sheet opens instantly on tap
  let photoFiles = [];
  let videoFile = null;
  let videoFilter = null;
  let renderToken = 0;
  let videoAbort = null;
  let firstRender = true;

  async function rerender() {
    const my = ++renderToken;
    strips = await renderStrips(shots, {
      filter: state.filter,
      border: state.border,
      caption: state.footerText.trim() || set.footer,
    });
    if (my !== renderToken) return;

    tray.replaceChildren(
      ...strips.map((c, i) => {
        c.className = 'strip';
        c.style.setProperty('--d', `${i * 0.25}s`);
        c.setAttribute('role', 'img');
        c.setAttribute('aria-label', `Photo strip ${i + 1}`);
        return c;
      }),
    );
    tray.classList.toggle('is-developing', firstRender);
    firstRender = false;

    stripFiles = await Promise.all(
      strips.map(async (c, i) => {
        const name = `christmas-photobooth_${stamp}${strips.length > 1 ? `_strip-${i + 1}` : ''}.png`;
        return new File([await canvasToBlob(c)], name, { type: 'image/png' });
      }),
    );
    photoFiles = [];
    markVideoStale();
  }

  async function buildPhotoFiles() {
    return Promise.all(
      shots.map(async (s, i) => {
        const blob = await canvasToBlob(filteredCopy(s, state.filter), 'image/jpeg', 0.92);
        return new File([blob], `christmas-photobooth_${stamp}_${i + 1}.jpg`, { type: 'image/jpeg' });
      }),
    );
  }

  function markVideoStale() {
    if (videoFile && videoFilter !== `${state.filter}|${state.border}|${state.footerText}`) {
      makeBtn.textContent = 'Remake video';
      makeBtn.hidden = false;
    }
  }

  async function save(files, what) {
    if (!files.length) return;
    const result = await saveFiles(files);
    if (result === 'downloaded') toast(`${what} saved to your downloads ✨`);
  }

  // ---- Downloads ----
  $('#dl-strip', root).addEventListener('click', async () => {
    if (!stripFiles.length) await rerender();
    save(stripFiles, stripFiles.length > 1 ? 'Strips' : 'Strip');
  });

  $('#dl-photos', root).addEventListener('click', async () => {
    if (!photoFiles.length) photoFiles = await buildPhotoFiles();
    save(photoFiles, 'Photos');
  });

  // Share sheet (WhatsApp, Instagram, Save to Photos on iPhone…): strips plus the video if it's made.
  const shareBtn = $('#share', root);
  shareBtn.hidden = !shareAvailable();
  shareBtn.addEventListener('click', async () => {
    const files = videoFile ? [...stripFiles, videoFile] : stripFiles;
    if (!files.length) return;
    if (!canShareFiles(files)) {
      toast("This browser can't share files. Use Save instead.");
      return;
    }
    const result = await saveFiles(files, { preferShare: true });
    if (result === 'shared') toast('Shared ✨');
  });

  // ---- Video ----
  makeBtn.addEventListener('click', async () => {
    if (!hasRaw) return;
    videoAbort?.abort();
    videoAbort = new AbortController();
    makeBtn.disabled = true;
    makeBtn.textContent = 'Making video…';
    dlVideoBtn.hidden = true;
    progress.hidden = false;
    stage.hidden = false;
    const preview = document.createElement('canvas');
    preview.className = 'video-card__media';
    stage.replaceChildren(preview);
    const bar = progress.firstElementChild;

    try {
      if (!strips.length) await rerender();
      const { blob, mimeType } = await renderOverlayVideo({
        raw: state.rawVideo,
        shots,
        times: state.shotTimes.slice(0, shots.length),
        filter: state.filter,
        mirror: state.rawVideo.mirror,
        strip: combineStrips(strips),
        canvas: preview,
        signal: videoAbort.signal,
        onProgress: (p) => (bar.style.width = `${Math.round(p * 100)}%`),
      });
      videoFile = new File([blob], `christmas-photobooth_${stamp}.${extensionFor(mimeType)}`, { type: mimeType });
      videoFilter = `${state.filter}|${state.border}|${state.footerText}`;

      const player = document.createElement('video');
      player.className = 'video-card__media';
      player.src = URL.createObjectURL(blob);
      player.controls = true;
      player.playsInline = true;
      player.loop = true;
      player.muted = true;
      stage.replaceChildren(player);
      player.play().catch(() => {});

      dlVideoBtn.hidden = false;
      makeBtn.hidden = true;
      toast('Your video is ready 🎬');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
        toast("Couldn't make the video on this browser. Try Chrome or Safari.");
      }
      stage.hidden = true;
    } finally {
      progress.hidden = true;
      bar.style.width = '0%';
      makeBtn.disabled = false;
      if (!makeBtn.hidden) makeBtn.textContent = videoFile ? 'Remake video' : 'Make video';
    }
  });

  dlVideoBtn.addEventListener('click', () => videoFile && save([videoFile], 'Video'));

  // ---- Edits ----
  $('#filters', root).addEventListener('click', (e) => {
    const chip = e.target.closest('[data-filter]');
    if (!chip) return;
    state.filter = chip.dataset.filter;
    $$('[data-filter]', root).forEach((c) => c.setAttribute('aria-pressed', c === chip));
    savePrefs();
    rerender();
  });

  $('#borders', root).addEventListener('click', (e) => {
    const chip = e.target.closest('[data-border]');
    if (!chip) return;
    state.border = chip.dataset.border;
    $$('[data-border]', root).forEach((c) => c.setAttribute('aria-pressed', c === chip));
    savePrefs();
    rerender();
  });

  let typing;
  $('#caption', root).addEventListener('input', (e) => {
    state.footerText = e.target.value;
    clearTimeout(typing);
    typing = setTimeout(rerender, 300);
  });

  $('#again', root).addEventListener('click', () => go('setup'));
  $('#home', root).addEventListener('click', () => go('welcome'));

  rerender();

  return () => {
    renderToken++;
    clearTimeout(typing);
    videoAbort?.abort();
  };
}
