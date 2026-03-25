// Title: [name]
// Date: [YYYY-MM-DD]
// Category: [flow|automata|growth|particles|audio|vision|physics|chaos|typography|swarm|tessellation]

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);

  if (parent !== window) {
    parent.postMessage({ type: 'ready' }, '*');
  }
}

function draw() {
  background(0);
  // sketch code here
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function touchStarted() {
  return false;
}
