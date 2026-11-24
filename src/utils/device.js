// Device and browser checks.

const ua = navigator.userAgent || '';

export const isIOS =
  /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const isAndroid = /Android/i.test(ua);

export const isMobile = isIOS || isAndroid || matchMedia('(pointer: coarse)').matches;

// Instagram, Facebook, TikTok, Snapchat and similar in-app browsers usually block the camera.
export const isInAppBrowser = /Instagram|FBAN|FBAV|FB_IAB|TikTok|musical_ly|Bytedance|Snapchat|Line\/|LinkedInApp|Twitter/i.test(
  ua,
);

export const hasCamera = !!navigator.mediaDevices?.getUserMedia;

export const canRecord = typeof window.MediaRecorder !== 'undefined';

export const isSecure = window.isSecureContext;

// Picks a video format this browser can record. MP4 first: it plays everywhere and Instagram accepts it.
export function pickVideoMime() {
  if (!canRecord) return null;
  const options = [
    'video/mp4;codecs=avc1.42E01E',
    'video/mp4;codecs=avc1',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  return options.find((t) => MediaRecorder.isTypeSupported?.(t)) ?? '';
}

export const extensionFor = (mime) => (mime && mime.includes('mp4') ? 'mp4' : 'webm');
