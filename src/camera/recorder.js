// Records the raw camera stream during the shoot so we can build the overlay video later.

import { pickVideoMime } from '../utils/device.js';

export class SessionRecorder {
  constructor(stream) {
    this.mimeType = pickVideoMime();
    this.chunks = [];
    this.startedAt = 0;
    this.recorder = null;
    try {
      this.recorder = new MediaRecorder(
        stream,
        this.mimeType ? { mimeType: this.mimeType, videoBitsPerSecond: 3_000_000 } : undefined,
      );
      this.mimeType = this.recorder.mimeType || this.mimeType;
      this.recorder.ondataavailable = (e) => e.data?.size && this.chunks.push(e.data);
    } catch (err) {
      console.warn('Recording not available', err);
      this.recorder = null;
    }
  }

  get available() {
    return !!this.recorder;
  }

  start() {
    if (!this.recorder) return;
    this.recorder.start(1000);
    this.startedAt = performance.now();
  }

  // Seconds since recording started (used to time each photo in the video).
  now() {
    return this.startedAt ? (performance.now() - this.startedAt) / 1000 : 0;
  }

  stop() {
    return new Promise((resolve) => {
      if (!this.recorder || this.recorder.state === 'inactive') return resolve(null);
      const duration = this.now();
      this.recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.mimeType || 'video/webm' });
        resolve(blob.size ? { blob, mimeType: blob.type, duration } : null);
      };
      this.recorder.stop();
    });
  }

  cancel() {
    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.onstop = null;
      this.recorder.stop();
    }
    this.chunks = [];
  }
}
