import './styles/base.css';
import './styles/booth.css';
import './styles/setup.css';
import './styles/shoot.css';
import './styles/result.css';

import { mountWelcome } from './screens/welcome.js';
import { mountSetup } from './screens/setup.js';
import { mountShoot } from './screens/shoot.js';
import { mountResult } from './screens/result.js';
import { startSnow } from './ui/snow.js';
import { stopCamera } from './camera/camera.js';

const screens = {
  welcome: mountWelcome,
  setup: mountSetup,
  shoot: mountShoot,
  result: mountResult,
};

const app = document.getElementById('app');
let cleanup = null;

export function go(name) {
  cleanup?.();
  cleanup = null;
  app.replaceChildren();
  window.scrollTo(0, 0);
  cleanup = screens[name](app, { go }) ?? null;
}

// Turn the camera light off when the tab is closed or hidden for good.
window.addEventListener('pagehide', stopCamera);

startSnow(document.getElementById('snow'));
go('welcome');
