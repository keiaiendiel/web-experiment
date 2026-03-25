// Title: Boids
// Date: 2026-03-25
// Category: swarm

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

const NUM = isMobile ? 600 : 1500;
const PERCEPTION = 50;
const MAX_SPEED = 3;
const MAX_FORCE = 0.15;
const SEP_WEIGHT = 1.8;
const ALI_WEIGHT = 1.0;
const COH_WEIGHT = 1.0;
const MOUSE_RADIUS = 150;

let boids = [];
let gridCols, gridRows, grid;
const CELL = PERCEPTION;

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  colorMode(HSB, 360, 100, 100, 100);
  initGrid();
  for (let i = 0; i < NUM; i++) {
    boids.push({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - 0.5) * MAX_SPEED, vy: (Math.random() - 0.5) * MAX_SPEED,
    });
  }
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function initGrid() {
  gridCols = Math.ceil(width / CELL) + 1;
  gridRows = Math.ceil(height / CELL) + 1;
  grid = new Array(gridCols * gridRows);
}

function draw() {
  background(0, 30);

  for (let i = 0; i < grid.length; i++) grid[i] = [];
  for (let i = 0; i < boids.length; i++) {
    const b = boids[i];
    const cx = Math.floor(b.x / CELL);
    const cy = Math.floor(b.y / CELL);
    if (cx >= 0 && cx < gridCols && cy >= 0 && cy < gridRows) {
      grid[cx + cy * gridCols].push(i);
    }
  }

  for (const b of boids) {
    let sepX = 0, sepY = 0, sepN = 0;
    let aliX = 0, aliY = 0, aliN = 0;
    let cohX = 0, cohY = 0, cohN = 0;

    const cx = Math.floor(b.x / CELL);
    const cy = Math.floor(b.y / CELL);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const gx = cx + dx, gy = cy + dy;
        if (gx < 0 || gx >= gridCols || gy < 0 || gy >= gridRows) continue;
        const cell = grid[gx + gy * gridCols];
        for (const idx of cell) {
          const o = boids[idx];
          if (o === b) continue;
          const ddx = b.x - o.x, ddy = b.y - o.y;
          const d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < PERCEPTION && d > 0) {
            sepX += ddx / d / d; sepY += ddy / d / d; sepN++;
            aliX += o.vx; aliY += o.vy; aliN++;
            cohX += o.x; cohY += o.y; cohN++;
          }
        }
      }
    }

    let fx = 0, fy = 0;
    if (sepN > 0) { fx += (sepX / sepN) * SEP_WEIGHT; fy += (sepY / sepN) * SEP_WEIGHT; }
    if (aliN > 0) { fx += ((aliX / aliN - b.vx) * 0.05) * ALI_WEIGHT; fy += ((aliY / aliN - b.vy) * 0.05) * ALI_WEIGHT; }
    if (cohN > 0) { fx += ((cohX / cohN - b.x) * 0.001) * COH_WEIGHT; fy += ((cohY / cohN - b.y) * 0.001) * COH_WEIGHT; }

    const mdx = b.x - mouseX, mdy = b.y - mouseY;
    const md = Math.sqrt(mdx * mdx + mdy * mdy);
    if (md < MOUSE_RADIUS && md > 0) {
      const mf = (1 - md / MOUSE_RADIUS) * 2;
      fx += (mdx / md) * mf;
      fy += (mdy / md) * mf;
    }

    const fMag = Math.sqrt(fx * fx + fy * fy);
    if (fMag > MAX_FORCE) { fx = fx / fMag * MAX_FORCE; fy = fy / fMag * MAX_FORCE; }
    b.vx += fx; b.vy += fy;
    const sMag = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
    if (sMag > MAX_SPEED) { b.vx = b.vx / sMag * MAX_SPEED; b.vy = b.vy / sMag * MAX_SPEED; }
    b.x += b.vx; b.y += b.vy;

    if (b.x < 0) b.x += width; if (b.x > width) b.x -= width;
    if (b.y < 0) b.y += height; if (b.y > height) b.y -= height;

    const heading = Math.atan2(b.vy, b.vx);
    const hue = ((heading / Math.PI + 1) * 180) % 360;
    stroke(hue, 70, 90, 70);
    strokeWeight(2);
    point(b.x, b.y);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initGrid();
}

function touchStarted() { return false; }
