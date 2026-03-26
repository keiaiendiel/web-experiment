// Title: Noise Terrain
// Date: 2024-02-19
// Category: geometry
// Ported from kindl.work p5.js Editor (JmJJzm_va)

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const SCL = isMobile ? 14 : 10;
const W = 800;
const H = 800;
let cols, rows;
let flying = 0;
let shapeMode = 0;
let modes;

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight, WEBGL);
  frameRate(isMobile ? 30 : 60);
  cols = W / SCL;
  rows = H / SCL;
  modes = [POINTS, LINES, QUAD_STRIP];
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  background(0);
  stroke(228);
  noFill();
  strokeWeight(0.75);

  const rot = map(mouseY, 0, height, 1, 5);
  const size = map(mouseX, 0, width, 0.01, 0.5);

  translate(0, 50);
  rotateX(PI / rot);
  translate(-W / 2, -H / 2);

  flying -= 0.02;
  let yoff = flying;

  for (let y = 0; y < rows - 1; y++) {
    beginShape(modes[shapeMode]);
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      vertex(x * SCL, y * SCL, map(noise(xoff, yoff), 0, 1, -200, 200));
      vertex(x * SCL, (y + 1) * SCL, map(noise(xoff, yoff + 0.1), 0, 1, -200, 200));
      xoff += size;
    }
    yoff += 0.1;
    endShape();
  }
}

function mousePressed() {
  shapeMode = (shapeMode + 1) % modes.length;
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function touchStarted() { }
