// Title: Solar System
// Date: 2026-04-02
// Category: physics
// Ported from kindl.work p5.js Editor — original colors

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

const NAMES = [
  'Altair','Vega','Rigel','Polaris','Sirius','Antares','Deneb',
  'Arcturus','Betelgeuse','Capella','Fomalhaut','Spica','Regulus',
  'Aldebaran','Procyon','Canopus','Castor','Pollux','Mizar',
  'Rasalhague','Thuban','Schedar','Mirach','Almach','Enif',
  'Alnilam','Alnitak','Mintaka','Saiph','Nunki','Hadar','Acamar'
];

const MAX_STARS = isMobile ? 20 : 35;
const MAX_TRAIL = isMobile ? 100 : 200;

let galaxy;
let blackHole;

function setup() {
  randomSeed(SEED);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight, WEBGL);
  frameRate(isMobile ? 30 : 60);

  blackHole = { pos: createVector(0, height / 4, 0), mass: 50000 };
  galaxy = makeGalaxy(0, 0, 0, floor(random(5, MAX_STARS)));

  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  colorMode(RGB, 255);
  background(0);

  let rx = sin(frameCount * 0.0005) * radians(30);
  let ry = sin(frameCount * 0.0005) * radians(45);
  rotateX(rx);
  rotateY(ry);

  let speedMult = map(mouseX, 0, width, 0.3, 3.0, true);
  blackHole.mass = map(mouseY, 0, height, 10000, 150000, true);

  // Grid
  push();
  noFill();
  strokeWeight(0.1);
  stroke(100);
  for (let i = -500; i <= 500; i += 50) {
    line(i, -500, 0, i, 500, 0);
    line(-500, i, 0, 500, i, 0);
  }
  strokeWeight(0.5);
  stroke(255, 0, 0);
  line(-500, 0, 0, 500, 0, 0);
  line(0, -500, 0, 0, 500, 0);
  pop();

  // WASD
  if (keyIsDown(87)) blackHole.pos.y -= 2;
  if (keyIsDown(83)) blackHole.pos.y += 2;
  if (keyIsDown(65)) blackHole.pos.x -= 2;
  if (keyIsDown(68)) blackHole.pos.x += 2;

  // Stars
  for (let s of galaxy.stars) {
    s.angle += s.baseSpeed * speedMult;
    s.pos.x = galaxy.cx + s.rx * cos(s.angle);
    s.pos.y = galaxy.cy + s.ry * sin(s.angle);
    s.pos.z = galaxy.cz + s.rz * sin(s.angle * 2);

    // Gravity
    let fx = blackHole.pos.x - s.pos.x;
    let fy = blackHole.pos.y - s.pos.y;
    let fz = blackHole.pos.z - s.pos.z;
    let d = sqrt(fx * fx + fy * fy + fz * fz);
    let dc = constrain(d, 5, 25);
    let strength = blackHole.mass / (dc * dc);
    let inv = strength / (d || 1);
    s.pos.x += fx * inv;
    s.pos.y += fy * inv;
    s.pos.z += fz * inv;

    s.trail.push(createVector(s.pos.x, s.pos.y, s.pos.z));
    if (s.trail.length > MAX_TRAIL) s.trail.shift();

    // Trail
    let grayValue = map(s.baseSpeed, 0.0005, 0.02, 50, 255);
    noFill();
    stroke(grayValue);
    beginShape();
    for (let i = 0; i < s.trail.length; i++) {
      strokeWeight(map(i, 0, s.trail.length, 0.5, 3));
      vertex(s.trail[i].x, s.trail[i].y, s.trail[i].z);
    }
    endShape();

    // Star body
    push();
    translate(s.pos.x, s.pos.y, s.pos.z);
    noStroke();
    fill(grayValue);
    sphere(2);
    pop();
  }

  // Sun
  push();
  translate(galaxy.cx, galaxy.cy, galaxy.cz);
  noStroke();
  fill(255, 0, 0);
  sphere(10);
  pop();

  // Black hole
  push();
  translate(blackHole.pos.x, blackHole.pos.y, blackHole.pos.z);
  rotateY(frameCount * 0.001);
  rotateX(frameCount * 0.005);
  noFill();
  stroke(255);
  strokeWeight(0.2);
  torus(20, 0.5);
  sphere(10, 10, 8);
  pop();
}

function makeGalaxy(x, y, z, n) {
  let g = { cx: x, cy: y, cz: z, stars: [] };
  let used = new Set();
  for (let i = 0; i < n; i++) {
    let name;
    do { name = random(NAMES); } while (used.has(name) && used.size < NAMES.length);
    used.add(name);
    g.stars.push({
      rx: random(50, windowWidth / 2),
      ry: random(50, windowHeight / 4),
      rz: random(50, windowHeight / 4),
      angle: random(TWO_PI),
      baseSpeed: random(0.0005, 0.02),
      name: name,
      pos: createVector(),
      trail: []
    });
  }
  return g;
}

function keyPressed() {
  if (key === ' ') {
    galaxy = makeGalaxy(0, 0, 0, floor(random(5, MAX_STARS)));
    blackHole.pos.set(0, height / 4, 0);
  }
}

function mousePressed() {
  if (galaxy.stars.length >= MAX_STARS + 10) return;
  let used = new Set(galaxy.stars.map(s => s.name));
  let name;
  do { name = random(NAMES); } while (used.has(name) && used.size < NAMES.length);
  galaxy.stars.push({
    rx: random(60, width / 3),
    ry: random(60, height / 5),
    rz: random(60, height / 5),
    angle: random(TWO_PI),
    baseSpeed: random(0.001, 0.02),
    name: name,
    pos: createVector(),
    trail: []
  });
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function touchStarted() { }
