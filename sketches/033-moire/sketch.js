// Title: Moire
// Date: 2026-03-25
// Category: geometry

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const SEED = parseInt(new URLSearchParams(window.location.search).get('seed')) || Date.now();

const LINE_SPACING = isMobile ? 8 : 5;

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  background(9, 9, 11);

  const cx = width / 2, cy = height / 2;
  const angle1 = map(mouseX, 0, width, -0.15, 0.15);
  const angle2 = map(mouseY, 0, height, -0.1, 0.1);
  const autoAngle = frameCount * 0.002;

  stroke(228, 228, 228, 50);
  strokeWeight(0.8);

  // Layer 1: vertical lines, slightly rotated
  push();
  translate(cx, cy);
  rotate(angle1 + autoAngle);
  const diag = Math.sqrt(width * width + height * height);
  for (let x = -diag / 2; x < diag / 2; x += LINE_SPACING) {
    line(x, -diag / 2, x, diag / 2);
  }
  pop();

  // Layer 2: vertical lines, counter-rotated
  push();
  translate(cx, cy);
  rotate(-angle1 - autoAngle + 0.05);
  for (let x = -diag / 2; x < diag / 2; x += LINE_SPACING) {
    line(x, -diag / 2, x, diag / 2);
  }
  pop();

  // Layer 3: concentric circles centered on mouse
  stroke(228, 228, 228, 25);
  strokeWeight(0.5);
  noFill();
  const ringSpacing = LINE_SPACING * 1.5;
  for (let r = ringSpacing; r < diag; r += ringSpacing) {
    circle(mouseX, mouseY, r * 2);
  }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function touchStarted() { }
