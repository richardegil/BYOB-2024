let inc = 0.1;
let scl = 80;
let cols, rows;
let zoff = 0;
let particles = [];
let flowfield;

function setup() {
  createCanvas(windowWidth, windowWidth * 0.5625);
  background(10);
  cols = floor(width / scl);
  rows = floor(height / scl);
  flowfield = new Array(cols * rows);

  for (let i = 0; i < 300; i++) {
    particles[i] = new Particle();
  }
}

function draw() {
  background(10, 20);
  let yoff = 0;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      let angle = noise(xoff, yoff, zoff) * TWO_PI * 4;
      let v = p5.Vector.fromAngle(angle);
      v.setMag(1);
      flowfield[index] = v;
      xoff += inc;
    }
    yoff += inc;
    zoff += 0.0003;
  }

  for (let i = 0; i < particles.length; i++) {
    particles[i].follow(flowfield);
    particles[i].update();
    particles[i].edges();
    particles[i].show();
    particles[i].changeColor();
  }
}

class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 4;
    this.prevPos = this.pos.copy();
    this.color = color(random(255), random(100, 255), random(100, 255));
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  show() {
    strokeWeight(2);
    stroke(this.color);
    line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
    this.updatePrev();
  }

  updatePrev() {
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
  }

  edges() {
    if (this.pos.x > width) {
      this.pos.x = 0;
      this.updatePrev();
    }
    if (this.pos.x < 0) {
      this.pos.x = width;
      this.updatePrev();
    }
    if (this.pos.y > height) {
      this.pos.y = 0;
      this.updatePrev();
    }
    if (this.pos.y < 0) {
      this.pos.y = height;
      this.updatePrev();
    }
  }

  follow(flowfield) {
    let x = floor(this.pos.x / scl);
    let y = floor(this.pos.y / scl);
    let index = x + y * cols;
    let force = flowfield[index];
    this.applyForce(force);
  }

  changeColor() {
    this.color.setRed(map(noise(frameCount * 0.01), 0, 1, 100, 255));
    this.color.setGreen(map(noise(frameCount * 0.01), 0, 1, 100, 255));
    this.color.setBlue(map(noise(frameCount * 0.01), 0, 1, 100, 255));
  }
}
