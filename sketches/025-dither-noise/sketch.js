// Title: Dither Noise
// Date: 2026-03-25
// Category: effect

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const SEED = parseInt(new URLSearchParams(window.location.search).get('seed')) || Date.now();

const SCALE = isMobile ? 3 : 2;
let gw, gh;

function setup() {
  pixelDensity(1);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 25 : 40);
  gw = Math.ceil(width / SCALE);
  gh = Math.ceil(height / SCALE);
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  const t = frameCount * 0.005;
  const mx = mouseX / width;
  const my = mouseY / height;
  const noiseScale = 0.003 + mx * 0.01;

  loadPixels();

  // Generate grayscale from noise
  const gray = new Float32Array(gw * gh);
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      const n = noise(x * noiseScale, y * noiseScale, t);
      // Mouse proximity creates bright spot
      const dx = (x * SCALE - mouseX) / width;
      const dy = (y * SCALE - mouseY) / height;
      const md = Math.sqrt(dx * dx + dy * dy);
      const mouseBright = md < 0.2 ? (1 - md / 0.2) * 0.4 : 0;
      gray[x + y * gw] = Math.min(1, n + mouseBright);
    }
  }

  // Floyd-Steinberg dithering
  const dithered = new Float32Array(gray);
  for (let y = 0; y < gh - 1; y++) {
    for (let x = 1; x < gw - 1; x++) {
      const i = x + y * gw;
      const old = dithered[i];
      const val = old > (0.5 - my * 0.3) ? 1 : 0;
      dithered[i] = val;
      const err = old - val;
      dithered[x + 1 + y * gw] += err * 7 / 16;
      dithered[x - 1 + (y + 1) * gw] += err * 3 / 16;
      dithered[x + (y + 1) * gw] += err * 5 / 16;
      dithered[x + 1 + (y + 1) * gw] += err * 1 / 16;
    }
  }

  // Render
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      const v = dithered[x + y * gw] > 0.5 ? 228 : 9;
      for (let sx = 0; sx < SCALE && x * SCALE + sx < width; sx++) {
        for (let sy = 0; sy < SCALE && y * SCALE + sy < height; sy++) {
          const pi = ((y * SCALE + sy) * width + (x * SCALE + sx)) * 4;
          pixels[pi] = v;
          pixels[pi + 1] = v;
          pixels[pi + 2] = v;
          pixels[pi + 3] = 255;
        }
      }
    }
  }
  updatePixels();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  gw = Math.ceil(width / SCALE);
  gh = Math.ceil(height / SCALE);
}
function touchStarted() { }
