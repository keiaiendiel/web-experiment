// Title: Circle Pack
// Date: 2026-03-25
// Category: geometry

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const SEED = parseInt(new URLSearchParams(window.location.search).get('seed')) || Date.now();

const MAX_CIRCLES = isMobile ? 500 : 1500;
const GROW_SPEED = 0.3;
const ATTEMPTS = isMobile ? 5 : 15;

let circles = [];

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  circles = [];
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  background(9, 9, 11);

  // Try to place new circles
  if (circles.length < MAX_CIRCLES) {
    for (let a = 0; a < ATTEMPTS; a++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      let valid = true;

      // Check mouse exclusion zone
      const mdx = x - mouseX, mdy = y - mouseY;
      if (Math.sqrt(mdx * mdx + mdy * mdy) < 80) { valid = false; }

      if (valid) {
        for (const c of circles) {
          const dx = x - c.x, dy = y - c.y;
          if (Math.sqrt(dx * dx + dy * dy) < c.r + 2) {
            valid = false;
            break;
          }
        }
      }

      if (valid) {
        circles.push({ x, y, r: 1, growing: true });
      }
    }
  }

  // Grow circles
  for (const c of circles) {
    if (!c.growing) continue;

    c.r += GROW_SPEED;

    // Check against edges
    if (c.x - c.r < 0 || c.x + c.r > width || c.y - c.r < 0 || c.y + c.r > height) {
      c.growing = false;
      continue;
    }

    // Check against mouse
    const mdx = c.x - mouseX, mdy = c.y - mouseY;
    if (Math.sqrt(mdx * mdx + mdy * mdy) < c.r + 60) {
      c.growing = false;
      continue;
    }

    // Check against others
    for (const o of circles) {
      if (o === c) continue;
      const dx = c.x - o.x, dy = c.y - o.y;
      if (Math.sqrt(dx * dx + dy * dy) < c.r + o.r + 1) {
        c.growing = false;
        break;
      }
    }
  }

  // Render
  noFill();
  for (const c of circles) {
    const brightness = c.growing ? 180 : Math.max(25, 80 - c.r * 0.5);
    stroke(brightness, brightness, brightness * 0.95);
    strokeWeight(c.growing ? 1 : 0.5);
    circle(c.x, c.y, c.r * 2);
  }
}

function mousePressed() {
  circles = [];
  return false;
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); circles = []; }
function touchStarted() { }
