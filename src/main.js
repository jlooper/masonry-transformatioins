import { layoutNextLine, prepareWithSegments } from "@chenglou/pretext";

const BASE_URL = "https://res.cloudinary.com/cloudinary-creators-community/image/upload";
const PUBLIC_ID = "curricula-images/surf.jpg";
const BASE_FRAGMENT = "f_auto/q_auto";
const FONT = "24px Arial";
const LINE_HEIGHT = 36;

const paragraphs = [
  {
    title: "Auto Subject Crop",
    transform: "c_auto,g_auto,w_520/f_auto/q_auto",
    text:
      "Automatic cropping and gravity create a punchier composition by zooming into the most interesting visual area of the frame.",
  },
  {
    title: "Round Hero Crop",
    transform: "c_fill,g_auto,h_280,w_280/r_max/f_auto/q_auto",
    text:
      "A large circular crop turns the image into a bold badge-style visual that immediately changes the layout tone.",
  },
  {
    title: "Tilted Reframe",
    transform: "a_-25/b_rgb:0f172a,c_pad,h_340,w_460/f_auto/q_auto",
    text:
      "A sharp rotation with padded framing keeps the full tilted image visible while still delivering a high-energy editorial look.",
  },
  {
    title: "Neon Colorize",
    transform: "co_rgb:ff4d00,e_colorize:65/f_auto/q_auto",
    text:
      "Colorize with a saturated orange qualifier pushes the image toward poster-art territory with a synthetic glow.",
  },
  {
    title: "Graphic Blackwhite",
    transform: "e_blackwhite/f_auto/q_auto",
    text:
      "High-contrast black and white strips out color detail and emphasizes shape, texture, and dramatic lighting.",
  },
  {
    title: "Vintage Sepia",
    transform: "e_sepia/f_auto/q_auto",
    text:
      "Sepia applies a cinematic warm cast and gives the image an intentionally nostalgic, archival look.",
  },
  {
    title: "Cartoonify",
    transform: "e_cartoonify/f_auto/q_auto",
    text:
      "Cartoonify pushes edges and flat color regions for a stylized, illustrated effect with strong visual character.",
  },
  {
    title: "Outline Glow",
    transform: "co_rgb:22d3ee,e_outline:outer:15:200/f_auto/q_auto",
    text:
      "Outline draws a high-contrast edge around visible contours, creating a graphic neon-rim effect over the original image.",
  },
  {
    title: "Vector Poster",
    transform: "e_vectorize/f_auto/q_auto",
    text:
      "Vectorize simplifies edges and color boundaries, producing a poster-like graphic treatment with hard contours.",
  },
  {
    title: "Heavy Blur",
    transform: "e_blur:1400/f_auto/q_auto",
    text:
      "A strong blur destroys fine detail and creates an abstract color field that still preserves overall composition.",
  },
];

const paragraphsRoot = document.getElementById("paragraphs");

/** @type {Array<{ el: HTMLElement; flowArea: HTMLElement; flowHost: HTMLElement; prepared: import("@chenglou/pretext").PreparedTextWithSegments; transform: string }>} */
const paragraphApis = [];

function cloudinaryUrl(fragment) {
  return `${BASE_URL}/${fragment}/${PUBLIC_ID}`;
}

function rectsOverlap(a, b) {
  return !(a.bottom <= b.top || a.top >= b.bottom || a.right <= b.left || a.left >= b.right);
}

function lineWidthAtY(y, areaW, imageLeft, imageTop, imageW, imageH) {
  const lineBottom = y + LINE_HEIGHT;
  const full = Math.max(80, areaW);
  if (lineBottom <= imageTop || y >= imageTop + imageH) return { left: 0, width: full };
  const gap = 10;
  const leftRun = imageLeft - gap;
  const rightStart = imageLeft + imageW + gap;
  const rightRun = areaW - rightStart;
  if (leftRun >= rightRun && leftRun > 90) return { left: 0, width: leftRun };
  if (rightRun > 90) return { left: rightStart, width: rightRun };
  return { left: 0, width: Math.max(90, full * 0.5) };
}

function reflowParagraph(api, imgRect) {
  const area = api.flowArea;
  const hostFlow = api.flowHost;
  hostFlow.replaceChildren();

  const flowRect = area.getBoundingClientRect();
  const hasOverlap = imgRect && rectsOverlap(imgRect, flowRect);

  let imageLeft = 0;
  let imageTop = 0;
  let imageW = 0;
  let imageH = 0;

  if (hasOverlap && imgRect) {
    imageLeft = imgRect.left - flowRect.left;
    imageTop = imgRect.top - flowRect.top;
    imageW = imgRect.width;
    imageH = imgRect.height;
  }

  let y = 2;
  let cursor = { segmentIndex: 0, graphemeIndex: 0 };
  for (let i = 0; i < 500; i++) {
    const lane = lineWidthAtY(y, area.clientWidth, imageLeft, imageTop, imageW, imageH);
    const line = layoutNextLine(api.prepared, cursor, lane.width);
    if (!line) break;
    const span = document.createElement("span");
    span.className = "flow-line";
    span.textContent = line.text;
    span.style.top = `${y}px`;
    span.style.left = `${lane.left}px`;
    span.style.width = `${Math.ceil(line.width)}px`;
    span.style.font = FONT;
    span.style.lineHeight = `${LINE_HEIGHT}px`;
    hostFlow.appendChild(span);
    cursor = line.end;
    y += LINE_HEIGHT;
  }
  area.style.minHeight = `${Math.max(120, y + 10)}px`;
}

/** Paragraph whose bounding box contains the center of the image (document order). */
function paragraphUnderImageCenter(imgRect) {
  const cx = imgRect.left + imgRect.width / 2;
  const cy = imgRect.top + imgRect.height / 2;
  for (const api of paragraphApis) {
    const r = api.el.getBoundingClientRect();
    if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) return api;
  }
  return null;
}

function applyTransformAndHighlight(imgRect) {
  const hit = paragraphUnderImageCenter(imgRect);
  const fragment = hit ? hit.transform : BASE_FRAGMENT;
  sharedImg.src = cloudinaryUrl(fragment);
  for (const api of paragraphApis) {
    api.el.classList.toggle("active", hit === api);
  }
}

function reflowAll(imgRect) {
  for (const api of paragraphApis) {
    reflowParagraph(api, imgRect);
  }
}

const sharedImg = document.createElement("img");
sharedImg.className = "shared-image";
sharedImg.alt = "Surf demo image";
sharedImg.src = cloudinaryUrl(BASE_FRAGMENT);
sharedImg.draggable = false;

function scrollBounds() {
  const el = document.documentElement;
  const w = Math.max(el.scrollWidth, document.body.scrollWidth);
  const h = Math.max(el.scrollHeight, document.body.scrollHeight);
  return { w, h };
}

function clampImagePosition() {
  const imgW = sharedImg.offsetWidth;
  const imgH = sharedImg.offsetHeight;
  const { w: docW, h: docH } = scrollBounds();
  let left = parseFloat(sharedImg.style.left) || 0;
  let top = parseFloat(sharedImg.style.top) || 0;
  left = Math.max(0, Math.min(left, Math.max(0, docW - imgW)));
  top = Math.max(0, Math.min(top, Math.max(0, docH - imgH)));
  sharedImg.style.left = `${left}px`;
  sharedImg.style.top = `${top}px`;
}

function placeImageInitially() {
  const main = document.querySelector("main");
  if (main) {
    const r = main.getBoundingClientRect();
    const left = r.right - sharedImg.offsetWidth - 24 + window.scrollX;
    const top = r.top + 100 + window.scrollY;
    sharedImg.style.left = `${Math.max(8, left)}px`;
    sharedImg.style.top = `${Math.max(8, top)}px`;
  } else {
    sharedImg.style.left = `${Math.max(16, window.innerWidth * 0.55)}px`;
    sharedImg.style.top = `${Math.max(80, 120)}px`;
  }
  clampImagePosition();
}

function makeParagraph(item) {
  const el = document.createElement("article");
  el.className = "transform-paragraph";
  const title = document.createElement("h2");
  title.textContent = item.title;
  const transform = document.createElement("code");
  transform.textContent = item.transform;
  const flowArea = document.createElement("div");
  flowArea.className = "flow-area";
  const flowHost = document.createElement("div");
  flowHost.className = "flow-host";
  flowArea.appendChild(flowHost);
  el.appendChild(title);
  el.appendChild(transform);
  el.appendChild(flowArea);
  paragraphsRoot.appendChild(el);

  const prepared = prepareWithSegments(item.text, FONT);
  const api = { el, flowArea, flowHost, prepared, transform: item.transform };
  paragraphApis.push(api);
  return api;
}

paragraphs.forEach(makeParagraph);
document.body.appendChild(sharedImg);
requestAnimationFrame(() => {
  placeImageInitially();
  scheduleSync();
});

let dragRaf = 0;
function scheduleSync() {
  if (dragRaf) return;
  dragRaf = requestAnimationFrame(() => {
    dragRaf = 0;
    clampImagePosition();
    const r = sharedImg.getBoundingClientRect();
    applyTransformAndHighlight(r);
    reflowAll(r);
  });
}

sharedImg.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  e.preventDefault();
  sharedImg.setPointerCapture(e.pointerId);
  const br = sharedImg.getBoundingClientRect();
  const docLeft = br.left + window.scrollX;
  const docTop = br.top + window.scrollY;
  const grabX = e.pageX - docLeft;
  const grabY = e.pageY - docTop;

  const onMove = (ev) => {
    const left = ev.pageX - grabX;
    const top = ev.pageY - grabY;
    sharedImg.style.left = `${left}px`;
    sharedImg.style.top = `${top}px`;
    scheduleSync();
  };

  const onUp = (ev) => {
    sharedImg.releasePointerCapture(ev.pointerId);
    sharedImg.removeEventListener("pointermove", onMove);
    sharedImg.removeEventListener("pointerup", onUp);
    sharedImg.removeEventListener("pointercancel", onUp);
    scheduleSync();
  };

  sharedImg.addEventListener("pointermove", onMove);
  sharedImg.addEventListener("pointerup", onUp);
  sharedImg.addEventListener("pointercancel", onUp);
});

window.addEventListener("resize", () => {
  clampImagePosition();
  const r = sharedImg.getBoundingClientRect();
  applyTransformAndHighlight(r);
  reflowAll(r);
});

window.addEventListener(
  "scroll",
  () => {
    const r = sharedImg.getBoundingClientRect();
    applyTransformAndHighlight(r);
    reflowAll(r);
  },
  { passive: true, capture: true }
);
