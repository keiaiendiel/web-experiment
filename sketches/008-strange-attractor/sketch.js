// Title: Strange Attractor
// Date: 2026-03-25
// Category: chaos

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

const NUM_POINTS = isMobile ? 20000 : 50000;
const ITERS_PER_FRAME = isMobile ? 10 : 20;

let a = -1.4, b = 1.6, c = 1.0, d = 0.7;
let targetA, targetB;
let pointsX, pointsY;
let density;

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  // monochrome

  targetA = a; targetB = b;
  pointsX = new Float32Array(NUM_POINTS);
  pointsY = new Float32Array(NUM_POINTS);
  density = new Float32Array(width * height);

  for (let i = 0; i < NUM_POINTS; i++) {
    pointsX[i] = (Math.random() - 0.5) * 4;
    pointsY[i] = (Math.random() - 0.5) * 4;
  }

  background(0);
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  targetA = map(mouseX, 0, width, -2.5, 2.5);
  targetB = map(mouseY, 0, height, -2.5, 2.5);
  a += (targetA - a) * 0.01;
  b += (targetB - b) * 0.01;

  // Fade density
  for (let i = 0; i < density.length; i++) {
    density[i] *= 0.995;
  }

  const scaleX = width / 5;
  const scaleY = height / 5;
  const offX = width / 2;
  const offY = height / 2;

  for (let iter = 0; iter < ITERS_PER_FRAME; iter++) {
    for (let i = 0; i < NUM_POINTS; i++) {
      const x = pointsX[i], y = pointsY[i];
      pointsX[i] = Math.sin(a * y) + c * Math.cos(a * x);
      pointsY[i] = Math.sin(b * x) + d * Math.cos(b * y);

      const sx = Math.floor(pointsX[i] * scaleX + offX);
      const sy = Math.floor(pointsY[i] * scaleY + offY);
      if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
        density[sx + sy * width] = Math.min(density[sx + sy * width] + 0.1, 10);
      }
    }
  }

  loadPixels();
  for (let i = 0; i < width * height; i++) {
    const v = density[i];
    const pi = i * 4;
    if (v < 0.01) {
      pixels[pi] = pixels[pi + 1] = pixels[pi + 2] = 0;
    } else {
      const t = Math.min(v / 3, 1);
      const bri = Math.floor(Math.min(t * 280, 228));
      pixels[pi] = bri;
      pixels[pi + 1] = bri;
      pixels[pi + 2] = bri;
    }
    pixels[pi + 3] = 255;
  }
  updatePixels();
}

function hsvToRgb(h, s, v) {
  let r, g, b2;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b2 = p; break;
    case 1: r = q; g = v; b2 = p; break;
    case 2: r = p; g = v; b2 = t; break;
    case 3: r = p; g = q; b2 = v; break;
    case 4: r = t; g = p; b2 = v; break;
    case 5: r = v; g = p; b2 = q; break;
  }
  return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b2 * 255)];
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  density = new Float32Array(width * height);
  background(0);
}

function touchStarted() { }
