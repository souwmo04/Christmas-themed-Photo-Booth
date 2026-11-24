# 🎄 Christmas Photo Booth

A free Christmas photo booth that runs in your browser on **laptops and phones**.
Step into the booth, follow a pose prompt for every shot, pick a filter, and take home
a classic photo strip plus a video where your photos pop onto the clip.

Everything happens on your device. No sign-up, no uploads.

**Live site:** https://souwmo04.github.io/Christmas-themed-Photo-Booth/

## Features

- 🎞️ **Guided poses**: a script title and an instruction for every shot, with a 3-2-1 countdown
- 📚 **9 pose sets**: Christmas Story, Classic Strip, Besties, Mistletoe Date, Family Christmas, Silly Faces, Cozy Night In, Christmas Party, Dear Santa
- 🎶 **8 carol lyric sets** (traditional, public-domain carols): Jingle Bells, Deck the Halls, We Wish You a Merry Christmas, Silent Night, Twelve Days of Christmas, Up on the Housetop, Joy to the World, O Christmas Tree. Each line of the song is the title, with a pose that acts it out
- 🎨 **17 filters**: Classic B&W, Vintage, Candy Cane, Frosty, Warm Glow, Film Noir, Gingerbread, Hot Cocoa, Golden Hour, Mistletoe, Polaroid, Pine Forest, Silent Night, Silver Bells, Tinsel Pop, Retro 90s, No filter
- 🧾 **Photo strips** with 13 designs (Candy cane, White, Red velvet, Snowflakes, Black, Tartan, Gingham, Fairy lights, Gift wrap, Holly, Gingerbread, Starry night, Film strip), your own caption and the date
- 🎬 **Video edit**: the session recording with each photo dropping in, ending on your strip
- 💾 **Save**: strip (PNG, print-ready 2×6"), single photos (JPG), video (MP4 or WebM)
- 📱 **Phone friendly**: Save buttons download straight to your phone, a Share button sends to WhatsApp/Instagram or "Save to Photos", front/back camera switch
- 🔍 **Real 0.5x zoom** on phones that allow it: uses the camera's wide zoom or ultra-wide lens (hidden when the phone doesn't share it with the browser)
- ⚡ **Flash on/off**: the phone flashlight on the back camera, or a bright "screen flash" for selfies and laptops
- ↺ Retake the last shot, finish early, mute sounds, mirror the selfie camera

## Tips

- Open the link in **Safari or Chrome**. Inside Instagram/TikTok the camera is usually blocked.
- Allow camera access when the browser asks.
- Keep the tab open while the video is being made.

## Run it yourself

```bash
npm install
npm run dev          # http://localhost:5173
npm run dev:phone    # https on your Wi-Fi so a phone can use the camera
npm run build        # production build in dist/
```

For `dev:phone`, open the `https://192.168.x.x:5173` address it prints on your phone
and accept the "not private" warning (it's your own computer's test certificate).

## Deploying

Every push to `main` builds and deploys to GitHub Pages through
`.github/workflows/deploy.yml`. One-time setup: in the repo go to
**Settings → Pages → Source** and choose **GitHub Actions**.

## Tech

Vanilla JavaScript + Vite, `getUserMedia` for the camera, Canvas 2D for filters and strips,
`MediaRecorder` for video. No runtime dependencies. See [PLAN.md](PLAN.md) for the full plan.

## Editing poses

All pose text lives in [`src/data/poses.js`](src/data/poses.js). Change a title or
instruction there, no other code needed.
