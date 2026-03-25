// Title: Cascade
// Date: 2026-03-25
// Category: typography

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const SEED = parseInt(new URLSearchParams(window.location.search).get('seed')) || Date.now();

const WORDS = [
  'PERCEIVE', 'OBSERVE', 'SENSE', 'RESPOND',
  'SIGNAL', 'PULSE', 'FIELD', 'MEMBRANE',
  'ORGANISM', 'MACHINE', 'SYSTEM', 'NETWORK',
  'RECEPTOR', 'SYNAPSE', 'VOLTAGE', 'FREQUENCY',
];

const BLOCK_H = isMobile ? 28 : 22;
const BLOCK_W = isMobile ? 10 : 8;
let blocks = [];
let font;

function preload() {
  font = loadFont('../../fonts/DegularMono-Medium.otf');
}

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  textFont(font);
  textSize(BLOCK_H * 0.7);
  textAlign(CENTER, CENTER);
  initBlocks();
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function initBlocks() {
  blocks = [];
  const cols = Math.ceil(width / BLOCK_W);
  const rows = Math.ceil(height / BLOCK_H);

  for (let col = 0; col < cols; col++) {
    // Pick a word for this column group
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    for (let row = 0; row < rows; row++) {
      const charIdx = row % word.length;
      blocks.push({
        x: col * BLOCK_W + BLOCK_W / 2,
        targetY: row * BLOCK_H + BLOCK_H / 2,
        y: -Math.random() * height * 3 - BLOCK_H, // start above
        vy: 0,
        ch: word[charIdx],
        delay: col * 2 + Math.random() * 30,
        landed: false,
        col, row,
      });
    }
  }
}

function draw() {
  background(9, 9, 11);

  const gravity = 0.4;
  const bounce = 0.3;
  const mouseInfluence = 150;

  for (const b of blocks) {
    if (b.delay > 0) {
      b.delay -= 1;
      continue;
    }

    if (!b.landed) {
      b.vy += gravity;
      b.y += b.vy;

      if (b.y >= b.targetY) {
        b.y = b.targetY;
        if (Math.abs(b.vy) > 1) {
          b.vy *= -bounce;
        } else {
          b.vy = 0;
          b.landed = true;
        }
      }
    }

    // Mouse disruption: blocks near cursor get pushed up
    const dx = b.x - mouseX;
    const dy = b.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < mouseInfluence && b.landed) {
      const force = (1 - dist / mouseInfluence) * 8;
      b.y -= force;
      b.vy = -force * 0.5;
      b.landed = false;
    }

    // Re-attract to target when disrupted
    if (!b.landed && b.delay <= 0) {
      // Already handled by gravity
    }

    const distFromTarget = Math.abs(b.y - b.targetY);
    const brightness = b.landed ? 50 + (b.row % 4) * 10 : Math.min(228, 100 + distFromTarget);

    fill(brightness, brightness, brightness);
    noStroke();
    text(b.ch, b.x, b.y);
  }
}

function mousePressed() {
  initBlocks();
  return false;
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); initBlocks(); }
function touchStarted() { }
