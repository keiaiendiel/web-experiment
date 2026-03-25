// Title: Game of Life
// Date: 2026-03-25
// Category: automata

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

const CELL = isMobile ? 6 : 4;
let cols, rows, grid, age, buf;

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 20 : 30);
  cols = Math.ceil(width / CELL);
  rows = Math.ceil(height / CELL);
  grid = new Uint8Array(cols * rows);
  age = new Uint16Array(cols * rows);
  buf = new Uint8Array(cols * rows);
  for (let i = 0; i < grid.length; i++) {
    grid[i] = Math.random() < 0.15 ? 1 : 0;
  }
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  loadPixels();
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const i = x + y * cols;
      let neighbors = 0;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          const nx = (x + dx + cols) % cols;
          const ny = (y + dy + rows) % rows;
          neighbors += grid[nx + ny * cols];
        }
      }
      if (grid[i] === 1) {
        buf[i] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
      } else {
        buf[i] = neighbors === 3 ? 1 : 0;
      }
      if (buf[i]) {
        age[i] = grid[i] ? Math.min(age[i] + 1, 500) : 1;
      } else {
        age[i] = 0;
      }
    }
  }
  [grid, buf] = [buf, grid];

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const i = x + y * cols;
      const a = age[i];
      let r, g, b;
      if (a === 0) {
        r = g = b = 0;
      } else if (a < 10) {
        r = 255; g = 255; b = 255;
      } else if (a < 80) {
        const t = (a - 10) / 70;
        r = Math.floor(255 * (1 - t) + 80 * t);
        g = Math.floor(255 * (1 - t) + 120 * t);
        b = Math.floor(255 * (1 - t * 0.3));
      } else {
        const t = Math.min((a - 80) / 200, 1);
        r = Math.floor(80 + 80 * t);
        g = Math.floor(120 * (1 - t) + 40 * t);
        b = Math.floor(255 * (1 - t * 0.5) + 140 * t);
      }
      for (let cx = 0; cx < CELL && x * CELL + cx < width; cx++) {
        for (let cy = 0; cy < CELL && y * CELL + cy < height; cy++) {
          const pi = ((y * CELL + cy) * width + (x * CELL + cx)) * 4;
          pixels[pi] = r;
          pixels[pi + 1] = g;
          pixels[pi + 2] = b;
          pixels[pi + 3] = 255;
        }
      }
    }
  }
  updatePixels();

  if (mouseIsPressed) drawCells();
}

function drawCells() {
  const cx = Math.floor(mouseX / CELL);
  const cy = Math.floor(mouseY / CELL);
  const r = 3;
  for (let dx = -r; dx <= r; dx++) {
    for (let dy = -r; dy <= r; dy++) {
      if (dx * dx + dy * dy > r * r) continue;
      const nx = (cx + dx + cols) % cols;
      const ny = (cy + dy + rows) % rows;
      grid[nx + ny * cols] = 1;
      age[nx + ny * cols] = 1;
    }
  }
}

function mouseDragged() { drawCells(); }

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  const newCols = Math.ceil(width / CELL);
  const newRows = Math.ceil(height / CELL);
  const newGrid = new Uint8Array(newCols * newRows);
  const newAge = new Uint16Array(newCols * newRows);
  for (let x = 0; x < Math.min(cols, newCols); x++) {
    for (let y = 0; y < Math.min(rows, newRows); y++) {
      newGrid[x + y * newCols] = grid[x + y * cols];
      newAge[x + y * newCols] = age[x + y * cols];
    }
  }
  cols = newCols; rows = newRows;
  grid = newGrid; age = newAge;
  buf = new Uint8Array(cols * rows);
}

function touchStarted() { drawCells(); return false; }
