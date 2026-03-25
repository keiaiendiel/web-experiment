// Title: Differential Growth
// Date: 2026-03-25
// Category: growth

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

const MAX_DIST = 8;
const MIN_DIST = 3;
const REPEL_DIST = 20;
const REPEL_FORCE = 0.3;
const ATTRACT_FORCE = 0.2;
const MOUSE_REPEL = 120;
const MAX_POINTS = isMobile ? 3000 : 8000;

let points = [];

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);

  const r = Math.min(width, height) * 0.15;
  const n = 60;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    points.push({
      x: width / 2 + Math.cos(a) * r,
      y: height / 2 + Math.sin(a) * r,
      vx: 0, vy: 0,
    });
  }

  background(0);
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  background(0, 15);

  for (let iter = 0; iter < 3; iter++) {
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      let fx = 0, fy = 0;

      for (let j = 0; j < points.length; j++) {
        if (Math.abs(i - j) < 2 || (i === 0 && j === points.length - 1) || (j === 0 && i === points.length - 1)) continue;
        const o = points[j];
        const dx = p.x - o.x, dy = p.y - o.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < REPEL_DIST && d > 0) {
          const f = (1 - d / REPEL_DIST) * REPEL_FORCE;
          fx += (dx / d) * f;
          fy += (dy / d) * f;
        }
      }

      const prev = points[(i - 1 + points.length) % points.length];
      const next = points[(i + 1) % points.length];
      const midX = (prev.x + next.x) / 2;
      const midY = (prev.y + next.y) / 2;
      fx += (midX - p.x) * ATTRACT_FORCE;
      fy += (midY - p.y) * ATTRACT_FORCE;

      const mdx = p.x - mouseX, mdy = p.y - mouseY;
      const md = Math.sqrt(mdx * mdx + mdy * mdy);
      if (md < MOUSE_REPEL && md > 0) {
        const mf = (1 - md / MOUSE_REPEL) * 1.5;
        fx += (mdx / md) * mf;
        fy += (mdy / md) * mf;
      }

      p.vx = (p.vx + fx) * 0.5;
      p.vy = (p.vy + fy) * 0.5;
      p.x += p.vx;
      p.y += p.vy;
    }

    if (points.length < MAX_POINTS) {
      const newPoints = [];
      for (let i = 0; i < points.length; i++) {
        newPoints.push(points[i]);
        const next = points[(i + 1) % points.length];
        const dx = next.x - points[i].x, dy = next.y - points[i].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > MAX_DIST) {
          newPoints.push({
            x: (points[i].x + next.x) / 2 + (Math.random() - 0.5) * 0.5,
            y: (points[i].y + next.y) / 2 + (Math.random() - 0.5) * 0.5,
            vx: 0, vy: 0,
          });
        }
      }
      points = newPoints;
    }
  }

  noFill();
  stroke(255, 80);
  strokeWeight(0.8);
  beginShape();
  for (const p of points) {
    curveVertex(p.x, p.y);
  }
  const first = points[0], second = points[1], third = points[2];
  curveVertex(first.x, first.y);
  curveVertex(second.x, second.y);
  curveVertex(third.x, third.y);
  endShape();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}

function touchStarted() { return false; }
