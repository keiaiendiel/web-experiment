// Title: Typewriter
// Date: 2026-03-25
// Category: typography

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const SEED = parseInt(new URLSearchParams(window.location.search).get('seed')) || Date.now();

const LINES = [
  "I build machines that perceive.",
  "The limits of my language",
  "mean the limits of my world.",
  "",
  "Electronic organisms that observe,",
  "develop behavior,",
  "and respond.",
  "",
  "Not depictions of the visible,",
  "but making the invisible visible.",
];

let charIndex = 0;
let lineIndex = 0;
let cursorBlink = 0;
let typed = [];
let charDelay = 0;
let font;

function preload() {
  font = loadFont('../../fonts/DegularMono-Medium.otf');
}

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  textFont(font);
  typed = LINES.map(() => '');
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  background(9, 9, 11);

  const speed = map(mouseX, 0, width, 0.5, 6);
  charDelay += speed;

  if (charDelay >= 3 && lineIndex < LINES.length) {
    charDelay = 0;
    if (charIndex < LINES[lineIndex].length) {
      typed[lineIndex] += LINES[lineIndex][charIndex];
      charIndex++;
    } else {
      lineIndex++;
      charIndex = 0;
      if (lineIndex >= LINES.length) {
        // Restart after pause
        setTimeout(() => {
          typed = LINES.map(() => '');
          lineIndex = 0;
          charIndex = 0;
        }, 3000);
      }
    }
  }

  const fontSize = isMobile ? 16 : 20;
  const lineH = fontSize * 1.6;
  const margin = isMobile ? 30 : 60;
  const startY = height / 2 - (LINES.length * lineH) / 2;

  textSize(fontSize);
  textAlign(LEFT, TOP);

  for (let i = 0; i < typed.length; i++) {
    const txt = typed[i];
    if (!txt && i > lineIndex) continue;

    const y = startY + i * lineH;
    const distFromMouse = Math.abs(y + fontSize / 2 - mouseY);
    const brightness = distFromMouse < 100 ? 228 : 161;

    // Subtle noise displacement per character
    for (let c = 0; c < txt.length; c++) {
      const nx = noise(c * 0.3, i * 0.5, frameCount * 0.005) - 0.5;
      const ny = noise(c * 0.3 + 100, i * 0.5, frameCount * 0.005) - 0.5;
      const displace = distFromMouse < 80 ? 1.5 : 0.3;
      fill(brightness, brightness * 0.95, brightness * 0.9);
      noStroke();
      text(txt[c], margin + c * fontSize * 0.6 + nx * displace, y + ny * displace);
    }

    // Cursor
    if (i === lineIndex && lineIndex < LINES.length) {
      cursorBlink += 0.05;
      if (Math.sin(cursorBlink * 3) > 0) {
        fill(201, 168, 76); // amber
        noStroke();
        rect(margin + txt.length * fontSize * 0.6, y, fontSize * 0.08, fontSize);
      }
    }
  }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function touchStarted() { }
