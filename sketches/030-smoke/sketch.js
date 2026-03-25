// Title: Smoke
// Date: 2026-03-25
// Category: organic

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const SEED = parseInt(new URLSearchParams(window.location.search).get('seed')) || Date.now();

const MAX_PARTICLES = isMobile ? 1500 : 4000;
let particles = [];

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  background(9, 9, 11, 20);

  // Emit from bottom
  const emitCount = isMobile ? 3 : 8;
  for (let i = 0; i < emitCount; i++) {
    if (particles.length < MAX_PARTICLES) {
      particles.push({
        x: width * 0.3 + Math.random() * width * 0.4,
        y: height + 5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -1 - Math.random() * 1.5,
        life: 1,
        size: 2 + Math.random() * 4,
        noiseOff: Math.random() * 1000,
      });
    }
  }

  // Mouse emit
  if (mouseIsPressed && particles.length < MAX_PARTICLES) {
    for (let i = 0; i < 5; i++) {
      particles.push({
        x: mouseX + (Math.random() - 0.5) * 10,
        y: mouseY + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 2,
        vy: -1 - Math.random() * 2,
        life: 1,
        size: 3 + Math.random() * 5,
        noiseOff: Math.random() * 1000,
      });
    }
  }

  const t = frameCount * 0.003;
  noStroke();

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    // Turbulence
    const nx = noise(p.x * 0.003, p.y * 0.003, t + p.noiseOff);
    const ny = noise(p.x * 0.003 + 100, p.y * 0.003, t + p.noiseOff);
    p.vx += (nx - 0.5) * 0.15;
    p.vy += (ny - 0.5) * 0.1 - 0.02; // upward bias

    // Mouse disturbs
    const dx = p.x - mouseX, dy = p.y - mouseY;
    const md = Math.sqrt(dx * dx + dy * dy);
    if (md < 100 && md > 0) {
      const push = (1 - md / 100) * 0.5;
      p.vx += (dx / md) * push;
      p.vy += (dy / md) * push;
    }

    p.vx *= 0.98;
    p.vy *= 0.98;
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.003;
    p.size += 0.03;

    if (p.life <= 0 || p.y < -20) {
      particles.splice(i, 1);
      continue;
    }

    const alpha = p.life * p.life * 40;
    const brightness = 60 + p.life * 100;
    fill(brightness, brightness, brightness, alpha);
    circle(p.x, p.y, p.size);
  }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function touchStarted() { }
