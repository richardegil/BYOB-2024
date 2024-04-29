/* ------------------------------ */
// PROJECT INFO
/* ------------------------------ */
let filename = getProjectName();

/* ------------------------------ */
// DATE
/* ------------------------------ */
let currentMoment = getCurrentDate();

/* ------------------------------ */
// VARIABLES
/* ------------------------------ */
let shapes = [];
const numberOfShapes = 10;

function setup() {
  // MAIN CANVAS
  createCanvas(windowWidth, windowWidth * 0.5625, WEBGL);
  
  // SKETCH SETTINGS
  pixelDensity(2);
  colorMode(HSB, 360, 100, 100, 100);
  angleMode(DEGREES);


  for(let i = 0; i < numberOfShapes; i++) {
    shapes.push(new Shape());
  }
}

function draw() {
  translate( -width / 2, -height / 2);
  background('slategrey');


  stroke('white');
  rectMode(CENTER);
  rect(width / 2, 0, 100, 100);

  push();
    for (let i = 0; i < shapes.length; i++) {
      shapes[i].move();
      shapes[i].display();
    }
  pop();
}

function keyPressed() {
  if (key === 's') {
    save(`reg_${filename}_${currentMoment}.png`);
  }
}


class Shape {
  constructor() {
    this.init();
    this.y = random(-this.r * 0.75, height + this.r * 0.75);
  }

  init() {
    this.r = random(width * 0.05, width * 0.25);
    this.x = random(width);
    this.y = height + this.r * 0.75;
    this.speed = random(2, 8);
    // this.colorInside = color(random(360), 100, 100);
    // this.colorOutside = color(
    //   hue(this.colorInside),
    //   saturation(this.colorInside),
    //   60
    // );
    // this.colorInside = random(palette);
    // this.colorOutside = color(
    //   hue(this.colorInside),
    //   saturation(this.colorInside) * 0.8,
    //   brightness(this.colorInside) * 0.25
    // );
  }

  move() {
    this.y -= this.speed;

    if (this.y < -this.r * 0.75) {
      this.init();
    }

  }

  display() {
    push();
    translate(this.x, this.y);

    push();
    fill("#02328B");
    // fill(this.colorOutside);
    ellipse(0, 0, this.r);
    pop();

    push();
    fill("#08D6F3");
    circle(0, 0, this.r);
    pop();

    push();
    fill(0, 0, 100, 97);
    circle(0, 0, this.r);
    pop();

    pop();
  }
}