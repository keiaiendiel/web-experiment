// Title: Cymatics
// Date: 2023-12-07
// Category: physics
// Ported from kindl.work p5.js Editor

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const NUM = isMobile ? 8000 : 20000;
const MAX_DIST = 5;
let particles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  initParticles();
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  background(0);

  const freqX = map(mouseX, 0, width, 0, 15);
  const freqY = map(mouseY, 0, height, 0, 15);
  const jitter = 3;

  stroke(228);
  strokeWeight(1);

  for (const p of particles) {
    const xEff = Math.cos(TWO_PI * p.x / width * freqX);
    const yEff = Math.cos(TWO_PI * p.y / height * freqY);
    const combined = xEff * yEff;

    const angle = TWO_PI * combined;
    const fx = Math.cos(angle) * MAX_DIST;
    const fy = Math.sin(angle) * MAX_DIST;

    p.x += (p.x + fx - p.x) * 0.25 + (Math.random() - 0.5) * jitter * 2;
    p.y += (p.y + fy - p.y) * 0.25 + (Math.random() - 0.5) * jitter * 2;

    p.x = Math.max(0, Math.min(width, p.x));
    p.y = Math.max(0, Math.min(height, p.y));

    point(p.x, p.y);
  }
}

function mousePressed() {
  initParticles();
}

function initParticles() {
  particles = [];
  for (let i = 0; i < NUM; i++) {
    particles.push({ x: Math.random() * width, y: Math.random() * height });
  }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); initParticles(); }
function touchStarted() { }
