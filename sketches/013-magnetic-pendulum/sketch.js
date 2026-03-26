// Title: Magnetic Pendulum
// Date: 2026-03-25
// Category: chaos

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

const FRICTION = 0.02;
const SPRING = 0.005;
const MAG_STRENGTH = 80;
const HEIGHT_SQ = 0.25;
const DT = 0.05;

let magnets = [];
let pendulums = [];

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  // monochrome: 3 magnets at different brightness levels

  const cx = width / 2, cy = height / 2;
  const r = Math.min(width, height) * 0.2;
  const magBrightness = [228, 140, 70]; // bright, medium, dim
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TWO_PI - HALF_PI;
    magnets.push({
      x: cx + Math.cos(a) * r,
      y: cy + Math.sin(a) * r,
      brightness: magBrightness[i],
    });
  }

  for (let i = 0; i < 5; i++) {
    spawnPendulum(cx + (Math.random() - 0.5) * 100, cy + (Math.random() - 0.5) * 100);
  }

  background(0);
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function spawnPendulum(x, y) {
  pendulums.push({
    x, y,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    trail: [],
    alive: true,
    age: 0,
  });
}

function draw() {
  background(0, 3);

  for (const mag of magnets) {
    fill(mag.brightness);
    noStroke();
    circle(mag.x, mag.y, 12);
  }

  const cx = width / 2, cy = height / 2;

  for (const p of pendulums) {
    if (!p.alive) continue;

    for (let step = 0; step < 8; step++) {
      let fx = -SPRING * (p.x - cx);
      let fy = -SPRING * (p.y - cy);
      fx -= FRICTION * p.vx;
      fy -= FRICTION * p.vy;

      for (const m of magnets) {
        const dx = m.x - p.x, dy = m.y - p.y;
        const distSq = dx * dx + dy * dy + HEIGHT_SQ;
        const dist = Math.sqrt(distSq);
        const force = MAG_STRENGTH / (distSq * dist);
        fx += dx * force;
        fy += dy * force;
      }

      p.vx += fx * DT;
      p.vy += fy * DT;
      p.x += p.vx * DT;
      p.y += p.vy * DT;
    }

    let closestMag = 0;
    let closestDist = Infinity;
    for (let i = 0; i < magnets.length; i++) {
      const dx = magnets[i].x - p.x, dy = magnets[i].y - p.y;
      const d = dx * dx + dy * dy;
      if (d < closestDist) { closestDist = d; closestMag = i; }
    }

    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    const brightness = Math.min(100, 30 + speed * 50);
    const b = magnets[closestMag].brightness;
    stroke(b, b, b, 60);
    strokeWeight(1.5);

    if (p.trail.length > 0) {
      const last = p.trail[p.trail.length - 1];
      line(last.x, last.y, p.x, p.y);
    }

    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > 2000) p.trail.shift();

    p.age++;
    if (speed < 0.01 && p.age > 200) p.alive = false;
  }
}

function mousePressed() {
  spawnPendulum(mouseX, mouseY);
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}

function touchStarted() {
  spawnPendulum(mouseX, mouseY);
  return false;
}
