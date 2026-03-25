// Title: Physarum
// Date: 2026-03-25
// Category: agent

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

const NUM_AGENTS = isMobile ? 2000 : 5000;
const SENSE_DIST = 9;
const SENSE_ANGLE = Math.PI / 4;
const TURN_SPEED = 0.3;
const MOVE_SPEED = 1.5;
const DEPOSIT = 5;
const DECAY = 0.97;

let trail, agents, tw, th;

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  tw = width; th = height;
  trail = new Float32Array(tw * th);
  agents = [];
  for (let i = 0; i < NUM_AGENTS; i++) {
    agents.push({
      x: width / 2 + (Math.random() - 0.5) * 100,
      y: height / 2 + (Math.random() - 0.5) * 100,
      angle: Math.random() * Math.PI * 2,
    });
  }
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
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

    const dx = mx - a.x;
    const dy = my - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0 && dist < 200) {
      const pull = 0.02 * (1 - dist / 200);
      a.angle += Math.atan2(dy, dx) > a.angle ? pull : -pull;
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
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          sum += trail[(x + dx) + (y + dy) * tw];
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
    const t = v / 255;
    pixels[pi] = Math.floor(t * 120 + t * t * 135);
    pixels[pi + 1] = Math.floor(t * 200 + t * t * 55);
    pixels[pi + 2] = Math.floor(t * 80 + t * t * 175);
    pixels[pi + 3] = 255;
  }
  updatePixels();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  tw = width; th = height;
  trail = new Float32Array(tw * th);
}

function touchStarted() { return false; }
