import { html, $, $$, escapeHtml, icons } from '../utils/dom.js';
import { state, savePrefs, resetSession } from '../state.js';
import { POSE_SETS } from '../data/poses.js';
import { FILTERS, applyPreview } from '../render/filters.js';
import { startCamera, stopCamera, getStream, countCameras, cameraErrorMessage } from '../camera/camera.js';
import { boothWindowHtml, attachStream, setWindowMessage } from '../ui/boothWindow.js';
import { canRecord } from '../utils/device.js';

export function mountSetup(root, { go }) {
  resetSession();

  root.append(html`
    <section class="screen setup">
      <header class="topbar">
        <button class="btn btn--link" id="leave">Leave</button>
        <span class="label">Get ready</span>
        <span class="topbar__spacer"></span>
      </header>

      <h2 class="script setup__title">pick your look</h2>

      <div class="setup__grid">
        <div class="setup__preview">
          ${boothWindowHtml({ flip: true })}
          <button class="btn btn--ghost btn--small" id="retry" hidden>Try again</button>
        </div>

        <div class="setup__panel">
          <div class="field">
            <span class="label">Filter</span>
            <div class="chips" id="filters" role="group" aria-label="Filter">
              ${FILTERS.map(
                (f) => `<button class="chip" data-filter="${f.id}" aria-pressed="${f.id === state.filter}">${escapeHtml(f.name)}</button>`,
              ).join('')}
            </div>
          </div>

          <div class="field">
            <span class="label">Poses</span>
            <div class="sets" id="sets" role="radiogroup" aria-label="Pose set">
              ${POSE_SETS.map(
                (s) => `
                <button class="set" role="radio" data-set="${s.id}" aria-checked="${s.id === state.poseSet}">
                  <span class="set__name">${escapeHtml(s.name)}</span>
                  <span class="set__meta">${escapeHtml(s.description)}</span>
                  <span class="script set__first">${escapeHtml(s.poses[0].title)}…</span>
                </button>`,
              ).join('')}
            </div>
          </div>

          <div class="field field--toggles">
            <label class="switch">
              <span>Record a video too <small>photos pop onto the clip</small></span>
              <input type="checkbox" id="opt-video" ${state.recordVideo && canRecord ? 'checked' : ''} ${canRecord ? '' : 'disabled'} />
            </label>
            <label class="switch">
              <span>Mirror selfie camera</span>
              <input type="checkbox" id="opt-mirror" ${state.mirror ? 'checked' : ''} />
            </label>
            <label class="switch">
              <span>Sounds</span>
              <input type="checkbox" id="opt-sound" ${state.sound ? 'checked' : ''} />
            </label>
          </div>
        </div>
      </div>

      <button class="btn btn--primary setup__start" id="start" disabled>Start shooting</button>
    </section>
  `);

  const win = $('.window', root);
  const video = $('.window__video', root);
  const fx = $('.window__fx', root);
  const flipBtn = $('.window__flip', root);
  const startBtn = $('#start', root);
  const retryBtn = $('#retry', root);
  flipBtn.innerHTML = icons.flip;

  const refreshPreview = () => {
    applyPreview(video, fx, state.filter);
    video.classList.toggle('is-mirrored', state.mirror && state.facing === 'user');
  };

  async function openCamera() {
    startBtn.disabled = true;
    retryBtn.hidden = true;
    setWindowMessage(win, 'Starting camera…');
    try {
      const stream = await startCamera(state.facing);
      await attachStream(video, stream, state.mirror && state.facing === 'user');
      setWindowMessage(win, '');
      refreshPreview();
      startBtn.disabled = false;
      if ((await countCameras()) > 1) flipBtn.hidden = false;
    } catch (err) {
      console.error(err);
      setWindowMessage(win, cameraErrorMessage(err));
      retryBtn.hidden = false;
    }
  }

  // Filter chips
  $('#filters', root).addEventListener('click', (e) => {
    const chip = e.target.closest('[data-filter]');
    if (!chip) return;
    state.filter = chip.dataset.filter;
    $$('[data-filter]', root).forEach((c) => c.setAttribute('aria-pressed', c === chip));
    refreshPreview();
    savePrefs();
  });

  // Pose sets
  $('#sets', root).addEventListener('click', (e) => {
    const card = e.target.closest('[data-set]');
    if (!card) return;
    state.poseSet = card.dataset.set;
    $$('[data-set]', root).forEach((c) => c.setAttribute('aria-checked', c === card));
    savePrefs();
  });

  // Toggles
  $('#opt-video', root).addEventListener('change', (e) => {
    state.recordVideo = e.target.checked;
    savePrefs();
  });
  $('#opt-mirror', root).addEventListener('change', (e) => {
    state.mirror = e.target.checked;
    refreshPreview();
    savePrefs();
  });
  $('#opt-sound', root).addEventListener('change', (e) => {
    state.sound = e.target.checked;
    savePrefs();
  });

  flipBtn.addEventListener('click', () => {
    state.facing = state.facing === 'user' ? 'environment' : 'user';
    savePrefs();
    openCamera();
  });
  retryBtn.addEventListener('click', openCamera);

  $('#leave', root).addEventListener('click', () => {
    stopCamera();
    go('welcome');
  });

  startBtn.addEventListener('click', () => {
    if (getStream()) go('shoot');
  });

  // Reuse a running camera (coming back from a retake), otherwise start it.
  if (getStream()) {
    attachStream(video, getStream(), state.mirror && state.facing === 'user').then(() => {
      refreshPreview();
      startBtn.disabled = false;
      countCameras().then((n) => (flipBtn.hidden = n < 2));
    });
  } else {
    openCamera();
  }

  return () => {
    video.srcObject = null;
  };
}
