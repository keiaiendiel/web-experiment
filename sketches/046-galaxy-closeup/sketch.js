// Title: Galaxy Close Up
// Date: 2024-03-04
// Category: particles
// Ported from kindl.work p5.js Editor (P8T9R4jHy)

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const MAX_MOVERS = isMobile ? 200 : 800;
let movers = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  background(0);
  for (let i = 0; i < 10; i++) {
    movers.push(makeMover(width / 2, height / 2, 1 + Math.random() * 9));
  }
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function makeMover(x, y, mass) {
  return {
    x, y, mass,
    vx: 0, vy: 0, vz: 0,
    ax: (Math.random() - 0.5) * 2, ay: (Math.random() - 0.5) * 2,
    size: 10,
  };
}

function draw() {
  background(0, 10);

  for (const m of movers) {
    const dx = mouseX - m.x;
    const dy = mouseY - m.y;
    const dist = Math.sqrt(dx * dx + dy * dy) + 1;
    const fx = dx / dist * 0.2;
    const fy = dy / dist * 0.2;
    m.ax = fx / m.mass;
    m.ay = fy / m.mass;

    m.vx += randomGaussian(0, 0.015) + m.ax;
    m.vy += randomGaussian(0, 0.015) + m.ay;
    m.vz += randomGaussian(0, 0.015);

    const speed = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
    if (speed > 5) { const s = 5 / speed; m.vx *= s; m.vy *= s; }

    m.x += m.vx;
    m.y += m.vy;

    if (m.x > width || m.x < 0) m.vx *= -1;
    if (m.y > height || m.y < 0) m.vy *= -1;

    m.size = map(Math.abs(m.vz), -1, 1, 0, 100);

    const brightness = Math.min(228, 40 + m.size * 2);
    noStroke();
    fill(brightness);
    circle(m.x, m.y, m.mass * 2);
  }
}

function mousePressed() {
  if (movers.length < MAX_MOVERS) {
    movers.push(makeMover(mouseX, mouseY, 1 + Math.random() * 9));
  }
}

function mouseDragged() {
  if (movers.length < MAX_MOVERS) {
    movers.push(makeMover(mouseX, mouseY, 1 + Math.random() * 9));
  }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); background(0); }
function touchStarted() { }
