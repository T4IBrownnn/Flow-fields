let flowField; // 2D array to store the flow field vectors
let particles = []; // Array to store particles
let resolution = 900; // Resolution of the flow field grid
let noiseScale = 1; // Scale for Perlin noise
let zOffset = 0; // Z-offset for 3D Perlin noise

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  // Initialize the flow field
  flowField = createFlowField();

  // Create particles
  for (let i = 0; i < 1000; i++) {
    particles.push(new Particle());
  }
}

function draw() {
  background(0, 10); // Semi-transparent background for a "trail" effect

  // Update the flow field over time
  zOffset += 0.01;
  flowField = createFlowField();

  // Update and display particles
  for (let particle of particles) {
    particle.follow(flowField);
    particle.update();
    particle.show();
  }
}

// Create a flow field using Perlin noise
function createFlowField() {
  let cols = floor(width / resolution);
  let rows = floor(height / resolution);
  let field = new Array(cols);

  for (let x = 0; x < cols; x++) {
    field[x] = new Array(rows);
    for (let y = 0; y < rows; y++) {
      // Use Perlin noise to determine the angle of the vector
      let angle = noise(x * noiseScale, y * noiseScale, zOffset) * TWO_PI * 4;
      field[x][y] = p5.Vector.fromAngle(angle);
    }
  }

  return field;
}

// Particle class
class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 2;
    this.color = color(random(255), random(255), random(255), 100);
  }

  // Update particle position
  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0); // Reset acceleration

    // Wrap around the edges of the canvas
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }

  // Apply force from the flow field
  follow(field) {
    let x = floor(this.pos.x / resolution);
    let y = floor(this.pos.y / resolution);

    // Ensure x and y are within the bounds of the flow field
    x = constrain(x, 0, floor(width / resolution) - 1);
    y = constrain(y, 0, floor(height / resolution) - 1);

    let force = field[x][y];
    this.applyForce(force);
  }

  // Apply a force to the particle
  applyForce(force) {
    this.acc.add(force);
  }

  // Display the particle
  show() {
    noStroke();
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, 2, 2);
  }
}