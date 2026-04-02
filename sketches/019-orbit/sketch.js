// Title: Orbit
// Date: 2026-03-25
// Category: particles

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

const G = 0.5;
const SOFTENING = 5;
let bodies = [];
let dragging = false;
let dragStart = null;

function setup() {
  randomSeed(SEED);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  // monochrome

  const cx = width / 2, cy = height / 2;
  const r = Math.min(width, height) * 0.25;

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * TWO_PI + (Math.random() - 0.5) * 0.3;
    const dist = r * (0.5 + Math.random() * 0.5);
    const speed = Math.sqrt(G * 30 / dist) * (0.8 + Math.random() * 0.4);
    bodies.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      vx: -Math.sin(angle) * speed,
      vy: Math.cos(angle) * speed,
      mass: 2 + Math.random() * 8,
      brightness: 80 + i * 18,
      trail: [],
    });
  }

  // Central mass
  bodies.push({
    x: cx, y: cy, vx: 0, vy: 0,
    mass: 30, brightness: 201, trail: [],
  });

  background(0);
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  background(0, 15);

  // Gravity
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i], b = bodies[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const distSq = dx * dx + dy * dy + SOFTENING * SOFTENING;
      const dist = Math.sqrt(distSq);
      const force = G * a.mass * b.mass / distSq;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx / a.mass; a.vy += fy / a.mass;
      b.vx -= fx / b.mass; b.vy -= fy / b.mass;
    }
  }

  for (const b of bodies) {
    b.x += b.vx; b.y += b.vy;
    b.trail.push({ x: b.x, y: b.y });
    if (b.trail.length > 200) b.trail.shift();
  }

  // Draw trails
  for (const b of bodies) {
    noFill();
    for (let i = 1; i < b.trail.length; i++) {
      const alpha = map(i, 0, b.trail.length, 5, 40);
      stroke(b.brightness, b.brightness, b.brightness, alpha);
      strokeWeight(b.mass * 0.1);
      line(b.trail[i - 1].x, b.trail[i - 1].y, b.trail[i].x, b.trail[i].y);
    }
  }

  // Draw bodies
  for (const b of bodies) {
    noStroke();
    fill(b.brightness);
    circle(b.x, b.y, b.mass * 1.5);
    fill(b.brightness, b.brightness, b.brightness, 30);
    circle(b.x, b.y, b.mass * 3);
  }

  // Draw drag arrow
  if (dragging && dragStart) {
    stroke(255, 80);
    strokeWeight(2);
    line(dragStart.x, dragStart.y, mouseX, mouseY);
    fill(255);
    noStroke();
    circle(dragStart.x, dragStart.y, 6);
  }
}

function mousePressed() {
  dragging = true;
  dragStart = { x: mouseX, y: mouseY };
}

function mouseReleased() {
  if (dragging && dragStart) {
    const vx = (dragStart.x - mouseX) * 0.05;
    const vy = (dragStart.y - mouseY) * 0.05;
    bodies.push({
      x: dragStart.x, y: dragStart.y,
      vx, vy,
      mass: 3 + Math.random() * 5,
      brightness: 80 + Math.floor(Math.random() * 148),
      trail: [],
    });
    if (bodies.length > 30) bodies.splice(0, 1);
  }
  dragging = false;
  dragStart = null;
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); background(0); }
function touchStarted() { }
function touchEnded() { mouseReleased(); }
