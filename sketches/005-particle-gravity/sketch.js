// Title: Particle Gravity
// Date: 2026-03-25
// Category: particles

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

const NUM = isMobile ? 800 : 2000;
const G = 0.15;
const MOUSE_MASS = 500;
let attractMode = true;
let particles = [];

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  for (let i = 0; i < NUM; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      mass: 0.5 + Math.random() * 2,
      px: 0, py: 0,
    });
  }
  for (const p of particles) { p.px = p.x; p.py = p.y; }
  background(0);
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  background(0, 8);

  for (const p of particles) {
    const dx = mouseX - p.x;
    const dy = mouseY - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy) + 10;
    const force = G * MOUSE_MASS * p.mass / (dist * dist);
    const sign = attractMode ? 1 : -1;
    p.vx += sign * (dx / dist) * force;
    p.vy += sign * (dy / dist) * force;

    p.vx *= 0.998;
    p.vy *= 0.998;

    p.px = p.x;
    p.py = p.y;
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) { p.x = 0; p.vx *= -0.5; }
    if (p.x > width) { p.x = width; p.vx *= -0.5; }
    if (p.y < 0) { p.y = 0; p.vy *= -0.5; }
    if (p.y > height) { p.y = height; p.vy *= -0.5; }

    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    const brightness = Math.min(228, 30 + speed * 50);
    stroke(brightness, brightness, brightness, 100);
    strokeWeight(p.mass * 0.5);
    line(p.px, p.py, p.x, p.y);
  }
}

function mousePressed() {
  attractMode = !attractMode;
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}

function touchStarted() {
  attractMode = !attractMode;
  return false;
}
