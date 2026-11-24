import { html, $ } from '../utils/dom.js';
import { isInAppBrowser, hasCamera, isSecure } from '../utils/device.js';
import { unlockAudio } from '../utils/sound.js';

function lights(n = 18) {
  return Array.from({ length: n }, (_, i) => `<span class="bulb" style="--i:${i}"></span>`).join('');
}

export function mountWelcome(root, { go }) {
  let warning = '';
  if (isInAppBrowser) {
    warning = `<div class="banner">📸 The camera usually doesn't work inside Instagram or TikTok.
      Tap <b>•••</b> and choose <b>Open in browser</b> (Safari or Chrome).</div>`;
  } else if (!isSecure) {
    warning = `<div class="banner">The camera only works on a secure (https) link.</div>`;
  } else if (!hasCamera) {
    warning = `<div class="banner">This browser can't use a camera. Try Chrome or Safari.</div>`;
  }

  root.append(html`
    <section class="screen welcome">
      ${warning}
      <div class="lights" aria-hidden="true">${lights()}</div>

      <div class="booth" id="booth">
        <div class="booth__sign">
          <span class="label">est. north pole</span>
          <span class="script booth__sign-text">Photo Booth</span>
        </div>

        <div class="booth__body">
          <div class="booth__side booth__side--left" aria-hidden="true">
            <div class="sample-strip">
              <i></i><i></i><i></i><i></i>
            </div>
          </div>

          <div class="booth__door">
            <div class="curtain curtain--left"></div>
            <div class="curtain curtain--right"></div>
            <div class="booth__seat" aria-hidden="true"></div>
          </div>

          <div class="booth__side booth__side--right" aria-hidden="true">
            <div class="booth__slot"></div>
            <div class="booth__price">
              <span class="label">4 or 8</span>
              <b>poses</b>
              <span class="label">free</span>
            </div>
          </div>
        </div>
        <div class="booth__floor" aria-hidden="true"></div>
      </div>

      <div class="welcome__copy">
        <h1 class="script welcome__title">Christmas photo booth</h1>
        <p class="welcome__sub">Follow the poses, pick a filter, take home a strip and a video.
          Everything stays on your device.</p>
        <button class="btn btn--primary welcome__cta" id="enter">Step inside</button>
      </div>
    </section>
  `);

  const booth = $('#booth', root);
  const enter = $('#enter', root);
  let timer;

  enter.addEventListener('click', () => {
    unlockAudio();
    enter.disabled = true;
    booth.classList.add('is-open');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    timer = setTimeout(() => go('setup'), reduce ? 0 : 900);
  });

  return () => clearTimeout(timer);
}
