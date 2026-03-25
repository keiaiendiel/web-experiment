// Title: Signal
// Date: 2026-03-25
// Category: machine

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const SEED = parseInt(new URLSearchParams(window.location.search).get('seed')) || Date.now();

const NUM_WAVES = 6;
let waves = [];

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);

  const sectionH = height / NUM_WAVES;
  for (let i = 0; i < NUM_WAVES; i++) {
    waves.push({
      y: sectionH * (i + 0.5),
      freq: 0.005 + Math.random() * 0.02,
      amp: sectionH * 0.25,
      speed: 0.02 + Math.random() * 0.03,
      phase: Math.random() * TWO_PI,
      noiseOff: Math.random() * 1000,
      thickness: 0.5 + Math.random() * 1,
    });
  }

  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  background(9, 9, 11, 40);

  const mx = mouseX / width;
  const my = mouseY / height;
  const t = frameCount;

  for (let w = 0; w < waves.length; w++) {
    const wave = waves[w];
    const distFromMouse = Math.abs(wave.y - mouseY) / height;
    const mouseAmp = 1 + (1 - distFromMouse) * 2 * my;
    const freqMod = wave.freq * (1 + mx * 3);

    noFill();
    beginShape();
    for (let x = 0; x < width; x += 2) {
      const n = noise(x * wave.freq + wave.noiseOff, t * wave.speed);
      const sine = Math.sin(x * freqMod + t * wave.speed * 3 + wave.phase);
      const val = (n * 0.6 + sine * 0.4) * wave.amp * mouseAmp;

      const y = wave.y + val;
      const brightness = 40 + Math.abs(val / wave.amp) * 140;

      stroke(brightness, brightness, brightness, 80);
      strokeWeight(wave.thickness);
      vertex(x, y);
    }
    endShape();

    // Baseline
    stroke(228, 228, 220, 8);
    strokeWeight(0.3);
    line(0, wave.y, width, wave.y);
  }
}

function mousePressed() {
  for (const w of waves) {
    w.freq = 0.005 + Math.random() * 0.02;
    w.speed = 0.02 + Math.random() * 0.03;
    w.phase = Math.random() * TWO_PI;
  }
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  const sectionH = height / NUM_WAVES;
  for (let i = 0; i < NUM_WAVES; i++) {
    waves[i].y = sectionH * (i + 0.5);
    waves[i].amp = sectionH * 0.25;
  }
}
function touchStarted() { }
