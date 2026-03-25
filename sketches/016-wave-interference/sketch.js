// Title: Wave Interference
// Date: 2026-03-25
// Category: physics

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

const RES = isMobile ? 4 : 2;
const WAVE_SPEED = 0.08;
const DECAY = 0.995;

let sources = [];

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);

  sources.push({ x: width * 0.3, y: height * 0.4, t: 0, freq: 0.05 });
  sources.push({ x: width * 0.7, y: height * 0.6, t: 0, freq: 0.06 });

  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  loadPixels();
  const w = width, h = height;
  const t = frameCount * WAVE_SPEED;

  for (let py = 0; py < h; py += RES) {
    for (let px = 0; px < w; px += RES) {
      let sum = 0;

      for (const s of sources) {
        const dx = px - s.x, dy = py - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const wave = Math.sin(dist * s.freq - t + s.t);
        const amp = 1 / (1 + dist * 0.005);
        sum += wave * amp;
      }

      // Mouse as moving source
      const mdx = px - mouseX, mdy = py - mouseY;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      sum += Math.sin(mDist * 0.07 - t) / (1 + mDist * 0.003);

      const v = (sum + 3) / 6;
      const r = Math.floor(Math.max(0, Math.min(255, v * 80)));
      const g = Math.floor(Math.max(0, Math.min(255, v * 160 + (sum > 0 ? sum * 40 : 0))));
      const b = Math.floor(Math.max(0, Math.min(255, v * 255)));

      for (let sx = 0; sx < RES && px + sx < w; sx++) {
        for (let sy = 0; sy < RES && py + sy < h; sy++) {
          const pi = ((py + sy) * w + (px + sx)) * 4;
          pixels[pi] = r; pixels[pi + 1] = g; pixels[pi + 2] = b; pixels[pi + 3] = 255;
        }
      }
    }
  }
  updatePixels();
}

function mousePressed() {
  sources.push({
    x: mouseX, y: mouseY,
    t: frameCount * WAVE_SPEED,
    freq: 0.04 + Math.random() * 0.04,
  });
  if (sources.length > 8) sources.shift();
  return false;
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function touchStarted() { }
