// Title: Flowfield
// Date: 2023-10-16
// Category: flow

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

const PARTICLE_COUNT = isMobile ? 3000 : 10000;
const INC = 0.1;
const SCL = 10;

let cols, rows;
let zoff = 0;
let particles = [];
let flowfield;
let twoPiMultiplier;
let trail = 10;

function setup() {
  randomSeed(SEED);
  noiseSeed(SEED);
  frameRate(isMobile ? 30 : 40);
  colorMode(HSB, 359, 100, 100, 100);
  createCanvas(windowWidth, windowHeight);

  cols = Math.floor(width / SCL);
  rows = Math.floor(height / SCL);
  flowfield = new Array(cols * rows);
  twoPiMultiplier = 1 + Math.random() * 2;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  background(0);

  if (parent !== window) {
    parent.postMessage({ type: 'ready' }, '*');
  }
}

function draw() {
  background(0, trail);

  let yoff = 0;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      const index = x + y * cols;
      const angle = noise(xoff, yoff, zoff) * TWO_PI * twoPiMultiplier;
      const v = p5.Vector.fromAngle(angle);
      v.setMag(1);
      flowfield[index] = v;
      xoff += INC;
    }
    yoff += INC;
    zoff += 0.03;
  }

  for (let i = 0; i < particles.length; i++) {
    particles[i].follow(flowfield);
    particles[i].update();
    particles[i].edges();
    particles[i].show();
  }
}

function mousePressed() {
  for (let i = 0; i < particles.length; i++) {
    particles[i].maxspeed = Math.random() * 3;
  }
  twoPiMultiplier = Math.random() * 3;
  trail = 5 + Math.random() * 25;
}

function touchStarted() { }

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cols = Math.floor(width / SCL);
  rows = Math.floor(height / SCL);
  flowfield = new Array(cols * rows);
  background(0);
}

class Particle {
  constructor() {
    this.pos = createVector(Math.random() * width, Math.random() * height);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxspeed = 3;
    this.prevPos = this.pos.copy();
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxspeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  follow(vectors) {
    const x = Math.floor(this.pos.x / SCL);
    const y = Math.floor(this.pos.y / SCL);
    const index = x + y * cols;
    const force = vectors[index];
    if (force) this.acc.add(force);
  }

  show() {
    const speed = this.vel.mag();
    const hueValue = map(speed, 0, this.maxspeed, 350, 220);
    stroke(hueValue, 100, Math.min(this.maxspeed * 50, 100), 100);
    strokeWeight(0.5);
    line(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
  }

  edges() {
    if (this.pos.x > width) { this.pos.x = 0; this.prevPos.x = 0; }
    if (this.pos.x < 0) { this.pos.x = width; this.prevPos.x = width; }
    if (this.pos.y > height) { this.pos.y = 0; this.prevPos.y = 0; }
    if (this.pos.y < 0) { this.pos.y = height; this.prevPos.y = height; }
  }
}
