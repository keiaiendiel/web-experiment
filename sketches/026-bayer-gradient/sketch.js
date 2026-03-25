// Title: Bayer Gradient
// Date: 2026-03-25
// Category: effect

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const SEED = parseInt(new URLSearchParams(window.location.search).get('seed')) || Date.now();

const SCALE = isMobile ? 4 : 3;
const BAYER8 = [
   0,32, 8,40, 2,34,10,42,
  48,16,56,24,50,18,58,26,
  12,44, 4,36,14,46, 6,38,
  60,28,52,20,62,30,54,22,
   3,35,11,43, 1,33, 9,41,
  51,19,59,27,49,17,57,25,
  15,47, 7,39,13,45, 5,37,
  63,31,55,23,61,29,53,21,
];

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
  const t = frameCount * 0.008;
  const mx = mouseX / width;
  const my = mouseY / height;

  loadPixels();
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      // Animated gradient with noise
      const n = noise(x * 0.008, y * 0.008, t);
      const radial = Math.sqrt(((x / gw - mx) ** 2 + (y / gh - my) ** 2)) * 1.5;
      const value = Math.max(0, Math.min(1, n - radial * 0.4 + 0.3));

      // Bayer threshold
      const bx = x % 8, by = y % 8;
      const threshold = (BAYER8[by * 8 + bx] + 0.5) / 64;
      const dithered = value > threshold ? 1 : 0;

      const v = dithered ? 228 : 9;
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
