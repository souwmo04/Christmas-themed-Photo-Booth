# 🎄 Christmas Photo Booth — Project Plan

A free, browser-based Christmas photo booth that works on **laptops and phones**.
You step into a virtual booth, follow fun pose prompts for each shot, pick a filter,
and download your photo strip (and a video version where the photos pop onto the
live recording, like the viral edits).

No app to install, no account, no server. Photos never leave your device.

---

## 1. Goals

| # | Goal | Why |
|---|------|-----|
| 1 | Works on laptop **and** phone (Android + iPhone) | Friends will open the link on whatever they have |
| 2 | Guided poses for every shot | Removes the "what do I do?" moment and makes strips look planned |
| 3 | Several filters | Black & white classic, plus warmer festive looks |
| 4 | Download the photo strip | The main thing people want to keep and post |
| 5 | Download a video version | The viral "photos overlaid on the video" edit |
| 6 | Easy to share | One public link (GitHub Pages) |
| 7 | Private by default | Everything happens in the browser; nothing is uploaded |

### Not in scope (for now)
- User accounts or a gallery saved online
- Printing service / payments
- Native mobile apps

---

## 2. Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Language | **Vanilla JavaScript (ES modules)** + HTML + CSS | No framework needed for a 4-screen app; small, fast on phones, easy for a friend to read |
| Build tool | **Vite** | Instant dev server, `--host` lets you test on your phone over Wi-Fi, tiny production build |
| Camera | **`navigator.mediaDevices.getUserMedia`** | Built into every modern browser on laptop and phone |
| Photo capture & filters | **HTML Canvas 2D** (`ctx.filter` + manual pixel fallback) | Bakes the filter into the saved image, not just the preview |
| Video recording | **`MediaRecorder`** on a canvas stream (`canvas.captureStream()`) | Records the live session with filter + overlays drawn in |
| Video format | WebM (Chrome/Android/Firefox), MP4 (Safari/iPhone) – picked automatically with `MediaRecorder.isTypeSupported` | Each browser supports a different format |
| Downloads | `canvas.toBlob` → `<a download>`; **Web Share API** (`navigator.share` with files) on phones | On iPhone, "Share → Save Image" is the only reliable way to save to Photos |
| Fonts | Google Fonts: a script font for titles + a clean sans for UI | Matches the handwritten look from the reels |
| Hosting | **GitHub Pages**, deployed by a GitHub Actions workflow | Free, HTTPS (required for camera access), one link to share |
| Code quality | Prettier formatting, small modules, no dependencies at runtime | Easy to maintain |

### Why not React / Next.js?
The app has only a few screens and most work happens on a `<canvas>`. A framework
would add weight on phones without making the camera or recording code simpler.

### Browser support
| Browser | Photos | Video export |
|---------|--------|--------------|
| Chrome / Edge (laptop) | ✅ | ✅ WebM |
| Firefox (laptop) | ✅ | ✅ WebM |
| Safari (Mac) | ✅ | ✅ MP4 |
| Chrome (Android) | ✅ | ✅ WebM |
| Safari (iPhone, iOS 16+) | ✅ | ✅ MP4 |
| In-app browsers (Instagram/TikTok) | ⚠️ camera often blocked | Show a banner: "Open in Safari/Chrome" |

---

## 3. User Flow

```
┌────────────┐   ┌──────────────┐   ┌────────────────┐   ┌──────────────┐   ┌──────────────┐
│ 1. Welcome │ → │ 2. Setup     │ → │ 3. Shoot       │ → │ 4. Develop   │ → │ 5. Result    │
│ booth with │   │ layout,      │   │ 8 shots with   │   │ strip slides │   │ download     │
│ curtain    │   │ filter,      │   │ countdown +    │   │ out of the   │   │ strip/video, │
│ "Enter"    │   │ camera allow │   │ pose prompts   │   │ booth slot   │   │ retake       │
└────────────┘   └──────────────┘   └────────────────┘   └──────────────┘   └──────────────┘
```

### Screen details

**1. Welcome**
- Illustrated booth: red velvet curtain, checkered floor, fairy lights, falling snow.
- Big "Step inside" button. Tapping it opens the curtain.

**2. Setup**
- Choose a **layout**: classic 4-shot strip, or 8 shots (two strips).
- Choose a **filter** (live preview).
- Choose **front/back camera** on phones.
- Toggle **"Record video"** on/off.
- Browser asks for camera permission here, with a short note on why.

**3. Shoot**
- Live camera inside a rounded white "booth window" frame.
- Top: `LEAVE` button and `POSE 3 OF 8` counter.
- Above the camera: the **pose title** in a script font.
- Below the camera: the **pose instruction** in small text.
- 3-2-1 countdown, white flash, shutter sound (can be muted).
- Bottom: row of thumbnail boxes that fill in as each shot is taken.
- Option to **retake** the last shot.

**4. Develop**
- Short animation: the strip slides out of a slot, like a real booth.

**5. Result**
- Shows the finished strip(s).
- Buttons: **Download strip (PNG)**, **Download video**, **Download single photos (ZIP-free: one by one)**, **Share**, **Retake**.
- Can still change the filter here — the strip re-renders instantly.

---

## 4. Poses (one per shot)

Original, festive pose prompts. Each has a script **title** (shown above the camera)
and an **instruction** (shown below).

### 8-shot "Christmas Story" set (default)

| Shot | Title | Instruction |
|------|-------|-------------|
| 1 | *ready, set, jingle* | Big smile, look straight at the camera |
| 2 | *who's on the nice list?* | Point at yourself with both thumbs |
| 3 | *oops, naughty list* | Cover your mouth like you got caught |
| 4 | *cold outside* | Hug yourself and pretend to shiver |
| 5 | *under the mistletoe* | Blow a kiss (or make a heart with your hands) |
| 6 | *unwrapping the gift* | Open your mouth wide in fake surprise |
| 7 | *one more cookie* | Pretend to sneak a bite of something |
| 8 | *merry & bright* | Peace sign, head tilt, best smile |

### 4-shot "Classic Strip" set

| Shot | Title | Instruction |
|------|-------|-------------|
| 1 | *hello, winter* | Wave at the camera |
| 2 | *snow day* | Look up like snow is falling on you |
| 3 | *cozy mode* | Rest your chin on your hands, soft smile |
| 4 | *see you next year* | Wink and point at the camera |

### "Besties" set (for 2+ people, 4 shots)

| Shot | Title | Instruction |
|------|-------|-------------|
| 1 | *the squad* | Squeeze together, everyone smile |
| 2 | *secret santa* | One person whispers in the other's ear |
| 3 | *gift exchange* | Pretend to hand each other a present |
| 4 | *chaos mode* | Everyone pulls their silliest face |

> Pose sets live in one data file (`src/data/poses.js`), so adding or editing
> poses means changing text only, no code.

---

## 5. Filters

Every filter is applied to the live preview **and** baked into the saved photos/video.

| Filter | Look | How |
|--------|------|-----|
| **Classic B&W** | Old booth, high contrast | `grayscale(1) contrast(1.3) brightness(1.05)` |
| **Vintage** | Faded, warm, slightly washed | `sepia(0.45) contrast(0.95) saturate(0.8)` + grain |
| **Candy Cane** | Bright, punchy reds | `saturate(1.4) contrast(1.1)` + slight red tint |
| **Frosty** | Cool blue winter | `hue-rotate(-10deg) saturate(0.8) brightness(1.1)` + blue overlay |
| **Warm Glow** | Fireplace warmth | `sepia(0.2) saturate(1.2) brightness(1.05)` + orange vignette |
| **Film Noir** | Very dark B&W, strong shadows | `grayscale(1) contrast(1.7) brightness(0.9)` + vignette |
| **None** | Original colours | — |

**Safari note:** older Safari ignores `ctx.filter`. A small pixel-processing fallback
(grayscale, sepia, contrast, brightness, saturate, tint) runs instead, so filters
still work on iPhone.

Extras applied on top of the filter:
- Film grain (optional)
- Soft vignette
- Mirror (front camera previews mirrored; saved photo can be mirrored or not)

---

## 6. Photo Strip Design

- **Classic strip:** 600 × 1800 px, 4 photos stacked, white or cream paper.
- **Double strip:** two strips side by side for 8 shots.
- **Border themes:** plain white, candy-cane stripe, red velvet, snowflakes.
- **Footer:** date + short text (editable, e.g. "Christmas 2026 ✨").
- Exported as **PNG** at 2× resolution for sharp printing (fits a 2×6 inch print).

---

## 7. Video Export (the viral overlay edit)

1. When shooting starts, a hidden canvas draws every camera frame (with filter)
   and `MediaRecorder` records it.
2. At each shutter moment, the frame time is saved.
3. After the session, a "rendering" step replays the recording onto a canvas and,
   at each saved moment, **drops that photo on top of the video** as a small
   polaroid that stays on screen, building up the strip.
4. The final clip ends on the full strip for 2 seconds.
5. Recording is re-encoded with `MediaRecorder` → downloadable file.

Size target: under 15 MB for a ~30-second clip (vertical 720 × 1280, 30 fps).

**No music is added** (copyrighted songs can't be bundled). People can add a song
themselves in Instagram/TikTok when they post.

---

## 8. Laptop & Phone Support

| Topic | Plan |
|-------|------|
| Layout | Mobile-first CSS; booth window fills the screen on phones, centered card on laptop |
| Orientation | Portrait layout; landscape on phones shows a "rotate your phone" hint |
| Camera | Front camera by default; switch button on phones with 2 cameras |
| Touch | Large buttons (min 48 px), no hover-only actions |
| HTTPS | Camera only works on HTTPS → GitHub Pages provides it; Vite dev uses `--host` + basic SSL plugin for phone testing |
| iPhone saving | Use Web Share API so users can "Save Image" / "Save Video" to Photos |
| Performance | Cap camera at 1280×720, draw at 30 fps, release camera when leaving the booth |
| Errors | Friendly messages for: permission denied, no camera, in-app browser, unsupported recording |

---

## 9. Project Structure

```
Christmas-themed-Photo-Booth/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── favicon.svg
│   └── sounds/shutter.mp3
├── src/
│   ├── main.js              # app start, screen switching
│   ├── styles/
│   │   ├── base.css         # colours, fonts, reset
│   │   ├── booth.css        # welcome + curtain
│   │   ├── shoot.css        # capture screen
│   │   └── result.css       # strip + buttons
│   ├── screens/
│   │   ├── welcome.js
│   │   ├── setup.js
│   │   ├── shoot.js
│   │   └── result.js
│   ├── camera/
│   │   ├── camera.js        # getUserMedia, switch camera, stop
│   │   └── recorder.js      # MediaRecorder wrapper, format detection
│   ├── render/
│   │   ├── filters.js       # filter list + Safari fallback
│   │   ├── strip.js         # builds the photo strip canvas
│   │   └── overlayVideo.js  # builds the viral overlay video
│   ├── data/
│   │   └── poses.js         # all pose sets
│   └── utils/
│       ├── download.js      # download + share helpers
│       └── device.js        # phone / in-app browser detection
├── .github/workflows/deploy.yml   # auto-deploy to GitHub Pages
├── PLAN.md
└── README.md
```

---

## 10. Build Milestones

| Phase | What gets built | Done when |
|-------|-----------------|-----------|
| **0. Setup** | Vite project, folder structure, base styles, fonts, deploy workflow | Empty page live on GitHub Pages |
| **1. Welcome booth** | Curtain, lights, snow, "Step inside" | Opens smoothly on phone and laptop |
| **2. Camera** | Permission flow, live preview, camera switch, error states | Preview works on Chrome, Safari, Android, iPhone |
| **3. Shooting** | Countdown, flash, pose titles/instructions, thumbnails, retake | Can take a full 4 or 8 shot session |
| **4. Filters** | All 7 filters + Safari fallback + grain/vignette | Filter looks identical in preview and saved file |
| **5. Strip** | Strip layouts, borders, footer text | PNG strip downloads correctly |
| **6. Downloads** | PNG download, single photos, Web Share on phones | Saving works on iPhone and Android |
| **7. Video** | Recording + overlay render + export | Video downloads and plays on both phone types |
| **8. Polish** | Sounds, animations, accessibility, loading states | Lighthouse score 90+ on mobile |
| **9. Launch** | README with link + screenshots | Link shared with friends 🎉 |

---

## 11. Testing Checklist

- [ ] Laptop: Chrome, Edge, Firefox, Safari
- [ ] Android phone: Chrome
- [ ] iPhone: Safari
- [ ] Camera permission denied → friendly message + retry
- [ ] No camera connected → message
- [ ] Opened inside Instagram → "open in browser" banner
- [ ] 4-shot and 8-shot sessions complete
- [ ] Every filter: preview matches download
- [ ] Strip PNG opens and prints at 2×6 inch
- [ ] Video plays after download on both phone types
- [ ] Rotating phone mid-session doesn't break anything
- [ ] Leaving the booth turns the camera light off

---

## 12. Privacy

- Photos and videos are processed **only in the browser**.
- Nothing is uploaded, stored on a server, or tracked.
- Camera stops as soon as you leave the booth or close the tab.

---

## 13. Sharing

- Live site: `https://souwmo04.github.io/Christmas-themed-Photo-Booth/` (after Phase 0)
- Anyone with the link can use it — no sign-up.
- Must be opened in a real browser (Safari/Chrome), not inside Instagram's in-app browser.
