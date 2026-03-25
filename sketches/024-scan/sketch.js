// Title: Scan
// Date: 2026-03-25
// Category: effect

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const SEED = parseInt(new URLSearchParams(window.location.search).get('seed')) || Date.now();

let scanY = 0;
let noiseField;

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  noiseField = new Float32Array(width * height);
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  const t = frameCount * 0.003;
  const scanSpeed = map(mouseX, 0, width, 0.5, 4);
  scanY = (scanY + scanSpeed) % height;

  loadPixels();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const n = noise(x * 0.005, y * 0.005, t);
      const distFromScan = Math.abs(y - scanY);
      const scanDist2 = Math.abs(y - (scanY - height));
      const minScanDist = Math.min(distFromScan, scanDist2);

      let brightness = 0;

      // Revealed area (above scan line)
      const revealed = y < scanY ? 1 : 0;
      if (revealed) {
        const age = (scanY - y) / height;
        brightness = n * 40 * (1 - age * 0.8);
      }

      // Scan line glow
      if (minScanDist < 30) {
        const scanBright = (1 - minScanDist / 30);
        const amber = scanBright * scanBright;
        const pi = (y * width + x) * 4;
        const r = Math.floor(brightness + 201 * amber);
        const g = Math.floor(brightness + 168 * amber);
        const b = Math.floor(brightness + 76 * amber * 0.5);
        pixels[pi] = Math.min(255, r);
        pixels[pi + 1] = Math.min(255, g);
        pixels[pi + 2] = Math.min(255, b);
        pixels[pi + 3] = 255;
        continue;
      }

      // Mouse proximity glow
      const mdx = x - mouseX, mdy = y - mouseY;
      const md = Math.sqrt(mdx * mdx + mdy * mdy);
      if (md < 150) {
        brightness += (1 - md / 150) * 30 * n;
      }

      const v = Math.max(0, Math.min(255, Math.floor(brightness)));
      const pi = (y * width + x) * 4;
      pixels[pi] = v;
      pixels[pi + 1] = v;
      pixels[pi + 2] = v;
      pixels[pi + 3] = 255;
    }
  }
  updatePixels();

  // Scan line indicator
  stroke(201, 168, 76, 180);
  strokeWeight(1);
  line(0, scanY, width, scanY);
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function touchStarted() { }
