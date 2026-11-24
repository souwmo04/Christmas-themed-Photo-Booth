import { html, $, wait, icons } from '../utils/dom.js';
import { state, savePrefs } from '../state.js';
import { getPoseSet } from '../data/poses.js';
import { applyPreview, drawFiltered } from '../render/filters.js';
import {
  getStream,
  stopCamera,
  captureFrame,
  isFrontCamera,
  getZoomSupport,
  currentZoom,
  setZoom,
} from '../camera/camera.js';
import { SessionRecorder } from '../camera/recorder.js';
import { boothWindowHtml, attachStream, setWindowMessage, flash, setView, bindZoom } from '../ui/boothWindow.js';
import { beep, shutter, unlockAudio } from '../utils/sound.js';
import { withFlash, flashKind, renderFlashButton, turnFlashOff } from '../ui/flash.js';

const READ_TIME = 1700; // ms to read the pose before the countdown
const AFTER_SHOT = 1000; // ms to look at the result before the next pose

export function mountShoot(root, { go }) {
  const set = getPoseSet(state.poseSet);
  const total = set.poses.length;
  const stream = getStream();
  if (!stream) {
    go('setup');
    return;
  }

  root.append(html`
    <section class="screen shoot">
      <header class="topbar">
        <button class="btn btn--link" id="leave">Leave</button>
        <span class="label" id="counter">Pose 1 of ${total}</span>
        <button class="icon-btn" id="sound" aria-label="Sound"></button>
      </header>

      <h2 class="script shoot__title" id="title" aria-live="polite"></h2>

      <div class="shoot__window">
        ${boothWindowHtml()}
        <button class="shoot__ready" id="ready" aria-label="Start the countdown">
          <span class="script">Ready?</span>
          <span class="label">tap to start</span>
        </button>
      </div>

      <div class="shoot__pose">
        <span class="label" id="pose-num">Pose 1</span>
        <p class="shoot__instruction" id="instruction"></p>
      </div>

      <div class="thumbs" id="thumbs" style="--n:${total}">
        ${set.poses.map((_, i) => `<div class="thumb" data-i="${i}"><span>${i + 1}</span></div>`).join('')}
      </div>

      <div class="shoot__controls">
        <button class="btn btn--ghost" id="retake" disabled>${icons.retake} Retake last</button>
        <button class="btn btn--primary" id="go">Start</button>
      </div>
    </section>
  `);

  const win = $('.window', root);
  const video = $('.window__video', root);
  const countEl = $('.window__count', root);
  const titleEl = $('#title', root);
  const instrEl = $('#instruction', root);
  const counterEl = $('#counter', root);
  const poseNumEl = $('#pose-num', root);
  const readyBtn = $('#ready', root);
  const goBtn = $('#go', root);
  const retakeBtn = $('#retake', root);
  const soundBtn = $('#sound', root);

  const mirror = state.mirror && isFrontCamera();
  attachStream(video, stream, mirror);
  applyPreview($('.window__feed', root), $('.window__fx', root), state.filter);
  // Zoom can change mid-shoot only when it's the camera's own zoom (same stream, recording keeps going).
  // Switching lenses restarts the camera, so that's done on the setup screen instead.
  const liveZoom = getZoomSupport().type === 'hardware';
  const refreshView = () => setView(win, { zoom: currentZoom(), mirror, zoomAvailable: liveZoom });
  refreshView();

  renderFlashButton(win, state.flash);
  $('.flash-toggle', win).addEventListener('click', () => {
    state.flash = !state.flash;
    savePrefs();
    renderFlashButton(win, state.flash);
  });

  bindZoom(win, async (zoom) => {
    try {
      await setZoom(zoom);
      state.zoom = zoom;
      savePrefs();
    } catch (err) {
      console.error(err);
    }
    refreshView();
  });

  const recorder = state.recordVideo ? new SessionRecorder(stream) : null;
  let generation = 0; // bumps whenever the running sequence must stop
  let started = false;
  let finished = false;

  const renderSound = () => {
    soundBtn.innerHTML = state.sound ? icons.soundOn : icons.soundOff;
    soundBtn.setAttribute('aria-pressed', String(state.sound));
  };
  renderSound();
  soundBtn.addEventListener('click', () => {
    state.sound = !state.sound;
    renderSound();
  });

  function showPose(i) {
    const pose = set.poses[i];
    titleEl.textContent = pose.title;
    titleEl.classList.remove('is-new');
    void titleEl.offsetWidth;
    titleEl.classList.add('is-new');
    instrEl.textContent = pose.instruction;
    counterEl.textContent = `Pose ${i + 1} of ${total}`;
    poseNumEl.textContent = `Pose ${i + 1}`;
    root.querySelectorAll('.thumb').forEach((t, k) => t.classList.toggle('is-current', k === i));
  }

  function setThumb(i, canvas) {
    const slot = root.querySelector(`.thumb[data-i="${i}"]`);
    slot.replaceChildren();
    if (!canvas) {
      slot.innerHTML = `<span>${i + 1}</span>`;
      slot.classList.remove('is-filled');
      return;
    }
    const t = document.createElement('canvas');
    t.width = 160;
    t.height = 120;
    drawFiltered(
      t.getContext('2d'),
      canvas,
      { x: 0, y: 0, w: canvas.width, h: canvas.height },
      { x: 0, y: 0, w: 160, h: 120 },
      state.filter,
    );
    slot.append(t);
    slot.classList.add('is-filled');
  }

  // Takes photo i (with the flash if it's on). Returns false if a retake/leave cancelled it meanwhile.
  async function capture(i, alive) {
    const take = () => {
      if (!alive()) return null;
      const shot = captureFrame(video, { width: 1200, mirror });
      state.shots[i] = shot;
      state.shotTimes[i] = recorder?.available ? recorder.now() : 0;
      return shot;
    };
    const shot = state.flash && flashKind() !== 'none' ? await withFlash(take) : take();
    if (!shot) return false;
    shutter();
    flash(win);
    setThumb(i, shot);
    if (navigator.vibrate) navigator.vibrate(30);
    return true;
  }

  async function runFrom(start) {
    const my = ++generation;
    const alive = () => my === generation;
    for (let i = start; i < total; i++) {
      showPose(i);
      retakeBtn.disabled = state.shots.length === 0;
      await wait(READ_TIME);
      if (!alive()) return;
      for (let n = 3; n >= 1; n--) {
        countEl.textContent = '';
        void countEl.offsetWidth;
        countEl.textContent = String(n);
        beep(n === 1 ? 1175 : 880);
        await wait(1000);
        if (!alive()) return;
      }
      countEl.textContent = '';
      if (!(await capture(i, alive))) return;
      retakeBtn.disabled = false;
      await wait(AFTER_SHOT);
      if (!alive()) return;
    }
    finish();
  }

  async function finish() {
    finished = true;
    generation++;
    goBtn.disabled = true;
    retakeBtn.disabled = true;
    setWindowMessage(win, 'Developing your photos…');
    if (recorder?.available) {
      const raw = await recorder.stop();
      state.rawVideo = raw && { ...raw, mirror };
    }
    go('result');
  }

  function begin() {
    if (started) return;
    started = true;
    unlockAudio();
    readyBtn.hidden = true;
    goBtn.textContent = 'Finish early';
    goBtn.classList.replace('btn--primary', 'btn--ghost');
    recorder?.start();
    runFrom(0);
  }

  readyBtn.addEventListener('click', begin);
  goBtn.addEventListener('click', () => {
    if (!started) return begin();
    if (state.shots.length === 0) return;
    // Finish early with the photos taken so far.
    state.shots.length = Math.min(state.shots.length, total);
    finish();
  });

  retakeBtn.addEventListener('click', () => {
    if (!state.shots.length || finished) return;
    generation++; // stop the running countdown
    countEl.textContent = '';
    const last = state.shots.length - 1;
    state.shots.pop();
    state.shotTimes.pop();
    setThumb(last, null);
    runFrom(last);
  });

  $('#leave', root).addEventListener('click', () => {
    if (state.shots.length && !confirm('Leave the booth? Your photos will be lost.')) return;
    generation++;
    recorder?.cancel();
    stopCamera();
    go('welcome');
  });

  showPose(0);

  return () => {
    generation++;
    turnFlashOff();
    if (!finished) recorder?.cancel();
    video.srcObject = null;
  };
}
