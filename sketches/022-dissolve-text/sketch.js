// Title: Dissolve Text
// Date: 2026-03-25
// Category: typography

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const SEED = parseInt(new URLSearchParams(window.location.search).get('seed')) || Date.now();

const TEXT = "PERCEIVE";
const FONT_SIZE = isMobile ? 60 : 120;
let particles = [];
let dissolved = false;
let font;

function preload() {
  font = loadFont('../../fonts/DegularMono-Bold.otf');
}

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  textFont(font);
  initParticles();
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function initParticles() {
  particles = [];
  const pg = createGraphics(width, height);
  pg.background(0);
  pg.fill(255);
  pg.noStroke();
  pg.textFont(font);
  pg.textSize(FONT_SIZE);
  pg.textAlign(CENTER, CENTER);
  pg.text(TEXT, width / 2, height / 2);
  pg.loadPixels();

  const step = isMobile ? 4 : 3;
  for (let x = 0; x < width; x += step) {
    for (let y = 0; y < height; y += step) {
      const i = (y * width + x) * 4;
      if (pg.pixels[i] > 128) {
        particles.push({
          homeX: x, homeY: y,
          x, y,
          vx: 0, vy: 0,
          size: step * 0.8,
        });
      }
    }
  }
  pg.remove();
  dissolved = false;
}

function draw() {
  background(9, 9, 11);

  for (const p of particles) {
    const dx = mouseX - p.x;
    const dy = mouseY - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 120 && dist > 0) {
      const force = (1 - dist / 120) * 4;
      p.vx -= (dx / dist) * force;
      p.vy -= (dy / dist) * force;
    }

    p.vx += (p.homeX - p.x) * 0.03;
    p.vy += (p.homeY - p.y) * 0.03;

    p.vx *= 0.88;
    p.vy *= 0.88;
    p.x += p.vx;
    p.y += p.vy;

    const displacement = Math.sqrt((p.x - p.homeX) ** 2 + (p.y - p.homeY) ** 2);
    const brightness = Math.min(228, 140 + displacement * 3);
    fill(brightness, brightness * 0.95, brightness * 0.9);
    noStroke();
    rect(p.x, p.y, p.size, p.size);
  }
}

function mousePressed() {
  // Explode all particles
  for (const p of particles) {
    const dx = p.x - width / 2;
    const dy = p.y - height / 2;
    const dist = Math.sqrt(dx * dx + dy * dy) + 1;
    p.vx += (dx / dist) * 15 + (Math.random() - 0.5) * 10;
    p.vy += (dy / dist) * 15 + (Math.random() - 0.5) * 10;
  }
  return false;
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); initParticles(); }
function touchStarted() { }
