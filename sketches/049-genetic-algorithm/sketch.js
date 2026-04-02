// Title: Genetic Algorithm
// Date: 2024-10-28
// Category: machine
// Adapted from kindl.work p5.js Editor (Dh_qLSlsT + eexhGrN91)

p5.disableFriendlyErrors = true;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const POP_SIZE = isMobile ? 60 : 100;
const LIFESPAN = 200;
const MUTATION = 0.02;
const MAX_FORCE = 0.5;

let population = [];
let obstacles = [];
let lifeCounter = 0;
let generation = 0;
let avgFitness = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(isMobile ? 30 : 60);
  initPop();
  if (parent !== window) parent.postMessage({ type: 'ready' }, '*');
}

function initPop() {
  population = [];
  for (let i = 0; i < POP_SIZE; i++) population.push(makeParticle());
}

function makeParticle(dna) {
  return {
    x: width / 2, y: height / 2,
    vx: 0, vy: 0, ax: 0, ay: 0,
    dna: dna || makeDNA(),
    gene: 0, fitness: 0, stopped: false, hit: false,
  };
}

function makeDNA() {
  const genes = [];
  for (let i = 0; i < LIFESPAN; i++) {
    const a = Math.random() * TWO_PI;
    const m = Math.random() * map(i, 0, LIFESPAN, MAX_FORCE, 0);
    genes.push({ x: Math.cos(a) * m, y: Math.sin(a) * m });
  }
  return genes;
}

function draw() {
  background(0, 50);

  // Draw obstacles
  noStroke();
  fill(228, 40);
  for (const o of obstacles) circle(o.x, o.y, o.r * 2);

  // Lines between close particles
  stroke(228, 20);
  strokeWeight(0.3);
  for (let i = 0; i < population.length; i++) {
    for (let j = i + 1; j < population.length; j++) {
      const dx = population[i].x - population[j].x;
      const dy = population[i].y - population[j].y;
      if (dx * dx + dy * dy < 10000) {
        line(population[i].x, population[i].y, population[j].x, population[j].y);
      }
    }
  }

  // Update particles
  for (const p of population) {
    if (p.stopped) continue;
    const g = p.dna[p.gene % p.dna.length];
    p.gene++;
    p.ax += g.x; p.ay += g.y;

    // Avoid obstacles
    for (const o of obstacles) {
      const dx = p.x - o.x, dy = p.y - o.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < o.r + 50) { p.ax += (dx / d) * 0.5; p.ay += (dy / d) * 0.5; }
      if (d < o.r + 4) { p.hit = true; p.stopped = true; }
    }

    p.vx += p.ax; p.vy += p.ay;
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speed > 5) { p.vx = p.vx / speed * 5; p.vy = p.vy / speed * 5; }
    p.x += p.vx; p.y += p.vy;
    p.ax = 0; p.ay = 0;
    p.vx *= 0.975; p.vy *= 0.975;
    p.x = constrain(p.x, 0, width); p.y = constrain(p.y, 0, height);
    if (lifeCounter >= LIFESPAN - 1) p.stopped = true;
  }

  // Draw particles
  noStroke();
  for (const p of population) {
    fill(p.hit ? 80 : 228);
    circle(p.x, p.y, 4);
  }

  lifeCounter++;
  if (lifeCounter >= LIFESPAN) {
    evaluate();
    select();
    lifeCounter = 0;
    generation++;
  }

  // HUD
  fill(201, 168, 76);
  noStroke();
  textSize(10);
  textFont('monospace');
  text(`gen ${generation}  life ${lifeCounter}/${LIFESPAN}  fitness ${avgFitness.toFixed(3)}`, 10, 20);
}

function evaluate() {
  let maxF = 0, sumF = 0;
  for (const p of population) {
    let total = 0, count = 0;
    for (const o of population) {
      if (o !== p) { total += dist(p.x, p.y, o.x, o.y); count++; }
    }
    p.fitness = 1 / (Math.abs(total / count - 100) + 0.01);
    if (p.hit) p.fitness *= 0.1;
    sumF += p.fitness;
    if (p.fitness > maxF) maxF = p.fitness;
  }
  avgFitness = sumF / population.length;
  for (const p of population) p.fitness /= maxF;
}

function select() {
  const pool = [];
  for (const p of population) {
    const n = Math.floor(p.fitness * 100);
    for (let i = 0; i < n; i++) pool.push(p);
  }
  const newPop = [];
  for (let i = 0; i < POP_SIZE; i++) {
    const a = pool[Math.floor(Math.random() * pool.length)].dna;
    const b = pool[Math.floor(Math.random() * pool.length)].dna;
    const mid = Math.floor(Math.random() * a.length);
    const child = a.map((g, idx) => idx > mid ? g : b[idx]);
    for (let j = 0; j < child.length; j++) {
      if (Math.random() < MUTATION) {
        const ang = Math.random() * TWO_PI;
        const mag = Math.random() * map(j, 0, LIFESPAN, MAX_FORCE, 0);
        child[j] = { x: Math.cos(ang) * mag, y: Math.sin(ang) * mag };
      }
    }
    newPop.push(makeParticle(child));
  }
  population = newPop;
}

function mouseDragged() {
  obstacles.push({ x: mouseX, y: mouseY, r: 20 });
}

function mousePressed() { }
function windowResized() { resizeCanvas(windowWidth, windowHeight); obstacles = []; initPop(); generation = 0; lifeCounter = 0; }
function touchStarted() { }
