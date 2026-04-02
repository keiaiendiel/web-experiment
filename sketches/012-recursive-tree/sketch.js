// Title: Recursive Tree
// Date: 2024-05-06
// Category: growth
// Ported from kindl.work p5.js Editor — original HSB style

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

let smoothedMouseX = 0;
let smoothedMouseY = 0;
const smoothing = 0.5;

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  smoothedMouseX = width / 2;
  smoothedMouseY = height / 2;
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  colorMode(RGB);
  background(0);
  noFill();
  translate(width / 2, height);

  smoothedMouseX += (mouseX - smoothedMouseX) * smoothing;
  smoothedMouseY += (mouseY - smoothedMouseY) * smoothing;

  drawLine(height / 2);
}

function drawLine(d) {
  let angle = PI / map(smoothedMouseY, 0, height, 1, 5);
  if (d > 10) {
    colorMode(HSB);
    stroke(360 - d, 100, 100);
    let ext = map(smoothedMouseY, 0, height, -d, d);
    line(0, 0, 0, -d + ext);
    translate(0, -d + ext);
    d = d * 0.6;

    push();
    rotate(angle + map(smoothedMouseX, 0, width, -2, 2));
    drawLine(d);
    pop();

    push();
    rotate(angle + map(smoothedMouseY, 0, height, -2, 2));
    drawLine(d);
    pop();

    push();
    rotate(-angle);
    drawLine(d);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function touchStarted() { }
