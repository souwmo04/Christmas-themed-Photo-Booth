// Shared app state for one booth session.
// Preferences (filter, pose set, toggles) are remembered between visits.

const PREFS_KEY = 'xmas-booth-prefs';

const defaults = {
  poseSet: 'story',
  filter: 'classic',
  border: 'candy',
  facing: 'user',
  recordVideo: true,
  mirror: true,
  sound: true,
};

function loadPrefs() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') };
  } catch {
    return { ...defaults };
  }
}

export const state = {
  ...loadPrefs(),
  footerText: '',
  // Filled during a session:
  shots: [], // raw (unfiltered) photo canvases
  shotTimes: [], // seconds from the start of the recording
  rawVideo: null, // { blob, mimeType, duration }
};

export function savePrefs() {
  const { poseSet, filter, border, facing, recordVideo, mirror, sound } = state;
  try {
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ poseSet, filter, border, facing, recordVideo, mirror, sound }),
    );
  } catch {
    /* private mode: preferences just aren't remembered */
  }
}

export function resetSession() {
  state.shots = [];
  state.shotTimes = [];
  state.rawVideo = null;
}
