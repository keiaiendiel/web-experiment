// Title: Voronoi
// Date: 2026-03-25
// Category: tessellation

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

const NUM_SEEDS = isMobile ? 80 : 200;
const RES = isMobile ? 4 : 3;

let seeds = [];

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 20 : 30);

  for (let i = 0; i < NUM_SEEDS; i++) {
    seeds.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      hue: Math.random() * 360,
      noiseOff: Math.random() * 1000,
    });
  }

  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  const t = frameCount * 0.005;

  for (const s of seeds) {
    s.x += Math.cos(noise(s.noiseOff, t) * TWO_PI * 2) * 0.8;
    s.y += Math.sin(noise(s.noiseOff + 500, t) * TWO_PI * 2) * 0.8;

    const dx = s.x - mouseX, dy = s.y - mouseY;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < 150 && d > 0) {
      const push = (1 - d / 150) * 2;
      s.x += (dx / d) * push;
      s.y += (dy / d) * push;
    }

    if (s.x < 0) s.x += width;
    if (s.x > width) s.x -= width;
    if (s.y < 0) s.y += height;
    if (s.y > height) s.y -= height;
  }

  loadPixels();
  const w = width, h = height;

  for (let py = 0; py < h; py += RES) {
    for (let px = 0; px < w; px += RES) {
      let minDist = Infinity;
      let secondDist = Infinity;
      let closest = 0;

      for (let i = 0; i < seeds.length; i++) {
        const dx = px - seeds[i].x;
        const dy = py - seeds[i].y;
        const d = dx * dx + dy * dy;
        if (d < minDist) {
          secondDist = minDist;
          minDist = d;
          closest = i;
        } else if (d < secondDist) {
          secondDist = d;
        }
      }

      const edge = Math.sqrt(secondDist) - Math.sqrt(minDist);
      const isEdge = edge < 3;

      const s = seeds[closest];
      const distFromCenter = Math.sqrt(minDist);
      const maxDist = 80;
      const brightness = isEdge ? 255 : Math.max(0, 40 - distFromCenter * 0.3);

      const hue = s.hue / 360;
      const sat = isEdge ? 0 : 0.6;
      const val = brightness / 255;

      const rgb = hsvToRgb(hue, sat, val);

      for (let sx = 0; sx < RES && px + sx < w; sx++) {
        for (let sy = 0; sy < RES && py + sy < h; sy++) {
          const pi = ((py + sy) * w + (px + sx)) * 4;
          pixels[pi] = rgb[0];
          pixels[pi + 1] = rgb[1];
          pixels[pi + 2] = rgb[2];
          pixels[pi + 3] = 255;
        }
      }
    }
  }
  updatePixels();
}

function hsvToRgb(h, s, v) {
  let r, g, b;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function touchStarted() { return false; }
