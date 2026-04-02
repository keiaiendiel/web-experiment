// Title: Cellular Automaton
// Date: 2024-04-22
// Category: automata
// Ported from kindl.work p5.js Editor (ic58kW6N-)

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const W = isMobile ? 6 : 4;
const RULESET = [0, 1, 0, 1, 1, 0, 1, 0]; // Rule 90
let cells;
let generation = 0;
let dotSize;

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  background(0);

  cells = new Array(Math.floor(width / W));
  for (let i = 0; i < cells.length; i++) cells[i] = 0;
  cells[Math.floor(cells.length / 2)] = 1;

  dotSize = W * 2;
  fill(228);
  noStroke();
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  for (let i = 1; i < cells.length - 1; i++) {
    if (cells[i] === 1) {
      circle(i * W, generation * W, dotSize);
    }
  }

  if (generation * W > height - W) {
    generation = 0;
    dotSize = W + Math.random() * W * 4;

    // Cycle through grays and occasional amber
    const choices = [228, 160, 80, 40];
    const pick = choices[Math.floor(Math.random() * choices.length)];
    if (Math.random() < 0.15) {
      fill(201, 168, 76); // amber
    } else {
      fill(pick);
    }
  }

  const nextgen = cells.slice();
  for (let i = 1; i < cells.length - 1; i++) {
    const idx = parseInt('' + cells[i - 1] + cells[i] + cells[i + 1], 2);
    nextgen[i] = RULESET[7 - idx];
  }
  cells = nextgen;
  generation++;
}

function mousePressed() {
  background(0);
  generation = 0;
  cells = new Array(Math.floor(width / W));
  for (let i = 0; i < cells.length; i++) cells[i] = 0;
  cells[Math.floor(cells.length / 2)] = 1;
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); mousePressed(); }
function touchStarted() { }
