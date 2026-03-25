// Title: Langton's Ant
// Date: 2026-03-25
// Category: automata

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

const CELL = isMobile ? 3 : 2;
const STEPS_PER_FRAME = isMobile ? 500 : 1500;

const RULES = ['RL', 'RLR', 'LLRR', 'RLLR', 'LRRRRRLLR'];
const COLORS = [
  [255, 100, 80],
  [80, 200, 255],
  [255, 220, 50],
  [150, 255, 120],
  [220, 130, 255],
];

let gw, gh, grid, ants;

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  initGrid();
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function initGrid() {
  gw = Math.ceil(width / CELL);
  gh = Math.ceil(height / CELL);
  grid = new Uint8Array(gw * gh);
  ants = [];

  const cx = Math.floor(gw / 2), cy = Math.floor(gh / 2);
  const spread = Math.floor(Math.min(gw, gh) * 0.1);
  for (let i = 0; i < 5; i++) {
    ants.push({
      x: cx + Math.floor((Math.random() - 0.5) * spread),
      y: cy + Math.floor((Math.random() - 0.5) * spread),
      dir: Math.floor(Math.random() * 4),
      rule: RULES[i % RULES.length],
      color: COLORS[i % COLORS.length],
      id: i + 1,
    });
  }
}

function draw() {
  for (let step = 0; step < STEPS_PER_FRAME; step++) {
    for (const ant of ants) {
      const idx = ant.x + ant.y * gw;
      if (ant.x < 0 || ant.x >= gw || ant.y < 0 || ant.y >= gh) continue;

      const cellState = grid[idx] % ant.rule.length;
      const turn = ant.rule[cellState];

      if (turn === 'R') ant.dir = (ant.dir + 1) % 4;
      else ant.dir = (ant.dir + 3) % 4;

      grid[idx] = (grid[idx] + 1) % (ant.rule.length + 1);

      if (ant.dir === 0) ant.y--;
      else if (ant.dir === 1) ant.x++;
      else if (ant.dir === 2) ant.y++;
      else ant.x--;

      if (ant.x < 0) ant.x = gw - 1;
      if (ant.x >= gw) ant.x = 0;
      if (ant.y < 0) ant.y = gh - 1;
      if (ant.y >= gh) ant.y = 0;
    }
  }

  loadPixels();
  for (let x = 0; x < gw; x++) {
    for (let y = 0; y < gh; y++) {
      const v = grid[x + y * gw];
      let r = 0, g = 0, b = 0;
      if (v > 0) {
        const ci = (v - 1) % COLORS.length;
        const intensity = Math.min(1, v / 3);
        r = Math.floor(COLORS[ci][0] * intensity);
        g = Math.floor(COLORS[ci][1] * intensity);
        b = Math.floor(COLORS[ci][2] * intensity);
      }
      for (let sx = 0; sx < CELL && x * CELL + sx < width; sx++) {
        for (let sy = 0; sy < CELL && y * CELL + sy < height; sy++) {
          const pi = ((y * CELL + sy) * width + (x * CELL + sx)) * 4;
          pixels[pi] = r; pixels[pi + 1] = g; pixels[pi + 2] = b; pixels[pi + 3] = 255;
        }
      }
    }
  }
  updatePixels();

  for (const ant of ants) {
    fill(255);
    noStroke();
    circle(ant.x * CELL + CELL / 2, ant.y * CELL + CELL / 2, CELL * 2);
  }
}

function mousePressed() {
  const gx = Math.floor(mouseX / CELL);
  const gy = Math.floor(mouseY / CELL);
  const ri = Math.floor(Math.random() * RULES.length);
  ants.push({
    x: gx, y: gy,
    dir: Math.floor(Math.random() * 4),
    rule: RULES[ri],
    color: COLORS[ants.length % COLORS.length],
    id: ants.length + 1,
  });
  return false;
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); initGrid(); }
function touchStarted() { }
