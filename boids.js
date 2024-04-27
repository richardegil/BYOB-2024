class Boid {
  constructor() {
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.acceleration = createVector();
    this.maxForce = 0.2;
    this.maxSpeed = 4;
  }

  edges() {
   if ( this.position.x > width) {
    this.position.x = 0;
   } else if (this.position.x < 0) {
    this.position.x = width;
   }

   if ( this.position.y > height) {
    this.position.y = 0;
   } else if (this.position.y < 0) {
    this.position.y = height;
   }
  }

  align(boids) {
    let perceptionRadius = 50;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(
        this.position.x, 
        this.position.y, 
        other.position.x, 
        other.position.y
      );
      if(other != this && d < perceptionRadius ) {
        steering.add(other.velocity);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  cohesion(boids) {
    let perceptionRadius = 100;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(
        this.position.x, 
        this.position.y, 
        other.position.x, 
        other.position.y
      );
      if(other != this && d < perceptionRadius ) {
        steering.add(other.position);
        total++;
        let scaleOffset = map(sin(millis() * 0.001), -1, 1, 0, 2);
        cnvs1.stroke(strokeColor[0], strokeColor[1], strokeColor[2])

        cnvs1.strokeWeight(width * 0.001 * scaleOffset);
        cnvs1.line(this.position.x, 
          this.position.y, 
          other.position.x, 
          other.position.y);
      }
     
    }
    if (total > 0) {
      steering.div(total);
      steering.sub(this.position);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  separation(boids) {
    let perceptionRadius = 100;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(
        this.position.x, 
        this.position.y, 
        other.position.x, 
        other.position.y
      );
      if(other != this && d < perceptionRadius ) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.div(d);
        diff.div(d * 2);
        steering.add(diff);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  flock(boids) {
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids);
    let separation = this.separation(boids);

    alignment.mult(alignSlider.value());
    cohesion.mult(cohesionSlider.value());
    separation.mult(separationSlider.value());

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.mult(0);
  }

  show(boids) {
    // cnvs1.translate(-width / 2, -height / 2);
    let perceptionRadius = 100;
    strokeWeight(8);
    stroke(255);
    let scaleOffset = map(sin(millis() * 0.001), 0, 1, 0, 10);
    // point(this.position.x, this.position.y);
    ellipseMode(CENTER);
    // ellipse(this.position.x, this.position.y, scaleOffset, scaleOffset);
    // print(boids.length);
    // for (let other of boids) {
    //   let d = dist(
    //     this.position.x, 
    //     this.position.y, 
    //     other.position.x, 
    //     other.position.y
    //   );
    //   if(other != this && d < perceptionRadius) {
    //     line(this.position.x, this.position.y, other.position.x, other.position.y);
    //   }
    // }
  }
}