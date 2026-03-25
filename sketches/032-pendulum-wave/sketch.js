// Title: Pendulum Wave
// Date: 2026-03-25
// Category: physics

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const SEED = parseInt(new URLSearchParams(window.location.search).get('seed')) || Date.now();

const NUM = isMobile ? 25 : 40;
const BASE_PERIOD = 60;

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  background(9, 9, 11, 25);

  const amplitude = height * 0.3;
  const spacing = width / (NUM + 1);
  const dampingOffset = map(mouseY, 0, height, 0, 0.5);
  const speedMod = map(mouseX, 0, width, 0.5, 2);

  stroke(228, 228, 220);
  noFill();

  for (let i = 0; i < NUM; i++) {
    const x = spacing * (i + 1);
    const period = BASE_PERIOD + i * (1 + dampingOffset);
    const angle = (frameCount * speedMod * TWO_PI) / period;
    const y = height / 2 + Math.sin(angle) * amplitude;

    // Thread
    strokeWeight(0.3);
    stroke(228, 228, 220, 30);
    line(x, 30, x, y);

    // Bob
    const speed = Math.abs(Math.cos(angle));
    const brightness = 60 + speed * 168;
    strokeWeight(0);
    fill(brightness, brightness, brightness * 0.95);
    circle(x, y, 6 + speed * 4);

    // Trail dot
    fill(brightness, brightness, brightness * 0.95, 15);
    circle(x, y, 2);
  }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function touchStarted() { }
