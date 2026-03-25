// Title: Text Rain
// Date: 2026-03-25
// Category: typography

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;!?@#&*+-=/<>[]{}()';
const CHAR_SIZE = isMobile ? 12 : 10;
const COLUMNS = isMobile ? 50 : 120;
const UPDRAFT_RADIUS = 120;
const UPDRAFT_FORCE = 3;

let drops = [];

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  textSize(CHAR_SIZE);
  textFont('monospace');
  textAlign(CENTER, CENTER);

  const spacing = width / COLUMNS;
  for (let col = 0; col < COLUMNS; col++) {
    const numInCol = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numInCol; i++) {
      drops.push({
        x: col * spacing + spacing / 2,
        y: -Math.random() * height * 2,
        vy: 0.5 + Math.random() * 1.5,
        ch: CHARS[Math.floor(Math.random() * CHARS.length)],
        alpha: 100 + Math.floor(Math.random() * 155),
        baseSpeed: 0.5 + Math.random() * 1.5,
        noiseOff: Math.random() * 1000,
        col: col,
      });
    }
  }

  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  background(0, 40);
  const t = frameCount * 0.01;

  for (const d of drops) {
    const wind = (noise(d.noiseOff, t) - 0.5) * 2;
    d.x += wind;

    const dx = d.x - mouseX;
    const dy = d.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < UPDRAFT_RADIUS) {
      const force = (1 - dist / UPDRAFT_RADIUS) * UPDRAFT_FORCE;
      d.vy -= force;
      d.x += (dx / dist) * force * 0.3;
    }

    d.vy += 0.05; // gravity
    d.vy = Math.min(d.vy, d.baseSpeed * 2);
    d.y += d.vy;

    if (d.y > height + CHAR_SIZE) {
      d.y = -CHAR_SIZE;
      d.vy = d.baseSpeed;
      d.ch = CHARS[Math.floor(Math.random() * CHARS.length)];
      const spacing = width / COLUMNS;
      d.x = d.col * spacing + spacing / 2;
    }

    const distFromBottom = height - d.y;
    const pile = distFromBottom < 50 ? map(distFromBottom, 50, 0, 0, 1) : 0;

    const brightness = Math.floor(100 + d.alpha * (1 - pile * 0.5));
    const green = Math.floor(brightness * (0.8 + pile * 0.2));

    fill(brightness * 0.6, green, brightness, d.alpha);
    noStroke();
    text(d.ch, d.x, d.y);
  }
}

function mousePressed() {
  // Spawn burst of characters at mouse
  const spacing = width / COLUMNS;
  for (let i = 0; i < 20; i++) {
    drops.push({
      x: mouseX + (Math.random() - 0.5) * 60,
      y: mouseY,
      vy: -2 - Math.random() * 3,
      ch: CHARS[Math.floor(Math.random() * CHARS.length)],
      alpha: 200,
      baseSpeed: 0.5 + Math.random() * 1.5,
      noiseOff: Math.random() * 1000,
      col: Math.floor(mouseX / spacing),
    });
  }
  if (drops.length > 1000) drops.splice(0, drops.length - 800);
  return false;
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function touchStarted() { mousePressed(); return false; }
