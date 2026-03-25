// Title: Cloth
// Date: 2026-03-25
// Category: physics

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

const COLS = isMobile ? 40 : 60;
const ROWS = isMobile ? 25 : 40;
const SPACING = isMobile ? 12 : 14;
const GRAVITY = 0.2;
const DAMPING = 0.99;
const STIFFNESS = 0.8;
const TEAR_DIST = SPACING * 3;
const ITERATIONS = 3;
const MOUSE_RADIUS = 30;

let points = [];
let sticks = [];
let dragging = null;

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  initCloth();
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function initCloth() {
  points = []; sticks = [];
  const startX = (width - (COLS - 1) * SPACING) / 2;
  const startY = 40;

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      points.push({
        x: startX + x * SPACING,
        y: startY + y * SPACING,
        px: startX + x * SPACING,
        py: startY + y * SPACING,
        pinned: y === 0 && x % 4 === 0,
      });
    }
  }

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (x < COLS - 1) sticks.push({ a: y * COLS + x, b: y * COLS + x + 1, len: SPACING, alive: true });
      if (y < ROWS - 1) sticks.push({ a: y * COLS + x, b: (y + 1) * COLS + x, len: SPACING, alive: true });
    }
  }
}

function draw() {
  background(0);

  for (const p of points) {
    if (p.pinned) continue;
    const vx = (p.x - p.px) * DAMPING;
    const vy = (p.y - p.py) * DAMPING;
    p.px = p.x;
    p.py = p.y;
    p.x += vx;
    p.y += vy + GRAVITY;
  }

  if (dragging !== null) {
    const p = points[dragging];
    p.x = mouseX;
    p.y = mouseY;
  }

  for (let iter = 0; iter < ITERATIONS; iter++) {
    for (const s of sticks) {
      if (!s.alive) continue;
      const a = points[s.a], b = points[s.b];
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > TEAR_DIST) { s.alive = false; continue; }
      if (dist === 0) continue;
      const diff = (s.len - dist) / dist * STIFFNESS * 0.5;
      const ox = dx * diff, oy = dy * diff;
      if (!a.pinned) { a.x -= ox; a.y -= oy; }
      if (!b.pinned) { b.x += ox; b.y += oy; }
    }
  }

  stroke(255, 60);
  strokeWeight(0.8);
  for (const s of sticks) {
    if (!s.alive) continue;
    const a = points[s.a], b = points[s.b];
    const dist = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
    const tension = dist / TEAR_DIST;
    const r = Math.floor(255 * tension);
    const g = Math.floor(255 * (1 - tension));
    stroke(r, g, 150, 150);
    line(a.x, a.y, b.x, b.y);
  }

  for (const p of points) {
    if (p.pinned) {
      fill(255, 100, 100);
      noStroke();
      circle(p.x, p.y, 4);
    }
  }
}

function mousePressed() {
  let closest = -1, closestDist = MOUSE_RADIUS;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const d = Math.sqrt((mouseX - p.x) ** 2 + (mouseY - p.y) ** 2);
    if (d < closestDist) { closest = i; closestDist = d; }
  }
  dragging = closest;
  return false;
}

function mouseReleased() { dragging = null; }

function doubleClicked() {
  for (const s of sticks) {
    if (!s.alive) continue;
    const a = points[s.a], b = points[s.b];
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const d = Math.sqrt((mouseX - mx) ** 2 + (mouseY - my) ** 2);
    if (d < 20) s.alive = false;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initCloth();
}

function touchStarted() {
  mousePressed();
  return false;
}

function touchEnded() { dragging = null; return false; }
