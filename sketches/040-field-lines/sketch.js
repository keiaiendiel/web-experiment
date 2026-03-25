// Title: Field Lines
// Date: 2026-03-25
// Category: flow

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const SEED = parseInt(new URLSearchParams(window.location.search).get('seed')) || Date.now();

const NUM_LINES = isMobile ? 80 : 200;
const LINE_STEPS = isMobile ? 60 : 100;
const STEP_SIZE = 3;

let charges = [];

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);

  // Initial charge configuration
  charges.push({ x: width * 0.35, y: height * 0.45, q: 1 });
  charges.push({ x: width * 0.65, y: height * 0.55, q: -1 });
  charges.push({ x: width * 0.5, y: height * 0.3, q: 0.5 });

  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  background(9, 9, 11);

  // Mouse is a moving positive charge
  const mouseCharge = { x: mouseX, y: mouseY, q: 1.5 };
  const allCharges = [...charges, mouseCharge];

  // Draw field lines from positive charges
  noFill();
  for (const charge of allCharges) {
    if (charge.q <= 0) continue;

    const linesFromThis = Math.floor(NUM_LINES * Math.abs(charge.q) / allCharges.reduce((s, c) => s + Math.max(0, c.q), 0));

    for (let i = 0; i < linesFromThis; i++) {
      const startAngle = (i / linesFromThis) * TWO_PI;
      let x = charge.x + Math.cos(startAngle) * 8;
      let y = charge.y + Math.sin(startAngle) * 8;

      beginShape();
      noFill();
      for (let step = 0; step < LINE_STEPS; step++) {
        let ex = 0, ey = 0;

        for (const c of allCharges) {
          const dx = x - c.x, dy = y - c.y;
          const distSq = dx * dx + dy * dy + 100;
          const dist = Math.sqrt(distSq);
          const force = c.q / distSq;
          ex += (dx / dist) * force;
          ey += (dy / dist) * force;
        }

        const mag = Math.sqrt(ex * ex + ey * ey);
        if (mag < 0.0001) break;
        ex /= mag;
        ey /= mag;

        const brightness = Math.max(20, 80 - step * 0.6);
        stroke(brightness, brightness, brightness, 60);
        strokeWeight(0.6);
        vertex(x, y);

        x += ex * STEP_SIZE;
        y += ey * STEP_SIZE;

        if (x < -10 || x > width + 10 || y < -10 || y > height + 10) break;

        // Check if we hit a negative charge
        let hitNeg = false;
        for (const c of allCharges) {
          if (c.q >= 0) continue;
          const dx = x - c.x, dy = y - c.y;
          if (dx * dx + dy * dy < 100) { hitNeg = true; break; }
        }
        if (hitNeg) break;
      }
      endShape();
    }
  }

  // Draw charges
  for (const c of charges) {
    noStroke();
    if (c.q > 0) {
      fill(228, 228, 220);
    } else {
      fill(9, 9, 11);
      stroke(228, 228, 220);
      strokeWeight(1);
    }
    circle(c.x, c.y, 10);
  }

  // Mouse charge indicator
  noStroke();
  fill(201, 168, 76, 100); // amber
  circle(mouseX, mouseY, 12);
}

function mousePressed() {
  // Toggle: add positive or negative charge
  const q = charges.length % 2 === 0 ? 1 : -1;
  charges.push({ x: mouseX, y: mouseY, q });
  if (charges.length > 8) charges.shift();
  return false;
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function touchStarted() { }
