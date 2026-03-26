// Title: Ecosystem
// Date: 2024-10-28
// Category: machine
// Adapted from kindl.work p5.js Editor (9FKRmE06W)

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const NUM = isMobile ? 30 : 50;
const PERCEPTION = 50;
const MAX_SPEED = 5;
const MAX_FORCE = 0.05;
const MAX_ENERGY = 100;
const DEPLETE_RATE = MAX_ENERGY / (20 * 60);
const GAIN_RATE = MAX_ENERGY / (2.5 * 60);
const ATTRACTOR_R = 100;

let organisms = [];
let attractor = null;

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  for (let i = 0; i < NUM; i++) {
    organisms.push(makeOrg(Math.random() * width, Math.random() * height));
  }
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function makeOrg(x, y) {
  return {
    x, y,
    vx: (Math.random() - 0.5) * MAX_SPEED * 2,
    vy: (Math.random() - 0.5) * MAX_SPEED * 2,
    ax: 0, ay: 0,
    energy: MAX_ENERGY,
    dead: false, blink: 0, cooldown: 0,
  };
}

function draw() {
  background(0, 50);

  // Draw attractor
  if (attractor) {
    stroke(228, 100 + 50 * Math.sin(frameCount * 0.05));
    noFill();
    circle(attractor.x, attractor.y, ATTRACTOR_R * 2);
  }

  for (const o of organisms) {
    if (o.dead) {
      o.blink++;
      if (o.blink % 60 < 30) { fill(120); } else { fill(0); }
      noStroke();
      circle(o.x, o.y, 5);
      continue;
    }

    if (o.cooldown > 0) o.cooldown--;
    else o.energy -= DEPLETE_RATE;

    if (o.energy <= 0) { o.energy = 0; o.dead = true; continue; }

    // Seek attractor if low energy
    if (o.energy < 70 && attractor) {
      const d = dist(o.x, o.y, attractor.x, attractor.y);
      if (d < ATTRACTOR_R) o.energy = Math.min(o.energy + GAIN_RATE, MAX_ENERGY);
      const dx = attractor.x - o.x, dy = attractor.y - o.y;
      const mag = Math.sqrt(dx * dx + dy * dy) + 1;
      o.ax += (dx / mag * MAX_SPEED - o.vx) * MAX_FORCE;
      o.ay += (dy / mag * MAX_SPEED - o.vy) * MAX_FORCE;
    } else if (o.energy > 70) {
      // Seek nearest dead
      let closest = null, minD = Infinity;
      for (const other of organisms) {
        if (!other.dead) continue;
        const d = dist(o.x, o.y, other.x, other.y);
        if (d < minD) { minD = d; closest = other; }
      }
      if (closest && minD < 10) {
        closest.dead = false;
        closest.energy = o.energy / 2;
        closest.cooldown = 120;
        o.energy /= 4;
      } else if (closest) {
        const dx = closest.x - o.x, dy = closest.y - o.y;
        const mag = Math.sqrt(dx * dx + dy * dy) + 1;
        o.ax += (dx / mag * MAX_SPEED - o.vx) * MAX_FORCE;
        o.ay += (dy / mag * MAX_SPEED - o.vy) * MAX_FORCE;
      }
    }

    // Flocking
    let sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0, n = 0;
    for (const other of organisms) {
      if (other === o || other.dead) continue;
      const d = dist(o.x, o.y, other.x, other.y);
      if (d < PERCEPTION && d > 0) {
        sx += (o.x - other.x) / d / d;
        sy += (o.y - other.y) / d / d;
        ax += other.vx; ay += other.vy;
        cx += other.x; cy += other.y;
        n++;
      }
    }
    if (n > 0) {
      o.ax += sx / n * 1.5 + (ax / n - o.vx) * 0.05 + (cx / n - o.x) * 0.001;
      o.ay += sy / n * 1.5 + (ay / n - o.vy) * 0.05 + (cy / n - o.y) * 0.001;
    }

    o.vx += o.ax; o.vy += o.ay;
    const speed = Math.sqrt(o.vx * o.vx + o.vy * o.vy);
    if (speed > MAX_SPEED) { o.vx = o.vx / speed * MAX_SPEED; o.vy = o.vy / speed * MAX_SPEED; }
    o.x += o.vx; o.y += o.vy;
    o.ax = 0; o.ay = 0;

    if (o.x > width) o.x = 0; if (o.x < 0) o.x = width;
    if (o.y > height) o.y = 0; if (o.y < 0) o.y = height;

    // Draw as triangle
    const angle = Math.atan2(o.vy, o.vx) + HALF_PI;
    const brightness = Math.floor(40 + (o.energy / MAX_ENERGY) * 188);
    fill(brightness);
    noStroke();
    push();
    translate(o.x, o.y);
    rotate(angle);
    triangle(0, -10, -5, 10, 5, 10);
    pop();
  }
}

function mousePressed() { attractor = createVector(mouseX, mouseY); }
function mouseDragged() { if (attractor) attractor.set(mouseX, mouseY); }
function mouseReleased() { attractor = null; }
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function touchStarted() { }
function touchMoved() { if (attractor) attractor.set(mouseX, mouseY); }
function touchEnded() { attractor = null; }
