// Title: Breathing Grid
// Date: 2026-03-25
// Category: geometry

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

const SPACING = isMobile ? 28 : 22;
const MAX_RADIUS = SPACING * 0.4;
const WAVE_SPEED = 0.03;
const WAVE_DECAY = 0.003;
const NOISE_SCALE = 0.005;

let cols, rows;

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  cols = Math.ceil(width / SPACING) + 1;
  rows = Math.ceil(height / SPACING) + 1;
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  background(0);
  const t = frameCount * 0.02;
  const mx = mouseX, my = mouseY;

  noStroke();
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const x = col * SPACING + SPACING / 2;
      const y = row * SPACING + SPACING / 2;

      const dx = x - mx, dy = y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const mouseInfluence = Math.max(0, 1 - dist * WAVE_DECAY);
      const wave = Math.sin(dist * WAVE_SPEED - t * 3) * mouseInfluence;

      const n = noise(col * NOISE_SCALE * 50, row * NOISE_SCALE * 50, t);
      const baseSize = (0.2 + n * 0.3) * MAX_RADIUS;
      const size = baseSize + wave * MAX_RADIUS * 0.8;
      const finalSize = Math.max(0.5, size);

      const brightness = Math.floor(40 + mouseInfluence * 150 + n * 60);
      const blue = Math.floor(brightness * 1.2);
      const green = Math.floor(brightness * 0.7);

      fill(Math.floor(brightness * 0.5), green, Math.min(255, blue));
      circle(x, y, finalSize * 2);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cols = Math.ceil(width / SPACING) + 1;
  rows = Math.ceil(height / SPACING) + 1;
}

function touchStarted() { }
