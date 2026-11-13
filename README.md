# 🎬 YtbCaption Studio

A browser-based video caption overlay editor and exporter. Design animated caption banners (music playing cards, notification badges, logo overlays), preview them in real time over any video, and export a pixel-perfect MP4 — all inside the browser with no server or backend required.

---

## ✨ Features

- **Live Canvas Preview** — real-time 1280×720 canvas rendering of the video + caption overlay, updated on every frame via `requestAnimationFrame`.
- **Two Banner Styles**
  - `splitBracket` — split corner brackets that animate open/close (the default "Music Playing" look).
  - `classic` — a rounded badge / pill with optional background fill.
- **Rich Text Customization** — font family (7 Google Fonts), size, weight, color, text alignment, text stroke, and glow shadow.
- **Avatar / Logo Support** — upload a PNG/JPG, pick circle or rounded-square clipping, adjust size and overlap offset.
- **5 Entrance & Exit Animations** — `Split`, `Fold`, `Fade`, `Bounce`, `Glitch` with configurable speed per direction.
- **Timeline & Timing Controls** — visual scrubber, caption start-time and duration sliders, play/pause/reset.
- **Dual Export Engine**
  - **WebCodecs path (preferred)** — offline frame-accurate H.264 + AAC → real `.mp4` via `mp4-muxer`. No dropped frames; runs in Chrome / Edge / Safari 17+.
  - **MediaRecorder fallback** — real-time WebM recording with drift-corrected `requestAnimationFrame` clock, used automatically on Firefox or when WebCodecs is unavailable.
- **Cancellable Export** — an in-progress export can be cancelled at any time from the progress modal.
- **Reset to Defaults** — one-click button in the header restores the default configuration while preserving the currently loaded video and avatar.

---

## 🗂️ Project Structure

```
YtbCaption/
├── index.html                        # Vite HTML entry point; loads Google Fonts
├── vite.config.js                    # Vite + React plugin config (port 3000)
├── tailwind.config.js                # Tailwind CSS theme config
├── postcss.config.js                 # PostCSS / Autoprefixer
├── package.json                      # Dependencies & npm scripts
│
├── public/
│   └── sample_avatar.jpg             # Default avatar image (shipped as a static asset)
│
└── src/
    ├── main.jsx                      # React app entry — mounts <App /> to #root
    ├── index.css                     # Global CSS (Tailwind directives + custom scrollbar)
    │
    ├── App.jsx                       # Root component — holds all shared state and
    │                                 #   wires together every sub-component
    │
    ├── components/
    │   ├── Header.jsx                # Top navbar: app logo, Reset and Export buttons
    │   ├── VideoPreview.jsx          # Canvas element + hidden <video> + avatar <img>;
    │   │                             #   runs the rAF render loop for the live preview
    │   ├── Timeline.jsx              # Scrubber, play/pause/reset, total-duration input,
    │   │                             #   and caption start-time / duration sliders
    │   ├── ControlPanel.jsx          # 4-tab sidebar: Text, Banner, Avatar, Animation
    │   └── CanvasExporter.jsx        # Export progress / success / error modal overlay
    │
    └── utils/
        ├── canvasRenderer.js         # Core rendering engine — draws video frame, banner,
        │                             #   text, avatar, and all animation states to a 2D
        │                             #   canvas context on every frame
        └── exportVideo.js            # Dual-path video exporter:
                                      #   • exportViaWebCodecs  — H.264 + AAC → MP4
                                      #   • exportViaMediaRecorder — WebM fallback
```

### Key Files at a Glance

| File | Role |
|---|---|
| [`src/App.jsx`](src/App.jsx) | Central state store (`config`, playback, export state); dispatches all handler callbacks to children |
| [`src/utils/canvasRenderer.js`](src/utils/canvasRenderer.js) | Stateless pure render function called 60× / sec during preview and once per frame during export |
| [`src/utils/exportVideo.js`](src/utils/exportVideo.js) | Chooses WebCodecs or MediaRecorder at runtime; both paths call `renderCanvasFrame` to draw each frame |
| [`src/components/ControlPanel.jsx`](src/components/ControlPanel.jsx) | All user-facing style controls; updates the shared `config` object via `setConfig` |
| [`src/components/VideoPreview.jsx`](src/components/VideoPreview.jsx) | Owns the `<canvas>` and `<video>` DOM elements; drives the live preview loop |
| [`src/components/Timeline.jsx`](src/components/Timeline.jsx) | Controls `currentTime`, `startTime`, `duration`, and `totalDuration` |
| [`src/components/CanvasExporter.jsx`](src/components/CanvasExporter.jsx) | Modal that shows export progress bar, download link, or error message |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Install & Run

```bash
# Install dependencies
npm install

# Start the development server (http://localhost:3000)
npm run dev
```

### Build for Production

```bash
npm run build      # outputs to dist/
npm run preview    # locally preview the production build
```

---

## 🛠️ Tech Stack

| Tool | Purpose |
|---|---|
| [React 18](https://react.dev) | UI framework |
| [Vite 5](https://vitejs.dev) | Dev server & bundler |
| [Tailwind CSS 3](https://tailwindcss.com) | Utility-first styling |
| [Lucide React](https://lucide.dev) | Icon set |
| [mp4-muxer](https://github.com/Vanilagy/mp4-muxer) | Muxes WebCodecs-encoded H.264/AAC into a real `.mp4` container |
| **WebCodecs API** | Frame-accurate H.264 + AAC encoding directly in the browser |
| **MediaRecorder API** | Real-time WebM recording fallback for Firefox |

---

## 📄 License

MIT
