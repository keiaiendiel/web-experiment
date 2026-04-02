// Title: Particles Repel
// Date: 2024-01-02
// Category: particles
// Ported from kindl.work p5.js Editor (zzCLeSSff)

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const NUM = isMobile ? 1000 : 3000;
let particles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  for (let i = 0; i < NUM; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      size: 2 + Math.random() * 6,
    });
  }
  mouseX = width / 2;
  mouseY = height / 2;
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  background(0, 20);

  noStroke();
  for (const p of particles) {
    const dx = p.x - mouseX;
    const dy = p.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 100 && dist > 0) {
      const force = (1 - dist / 100) * 0.5;
      p.vx += (dx / dist) * force;
      p.vy += (dy / dist) * force;
    }

    p.vx *= 0.995;
    p.vy *= 0.995;
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > width) { p.vx *= -1; p.x = Math.max(0, Math.min(width, p.x)); }
    if (p.y < 0 || p.y > height) { p.vy *= -1; p.y = Math.max(0, Math.min(height, p.y)); }

    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    const brightness = Math.min(228, 60 + speed * 80);
    fill(brightness, brightness, brightness);
    circle(p.x, p.y, p.size);
  }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function touchStarted() { }
