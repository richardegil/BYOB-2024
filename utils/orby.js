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