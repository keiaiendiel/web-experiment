// Title: Physarum
// Date: 2024-01-05
// Category: agent

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

const NUM_AGENTS = isMobile ? 6000 : 15000;
const SENSE_DIST = 14;
const SENSE_ANGLE = Math.PI / 4;
const TURN_SPEED = 0.4;
const MOVE_SPEED = 2.0;
const DEPOSIT = 5;
const DECAY = 0.97;

let trail, agents, tw, th;

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  tw = width; th = height;
  initSimulation();
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function initSimulation() {
  trail = new Float32Array(tw * th);
  agents = [];

  // Spawn across full canvas in 5 clusters + scatter
  let clusterCount = 5;
  let perCluster = Math.floor(NUM_AGENTS * 0.6 / clusterCount);
  let scattered = NUM_AGENTS - perCluster * clusterCount;

  for (let c = 0; c < clusterCount; c++) {
    let cx = Math.random() * tw;
    let cy = Math.random() * th;
    let radius = Math.min(tw, th) * 0.15;
    for (let i = 0; i < perCluster; i++) {
      let a = Math.random() * Math.PI * 2;
      let r = Math.random() * radius;
      agents.push({
        x: cx + Math.cos(a) * r,
        y: cy + Math.sin(a) * r,
        angle: Math.random() * Math.PI * 2,
      });
    }
  }

  // Remaining agents scattered across canvas
  for (let i = 0; i < scattered; i++) {
    agents.push({
      x: Math.random() * tw,
      y: Math.random() * th,
      angle: Math.random() * Math.PI * 2,
    });
  }
}

function sense(a, offset) {
  const angle = a.angle + offset;
  const sx = Math.round(a.x + Math.cos(angle) * SENSE_DIST);
  const sy = Math.round(a.y + Math.sin(angle) * SENSE_DIST);
  if (sx < 0 || sx >= tw || sy < 0 || sy >= th) return 0;
  return trail[sx + sy * tw];
}

function draw() {
  const mx = mouseX, my = mouseY;

  // Wandering auto-attractor (keeps simulation alive without mouse)
  const t = frameCount * 0.002;
  const autoX = tw * 0.5 + Math.cos(t) * tw * 0.35;
  const autoY = th * 0.5 + Math.sin(t * 0.7) * th * 0.35;

  // Second attractor orbiting opposite phase
  const auto2X = tw * 0.5 + Math.cos(t * 0.6 + Math.PI) * tw * 0.3;
  const auto2Y = th * 0.5 + Math.sin(t * 0.9 + Math.PI) * th * 0.3;

  for (const a of agents) {
    const fwd = sense(a, 0);
    const left = sense(a, SENSE_ANGLE);
    const right = sense(a, -SENSE_ANGLE);

    if (fwd > left && fwd > right) {
      // keep going
    } else if (left > right) {
      a.angle += TURN_SPEED * (0.5 + Math.random() * 0.5);
    } else if (right > left) {
      a.angle -= TURN_SPEED * (0.5 + Math.random() * 0.5);
    } else {
      a.angle += (Math.random() - 0.5) * TURN_SPEED;
    }

    // Mouse attraction
    const dx = mx - a.x;
    const dy = my - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0 && dist < 250) {
      const pull = 0.03 * (1 - dist / 250);
      a.angle += Math.atan2(dy, dx) > a.angle ? pull : -pull;
    }

    // Auto-attractor 1
    const adx = autoX - a.x;
    const ady = autoY - a.y;
    const adist = Math.sqrt(adx * adx + ady * ady);
    if (adist > 0 && adist < 350) {
      const apull = 0.015 * (1 - adist / 350);
      a.angle += Math.atan2(ady, adx) > a.angle ? apull : -apull;
    }

    // Auto-attractor 2
    const bdx = auto2X - a.x;
    const bdy = auto2Y - a.y;
    const bdist = Math.sqrt(bdx * bdx + bdy * bdy);
    if (bdist > 0 && bdist < 300) {
      const bpull = 0.01 * (1 - bdist / 300);
      a.angle += Math.atan2(bdy, bdx) > a.angle ? bpull : -bpull;
    }

    a.x += Math.cos(a.angle) * MOVE_SPEED;
    a.y += Math.sin(a.angle) * MOVE_SPEED;

    if (a.x < 0) a.x = tw - 1;
    if (a.x >= tw) a.x = 0;
    if (a.y < 0) a.y = th - 1;
    if (a.y >= th) a.y = 0;

    const ix = Math.floor(a.x);
    const iy = Math.floor(a.y);
    if (ix >= 0 && ix < tw && iy >= 0 && iy < th) {
      trail[ix + iy * tw] = Math.min(trail[ix + iy * tw] + DEPOSIT, 255);
    }
  }

  // Diffuse and decay
  const newTrail = new Float32Array(tw * th);
  for (let x = 1; x < tw - 1; x++) {
    for (let y = 1; y < th - 1; y++) {
      let sum = 0;
      for (let ddx = -1; ddx <= 1; ddx++) {
        for (let ddy = -1; ddy <= 1; ddy++) {
          sum += trail[(x + ddx) + (y + ddy) * tw];
        }
      }
      newTrail[x + y * tw] = (sum / 9) * DECAY;
    }
  }
  trail = newTrail;

  loadPixels();
  for (let i = 0; i < tw * th; i++) {
    const v = trail[i];
    const pi = i * 4;
    const tt = v / 255;
    const brightness = Math.floor(tt * 180 + tt * tt * 48);
    pixels[pi] = brightness;
    pixels[pi + 1] = brightness;
    pixels[pi + 2] = brightness;
    pixels[pi + 3] = 255;
  }
  updatePixels();
}

function mousePressed() {
  // Spawn burst of agents at click
  for (let i = 0; i < 500; i++) {
    let a = Math.random() * Math.PI * 2;
    let r = Math.random() * 50;
    agents.push({
      x: mouseX + Math.cos(a) * r,
      y: mouseY + Math.sin(a) * r,
      angle: Math.random() * Math.PI * 2,
    });
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  tw = width; th = height;
  trail = new Float32Array(tw * th);
}

function touchStarted() { }
