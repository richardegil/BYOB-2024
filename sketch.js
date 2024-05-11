/* ------------------------------ */
// PROJECT INFO0
/* ------------------------------ */
let filename = getProjectName();

/* ------------------------------ */
// DATE
/* ------------------------------ */
let currentMoment = getCurrentDate();

/* ------------------------------ */
// UTILITIES
/* ------------------------------ */
let showUtilities = 0;
let hSlider, sSlider, bSlider, progressSlider;
let moveCheckbox;

/* ------------------------------ */
// VARIABLES
/* ------------------------------ */
// --- CANVASES
let cnvs  = [];
let cnvsG = [];
let currentCanvas;
let canvasMask;
let canvasMaskSize;
let canvasSource;
let glowSize;

// --- TIME
let currentPercentage;
let interval = 1000;
let start    = '2024-05-11T10:20:00';
let finish   = '2024-05-11T10:50:00';

// --- SHAPES (unused right now)
let shapes    = [];
let shapesNum = 10;

// --- COLORS
let palette;
let initialColor;
let strokeColor;
let backgroundColor;
let _c1; 
let _c2;

// --- Noise Values
let noiseScaleY      = 0;
let noiseScaleX      = 0;
let verticalSpread   = 0;
let horizontalSpread = 0.01;

/* ------------------------------ */
// SHADERS
/* ------------------------------ */
let theShader;
let f = 'standardFragmentShader';
let v = 'vertexShader';

// --- Kaleidoscope
let kaleidoscopeX = 0;
let kaleidoscopeY = 0;

// --- Mosaic
let mosaicAmt = 0.2
let mosaicSquares = 10.0

/* ------------------------------ */
// PRELOAD
/* ------------------------------ */
function preload() {
	theShader = getShader(v, f);
}

/* ------------------------------ */
// SETUP
/* ------------------------------ */
function setup() {
	// --- MAIN CANVAS
	createCanvas(windowWidth, windowWidth * 0.5625, WEBGL);
	cnvsG[0] = createGraphics(width, windowWidth * 0.5625, WEBGL);

	// --- SECONDARY CANVASES 
	// WAVES
	cnvs[1] = createGraphics(width, windowWidth * 0.5625, WEBGL);

	// SUNS
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

	canvasMaskSize = height;
	glowSize = height;

  palette = floor(random(palettes.length));
  initialColor = floor(random(5));
  getColor(palette, initialColor);
  backgroundColor = [h, s, b];

	// UTILITIES
		hSlider = createSlider(0, 720, 100);
		hSlider.position(20, 20);
		sSlider = createSlider(0, 100, 100);
		sSlider.position(20, 50);
		bSlider = createSlider(0, 100, 100);
		bSlider.position(20, 80);
		progressSlider = createSlider(0, 1, 0.5, 0.01);
		progressSlider.position(20, 110);
		moveCheckbox = createCheckbox();
		moveCheckbox.position(0, 140);

}

/* ------------------------------ */
// DRAW
/* ------------------------------ */
function draw() {
	// --- Initial Settings
	background(220, 80, 8, 100);
	theShader = getShader(v, f);
	smooth();
	noStroke();
	translate(-width / 2, -height / 2);
	rectMode(CENTER);
  
	drawWaves(cnvs[1]);
	drawBaseLayer();
	drawHorizonLine();
	drawSuns();
}

/* ------------------------------ */
// PARTIALS
/* ------------------------------ */

// --- BASE LAYER
function drawBaseLayer() {
	cnvsG[0].clear();
	cnvsG[0].shader(theShader);
	theShader.setUniform('u_tex0', currentCanvas);
	theShader.setUniform('u_resolution', [width, height]);
	theShader.setUniform('u_mouse', [kaleidoscopeX, kaleidoscopeY]);
	theShader.setUniform('u_mouse2', [mosaicAmt, mosaicSquares]);
	theShader.setUniform('u_time', millis() / 500.0);
	cnvsG[0].rect(0, 0, width, height);
	image(cnvsG[0], 0, 0 , width, height);
}

// --- HORIZON LINE
function drawHorizonLine(){
	let numOfLines = 120;
	let spacer = width / numOfLines;

	for (let i = 0; i < width; i+=spacer) {
		push();
			strokeWeight(2);
			stroke(0, 0, 100, 50);
			let d = dist(0 + i, height / 2, width / 2, height / 2);
			let delta = map(d, 0, width / 2, 0.5, 0.0001);
			line(0 + i, height / 2 + 10 * delta, 0 + i, height / 2 - 10 * delta);
		pop();
	}
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
		uniform vec2 u_mouse2;

		varying vec2        v_texcoord;
	
	float amt = 0.2; // the amount of displacement, higher is more
	float squares = 10.0; // the number of squares to render vertically
	
	void main() {
		float aspect = u_resolution.x / u_resolution.y;

		// make mouse
		vec2 mouse = u_mouse2 / u_resolution; 

		float offset = u_mouse2.x * 0.5;
	
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
		vec2 tile = fract(uv * u_mouse2.y + 0.5) * amt;
	
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
  initialColor = floor(random(15));
  getColor(palette, initialColor);
  strokeColor = [h, s, b];
	console.log(strokeColor);
 // 30 seconds in milliseconds
  return strokeColor;
}

setInterval(() => {
	colorChange();
	// console.log(`test: ${i}`)
}, 3000);

function drawWaves(p) {
	strokeColor = [
		200,
		100, 
		55
	]
	p.background(100, 100, 100, 100);
  p.push();
	p.translate(-width / 2, -height / 2);
	for (let i = 0; i < 100; i++) {
    let paint = map( hSlider.value() * i / frameCount, 0, 100, 0, 360);
		let hue = map( sSlider.value() * i, 0, 100, 0, 100);
		let sat = map( bSlider.value() * i, 0, 100, 0, 100);
		// let alph = map(sin(frameCount * 4), -1, 1, 0, 100);
    p.stroke(paint, hue, sat, 100);
		p.noFill();
		p.push();
    p.beginShape();
    for (let x = -10; x < width + 11; x += 20) {
      let n = noise(x * 0.001 + noiseScaleX, i * noiseScaleY, frameCount * 0.005);
      let y = map(n, 0, 1, 0, height);
      p.vertex(x, y);
    }
    p.endShape();
		p.pop();
	}
	p.pop();
}

function drawSuns() {
	push();
  noStroke();
  drawingContext.filter = "blur(10px)";
  pop()

	_c1 = color( 0, 0, 100, 55 );
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

	// console.log(move);
	// --- Top Sun
	push();
	blendMode(ADD);
	if (moveCheckbox && moveCheckbox.checked()) {
		translate(0, height * progressSlider.value());
	} else {
		translate(0, height * currentPercentage);
	}
	rotateX(180);
	image(canvasMask, 0, 0, width, height);
	pop();

	// --- Bottom Sun
	push();
	blendMode(ADD);

	if (moveCheckbox && moveCheckbox.checked()) {
		translate(0, height - (height * progressSlider.value()));
	} else {
		translate(0, height - (height * currentPercentage));
	}

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
  // console.log({key});
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

	// if (key === '6') {
	// 	currentCanvas = cnvs[2];
	// }
}