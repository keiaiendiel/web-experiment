// Title: Field Lines
// Date: 2026-03-25
// Category: flow

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const SEED = parseInt(new URLSearchParams(window.location.search).get('seed')) || Date.now();

const NUM_LINES = isMobile ? 100 : 240;
const LINE_STEPS = isMobile ? 80 : 120;
const STEP_SIZE = 3;

let charges = [];

function setup() {
  randomSeed(SEED);
  noiseSeed(SEED);
  colorMode(HSB, 360, 100, 100, 100);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);

  charges.push({ x: width * 0.35, y: height * 0.45, q: 1 });
  charges.push({ x: width * 0.65, y: height * 0.55, q: -1 });
  charges.push({ x: width * 0.5, y: height * 0.3, q: 0.5 });

  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  background(0);

  const mouseCharge = { x: mouseX, y: mouseY, q: 1.5 };
  const allCharges = [...charges, mouseCharge];

  noFill();
  for (const charge of allCharges) {
    if (charge.q <= 0) continue;

    const totalPos = allCharges.reduce((s, c) => s + Math.max(0, c.q), 0);
    const linesFromThis = Math.floor(NUM_LINES * Math.abs(charge.q) / totalPos);

    for (let i = 0; i < linesFromThis; i++) {
      const startAngle = (i / linesFromThis) * TWO_PI;
      let x = charge.x + Math.cos(startAngle) * 8;
      let y = charge.y + Math.sin(startAngle) * 8;

      beginShape();
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

        // Color by field strength: strong = warm pink/red, weak = cool blue
        const strength = constrain(mag * 8000, 0, 1);
        const hue = lerp(220, 350, strength);
        const bright = lerp(70, 100, strength);
        const alpha = lerp(50, 85, strength);
        const weight = lerp(0.3, 1.2, strength);

        stroke(hue, 90, bright, alpha);
        strokeWeight(weight);
        vertex(x, y);

        x += ex * STEP_SIZE;
        y += ey * STEP_SIZE;

        if (x < -10 || x > width + 10 || y < -10 || y > height + 10) break;

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
      fill(0, 0, 95);
    } else {
      fill(0, 0, 5);
      stroke(0, 0, 80);
      strokeWeight(1);
    }
    circle(c.x, c.y, 12);
  }

  // Mouse charge
  noStroke();
  fill(40, 80, 80, 60);
  circle(mouseX, mouseY, 14);
}

function mousePressed() {
  const q = charges.length % 2 === 0 ? 1 : -1;
  charges.push({ x: mouseX, y: mouseY, q });
  if (charges.length > 8) charges.shift();
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function touchStarted() { }
