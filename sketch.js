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
let cnvsG = [];
let currentCanvas;

let canvasMask;
let canvasMaskSize;

let canvasSource;
let glowSize;

// --- TIME
let currentPercentage;
let interval = 1000;
let start  = '2024-05-09T22:50:00';
let finish = '2024-05-09T23:05:00';

// --- SHAPES (unused right now)
let shapes = [];
let shapesNum = 10;

// --- RINGS
let radius = 100;
let vertices = 360;

let ringDelta = 1;

let rX = 0;
// let angle;
  
// --- Orbs
let numberOfOrbs = 100;
let orbs = [];

// --- COLORS
let palette;
let initialColor;
let strokeColor;
let backgroundColor;

let r = 180; let angle = 0;
let amt = 0; let startingAngle = 0;

let _c1; let _c2; let c3;
let circleY;

/* ------------------------------ */
// SHADERS
/* ------------------------------ */
let theShader;
let f = 'standardFragmentShader';
let v = 'vertexShader';

function preload() {
	theShader = getShader(v, f);
}

function setup() {
	// --- MAIN CANVAS
	createCanvas(windowWidth, windowWidth * 0.5625, WEBGL);

	cnvsG[0] = createGraphics(width, windowWidth * 0.5625, WEBGL);

	// --- SECONDARY CANVASES 
	// BASE
	cnvs[0] = createFramebuffer();
	// WAVES
	cnvs[1] = createGraphics(width, windowWidth * 0.5625, WEBGL);
	// TBD
	cnvs[2] = createGraphics(width, windowWidth * 0.5625);
	// TBD
	cnvs[3] = createFramebuffer();
	// SUNS
	cnvs[4] = createFramebuffer();

	cnvs[5] = createGraphics(width, windowWidth * 0.5625);

	canvasMask   = createGraphics(width, height);
  canvasSource = createGraphics(width, height);
	canvasSource.clear();
  currentCanvas = cnvs[1];

  // --- MIDI
  initMIDI();

	// --- SKETCH SETTINGS
	pixelDensity(2);
	colorMode(HSB, 360, 100, 100, 100);
	angleMode(DEGREES);
	smooth();
  colorChange();

	angle = TWO_PI / vertices;

	canvasMaskSize = height;
	glowSize = height;

  palette = floor(random(palettes.length));
  initialColor = floor(random(5));
  getColor(palette, initialColor);
  backgroundColor = [h, s, b];

	// --- Orbs
	for (let i = 0; i < numberOfOrbs; i++) {
    orbs.push(new Orby(h, s, b, i));
  }
}

function draw() {
	background(220, 80, 8, 100);
	theShader = getShader(v, f);
	smooth();
	noStroke();
	translate(-width / 2, -height / 2);
	rectMode(CENTER);
  drawWaves(cnvs[1]);
	drawOrbs(cnvs[2]);

	// --- Base Layer
	cnvsG[0].clear();
	cnvsG[0].shader(theShader);
	theShader.setUniform('u_tex0', currentCanvas);
	// theShader.setUniform('u_offset', offset);
	theShader.setUniform('u_resolution', [width, height]);
	theShader.setUniform('u_mouse', [mouseX, mouseY]);
	theShader.setUniform('u_time', millis() / 500.0);
	cnvsG[0].rect(0, 0, width, height);
	image(cnvsG[0], 0, 0 , width, height);
	
	// --- Horizon Line
	let numOfLines = 120;
	let spacer = width / numOfLines;

	for (let i = 0; i < width; i+=spacer) {
		push();
			// blendMode(HARD_LIGHT);
			strokeWeight(2);
			stroke(0, 0, 100, 50);
			let d = dist(0 + i, height / 2, width / 2, height / 2);
			let delta = map(d, 0, width / 2, 0.5, 0.0001);
			line(0 + i, height / 2 + 10 * delta, 0 + i, height / 2 - 10 * delta);
		pop();
	}
	
	// clear();
	// translate(width / 2, height / 2);
	// push();
	// smooth();
	// noFill();
	// strokeWeight(1);
	// stroke(0, 0, 100, 50);
	// ellipse(0, 0, ringDelta, ringDelta);
	// pop();
	// if (ringDelta > width + (width * 0.25)) {
	// 		ringDelta = 1;
	// } else {
	// 		ringDelta+=1;
	// }

	drawSuns();
}

// --- SHADER LOGIC
function getShader(v = "vertexShader", f = "standardFragmentShader") {	
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

	let transparentFragmentShader = `
	precision highp float;

	uniform float time;

	void main() {
    vec2 center = vec2(0.0, 0.0);
    float radius = 100.0;
  
    vec2 position = gl_FragCoord.xy - center;
    float dist = length(position);
    
    float gradient = smoothstep(radius - 2.0, radius, dist);
    
    gl_FragColor = vec4(gradient, gradient, gradient, 1.0);
	}`;

	let mosaicFragmentShader = `
	precision mediump float;

	// grab texcoords from vert shader
	varying vec2 vTexCoord;
	
	// our textures coming from p5
	uniform sampler2D tex0;
	uniform vec2 resolution;
	

	uniform sampler2D   u_tex0;
		uniform vec2        u_resolution;
		uniform float       u_time;
		uniform float       u_offset;
		uniform vec2 u_mouse;

		varying vec2        v_texcoord;
	
	float amt = 0.2; // the amount of displacement, higher is more
	float squares = 10.0; // the number of squares to render vertically
	
	void main() {
		float aspect = u_resolution.x / u_resolution.y;
		float offset = amt * 0.5;
	
		vec2 uv = v_texcoord;
		
		// the texture is loaded upside down and backwards by default so lets flip it
		uv.y = 1.0 - uv.y;
	
		// copy of the texture coords
		vec2 tc = uv;
	
		// move into a range of -0.5 - 0.5
		uv -= 0.5;
	
		// correct for window aspect to make squares
		uv.x *= aspect;
	
		// tile will be used to offset the texture coordinates
		// taking the fract will give us repeating patterns
		vec2 tile = fract(uv * squares + 0.5) * amt;
	
		// sample the texture using our computed tile
		// offset will remove some texcoord edge artifacting
		vec4 tex = texture2D(u_tex0, tc + tile - offset);
	
		// render the output
		gl_FragColor = tex;
	}
	`
	
	if (v == "vertexShader") {
		vert = vertexShader;
	}
	
	if (f == "kaleidoscope") {
		frag = kaleidoscopeFragmentShader;
	} else if (f == "mirrored") {
		frag = mirroredFragmentShader;
	} else if (f == "tiled") {
		frag = tiledFragmentShader;
	} else if (f == "transparent") {
		frag = transparentFragmentShader;
	} else if (f == "mosaic") {
		frag = mosaicFragmentShader;
	} else {
		frag = standardFragmentShader;
	}
	return createShader(vert, frag);
}

// --- COLOR CHANGE LOGIC
function colorChange() {
  console.log('TARS: Start Color Change');
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
	p.background(100, 100, 100, 100);
  p.push();
	p.translate(-width / 2, -height / 2);
	for (let i = 0; i < 100; i++) {
    let paint = map(strokeColor[0] * i / frameCount, 0, 100, 0, 360);
		let hue = map( strokeColor[1] * i, 0, 100, 0, 100);
		let sat = map( strokeColor[2] * i, 0, 100, 0, 100);
		let alph = map(sin(frameCount), 0, 100, 0, 100);
    p.stroke(paint, hue, sat, 100);
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

function drawOrbs(p) {
	p.clear();
	p.background(100, 100, 100, 0);
	// p.translate(-width / 2, -height / 2);
	
	for (let i = 0; i < orbs.length; i++) {
		let pt = map(strokeColor[0] * i / frameCount, 0, 100, 0, 360);
		let h = map( strokeColor[1] * i, 0, 100, 0, 100);
		let s = map( strokeColor[2] * i, 0, 100, 0, 100);
		let alph = map(sin(frameCount), 0, 100, 0, 100);
		// p.fill(paint, hue, sat, 100);

		push();
			orbs[i].display(p);
			orbs[i].update();
		pop();
	}
}

function drawRings(p) {
	
}

function drawSuns() {

	push();
  // blendMode(BLEND);
  // blendMode(SCREEN);
  noStroke();
  drawingContext.filter = "blur(10px)";
  pop()

	_c1 = color( 0, 0, 100, 55 );
	// _c1 = color(0, 0, 100, map(sin(frameCount), -1, 1, 20, 55));
  _c2 = color( 0, 0, 100, 0 );
	radialGradient( canvasSource, 0,0,0, 0,0,(glowSize/2), color(_c1), color(_c2) );

	canvasSource.strokeWeight(0);
	canvasSource.noStroke();
	canvasSource.push();
		canvasSource.translate( (width/2), (height/2)-(canvasMaskSize/2));
		canvasSource.scale(1.0);
		canvasSource.ellipse(0, 0, glowSize);
	canvasSource.pop();

	canvasMask.strokeWeight(0);
	canvasMask.noStroke();
	canvasMask.fill(255);
	canvasMask.ellipse(width/2, 10+ height/2, canvasMaskSize, canvasMaskSize);

	canvasMask.drawingContext.globalCompositeOperation = 'source-in';
	canvasMask.image(canvasSource, 0, 0)

	// --- Top Sun
	push();
	blendMode(ADD);
	translate(0, height * currentPercentage);
	rotateX(180);
	image(canvasMask, 0, 0, width, height);
	pop();

	// --- Bottom Sun
	push();
	blendMode(ADD);
	translate(0, height - (height * currentPercentage));
	rotateX(0);
	image(canvasMask, 0, 0, width, height);
	pop();
}

setInterval(() => {
	currentPercentage = getTimePercentage(start, finish);
	console.log(currentPercentage);
}, interval);

function setGradientEllipse(min, max, c1, c2) {
  for (let i=min; i<max; i++) {
    let amt = map(i, min, max, 0, 1);
    let c3 = lerpColor(c1, c2, amt);
    
    stroke(c3);
    
    let x = r*cos(i);
    let y = r*sin(i);
    line(0, 0, x, y);
  }
}

function radialGradient(context, sX, sY, sR, eX, eY, eR, colorS, colorE){
	let gradient = context.drawingContext.createRadialGradient(sX, sY, sR, eX, eY, eR);
	gradient.addColorStop(0, colorS);
	gradient.addColorStop(1, colorE);
	context.drawingContext.fillStyle = gradient;
	context.drawingContext.fillStyle = gradient;
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
		f = 'mosaic';
	}

	if (key === '5') {
		currentCanvas = cnvs[1];
	}

	if (key === '6') {
		currentCanvas = cnvs[2];
	}
}

class Orby {
	constructor(h, s, b, i) {
		this.x         = floor(random(0, width));
		
		this.size      = random(width * 0.01, width * 0.02);
		this.direction = floor(random(2));
		this.speed     = random(6, 8);
		this.h = h;
		this.s = s;
		this.b = b;
		this.i = i;

		if (this.direction == 1) {
			this.y = random(0, height / 2);
		} else {
			this.y = random(height / 2, height);
		}
	}

	display(p) {
		let deltaSize;
		p.smooth();		
		// p.translate(-width / 2, -height / 2);

		// let pt = map(strokeColor[0] * i / frameCount, 0, 100, 0, 360);
		// let h = map( strokeColor[1] * i, 0, 100, 0, 100);
		// let s = map( strokeColor[2] * i, 0, 100, 0, 100);
		p.fill(
			map(h * this.i / frameCount, 0, 100, 0, 360), 
			map(s * this.i / frameCount, 0, 100, 0, 360), 
			map(b * this.i / frameCount, 0, 100, 0, 360), 
			100
		);
		p.noStroke();
		if (this.direction == 1) {
			deltaSize = map(sin(frameCount * this.i * 0.1), -1, 1, this.size * 0.5, this.size * 4);
		} else {
			deltaSize = map(cos(frameCount * this.i * 0.1), -1, 1, this.size * 4, this.size * 0.5);
		}
		p.rect(this.x, this.y, this.size , deltaSize);
	}

	update() {
		if (this.direction == 1) {
			if (this.y > 0) {
				this.y -= random(0.1, 0.8);
			} else {
				this.y = height / 2;
			}
		} else {
			if (this.y < height) {
				this.y += random(0.1, 0.8);
			} else {
				this.y = height / 2;
			}
		}
	}
}