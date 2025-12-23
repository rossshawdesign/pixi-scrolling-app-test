// ==============================
// PIXI APPLICATION
// ==============================
const app = new PIXI.Application({
  backgroundColor: 0x000000,
  resizeTo: window,
  antialias: true
});
document.body.appendChild(app.view);

app.stage.eventMode = "static";
app.stage.hitArea = app.screen;
app.stage.sortableChildren = true;

// ==============================
// CONSTANTS
// ==============================
const BASE_WIDTH = 400;
const BASE_HEIGHT = 850;
const BASE_RATIO = BASE_WIDTH / BASE_HEIGHT;

const FRAME_MARGIN = 20;
const OUTER_PADDING = 20;
const SCROLL_PADDING = 20;
const SCROLL_TOP_INSET = 20;
const INNER_PADDING = 20;
const CORNER_RADIUS = 30;

const INNER_COUNT = 5;
const INNER_SPACING = 30;
const ICON_SIZE = 80;

// 🎨 PALETTE
const COL_RED    = { r: 255, g: 135, b: 135 }; // FF8787
const COL_ORANGE = { r: 255, g: 194, b: 123 }; // FFC27B
const COL_YELLOW = { r: 255, g: 239, b: 125 }; // FFEF7D
const COL_GREEN  = { r: 143, g: 234, b: 145 }; // 8FEA91

const ORANGE = 0xFFC27B;

// ==============================
// EDITABLE TEXT (SCREEN 2)
// ==============================
const DESC_TEXTS = [
  "Editable text for inner frame 1.",
  "Editable text for inner frame 2.",
  "Editable text for inner frame 3.",
  "Editable text for inner frame 4.",
  "Editable text for inner frame 5."
];

// ==============================
// UTILITY
// ==============================
function roundedRect(w, h, r, color) {
  const g = new PIXI.Graphics();
  g.beginFill(color);
  g.drawRoundedRect(0, 0, w, h, r);
  g.endFill();
  return g;
}

function rgbToHex(r, g, b) {
  return ((r << 16) + (g << 8) + b) | 0;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// ==============================
// BASE + OUTER FRAME
// ==============================
const baseContainer = new PIXI.Container();
app.stage.addChild(baseContainer);

const baseFrame = roundedRect(BASE_WIDTH, BASE_HEIGHT, CORNER_RADIUS, 0xF2F2F2);
baseContainer.addChild(baseFrame);

const outerFrame = new PIXI.Container();
outerFrame.x = FRAME_MARGIN;
outerFrame.y = FRAME_MARGIN;
baseContainer.addChild(outerFrame);

const outerWidth = BASE_WIDTH - FRAME_MARGIN * 2;
const outerHeight = BASE_HEIGHT - FRAME_MARGIN * 2;

const outerBg = roundedRect(outerWidth, outerHeight, CORNER_RADIUS, 0xE0E0E0);
outerFrame.addChild(outerBg);

// ==============================
// SCREENS
// ==============================
const screen1 = new PIXI.Container();
const screen2 = new PIXI.Container();
outerFrame.addChild(screen1, screen2);
screen2.visible = false;

// ======================================================
// SCREEN 1 — SLIDER + CTA
// ======================================================
const centerBox = roundedRect(
  outerWidth - OUTER_PADDING * 2,
  300,
  30,
  0xD9D9D9
);
centerBox.x = OUTER_PADDING;
centerBox.y = (outerHeight - 300) / 2;
screen1.addChild(centerBox);

// Title
const titleText = new PIXI.Text("Initial Screen CTA", {
  fill: 0x333333,
  fontFamily: "Boldonse",
  fontSize: 16
});
titleText.anchor.set(0.5);
titleText.x = outerWidth / 2;
titleText.y = centerBox.y + 40;
screen1.addChild(titleText);

// ==============================
// SLIDER
// ==============================
const sliderTrackWidth = centerBox.width - 80;
const sliderTrack = roundedRect(sliderTrackWidth, 50, 25, 0xBDBDBD);
sliderTrack.x = centerBox.x + 40;
sliderTrack.y = centerBox.y + 120;
screen1.addChild(sliderTrack);

// Handle shadow
const handleShadow = new PIXI.Graphics();
handleShadow.beginFill(0x000000, 0.2);
handleShadow.drawCircle(0, 0, 35);
handleShadow.endFill();
screen1.addChild(handleShadow);

// Handle
const handle = new PIXI.Graphics();
handle.beginFill(ORANGE);
handle.drawCircle(0, 0, 35);
handle.endFill();
handle.eventMode = "static";
handle.cursor = "pointer";
screen1.addChild(handle);

const sliderMinX = sliderTrack.x;
const sliderMaxX = sliderTrack.x + sliderTrackWidth;
const sliderCenterX = (sliderMinX + sliderMaxX) / 2;

handle.x = sliderCenterX;
handle.y = sliderTrack.y + 25;
handleShadow.x = handle.x;
handleShadow.y = handle.y + 6;

let sliderDragging = false;
let sliderMoved = false;
let grabOffsetX = 0;
let idleShake = true;
let idleT = 0;

// ==============================
// SMOOTH SLIDER HUE UPDATE
// ==============================
function updateHandleHue() {
  if (!sliderDragging) return;
  const t = (handle.x - sliderMinX) / (sliderMaxX - sliderMinX);

  let r, g, b;

  if (t <= 0.5) {
    const k = t * 2;
    r = lerp(COL_RED.r, COL_ORANGE.r, k);
    g = lerp(COL_RED.g, COL_ORANGE.g, k);
    b = lerp(COL_RED.b, COL_ORANGE.b, k);
  } else if (t <= 0.75) {
    const k = (t - 0.5) * 4;
    r = lerp(COL_ORANGE.r, COL_YELLOW.r, k);
    g = lerp(COL_ORANGE.g, COL_YELLOW.g, k);
    b = lerp(COL_ORANGE.b, COL_YELLOW.b, k);
  } else {
    const k = (t - 0.75) * 4;
    r = lerp(COL_YELLOW.r, COL_GREEN.r, k);
    g = lerp(COL_YELLOW.g, COL_GREEN.g, k);
    b = lerp(COL_YELLOW.b, COL_GREEN.b, k);
  }

  handle.clear();
  handle.beginFill(rgbToHex(r, g, b));
  handle.drawCircle(0, 0, 35);
  handle.endFill();
}

// Idle shake
app.ticker.add(() => {
  if (!idleShake || sliderDragging) return;
  idleT += 0.2;
  handle.x = sliderCenterX + Math.sin(idleT) * 2;
  handleShadow.x = handle.x;
  handle.clear();
  handle.beginFill(ORANGE);
  handle.drawCircle(0, 0, 35);
  handle.endFill();
});

// Drag
handle.on("pointerdown", e => {
  sliderDragging = true;
  grabOffsetX = e.global.x - handle.x;
  idleShake = false;
});

app.stage.on("pointerup", () => sliderDragging = false);

app.stage.on("pointermove", e => {
  if (!sliderDragging) return;
  let x = e.global.x - grabOffsetX;
  x = Math.max(sliderMinX, Math.min(sliderMaxX, x));
  handle.x = x;
  handleShadow.x = x;
  updateHandleHue();
  if (!sliderMoved) {
    sliderMoved = true;
    activateCTA();
  }
});

// ==============================
// CTA BUTTON
// ==============================
const ctaContainer = new PIXI.Container();
ctaContainer.x = outerWidth / 2;
ctaContainer.y = sliderTrack.y + 100;
ctaContainer.pivot.set(100, 25);
ctaContainer.eventMode = "static";
ctaContainer.cursor = "pointer";
screen1.addChild(ctaContainer);

const ctaBg = roundedRect(200, 50, 25, 0xEBEBEB);
ctaContainer.addChild(ctaBg);

const ctaText = new PIXI.Text("CTA confirm", {
  fill: 0xAAAAAA,
  fontFamily: "Boldonse",
  fontSize: 14
});
ctaText.anchor.set(0.5);
ctaText.x = 100;
ctaText.y = 25;
ctaContainer.addChild(ctaText);

let ctaTicker = null;
function activateCTA() {
  ctaBg.clear();
  ctaBg.beginFill(ORANGE);
  ctaBg.drawRoundedRect(0, 0, 200, 50, 25);
  ctaBg.endFill();
  ctaText.style.fill = 0xffffff;

  let t = 0;
  ctaTicker = () => {
    t += 0.2;
    ctaContainer.rotation = Math.sin(t) * (1 * Math.PI / 180);
  };
  app.ticker.add(ctaTicker);
}

ctaContainer.on("pointerdown", () => ctaContainer.scale.set(0.9));
ctaContainer.on("pointerup", () => ctaContainer.scale.set(1));
ctaContainer.on("pointerout", () => ctaContainer.scale.set(1));

ctaContainer.on("pointertap", () => {
  if (!sliderMoved) return;
  screen1.visible = false;
  screen2.visible = true;
  animateInners();
});

// ======================================================
// SCREEN 2 — SCROLLABLE INNER FRAMES
// ======================================================
const viewport = roundedRect(
  outerWidth - OUTER_PADDING * 2,
  outerHeight - OUTER_PADDING * 2,
  CORNER_RADIUS,
  0xffffff
);
viewport.x = OUTER_PADDING;
viewport.y = OUTER_PADDING;
viewport.eventMode = "static";
screen2.addChild(viewport);

const scrollContainer = new PIXI.Container();
scrollContainer.mask = viewport;
scrollContainer.x = OUTER_PADDING + SCROLL_PADDING;
scrollContainer.y = OUTER_PADDING + SCROLL_PADDING + SCROLL_TOP_INSET;
screen2.addChild(scrollContainer);

const INNER_WIDTH = outerWidth - OUTER_PADDING * 2 - SCROLL_PADDING * 2;
let contentHeight = 0;
const innerFrames = [];

for (let i = 0; i < INNER_COUNT; i++) {
  const frame = new PIXI.Container();
  frame.eventMode = "static";
  frame.cursor = "pointer";

  const bg = roundedRect(INNER_WIDTH, INNER_WIDTH, 30, 0xD9D9D9);
  bg.pivot.set(bg.width / 2);
  frame.addChild(bg);

  frame.x = INNER_WIDTH / 2;
  frame.y = contentHeight + bg.height / 2;

  const icon = roundedRect(ICON_SIZE, ICON_SIZE, 20, 0xffffff);
  icon.x = -INNER_WIDTH / 2 + INNER_PADDING;
  icon.y = -INNER_WIDTH / 2 + INNER_PADDING;
  frame.addChild(icon);

  const descWidth = INNER_WIDTH - ICON_SIZE - INNER_PADDING * 3;
  const desc = roundedRect(
    descWidth,
    INNER_WIDTH - INNER_PADDING * 2,
    20,
    0xEBEBEB
  );
  desc.x = icon.x + ICON_SIZE + INNER_PADDING;
  desc.y = icon.y;
  frame.addChild(desc);

  const text = new PIXI.Text(DESC_TEXTS[i], {
    fill: 0x333333,
    fontFamily: "Boldonse",
    fontSize: 14,
    wordWrap: true,
    wordWrapWidth: descWidth - 40,
    lineHeight: 20
  });
  text.x = desc.x + 20;
  text.y = desc.y + 20;
  frame.addChild(text);

  frame.on("pointerover", () => frame.scale.set(0.9));
  frame.on("pointerout", () => frame.scale.set(1));

  frame.on("pointertap", () => {
    let r = 0;
    const shake = () => {
      r += 0.3;
      frame.rotation = Math.sin(r) * 0.05;
      if (r > 6) {
        frame.rotation = 0;
        app.ticker.remove(shake);
      }
    };
    app.ticker.add(shake);
  });

  frame.alpha = 0;
  frame.x = -INNER_WIDTH;

  scrollContainer.addChild(frame);
  innerFrames.push(frame);
  contentHeight += bg.height + INNER_SPACING;
}
contentHeight -= INNER_SPACING;

function animateInners() {
  innerFrames.forEach((f, i) => {
    let delay = i * 8;
    let t = 0;
    app.ticker.add(function slide() {
      t++;
      if (t < delay) return;
      f.x += (INNER_WIDTH / 2 - f.x) * 0.2;
      f.alpha += 0.08;
      if (Math.abs(f.x - INNER_WIDTH / 2) < 0.5) {
        f.x = INNER_WIDTH / 2;
        f.alpha = 1;
        app.ticker.remove(slide);
      }
    });
  });
}

// ==============================
// SCROLLING
// ==============================
let dragging = false;
let lastY = 0;
let velocity = 0;
const VIEWPORT_HEIGHT = outerHeight - OUTER_PADDING * 2 - SCROLL_PADDING * 2;
const maxScrollY = scrollContainer.y;
const minScrollY = maxScrollY + VIEWPORT_HEIGHT - contentHeight;

viewport.on("pointerdown", e => {
  dragging = true;
  lastY = e.global.y;
  velocity = 0;
});
app.stage.on("pointerup", () => dragging = false);
app.stage.on("pointermove", e => {
  if (!dragging) return;
  const dy = e.global.y - lastY;
  scrollContainer.y += dy;
  velocity = dy;
  lastY = e.global.y;
});
window.addEventListener("wheel", e => {
  scrollContainer.y -= e.deltaY * 0.6;
  velocity = -e.deltaY * 0.3;
});
app.ticker.add(() => {
  if (!dragging) scrollContainer.y += velocity;
  velocity *= 0.9;
  if (scrollContainer.y > maxScrollY)
    scrollContainer.y += (maxScrollY - scrollContainer.y) * 0.3;
  if (scrollContainer.y < minScrollY)
    scrollContainer.y += (minScrollY - scrollContainer.y) * 0.3;
});

// ==============================
// RESET BUTTON
// ==============================
const resetBtn = new PIXI.Container();
resetBtn.x = OUTER_PADDING + 20;
resetBtn.y = OUTER_PADDING + 20;
resetBtn.zIndex = 9999;
resetBtn.eventMode = "static";
resetBtn.cursor = "pointer";
screen2.addChild(resetBtn);

const resetBg = roundedRect(40, 40, 20, 0xEBEBEB);
resetBtn.addChild(resetBg);

const arrow = new PIXI.Graphics();
arrow.lineStyle(3, 0x333333);
arrow.moveTo(24, 10);
arrow.lineTo(14, 20);
arrow.lineTo(24, 30);
resetBtn.addChild(arrow);

resetBtn.hitArea = new PIXI.Rectangle(0, 0, 40, 40);

resetBtn.on("pointertap", () => {
  screen2.visible = false;
  screen1.visible = true;
  scrollContainer.y = OUTER_PADDING + SCROLL_PADDING + SCROLL_TOP_INSET;
  handle.x = sliderCenterX;
  handleShadow.x = handle.x;
  sliderMoved = false;
  idleShake = true;
  idleT = 0;

  ctaBg.clear();
  ctaBg.beginFill(0xEBEBEB);
  ctaBg.drawRoundedRect(0, 0, 200, 50, 25);
  ctaBg.endFill();
  ctaText.style.fill = 0xAAAAAA;
  ctaContainer.rotation = 0;
  ctaContainer.scale.set(1);
  if (ctaTicker) app.ticker.remove(ctaTicker);
});

// ==============================
// RESIZE
// ==============================
function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const scale = w / h > BASE_RATIO ? h / BASE_HEIGHT : w / BASE_WIDTH;
  baseContainer.scale.set(scale);
  baseContainer.x = (w - BASE_WIDTH * scale) / 2;
  baseContainer.y = (h - BASE_HEIGHT * scale) / 2;
}
window.addEventListener("resize", resize);
resize();