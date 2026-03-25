// Title: Matrix Rain
// Date: 2026-03-25
// Category: typography

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const SEED = parseInt(new URLSearchParams(window.location.search).get('seed')) || Date.now();

const CHAR_SIZE = isMobile ? 14 : 11;
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.:;+=*^%$#@!?><|/\\~';
let columns = [];
let font;

function preload() {
  font = loadFont('../../fonts/DegularMono-Medium.otf');
}

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 25 : 40);
  textFont(font);
  textSize(CHAR_SIZE);
  textAlign(CENTER, TOP);
  initColumns();
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function initColumns() {
  columns = [];
  const colW = CHAR_SIZE * 0.7;
  const numCols = Math.ceil(width / colW);
  for (let i = 0; i < numCols; i++) {
    const numDrops = 1 + Math.floor(Math.random() * 2);
    for (let d = 0; d < numDrops; d++) {
      columns.push({
        x: i * colW + colW / 2,
        y: -Math.random() * height * 2,
        speed: 1 + Math.random() * 3,
        length: 8 + Math.floor(Math.random() * 20),
        chars: [],
        col: i,
      });
      const col = columns[columns.length - 1];
      for (let c = 0; c < col.length; c++) {
        col.chars.push(CHARS[Math.floor(Math.random() * CHARS.length)]);
      }
    }
  }
}

function draw() {
  background(9, 9, 11, 40);

  for (const col of columns) {
    // Mouse void
    const dx = col.x - mouseX;
    const midY = col.y - (col.length * CHAR_SIZE) / 2;
    const dy = midY - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const fade = dist < 100 ? dist / 100 : 1;

    for (let i = 0; i < col.length; i++) {
      const cy = col.y - i * CHAR_SIZE;
      if (cy < -CHAR_SIZE || cy > height + CHAR_SIZE) continue;

      const t = i / col.length;
      let brightness;
      if (i === 0) {
        brightness = 228; // head is bright white
      } else {
        brightness = Math.floor(228 * (1 - t) * 0.4);
      }
      brightness = Math.floor(brightness * fade);
      if (brightness < 5) continue;

      if (Math.random() < 0.02) {
        col.chars[i] = CHARS[Math.floor(Math.random() * CHARS.length)];
      }

      fill(brightness * 0.85, brightness, brightness * 0.85);
      noStroke();
      text(col.chars[i], col.x, cy);
    }

    col.y += col.speed;
    if (col.y - col.length * CHAR_SIZE > height) {
      col.y = -Math.random() * height * 0.5;
      col.speed = 1 + Math.random() * 3;
    }
  }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); initColumns(); }
function touchStarted() { }
