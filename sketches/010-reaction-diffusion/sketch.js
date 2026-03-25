// Title: Reaction Diffusion
// Date: 2026-03-25
// Category: growth

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

const SCALE = isMobile ? 4 : 2;
const STEPS = isMobile ? 5 : 10;
const DA = 1.0, DB = 0.5, DT = 1.0;

const PRESETS = [
  { name: 'coral', f: 0.0545, k: 0.062 },
  { name: 'mitosis', f: 0.0367, k: 0.0649 },
  { name: 'maze', f: 0.029, k: 0.057 },
  { name: 'spots', f: 0.035, k: 0.065 },
];
let preset = 0;

let gw, gh, gridA, gridB, nextA, nextB;

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 20 : 30);
  initGrid();
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function initGrid() {
  gw = Math.ceil(width / SCALE);
  gh = Math.ceil(height / SCALE);
  gridA = new Float32Array(gw * gh).fill(1);
  gridB = new Float32Array(gw * gh).fill(0);
  nextA = new Float32Array(gw * gh);
  nextB = new Float32Array(gw * gh);

  for (let i = 0; i < 15; i++) {
    const cx = Math.floor(Math.random() * gw);
    const cy = Math.floor(Math.random() * gh);
    const r = 3 + Math.floor(Math.random() * 5);
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        if (dx * dx + dy * dy > r * r) continue;
        const nx = (cx + dx + gw) % gw;
        const ny = (cy + dy + gh) % gh;
        gridB[nx + ny * gw] = 1;
      }
    }
  }
}

function laplacianA(x, y) {
  const i = x + y * gw;
  let sum = -gridA[i];
  sum += gridA[((x - 1 + gw) % gw) + y * gw] * 0.2;
  sum += gridA[((x + 1) % gw) + y * gw] * 0.2;
  sum += gridA[x + ((y - 1 + gh) % gh) * gw] * 0.2;
  sum += gridA[x + ((y + 1) % gh) * gw] * 0.2;
  sum += gridA[((x - 1 + gw) % gw) + ((y - 1 + gh) % gh) * gw] * 0.05;
  sum += gridA[((x + 1) % gw) + ((y - 1 + gh) % gh) * gw] * 0.05;
  sum += gridA[((x - 1 + gw) % gw) + ((y + 1) % gh) * gw] * 0.05;
  sum += gridA[((x + 1) % gw) + ((y + 1) % gh) * gw] * 0.05;
  return sum;
}

function laplacianB(x, y) {
  const i = x + y * gw;
  let sum = -gridB[i];
  sum += gridB[((x - 1 + gw) % gw) + y * gw] * 0.2;
  sum += gridB[((x + 1) % gw) + y * gw] * 0.2;
  sum += gridB[x + ((y - 1 + gh) % gh) * gw] * 0.2;
  sum += gridB[x + ((y + 1) % gh) * gw] * 0.2;
  sum += gridB[((x - 1 + gw) % gw) + ((y - 1 + gh) % gh) * gw] * 0.05;
  sum += gridB[((x + 1) % gw) + ((y - 1 + gh) % gh) * gw] * 0.05;
  sum += gridB[((x - 1 + gw) % gw) + ((y + 1) % gh) * gw] * 0.05;
  sum += gridB[((x + 1) % gw) + ((y + 1) % gh) * gw] * 0.05;
  return sum;
}

function draw() {
  const { f, k } = PRESETS[preset];

  for (let step = 0; step < STEPS; step++) {
    for (let x = 0; x < gw; x++) {
      for (let y = 0; y < gh; y++) {
        const i = x + y * gw;
        const a = gridA[i], b = gridB[i];
        const abb = a * b * b;
        nextA[i] = a + (DA * laplacianA(x, y) - abb + f * (1 - a)) * DT;
        nextB[i] = b + (DB * laplacianB(x, y) + abb - (k + f) * b) * DT;
        nextA[i] = Math.max(0, Math.min(1, nextA[i]));
        nextB[i] = Math.max(0, Math.min(1, nextB[i]));
      }
    }
    [gridA, nextA] = [nextA, gridA];
    [gridB, nextB] = [nextB, gridB];
  }

  if (mouseIsPressed) {
    const mx = Math.floor(mouseX / SCALE);
    const my = Math.floor(mouseY / SCALE);
    const r = 5;
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        if (dx * dx + dy * dy > r * r) continue;
        const nx = (mx + dx + gw) % gw;
        const ny = (my + dy + gh) % gh;
        gridB[nx + ny * gw] = 1;
      }
    }
  }

  loadPixels();
  for (let x = 0; x < gw; x++) {
    for (let y = 0; y < gh; y++) {
      const b = gridB[x + y * gw];
      const a = gridA[x + y * gw];
      const v = 1 - (a - b);
      const r = Math.floor(Math.max(0, Math.min(255, v * 180)));
      const g = Math.floor(Math.max(0, Math.min(255, v * 220 + b * 80)));
      const bl = Math.floor(Math.max(0, Math.min(255, v * 255)));

      for (let sx = 0; sx < SCALE && x * SCALE + sx < width; sx++) {
        for (let sy = 0; sy < SCALE && y * SCALE + sy < height; sy++) {
          const pi = ((y * SCALE + sy) * width + (x * SCALE + sx)) * 4;
          pixels[pi] = r;
          pixels[pi + 1] = g;
          pixels[pi + 2] = bl;
          pixels[pi + 3] = 255;
        }
      }
    }
  }
  updatePixels();
}

function mousePressed() {
  return false;
}

function keyPressed() {
  if (key === 'p' || key === 'P') {
    preset = (preset + 1) % PRESETS.length;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initGrid();
}

function touchStarted() { return false; }
