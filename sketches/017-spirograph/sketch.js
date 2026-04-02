// Title: Spirograph
// Date: 2026-03-25
// Category: geometry

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

let angle = 0;
let layers = [];
const NUM_LAYERS = 4;

function setup() {
  randomSeed(SEED);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  // monochrome

  for (let i = 0; i < NUM_LAYERS; i++) {
    layers.push({
      R: 100 + Math.random() * 100,
      r: 30 + Math.random() * 60,
      d: 40 + Math.random() * 80,
      brightness: 60 + i * 50,
      speed: 0.02 + Math.random() * 0.02,
      px: null, py: null,
    });
  }

  background(0);
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  background(0, 2);
  translate(width / 2, height / 2);

  const rRatio = map(mouseX, 0, width, 0.2, 0.8);
  const dRatio = map(mouseY, 0, height, 0.3, 1.5);

  for (const layer of layers) {
    const R = layer.R;
    const r = layer.r * rRatio;
    const d = layer.d * dRatio;

    const x = (R - r) * Math.cos(angle * layer.speed) + d * Math.cos((R - r) / r * angle * layer.speed);
    const y = (R - r) * Math.sin(angle * layer.speed) - d * Math.sin((R - r) / r * angle * layer.speed);

    if (layer.px !== null) {
      const speed = Math.sqrt((x - layer.px) ** 2 + (y - layer.py) ** 2);
      const alpha = Math.min(50, 10 + speed * 5);
      stroke(layer.brightness, layer.brightness, layer.brightness, alpha);
      strokeWeight(0.8);
      line(layer.px, layer.py, x, y);
    }

    layer.px = x;
    layer.py = y;
  }

  angle += 1;
}

function mousePressed() {
  background(0);
  for (const layer of layers) {
    layer.R = 80 + Math.random() * 150;
    layer.r = 20 + Math.random() * 80;
    layer.d = 30 + Math.random() * 100;
    layer.brightness = 60 + Math.random() * 168;
    layer.px = null;
    layer.py = null;
  }
  angle = 0;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
  for (const l of layers) { l.px = null; l.py = null; }
}

function touchStarted() { }
