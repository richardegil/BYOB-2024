/* ------------------------------ */
// PROJECT INFO0
/* ------------------------------ */
let filename = getProjectName();

/* ------------------------------ */
// DATE
/* ------------------------------ */
let currentMoment = getCurrentDate();

/* ------------------------------ */
// VARIABLES
/* ------------------------------ */
// --- CANVASES
let cnvs = [];
let currentCanvas;

// --- TIME
let currentPercentage;
let interval = 1000;
let start = '2024-05-04T17:40:00';
let finish = '2024-05-04T18:00:00';

// --- SHAPES (unused right now)
let shapes = [];
const numberOfShapes = 10;

// --- RINGS
let radius = 100;
let vertices = 360;
let angle;
  

// --- COLORS
let palette;
let initialColor;
let strokeColor;
let backgroundColor;

/* ------------------------------ */
// SHADERS
/* ------------------------------ */
let theShader;
let f = 'standardFragmentShader';
let v = 'vertexShader';

function setup() {
	// --- MAIN CANVAS
	createCanvas(windowWidth, windowWidth * 0.5625, WEBGL);

	// --- SECONDARY CANVASES 
	cnvs[0] = createGraphics(windowWidth, windowWidth * 0.5625, WEBGL);
  cnvs[1] = createGraphics(windowWidth, windowWidth * 0.5625, WEBGL);
	cnvs[2] = createGraphics(windowWidth, windowWidth * 0.5625, WEBGL);
	cnvs[3] = createGraphics(windowWidth, windowWidth * 0.5625, WEBGL);
	cnvs[4] = createGraphics(windowWidth, windowWidth * 0.5625, WEBGL);
  currentCanvas = cnvs[0];

  // --- MIDI
  initMIDI();

	// --- SKETCH SETTINGS
	pixelDensity(2);
	colorMode(HSB, 360, 100, 100, 100);
	angleMode(DEGREES);
	smooth();
  colorChange();

	angle = TWO_PI / vertices;

  palette = floor(random(palettes.length));
  initialColor = floor(random(5));
  getColor(palette, initialColor);
  backgroundColor = [h, s, b];
}

function draw() {
	background(backgroundColor[0], backgroundColor[1], backgroundColor[2]);
	theShader = getShader(v, f);
	smooth();
	noStroke();
	translate(-width / 2, -height / 2);
	rectMode(CENTER);
  drawWaves(cnvs[1]);
	// drawRings(cnvs[2]);
	drawSuns(cnvs[3], currentPercentage);
	noStroke();
	shader(theShader);
	theShader.setUniform('u_tex0', currentCanvas);
	// theShader.setUniform('u_offset', offset);
	theShader.setUniform('u_resolution', [width, height]);
	theShader.setUniform('u_mouse', [mouseX, mouseY]);
	theShader.setUniform('u_time', millis() / 500.0);
	rect(0, 0, width, height);
	// console.log({currentPercentage});
}

// --- KEYPRESS LOGIC
function keyPressed() {
  console.log({key});
	if (key === 's') {
		save(`reg_${filename}_${currentMoment}.png`);
	}
	
	if (key === '1') {
		f = 'standard';
	}
	
	if (key === '2') {
		f = 'kaleidoscope';
	}
	
	if (key === '3') {
		f = 'mirrored';
	}
	
	if (key === '4') {
		f = 'tiled';
	}
}

// --- SHADER LOGIC
function getShader(v, f) {	
	let vert;
	let frag;
	
	let vertexShader = `
		#ifdef GL_ES
		precision mediump float;
		#endif

		attribute vec3 aPosition;

		varying vec2   v_texcoord;

		void main() { 
			v_texcoord = aPosition.xy;
			v_texcoord.y = 1.0-v_texcoord.y;
			gl_Position = vec4(aPosition * 2.0 - 1.0, 1.0); 
		}
  `;

	let kaleidoscopeFragmentShader = `
		#ifdef GL_ES
		precision highp float;
		#endif

		# define SEGMENTS 14.0  
		# define PI 3.141592653589

		uniform sampler2D   u_tex0;
		uniform vec2        u_resolution;
		uniform float       u_time;
		uniform float       u_offset;
		uniform vec2 u_mouse;

		varying vec2        v_texcoord;

		void main (void) {
			// vec3 color = vec3(0.0);
			vec2 pixel = 1.0/u_resolution;
			vec2 st = gl_FragCoord.xy * pixel;
			vec2 uv = v_texcoord;
			vec4 tex = texture2D(u_tex0, uv);

			uv *= 2.0;
			uv -= 1.0;

			// make mouse
			vec2 mouse = u_mouse / u_resolution; 

			//get angle and radius
			float radius = length(uv * mix(1.0, 2.0, mouse.y));
			float angle = atan(uv.y, uv.x);

			// get a segment 
			angle /= PI;
			angle *= SEGMENTS; 

			// repeat segment
			if (mod(angle, 2.0) >= 1.0) {
			angle = fract(angle);
			} else {
			angle = 1.0 - fract(angle);
			}
			angle += u_time * 0.3;
			angle += mouse.x;          

			// unsquash segment
			angle /= SEGMENTS;
			angle *= PI * 2.0;

			vec2 point = vec2(radius * cos(angle), radius * sin(angle));
			point = fract(point);

			vec4 color = texture2D(u_tex0, point);

			gl_FragColor = color;
		}
  `;
	
	let standardFragmentShader = `
		#ifdef GL_ES
		precision highp float;
		#endif

		# define SEGMENTS 14.0  
		# define PI 3.141592653589

		uniform sampler2D   u_tex0;
		uniform vec2        u_resolution;
		uniform float       u_time;
		uniform float       u_offset;
		uniform vec2 u_mouse;

		varying vec2        v_texcoord;

		void main (void) {
			// vec3 color = vec3(0.0);
			vec2 pixel = 1.0/u_resolution;
			vec2 st = gl_FragCoord.xy * pixel;
			vec2 uv = v_texcoord;
			vec4 tex = texture2D(u_tex0, uv);

			vec4 color = texture2D(u_tex0, uv);

			gl_FragColor = color;
		}
  `;
	
	let mirroredFragmentShader = `
		#ifdef GL_ES
		precision highp float;
		#endif

		# define SEGMENTS 14.0  
		# define PI 3.141592653589

		uniform sampler2D   u_tex0;
		uniform vec2        u_resolution;
		uniform float       u_time;
		uniform float       u_offset;
		uniform vec2 u_mouse;

		varying vec2        v_texcoord;

		void main (void) {
			vec2 uv = v_texcoord;
  		// the texture is loaded upside down and backwards by default so lets flip it
  		uv = 1.0 - uv;
			// this line will make our uvs mirrored
			// it will convert it into a number that goes 0 to 1 to 0
			// abs() will turn our negative numbers positive
  		vec2 mirrorUvs = abs(uv * 2.0  - 1.0);
  		vec4 tex = texture2D(u_tex0, mirrorUvs);
			gl_FragColor = tex;
		}
  `;
	
	let tiledFragmentShader = `
		#ifdef GL_ES
		precision highp float;
		#endif

		# define SEGMENTS 14.0  
		# define PI 3.141592653589

		uniform sampler2D   u_tex0;
		uniform vec2        u_resolution;
		uniform float       u_time;
		uniform float       u_offset;
		uniform vec2 u_mouse;

		varying vec2        v_texcoord;

		void main (void) {
			vec2 vUV = v_texcoord;
			float colWidth = 1.0 / 5.0; // Width of each column
			int column = int(v_texcoord.x / colWidth); // Determine which column the fragment belongs to
			// Calculate rotated UV coordinates
			float angle = radians(45.0); // 45 degrees in radians
			mat2 rotationMat = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
			vec2 rotatedUV = rotationMat * vec2(vUV.x - colWidth * float(column), vUV.y);
			vec2 uv = vec2(colWidth * float(column) + rotatedUV.x - 0.25, rotatedUV.y + 0.25) * angle; // Adjust UV to map to the current column with rotation

			gl_FragColor = texture2D(u_tex0, uv);
		}
  `;
	
	if (v == "vertexShader") {
		vert = vertexShader;
	}
	
	if (f == "kaleidoscope") {
		frag = kaleidoscopeFragmentShader;
	} else if (f == "mirrored") {
		frag = mirroredFragmentShader;
	} else if (f == "tiled") {
		frag = tiledFragmentShader;
	} else {
		frag = standardFragmentShader;
	}
	return createShader(vert, frag);
}

// --- COLOR CHANGE LOGIC
function colorChange() {
  console.log('start');
  palette = floor(random(palettes.length));
  initialColor = floor(random(5));
  getColor(palette, initialColor);
  strokeColor = [h, s, b];

  let i = 0;
  setInterval(() => {
    palette = floor(random(palettes.length));
    initialColor = floor(random(5));
    getColor(palette, initialColor);
    strokeColor = [h, s, b];

    console.log(`test: ${i}`)
    i++;
  }, 30000); // 30 seconds in milliseconds
  return strokeColor;
}

function drawWaves(p) {
  p.push();
	p.translate(-width / 2, -height / 2);

	for (let i = 0; i < 100; i++) {
    let paint = map(strokeColor[0] * i / frameCount, 0, 100, 0, 360);
		let hue = map( strokeColor[1] * i, 0, 100, 0, 100);
		let sat = map( strokeColor[2] * i, 0, 100, 0, 100);
		let alph = map(sin(millis() * 0.1), 0, 100, 0, 100);
    p.stroke(paint, hue, sat, alph);
		p.noFill();
		p.push();
    p.beginShape();
    for (let x = -10; x < width + 11; x += 20) {
      let n = noise(x * 0.001, i * 0.01, frameCount * 0.005);
      let y = map(n, 0, 1, 0, height);
      p.vertex(x, y);
    }
    p.endShape();
		p.pop();
	}
	p.pop();
}

function drawRings(p) {
	p.push();
	p.translate(-width / 2, -height / 2);

	for (let i = 0; i < 100; i++) {
		let paint = map(strokeColor[0] * i / frameCount, 0, 100, 0, 360);
		let hue = map( strokeColor[1] * i, 0, 100, 0, 100);
		let sat = map( strokeColor[2] * i, 0, 100, 0, 100);
		let alph = map(sin(millis() * 0.1), 0, 100, 0, 100);
		p.push();
		p.beginShape();
		for (let i = 0; i < vertices; i++) {
			let x = cos(angle * i) * radius;
			let n = noise(x * 0.001, i * 0.01, frameCount * 0.005);
      let y = map(n, 0, 1, 0, height);
      p.vertex(x, y);
		}
		p.endShape();
		p.pop();
	}
	p.pop();
}

function drawSuns(p, currentPercentage) {
	p.clear();
	console.log({currentPercentage});
	// let img = cnvs[1].get();
	p.noStroke();
	// // p.rotateX(frameCount);
	// 	p.rotateZ(frameCount * 2);
	p.push()
	p.translate(0, height * currentPercentage);
		// p.texture(img);
		p.fill(100, 100, 100, 100);
		p.ellipse(0, 0, width * 0.5);
	p.pop();

	p.push()
	p.translate(0, - (height * currentPercentage));
		// p.texture(img);
		
		p.ellipse(0, 0, width * 0.5);
	p.pop();
}

setInterval(() => {
	currentPercentage = getTimePercentage(start, finish);
	// console.log(currentPercentage);
}, interval);