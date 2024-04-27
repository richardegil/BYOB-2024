let shdr;
let vertSource, fragSource;
let cnvs1;

const flock = [];

let alignSlider;
let cohesionSlider;
let separationSlider;

let backgroundColor = []; let strokeColor = [];


let noiseOffsetX = 0;
let noiseOffsetY = 1000;


function preload() {
  vertSource = loadStrings('shaders/default.vert');
  fragSource = loadStrings('shaders/default.frag');
}

function setup() {
  pixelDensity(2);
  // colorMode(HSB, 360, 100, 100);
  // maxCanvas = min(windowWidth, windowHeight);

  createCanvas(windowWidth, windowWidth * 0.5625, WEBGL);
  alignSlider = createSlider(0, 5, 1, 0.1);
  cohesionSlider = createSlider(0, 5, 1, 0.1);
  separationSlider = createSlider(0, 5, 1.25, 0.1);
  cnvs1 = createGraphics(windowWidth, windowWidth * 0.5625, WEBGL);

  // for(let i = 0; i < 100; i++) {
  //   flock.push(new Boid());
  // }

  palette = floor(random(palettes.length));
  initialColor = floor(random(5));
  getColor(palette, initialColor);
  backgroundColor = [h, s, b];

  palette = floor(random(palettes.length));
  initialColor = floor(random(5));
  getColor(palette, initialColor);
  strokeColor = [h, s, b];
  
  vertSource = resolveLygia(vertSource);
  fragSource = resolveLygia(fragSource);
  shdr = createShader(vertSource, fragSource);
}

function draw() {

  // if (frameCount === 100) {
  //   const capture = P5Capture.getInstance();
  //   capture.start({
  //     format: "jpg",
  //     duration: 300,
  //   });
  // }

  translate(-width, -height / 2);
  let offset = map(sin(millis() * 0.01), -1, 1, -width, width);
  offset = 0;

  cnvs1.push();
  // cnvs1.translate(width / 2, height / 2);
  cnvs1.ellipseMode(CENTER);
  cnvs1.clear();
  cnvs1.background(backgroundColor[0], backgroundColor[1], backgroundColor[2], 0.5);
  cnvs1.fill(255, 0, 0);
  cnvs1.noStroke();
  cnvs1.ellipse(0, 0, width * 0.5, width * 0.5);
  // drawLines();
  
  cnvs1.pop();
  drawLines();
  
  
  shader(shdr);
  shdr.setUniform('u_tex0', cnvs1);
  shdr.setUniform('u_offset', offset);
  shdr.setUniform('u_resolution', [width, height] );
  shdr.setUniform('u_mouse', [mouseX, mouseY]);
  shdr.setUniform('u_time', millis() / 500.0);
  rect(0, 0, width, height);

}


function keyPressed() {
  if (key === 's') {
    save(`exports/reg_BYOB2024_${prompt}__.png`);
  }
}

function drawGlitter() {
  // Add random glittering lights
  fill(255);
  for (let i = 0; i < 5; i++) {
    let glitterX = random(width);
    let glitterY = random(height);
    ellipse(glitterX, glitterY, 2, 2);
  }
}

function drawLines() {
  stroke(255);
  translate(width / 2, 0);
  for (let y = 0; y < height + 20; y += 20) {
    beginShape();
    for (let x = 0; x < width; x += 5) {
      let noiseValue = noise(noiseOffsetX + x * 0.005, noiseOffsetY + y * 0.005);
      let yOffset = map(noiseValue, 0, 1, -10, 10);
      vertex(x, y + yOffset);
    }
    endShape();
  }

  // Increment noise offset for animation
  noiseOffsetX += 0.01;
  noiseOffsetY += 0.01;
}