// Title: Erode
// Date: 2026-03-25
// Category: effect

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const SEED = parseInt(new URLSearchParams(window.location.search).get('seed')) || Date.now();

const RES = isMobile ? 3 : 2;
let gw, gh, surface;

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  initSurface();
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function initSurface() {
  gw = Math.ceil(width / RES);
  gh = Math.ceil(height / RES);
  surface = new Float32Array(gw * gh);
  for (let x = 0; x < gw; x++) {
    for (let y = 0; y < gh; y++) {
      surface[x + y * gw] = noise(x * 0.01, y * 0.01) > 0.35 ? 1 : 0;
    }
  }
}

function draw() {
  const erosionRate = map(mouseY, 0, height, 0.001, 0.02);
  const rebuildRate = map(mouseX, 0, width, 0, 0.005);

  // Erosion: cells adjacent to empty space lose material
  const next = new Float32Array(surface);
  for (let x = 1; x < gw - 1; x++) {
    for (let y = 1; y < gh - 1; y++) {
      const i = x + y * gw;
      if (surface[i] < 0.01) continue;

      let emptyNeighbors = 0;
      if (surface[i - 1] < 0.1) emptyNeighbors++;
      if (surface[i + 1] < 0.1) emptyNeighbors++;
      if (surface[i - gw] < 0.1) emptyNeighbors++;
      if (surface[i + gw] < 0.1) emptyNeighbors++;

      if (emptyNeighbors > 0) {
        next[i] -= erosionRate * emptyNeighbors * (0.5 + Math.random() * 0.5);
      }

      // Mouse accelerates erosion
      const dx = x * RES - mouseX, dy = y * RES - mouseY;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 80) {
        next[i] -= (1 - d / 80) * 0.03;
      }
    }
  }

  // Rebuild: noise-driven regrowth
  if (rebuildRate > 0.001) {
    const t = frameCount * 0.01;
    for (let x = 0; x < gw; x++) {
      for (let y = 0; y < gh; y++) {
        const i = x + y * gw;
        if (next[i] < 0.5 && noise(x * 0.02, y * 0.02, t) > 0.6) {
          next[i] += rebuildRate;
        }
      }
    }
  }

  for (let i = 0; i < next.length; i++) {
    next[i] = Math.max(0, Math.min(1, next[i]));
  }
  surface = next;

  // Render
  loadPixels();
  for (let x = 0; x < gw; x++) {
    for (let y = 0; y < gh; y++) {
      const v = surface[x + y * gw];
      const brightness = Math.floor(v * 200 + v * v * 28);
      for (let sx = 0; sx < RES && x * RES + sx < width; sx++) {
        for (let sy = 0; sy < RES && y * RES + sy < height; sy++) {
          const pi = ((y * RES + sy) * width + (x * RES + sx)) * 4;
          pixels[pi] = brightness;
          pixels[pi + 1] = brightness;
          pixels[pi + 2] = brightness;
          pixels[pi + 3] = 255;
        }
      }
    }
  }
  updatePixels();
}

function mousePressed() { initSurface(); return false; }
function windowResized() { resizeCanvas(windowWidth, windowHeight); initSurface(); }
function touchStarted() { }
