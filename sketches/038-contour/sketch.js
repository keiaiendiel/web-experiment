// Title: Contour
// Date: 2026-03-25
// Category: geometry

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const SEED = parseInt(new URLSearchParams(window.location.search).get('seed')) || Date.now();

const RES = isMobile ? 6 : 4;
const NUM_LEVELS = 12;

function setup() {
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 25 : 40);
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  background(9, 9, 11);
  const t = frameCount * 0.004;
  const cols = Math.ceil(width / RES);
  const rows = Math.ceil(height / RES);

  // Generate height field
  const field = new Float32Array(cols * rows);
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let v = noise(x * 0.008, y * 0.008, t);
      // Mouse creates hill
      const dx = (x * RES - mouseX) / width;
      const dy = (y * RES - mouseY) / height;
      const md = Math.sqrt(dx * dx + dy * dy);
      if (md < 0.3) {
        v += (1 - md / 0.3) * 0.3;
      }
      field[x + y * cols] = v;
    }
  }

  // March contour lines
  stroke(228, 228, 220);
  strokeWeight(0.6);
  noFill();

  for (let level = 0; level < NUM_LEVELS; level++) {
    const threshold = (level + 1) / (NUM_LEVELS + 1);
    const brightness = 20 + (level / NUM_LEVELS) * 60;
    stroke(brightness, brightness, brightness);

    for (let x = 0; x < cols - 1; x++) {
      for (let y = 0; y < rows - 1; y++) {
        const tl = field[x + y * cols];
        const tr = field[(x + 1) + y * cols];
        const bl = field[x + (y + 1) * cols];
        const br = field[(x + 1) + (y + 1) * cols];

        // Simple marching squares (4-bit case)
        const config = (tl > threshold ? 8 : 0) |
                       (tr > threshold ? 4 : 0) |
                       (br > threshold ? 2 : 0) |
                       (bl > threshold ? 1 : 0);

        if (config === 0 || config === 15) continue;

        const px = x * RES, py = y * RES;

        // Interpolate edge crossings
        const top = lerp(px, px + RES, (threshold - tl) / (tr - tl));
        const bottom = lerp(px, px + RES, (threshold - bl) / (br - bl));
        const left = lerp(py, py + RES, (threshold - tl) / (bl - tl));
        const right = lerp(py, py + RES, (threshold - tr) / (br - tr));

        // Draw line segments based on case
        if (config === 1 || config === 14) { line(px, left, top, py); }
        else if (config === 2 || config === 13) { line(px + RES, right, bottom, py + RES); }
        else if (config === 3 || config === 12) { line(px, left, px + RES, right); }
        else if (config === 4 || config === 11) { line(top, py, px + RES, right); }
        else if (config === 5) { line(px, left, top, py); line(px + RES, right, bottom, py + RES); }
        else if (config === 6 || config === 9) { line(top, py, bottom, py + RES); }
        else if (config === 7 || config === 8) { line(px, left, bottom, py + RES); }
        else if (config === 10) { line(top, py, px + RES, right); line(px, left, bottom, py + RES); }
      }
    }
  }
}

function mousePressed() {
  noiseSeed(Date.now());
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function touchStarted() { }
