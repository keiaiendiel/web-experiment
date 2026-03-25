// Title: Ink
// Date: 2026-03-25
// Category: organic

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const SEED = parseInt(new URLSearchParams(window.location.search).get('seed')) || Date.now();

const NUM = isMobile ? 2000 : 5000;
let drops = [];

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  background(9, 9, 11);
  spawnDrop(width / 2, height / 2, 200);
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function spawnDrop(cx, cy, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * TWO_PI;
    const r = Math.random() * 3;
    drops.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      vx: 0, vy: 0,
      life: 1,
      noiseOff: Math.random() * 1000,
      size: 0.5 + Math.random() * 1.5,
    });
  }
  if (drops.length > NUM) drops.splice(0, drops.length - NUM);
}

function draw() {
  // No background clear - accumulative drawing
  const t = frameCount * 0.003;

  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];

    const nx = noise(d.x * 0.003 + d.noiseOff, d.y * 0.003, t) - 0.5;
    const ny = noise(d.x * 0.003, d.y * 0.003 + d.noiseOff, t) - 0.5;

    d.vx += nx * 0.8;
    d.vy += ny * 0.8;
    d.vx *= 0.95;
    d.vy *= 0.95;

    d.x += d.vx;
    d.y += d.vy;
    d.life -= 0.002;

    if (d.life <= 0) {
      drops.splice(i, 1);
      continue;
    }

    const alpha = d.life * 30;
    const brightness = 180 + d.life * 48;
    stroke(brightness, brightness, brightness, alpha);
    strokeWeight(d.size);
    point(d.x, d.y);
  }

  // Mouse leaves ink trail
  if (mouseIsPressed || (frameCount % 3 === 0 && Math.random() < 0.3)) {
    const sx = mouseIsPressed ? mouseX : width / 2 + (Math.random() - 0.5) * width * 0.6;
    const sy = mouseIsPressed ? mouseY : height / 2 + (Math.random() - 0.5) * height * 0.6;
    spawnDrop(sx, sy, mouseIsPressed ? 20 : 5);
  }
}

function mousePressed() {
  spawnDrop(mouseX, mouseY, 300);
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(9, 9, 11);
}
function touchStarted() { }
