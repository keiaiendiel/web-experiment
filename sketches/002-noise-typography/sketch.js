// Title: Noise Typography
// Date: 2026-03-25
// Category: typography

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

const TEXT = "I build machines that perceive";
const CHAR_SIZE = isMobile ? 14 : 18;
const NOISE_SCALE = 0.008;
const SPRING = 0.02;
const DAMPING = 0.85;
const REPEL_RADIUS = isMobile ? 100 : 150;
const REPEL_FORCE = 8;

let chars = [];

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  textAlign(CENTER, CENTER);
  textSize(CHAR_SIZE);
  textFont('monospace');
  initChars();
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function initChars() {
  chars = [];
  const charW = CHAR_SIZE * 0.62;
  const lineH = CHAR_SIZE * 1.8;
  const words = TEXT.split(' ');
  const maxLineW = Math.min(width * 0.8, 600);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const test = currentLine ? currentLine + ' ' + word : word;
    if (test.length * charW > maxLineW && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = test;
    }
  }
  if (currentLine) lines.push(currentLine);

  const totalH = lines.length * lineH;
  const startY = (height - totalH) / 2 + lineH / 2;

  for (let l = 0; l < lines.length; l++) {
    const line = lines[l];
    const lineW = line.length * charW;
    const startX = (width - lineW) / 2 + charW / 2;
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === ' ') continue;
      const homeX = startX + c * charW;
      const homeY = startY + l * lineH;
      const isVowel = 'aeiouAEIOU'.includes(ch);
      const isPunct = '.,;:!?'.includes(ch);
      chars.push({
        ch, homeX, homeY,
        x: homeX, y: homeY,
        vx: 0, vy: 0,
        noiseFreq: isPunct ? 0.04 : isVowel ? 0.005 : 0.02,
        noiseMag: isPunct ? 30 : isVowel ? 8 : 18,
        noiseOff: Math.random() * 1000,
        alpha: 200 + Math.random() * 55,
      });
    }
  }
}

function draw() {
  background(0, 25);
  const t = frameCount * 0.01;

  for (const c of chars) {
    const nx = noise(c.x * NOISE_SCALE + c.noiseOff, c.y * NOISE_SCALE, t * c.noiseFreq * 10);
    const ny = noise(c.y * NOISE_SCALE + c.noiseOff + 500, c.x * NOISE_SCALE, t * c.noiseFreq * 10);
    const targetX = c.homeX + (nx - 0.5) * c.noiseMag * 2;
    const targetY = c.homeY + (ny - 0.5) * c.noiseMag * 2;

    c.vx += (targetX - c.x) * SPRING;
    c.vy += (targetY - c.y) * SPRING;

    const dx = c.x - mouseX;
    const dy = c.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < REPEL_RADIUS && dist > 0) {
      const force = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
      c.vx += (dx / dist) * force;
      c.vy += (dy / dist) * force;
    }

    c.vx *= DAMPING;
    c.vy *= DAMPING;
    c.x += c.vx;
    c.y += c.vy;

    const speed = Math.sqrt(c.vx * c.vx + c.vy * c.vy);
    const brightness = Math.min(255, 150 + speed * 30);
    fill(brightness, c.alpha);
    noStroke();
    text(c.ch, c.x, c.y);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initChars();
}

function touchStarted() { }
