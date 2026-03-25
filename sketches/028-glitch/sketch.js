// Title: Glitch
// Date: 2026-03-25
// Category: effect

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const SEED = parseInt(new URLSearchParams(window.location.search).get('seed')) || Date.now();

let baseImg;

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  baseImg = createGraphics(width, height);
  generateBase();
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function generateBase() {
  baseImg.background(9, 9, 11);
  baseImg.noStroke();

  // Grid of monospace characters as base texture
  baseImg.fill(50);
  baseImg.textSize(10);
  baseImg.textFont('monospace');
  baseImg.textAlign(CENTER, CENTER);
  for (let x = 0; x < width; x += 12) {
    for (let y = 0; y < height; y += 14) {
      if (noise(x * 0.01, y * 0.01) > 0.4) {
        const ch = String.fromCharCode(33 + Math.floor(Math.random() * 90));
        baseImg.fill(30 + noise(x * 0.005, y * 0.005) * 40);
        baseImg.text(ch, x + 6, y + 7);
      }
    }
  }
}

function draw() {
  image(baseImg, 0, 0);

  const intensity = map(mouseY, 0, height, 0, 1);
  const freq = map(mouseX, 0, width, 0.01, 0.3);

  if (intensity < 0.05) return;

  loadPixels();

  // Horizontal displacement glitches
  const numGlitches = Math.floor(intensity * 15);
  for (let g = 0; g < numGlitches; g++) {
    if (Math.random() > intensity * 0.6) continue;

    const glitchY = Math.floor(Math.random() * height);
    const glitchH = 1 + Math.floor(Math.random() * 8 * intensity);
    const shift = Math.floor((Math.random() - 0.5) * 80 * intensity);

    for (let y = glitchY; y < Math.min(height, glitchY + glitchH); y++) {
      for (let x = 0; x < width; x++) {
        const srcX = Math.max(0, Math.min(width - 1, x - shift));
        const dstI = (y * width + x) * 4;
        const srcI = (y * width + srcX) * 4;
        pixels[dstI] = pixels[srcI];
        pixels[dstI + 1] = pixels[srcI + 1];
        pixels[dstI + 2] = pixels[srcI + 2];
      }
    }
  }

  // Random bright blocks
  if (Math.random() < intensity * 0.3) {
    const bx = Math.floor(Math.random() * width);
    const by = Math.floor(Math.random() * height);
    const bw = 20 + Math.floor(Math.random() * 100 * intensity);
    const bh = 2 + Math.floor(Math.random() * 10);
    for (let y = by; y < Math.min(height, by + bh); y++) {
      for (let x = bx; x < Math.min(width, bx + bw); x++) {
        const pi = (y * width + x) * 4;
        pixels[pi] = 228;
        pixels[pi + 1] = 228;
        pixels[pi + 2] = 228;
      }
    }
  }

  // Static noise bursts
  if (Math.random() < intensity * 0.15) {
    const ny = Math.floor(Math.random() * height);
    const nh = 10 + Math.floor(Math.random() * 40);
    for (let y = ny; y < Math.min(height, ny + nh); y++) {
      for (let x = 0; x < width; x++) {
        if (Math.random() < 0.3) {
          const pi = (y * width + x) * 4;
          const v = Math.random() < 0.5 ? 0 : 180;
          pixels[pi] = v;
          pixels[pi + 1] = v;
          pixels[pi + 2] = v;
        }
      }
    }
  }

  updatePixels();
}

function mousePressed() { generateBase(); return false; }
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  baseImg.resizeCanvas(width, height);
  generateBase();
}
function touchStarted() { }
