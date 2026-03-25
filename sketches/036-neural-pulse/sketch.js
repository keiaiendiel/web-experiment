// Title: Neural Pulse
// Date: 2026-03-25
// Category: machine

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const SEED = parseInt(new URLSearchParams(window.location.search).get('seed')) || Date.now();

const NUM_NODES = isMobile ? 60 : 120;
const CONNECTION_DIST = isMobile ? 120 : 100;
let nodes = [];
let pulses = [];

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);

  for (let i = 0; i < NUM_NODES; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      energy: 0,
      noiseOff: Math.random() * 1000,
    });
  }

  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  background(9, 9, 11, 30);
  const t = frameCount * 0.003;

  // Move nodes
  for (const n of nodes) {
    n.x += n.vx + (noise(n.noiseOff, t) - 0.5) * 0.5;
    n.y += n.vy + (noise(n.noiseOff + 100, t) - 0.5) * 0.5;
    if (n.x < 0 || n.x > width) n.vx *= -1;
    if (n.y < 0 || n.y > height) n.vy *= -1;
    n.x = constrain(n.x, 0, width);
    n.y = constrain(n.y, 0, height);
    n.energy *= 0.95;
  }

  // Draw connections
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < CONNECTION_DIST) {
        const alpha = (1 - d / CONNECTION_DIST) * 30;
        const energy = (a.energy + b.energy) * 0.5;
        if (energy > 0.1) {
          stroke(201, 168, 76, alpha + energy * 100); // amber pulse
        } else {
          stroke(228, 228, 228, alpha);
        }
        strokeWeight(0.5);
        line(a.x, a.y, b.x, b.y);
      }
    }
  }

  // Draw nodes
  for (const n of nodes) {
    const brightness = 40 + n.energy * 188;
    noStroke();
    if (n.energy > 0.3) {
      fill(201, 168, 76, n.energy * 200); // amber glow
      circle(n.x, n.y, 8 + n.energy * 8);
    }
    fill(brightness, brightness, brightness);
    circle(n.x, n.y, 3);
  }

  // Traveling pulses
  for (let i = pulses.length - 1; i >= 0; i--) {
    const p = pulses[i];
    p.progress += 0.03;
    if (p.progress >= 1) {
      nodes[p.to].energy = Math.min(1, nodes[p.to].energy + 0.5);
      // Cascade: randomly fire to a neighbor
      if (Math.random() < 0.4) {
        firePulseFrom(p.to);
      }
      pulses.splice(i, 1);
      continue;
    }
    const a = nodes[p.from], b = nodes[p.to];
    const x = a.x + (b.x - a.x) * p.progress;
    const y = a.y + (b.y - a.y) * p.progress;
    fill(201, 168, 76);
    noStroke();
    circle(x, y, 4);
  }

  // Random spontaneous firing
  if (Math.random() < 0.02) {
    const idx = Math.floor(Math.random() * nodes.length);
    firePulseFrom(idx);
  }
}

function firePulseFrom(idx) {
  const n = nodes[idx];
  n.energy = 1;
  for (let j = 0; j < nodes.length; j++) {
    if (j === idx) continue;
    const o = nodes[j];
    const d = Math.sqrt((n.x - o.x) ** 2 + (n.y - o.y) ** 2);
    if (d < CONNECTION_DIST && Math.random() < 0.3) {
      pulses.push({ from: idx, to: j, progress: 0 });
    }
  }
}

function mousePressed() {
  // Find nearest node and fire
  let closest = 0, closestDist = Infinity;
  for (let i = 0; i < nodes.length; i++) {
    const d = Math.sqrt((nodes[i].x - mouseX) ** 2 + (nodes[i].y - mouseY) ** 2);
    if (d < closestDist) { closest = i; closestDist = d; }
  }
  firePulseFrom(closest);
  return false;
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function touchStarted() { }
