// Title: Solar System
// Date: 2026-04-02
// Category: physics

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed')) || Date.now();

const AMBER = [201, 168, 76];
const WHITE = [228, 228, 231];

const NAMES = [
  'Altair','Vega','Rigel','Polaris','Sirius','Antares','Deneb',
  'Arcturus','Betelgeuse','Capella','Fomalhaut','Spica','Regulus',
  'Aldebaran','Procyon','Canopus','Castor','Pollux','Mizar',
  'Rasalhague','Thuban','Schedar','Mirach','Almach','Enif',
  'Alnilam','Alnitak','Mintaka','Saiph','Nunki','Hadar','Acamar',
  'Eltanin','Kornephoros','Sabik','Albireo','Sadalsuud','Alphecca'
];

let galaxy;
let blackHole;
let monoFont;

function preload() {
  monoFont = loadFont('../../fonts/DegularMono-Medium.otf');
}

function setup() {
  pixelDensity(1);
  randomSeed(SEED);
  noiseSeed(SEED);
  createCanvas(windowWidth, windowHeight, WEBGL);
  frameRate(isMobile ? 30 : 60);
  textFont(monoFont);

  blackHole = { pos: createVector(0, height / 4, 0), mass: 50000 };
  galaxy = makeGalaxy(0, 0, 0, floor(random(8, isMobile ? 25 : 45)));

  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function draw() {
  background(9, 9, 11);

  let rx = sin(frameCount * 0.0005) * radians(30);
  let ry = sin(frameCount * 0.0007) * radians(45);
  rotateX(rx);
  rotateY(ry);

  let speedMult = map(mouseX, 0, width, 0.3, 3.0, true);
  blackHole.mass = map(mouseY, 0, height, 10000, 150000, true);

  drawGrid();

  // WASD moves black hole
  if (keyIsDown(87)) blackHole.pos.y -= 2;
  if (keyIsDown(83)) blackHole.pos.y += 2;
  if (keyIsDown(65)) blackHole.pos.x -= 2;
  if (keyIsDown(68)) blackHole.pos.x += 2;

  // Update & draw stars
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
    d = constrain(d, 5, 25);
    let strength = blackHole.mass / (d * d);
    let invD = strength / sqrt(fx * fx + fy * fy + fz * fz || 1);
    s.pos.x += fx * invD;
    s.pos.y += fy * invD;
    s.pos.z += fz * invD;

    s.trail.push(createVector(s.pos.x, s.pos.y, s.pos.z));
    if (s.trail.length > s.maxTrail) s.trail.shift();

    drawStar(s);
  }

  // Sun
  push();
  translate(galaxy.cx, galaxy.cy, galaxy.cz);
  noStroke();
  fill(AMBER[0], AMBER[1], AMBER[2]);
  sphere(8);
  pop();

  // Black hole
  drawBlackHole();
}

function drawStar(s) {
  let bright = map(s.baseSpeed, 0.0005, 0.02, 70, 210);
  let len = s.trail.length;

  // Trail: 3-segment fade
  if (len > 3) {
    noFill();
    let seg = floor(len / 3);
    for (let i = 0; i < 3; i++) {
      let a = map(i, 0, 2, 25, 140);
      let w = map(i, 0, 2, 0.4, 1.5);
      stroke(bright, bright, bright, a);
      strokeWeight(w);
      beginShape();
      let from = i * seg;
      let to = (i === 2) ? len : (i + 1) * seg + 1;
      for (let j = from; j < to; j++) {
        vertex(s.trail[j].x, s.trail[j].y, s.trail[j].z);
      }
      endShape();
    }
  }

  // Body
  push();
  translate(s.pos.x, s.pos.y, s.pos.z);
  noStroke();
  fill(bright + 30);
  sphere(2);
  // Label
  fill(WHITE[0], WHITE[1], WHITE[2], 140);
  textSize(isMobile ? 7 : 9);
  textAlign(LEFT);
  text(s.name, 8, 0);
  pop();
}

function drawBlackHole() {
  push();
  translate(blackHole.pos.x, blackHole.pos.y, blackHole.pos.z);
  rotateY(frameCount * 0.002);
  rotateX(frameCount * 0.005);
  noFill();
  stroke(WHITE[0], WHITE[1], WHITE[2]);
  strokeWeight(0.3);
  torus(18, 0.5);
  stroke(AMBER[0], AMBER[1], AMBER[2], 180);
  strokeWeight(0.2);
  torus(22, 0.3);
  noStroke();
  fill(WHITE[0], WHITE[1], WHITE[2]);
  sphere(5, 8, 6);
  pop();
}

function drawGrid() {
  push();
  noFill();
  stroke(255, 18);
  strokeWeight(0.12);
  for (let i = -500; i <= 500; i += 100) {
    line(i, -500, 0, i, 500, 0);
    line(-500, i, 0, 500, i, 0);
  }
  stroke(255, 35);
  strokeWeight(0.25);
  line(-500, 0, 0, 500, 0, 0);
  line(0, -500, 0, 0, 500, 0);
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
      rx: random(50, windowWidth / 2.5),
      ry: random(50, windowHeight / 4),
      rz: random(50, windowHeight / 4),
      angle: random(TWO_PI),
      baseSpeed: random(0.0005, 0.02),
      name: name,
      pos: createVector(),
      trail: [],
      maxTrail: isMobile ? 120 : 300
    });
  }
  return g;
}

function keyPressed() {
  if (key === ' ') {
    galaxy = makeGalaxy(0, 0, 0, floor(random(8, isMobile ? 25 : 45)));
    blackHole.pos.set(0, height / 4, 0);
  }
}

function mousePressed() {
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
    trail: [],
    maxTrail: isMobile ? 120 : 300
  });
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function touchStarted() { }
