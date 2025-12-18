// ==============================
// PIXI APPLICATION
// ==============================

// ==============================
// SCROLLABLE TEST APP
// ==============================

const app = new PIXI.Application({
  backgroundColor: 0x000000,
  resizeTo: window,
  antialias: true
});
document.body.appendChild(app.view);

// ==============================
// CONSTANTS
// ==============================
const BASE_WIDTH = 400;
const BASE_HEIGHT = 850;
const BASE_RATIO = BASE_WIDTH / BASE_HEIGHT;

const FRAME_MARGIN = 20;
const OUTER_PADDING = 20;
const SCROLL_PADDING = 20;
const SCROLL_TOP_INSET = 20; // 🔑 NEW: forces content down
const INNER_PADDING = 20;
const CORNER_RADIUS = 30;

const INNER_COUNT = 5;
const INNER_SPACING = 30;
const ICON_SIZE = 80;

// ==============================
// ✏️ EDIT TEXT CONTENT HERE
// ==============================
const DESC_TEXTS = [
  "First box. Item one",
  "Item two two two",
  "Three's a crowd, another one?",
  "four four four, nobody likes you, nobody likes you, four four four",
  "five pounds"
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

// ==============================
// BASE CONTAINER
// ==============================
const baseContainer = new PIXI.Container();
app.stage.addChild(baseContainer);

const baseFrame = roundedRect(
  BASE_WIDTH,
  BASE_HEIGHT,
  CORNER_RADIUS,
  0xF2F2F2
);
baseContainer.addChild(baseFrame);

// ==============================
// OUTER FRAME
// ==============================
const outerFrame = new PIXI.Container();
outerFrame.x = FRAME_MARGIN;
outerFrame.y = FRAME_MARGIN;
baseContainer.addChild(outerFrame);

const outerWidth = BASE_WIDTH - FRAME_MARGIN * 2;
const outerHeight = BASE_HEIGHT - FRAME_MARGIN * 2;

const outerBg = roundedRect(
  outerWidth,
  outerHeight,
  CORNER_RADIUS,
  0xE0E0E0
);
outerFrame.addChild(outerBg);

// ==============================
// VIEWPORT MASK
// ==============================
const viewport = new PIXI.Graphics();
viewport.beginFill(0xffffff);
viewport.drawRoundedRect(
  OUTER_PADDING,
  OUTER_PADDING,
  outerWidth - OUTER_PADDING * 2,
  outerHeight - OUTER_PADDING * 2,
  CORNER_RADIUS
);
viewport.endFill();
outerFrame.addChild(viewport);

// ==============================
// SCROLL CONTAINER
// ==============================
const scrollContainer = new PIXI.Container();
scrollContainer.mask = viewport;
scrollContainer.x = OUTER_PADDING + SCROLL_PADDING;
scrollContainer.y = OUTER_PADDING + SCROLL_PADDING;
outerFrame.addChild(scrollContainer);

// ==============================
// VIEWPORT SIZE
// ==============================
const VIEWPORT_WIDTH =
  outerWidth - OUTER_PADDING * 2 - SCROLL_PADDING * 2;

const VIEWPORT_HEIGHT =
  outerHeight - OUTER_PADDING * 2 - SCROLL_PADDING * 2;

// Inner frames fill width
const INNER_WIDTH = VIEWPORT_WIDTH;
const INNER_HEIGHT = VIEWPORT_WIDTH;

// ==============================
// CREATE INNER FRAMES
// ==============================
let contentHeight = SCROLL_TOP_INSET; // 🔑 start lower
const innerFrames = [];

for (let i = 0; i < INNER_COUNT; i++) {
  const frame = new PIXI.Container();

  frame.x = INNER_WIDTH / 2;
  frame.y = contentHeight + INNER_HEIGHT / 2;

  // Background
  const bg = roundedRect(
    INNER_WIDTH,
    INNER_HEIGHT,
    CORNER_RADIUS,
    0xffffff
  );
  bg.pivot.set(INNER_WIDTH / 2);
  frame.addChild(bg);

  frame.eventMode = 'static';
  frame.cursor = 'pointer';

  // Hover shrink
  frame.on('pointerover', () => frame.scale.set(0.9));
  frame.on('pointerout', () => frame.scale.set(1));

  // Tap shake
  frame.on('pointertap', () => shake(frame));

  // Icon
  const icon = roundedRect(ICON_SIZE, ICON_SIZE, 20, 0xfff2ff);
  icon.x = -INNER_WIDTH / 2 + INNER_PADDING;
  icon.y = -INNER_HEIGHT / 2 + INNER_PADDING;
  frame.addChild(icon);

  // Description frame
  const descX = icon.x + ICON_SIZE + INNER_PADDING;
  const descY = -INNER_HEIGHT / 2 + INNER_PADDING;
  const descWidth =
    INNER_WIDTH - (ICON_SIZE + INNER_PADDING * 3);
  const descHeight =
    INNER_HEIGHT - INNER_PADDING * 2;

  const desc = roundedRect(descWidth, descHeight, 20, 0xEBEBEB);
  desc.x = descX;
  desc.y = descY;
  frame.addChild(desc);

  const text = new PIXI.Text(DESC_TEXTS[i] || "", {
    fill: 0x333333,
    fontSize: 14,
    wordWrap: true,
    wordWrapWidth: descWidth - 20
  });
  text.x = desc.x + 10;
  text.y = desc.y + 10;
  frame.addChild(text);

  // Slide-in setup
  frame.alpha = 0;
  frame.x = -INNER_WIDTH;

  scrollContainer.addChild(frame);
  innerFrames.push(frame);

  contentHeight += INNER_HEIGHT + INNER_SPACING;
}
contentHeight -= INNER_SPACING;

// ==============================
// SLIDE-IN ANIMATION
// ==============================
innerFrames.forEach((frame, i) => {
  let delay = i * 8;
  let t = 0;

  app.ticker.add(function slide() {
    t++;
    if (t < delay) return;

    frame.x += (INNER_WIDTH / 2 - frame.x) * 0.18;
    frame.alpha += 0.06;

    if (Math.abs(frame.x - INNER_WIDTH / 2) < 0.5) {
      frame.x = INNER_WIDTH / 2;
      frame.alpha = 1;
      app.ticker.remove(slide);
    }
  });
});
// ==============================
// SMOOTH SCROLLING + MOUSE WHEEL
// ==============================
let velocity = 0;
let dragging = false;
let lastY = 0;

const maxScrollY = 0;
const minScrollY = Math.min(
  0,
  VIEWPORT_HEIGHT - contentHeight - SCROLL_TOP_INSET
);

outerFrame.eventMode = 'static';

// Drag interaction
outerFrame.on('pointerdown', e => {
  dragging = true;
  velocity = 0;
  lastY = e.global.y;
});
outerFrame.on('pointerup', () => dragging = false);
outerFrame.on('pointerupoutside', () => dragging = false);
outerFrame.on('pointermove', e => {
  if (!dragging) return;
  const delta = e.global.y - lastY;
  scrollContainer.y += delta;
  velocity = delta;
  lastY = e.global.y;
});

// Mouse wheel (including middle mouse button scroll)
window.addEventListener('wheel', e => {
  // Normalize scroll direction (inverted to feel natural)
  const deltaY = e.deltaY;
  scrollContainer.y -= deltaY;
  // Update velocity for smooth inertia
  velocity = -deltaY * 0.7;
});

// Inertia + bounds
app.ticker.add(() => {
  if (!dragging) {
    scrollContainer.y += velocity;
    velocity *= 0.9;
  }

  if (scrollContainer.y > maxScrollY) {
    scrollContainer.y += (maxScrollY - scrollContainer.y) * 0.25;
    velocity = 0;
  }

  if (scrollContainer.y < minScrollY) {
    scrollContainer.y += (minScrollY - scrollContainer.y) * 0.25;
    velocity = 0;
  }
});

// ==============================
// SHAKE
// ==============================
function shake(target) {
  let i = 0;
  app.ticker.add(function shaker() {
    target.rotation = Math.sin(i * 0.5) * 0.05;
    i++;
    if (i > 20) {
      target.rotation = 0;
      app.ticker.remove(shaker);
    }
  });
}

// ==============================
// RESIZE
// ==============================
function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  const scale =
    w / h > BASE_RATIO
      ? h / BASE_HEIGHT
      : w / BASE_WIDTH;

  baseContainer.scale.set(scale);
  baseContainer.x = (w - BASE_WIDTH * scale) / 2;
  baseContainer.y = (h - BASE_HEIGHT * scale) / 2;
}

window.addEventListener('resize', resize);
resize();