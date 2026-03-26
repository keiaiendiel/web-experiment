// Title: Recursive Tree
// Date: 2026-03-25
// Category: growth

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

const MAX_DEPTH = isMobile ? 9 : 12;

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  background(0);
  const baseAngle = map(mouseY, 0, height, PI / 8, PI / 3);
  const wind = map(mouseX, 0, width, -0.15, 0.15);
  const t = frameCount * 0.01;

  translate(width / 2, height);
  stroke(255);
  drawBranch(height * 0.25, baseAngle, wind, t, 0);
}

function drawBranch(len, baseAngle, wind, t, depth) {
  if (depth > MAX_DEPTH || len < 2) return;

  const sw = map(depth, 0, MAX_DEPTH, 4, 0.5);
  const brightness = map(depth, 0, MAX_DEPTH, 255, 80);
  const noiseVal = noise(depth * 0.3, t + depth * 0.1);
  const wobble = (noiseVal - 0.5) * 0.1;

  strokeWeight(sw);
  stroke(brightness, brightness * 0.9, brightness * 0.8, 200);
  line(0, 0, 0, -len);
  translate(0, -len);

  if (depth > MAX_DEPTH - 3) {
    const leafSize = map(depth, MAX_DEPTH - 3, MAX_DEPTH, 1, 4);
    const glow = 150 + Math.sin(t * 2 + depth) * 50;
    noStroke();
    fill(201, 168, 76, 120);
    circle(0, 0, leafSize);
  }

  const shrink = 0.68 + noise(depth, t * 0.5) * 0.1;

  push();
  rotate(baseAngle + wind + wobble);
  drawBranch(len * shrink, baseAngle, wind * 0.9, t, depth + 1);
  pop();

  push();
  rotate(-baseAngle + wind + wobble);
  drawBranch(len * shrink, baseAngle, wind * 0.9, t, depth + 1);
  pop();

  if (depth < 4 && noise(depth * 2, t) > 0.6) {
    push();
    rotate(wind * 2 + wobble * 3);
    drawBranch(len * shrink * 0.7, baseAngle, wind, t, depth + 2);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function touchStarted() { }
