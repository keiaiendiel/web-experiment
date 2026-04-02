// Title: Grid Distort
// Date: 2026-03-25
// Category: geometry

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const SEED = parseInt(new URLSearchParams(window.location.search).get('seed')) || Date.now();

const SPACING = isMobile ? 24 : 16;
const DOT_SIZE = 2;
const DISTORT_RADIUS = 200;
const DISTORT_STRENGTH = 40;

function setup() {
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  background(9, 9, 11);
  const t = frameCount * 0.005;

  noStroke();
  const cols = Math.ceil(width / SPACING) + 1;
  const rows = Math.ceil(height / SPACING) + 1;

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const baseX = col * SPACING;
      const baseY = row * SPACING;

      // Mouse distortion
      const dx = baseX - mouseX;
      const dy = baseY - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let offsetX = 0, offsetY = 0;

      if (dist < DISTORT_RADIUS && dist > 0) {
        const force = (1 - dist / DISTORT_RADIUS);
        const angle = Math.atan2(dy, dx);
        offsetX = Math.cos(angle) * force * DISTORT_STRENGTH;
        offsetY = Math.sin(angle) * force * DISTORT_STRENGTH;
      }

      // Subtle noise drift
      const nx = (noise(col * 0.1, row * 0.1, t) - 0.5) * 3;
      const ny = (noise(col * 0.1 + 100, row * 0.1, t) - 0.5) * 3;

      const x = baseX + offsetX + nx;
      const y = baseY + offsetY + ny;

      const distortion = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
      const brightness = 40 + distortion * 4;
      const size = DOT_SIZE + distortion * 0.05;

      fill(brightness, brightness, brightness);
      circle(x, y, size);
    }
  }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function touchStarted() { }
