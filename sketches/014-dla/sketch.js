// Title: DLA
// Date: 2026-03-25
// Category: growth

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

const CELL = isMobile ? 3 : 2;
const WALKERS_PER_FRAME = isMobile ? 30 : 80;
const STEPS_PER_WALKER = 500;

let gw, gh, grid, colorGrid, particleCount;
let maxRadius;

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  colorMode(HSB, 360, 100, 100);
  initGrid();
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function initGrid() {
  gw = Math.ceil(width / CELL);
  gh = Math.ceil(height / CELL);
  grid = new Uint8Array(gw * gh);
  colorGrid = new Float32Array(gw * gh);
  particleCount = 0;
  maxRadius = 2;

  const cx = Math.floor(gw / 2);
  const cy = Math.floor(gh / 2);
  grid[cx + cy * gw] = 1;
  colorGrid[cx + cy * gw] = 0;
  particleCount = 1;
}

function hasNeighbor(x, y) {
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < gw && ny >= 0 && ny < gh && grid[nx + ny * gw]) return true;
    }
  }
  return false;
}

function draw() {
  const cx = Math.floor(gw / 2), cy = Math.floor(gh / 2);
  const spawnR = maxRadius + 10;
  const killR = spawnR + 30;

  for (let w = 0; w < WALKERS_PER_FRAME; w++) {
    const angle = Math.random() * TWO_PI;
    let wx = Math.floor(cx + Math.cos(angle) * spawnR);
    let wy = Math.floor(cy + Math.sin(angle) * spawnR);

    for (let s = 0; s < STEPS_PER_WALKER; s++) {
      const dir = Math.floor(Math.random() * 4);
      if (dir === 0) wx++;
      else if (dir === 1) wx--;
      else if (dir === 2) wy++;
      else wy--;

      if (wx < 0 || wx >= gw || wy < 0 || wy >= gh) break;

      const dist = Math.sqrt((wx - cx) ** 2 + (wy - cy) ** 2);
      if (dist > killR) break;

      if (hasNeighbor(wx, wy) && !grid[wx + wy * gw]) {
        grid[wx + wy * gw] = 1;
        colorGrid[wx + wy * gw] = particleCount;
        particleCount++;
        if (dist > maxRadius) maxRadius = dist;
        break;
      }
    }
  }

  background(0);
  loadPixels();
  for (let x = 0; x < gw; x++) {
    for (let y = 0; y < gh; y++) {
      if (!grid[x + y * gw]) continue;
      const hue = (colorGrid[x + y * gw] * 0.3) % 360;
      const rgb = hsvToRgb(hue / 360, 0.7, 0.9);
      for (let sx = 0; sx < CELL && x * CELL + sx < width; sx++) {
        for (let sy = 0; sy < CELL && y * CELL + sy < height; sy++) {
          const pi = ((y * CELL + sy) * width + (x * CELL + sx)) * 4;
          pixels[pi] = rgb[0]; pixels[pi + 1] = rgb[1]; pixels[pi + 2] = rgb[2]; pixels[pi + 3] = 255;
        }
      }
    }
  }
  updatePixels();
}

function mousePressed() {
  const gx = Math.floor(mouseX / CELL);
  const gy = Math.floor(mouseY / CELL);
  if (gx >= 0 && gx < gw && gy >= 0 && gy < gh) {
    grid[gx + gy * gw] = 1;
    colorGrid[gx + gy * gw] = particleCount++;
  }
  return false;
}

function hsvToRgb(h, s, v) {
  let r, g, b;
  const i = Math.floor(h * 6), f = h * 6 - i;
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break; case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break; case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break; case 5: r = v; g = p; b = q; break;
  }
  return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); initGrid(); }
function touchStarted() { mousePressed(); return false; }
