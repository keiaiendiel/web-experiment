// Title: Wind Particles
// Date: 2024-03-25
// Category: particles
// Ported from kindl.work p5.js Editor (nDhtKK2cO)

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const MAX_PARTICLES = isMobile ? 500 : 2000;
let particles = [];
let wind;
let originalWind;

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  originalWind = createVector(
    randomGaussian(0, randomGaussian(0.01, 0.005)),
    randomGaussian(0, randomGaussian(0.01, 0.005))
  );
  wind = originalWind.copy();
  for (let i = 0; i < 10; i++) {
    particles.push(makeParticle(Math.random() * width, Math.random() * height));
  }
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function makeParticle(x, y) {
  return {
    x, y,
    vx: randomGaussian(0, 1), vy: randomGaussian(0, 1),
    ax: 0, ay: 0,
    life: randomGaussian(100, 40),
    radius: (1 + Math.random() * 9) * 8,
  };
}

function draw() {
  background(0);

  // Spawn from mouse
  const spawnCount = isMobile ? 2 : 5;
  for (let i = 0; i < spawnCount; i++) {
    if (particles.length < MAX_PARTICLES) {
      particles.push(makeParticle(mouseX, mouseY));
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.ax += wind.x;
    p.ay += wind.y;

    p.vx += p.ax;
    p.vy += p.ay;
    p.x += p.vx;
    p.y += p.vy;
    p.ax = 0;
    p.ay = 0;
    p.life -= 0.5;

    if (p.x > width || p.x < 0) p.vx *= -1;
    if (p.y > height || p.y < 0) p.vy *= -1;

    if (p.life < 0) { particles.splice(i, 1); continue; }

    const brightness = Math.min(228, map(p.life, 0, 100, 20, 228));
    const alpha = Math.min(255, p.life * 2.5);
    stroke(brightness, brightness, brightness, alpha);
    strokeWeight(Math.max(0.3, p.life * 0.005));
    const endX = p.x + p.vx * 10;
    const endY = p.y + p.vy * 10;
    line(p.x, p.y, endX, endY);
  }
}

function mousePressed() {
  wind = createVector(
    randomGaussian(0, randomGaussian(0.5, 0.005)),
    randomGaussian(0, randomGaussian(0.5, 0.005))
  );
}

function mouseReleased() { wind = originalWind.copy(); }

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function touchStarted() { }
