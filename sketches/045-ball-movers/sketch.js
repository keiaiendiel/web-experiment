// Title: Ball Movers
// Date: 2024-02-26
// Category: particles
// Ported from kindl.work p5.js Editor (B26NCBjUv)

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const MAX_MOVERS = isMobile ? 500 : 2000;
let movers = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  for (let i = 0; i < 10; i++) {
    movers.push(makeMover(width / 2, height / 2));
  }
  background(0);
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function makeMover(x, y) {
  return {
    x, y, size: 10,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4,
    vz: (Math.random() - 0.5) * 4,
  };
}

function draw() {
  background(0, 50);

  stroke(228);
  strokeWeight(4);

  for (const m of movers) {
    m.vx += randomGaussian(0, 0.05);
    m.vy += randomGaussian(0, 0.05);
    m.vz += randomGaussian(0, 0.05);

    const speed = Math.sqrt(m.vx * m.vx + m.vy * m.vy + m.vz * m.vz);
    if (speed > 3) { const s = 3 / speed; m.vx *= s; m.vy *= s; m.vz *= s; }

    m.x += m.vx;
    m.y += m.vy;

    if (m.x > width || m.x < 0) m.vx *= -1;
    if (m.y > height || m.y < 0) m.vy *= -1;

    m.size = map(Math.abs(m.vz), 0, 2, 1, 10);

    const brightness = Math.min(228, m.size * 25);
    stroke(brightness);
    point(m.x, m.y);
  }
}

function mousePressed() {
  const count = isMobile ? 30 : 100;
  for (let i = 0; i < count; i++) {
    if (movers.length < MAX_MOVERS) {
      movers.push(makeMover(mouseX, mouseY));
    }
  }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); background(0); }
function touchStarted() { }
