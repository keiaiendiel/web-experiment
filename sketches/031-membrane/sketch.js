// Title: Membrane
// Date: 2026-03-25
// Category: physics

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const SEED = parseInt(new URLSearchParams(window.location.search).get('seed')) || Date.now();

const SPACING = isMobile ? 16 : 10;
const DAMPING = 0.97;
const TENSION = 0.3;
const MOUSE_FORCE = 5;

let cols, rows, current, previous;

function setup() {
  pixelDensity(1);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  initGrid();
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function initGrid() {
  cols = Math.ceil(width / SPACING) + 1;
  rows = Math.ceil(height / SPACING) + 1;
  current = new Float32Array(cols * rows);
  previous = new Float32Array(cols * rows);
}

function draw() {
  background(9, 9, 11);

  // Mouse creates ripple
  const mx = Math.floor(mouseX / SPACING);
  const my = Math.floor(mouseY / SPACING);
  if (mx > 0 && mx < cols - 1 && my > 0 && my < rows - 1) {
    current[mx + my * cols] += MOUSE_FORCE;
  }

  // Wave equation
  const next = new Float32Array(cols * rows);
  for (let x = 1; x < cols - 1; x++) {
    for (let y = 1; y < rows - 1; y++) {
      const i = x + y * cols;
      const laplacian = (
        current[i - 1] + current[i + 1] +
        current[i - cols] + current[i + cols]
      ) / 4 - current[i];

      next[i] = (2 * current[i] - previous[i] + TENSION * laplacian) * DAMPING;
    }
  }
  previous = current;
  current = next;

  // Render as wireframe grid
  stroke(228, 228, 228);
  noFill();

  // Horizontal lines
  for (let y = 0; y < rows; y++) {
    beginShape();
    for (let x = 0; x < cols; x++) {
      const i = x + y * cols;
      const v = current[i];
      const brightness = Math.min(228, 30 + Math.abs(v) * 100);
      stroke(brightness, brightness, brightness, 60 + Math.abs(v) * 80);
      strokeWeight(0.5 + Math.abs(v) * 0.3);
      vertex(x * SPACING, y * SPACING + v * 3);
    }
    endShape();
  }

  // Vertical lines
  for (let x = 0; x < cols; x++) {
    beginShape();
    for (let y = 0; y < rows; y++) {
      const i = x + y * cols;
      const v = current[i];
      stroke(228, 228, 228, 30 + Math.abs(v) * 60);
      strokeWeight(0.3 + Math.abs(v) * 0.2);
      vertex(x * SPACING, y * SPACING + v * 3);
    }
    endShape();
  }
}

function mousePressed() {
  const mx = Math.floor(mouseX / SPACING);
  const my = Math.floor(mouseY / SPACING);
  if (mx > 0 && mx < cols - 1 && my > 0 && my < rows - 1) {
    current[mx + my * cols] += 20;
  }
  return false;
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); initGrid(); }
function touchStarted() { }
