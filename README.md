# Cloudinary × Pretext reflow demo

Interactive demo: one surf image floats over the page; **whichever paragraph contains the image center** drives a **Cloudinary transformation URL**, while **Pretext** reflows each paragraph’s text around the bitmap as you drag.

## Demo video

Screen recording of the interaction:

<video src="./reflowing-demo.mov" controls muted playsinline width="960"></video>

Fallback link: [`reflowing-demo.mov`](./reflowing-demo.mov)

Open the file locally in QuickTime, VLC, or your browser if it supports `.mov` playback.

## What it shows

- **Single shared image** — `curricula-images/surf.jpg` on [Cloudinary](https://cloudinary.com/), delivered with different transformation chains.
- **No drop zones** — pointer-drag the image anywhere on the document; transform switches when the **center** of the image enters a new paragraph block.
- **Live text reflow** — [`@chenglou/pretext`](https://github.com/chenglou/pretext) `prepareWithSegments` + `layoutNextLine` lay out lines with a changing max width where the image overlaps each paragraph’s flow area (similar in spirit to demos like [The Editorial Engine](https://somnai-dreams.github.io/pretext-demos/the-editorial-engine.html)).
- **Two columns on wide viewports** — ten transformation paragraphs (five per column at `≥940px` width).

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (the app expects the dev server so ES modules and `node_modules` resolve).

Other scripts:

| Command | Purpose |
|--------|---------|
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the built `dist/` output |

## Project layout

| Path | Role |
|------|------|
| `index.html` | Page shell, typography, two-column grid |
| `src/main.js` | Pretext layout, drag logic, paragraph hit-test, Cloudinary URLs |
| `package.json` | Vite + `@chenglou/pretext` |
| `reflowing-demo.mov` | Demo recording |

## Tech stack

- [Vite](https://vitejs.dev/) — dev server and bundling  
- [Pretext](https://github.com/chenglou/pretext) — canvas-backed measurement, `layoutNextLine` for per-line widths  
- [Cloudinary](https://cloudinary.com/documentation/transformation_reference) — URL transformation strings  

## License

Depends on your choice for this repo; dependencies include MIT-licensed Pretext. Add a `LICENSE` file if you publish publicly.
