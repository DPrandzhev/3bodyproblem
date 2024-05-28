let body1, body2, body3;
let G = 1.8; // Increased gravitational constant
let orbitingPairs = []; // Array to store pairs of bodies that are orbiting each other

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('simulation-container');

    let areaWidth = 720;
    let areaHeight = 480;

    let areaX = (width - areaWidth) / 2;
    let areaY = (height - areaHeight) / 2;

    let center = createVector(areaX + areaWidth / 2, areaY + areaHeight / 3);
    let bottomRight = createVector(areaX + areaWidth, areaY + areaHeight);
    let bottomLeft = createVector(areaX, areaY + areaHeight);

    body1 = new Body(random(width), random(height), 0, 0, random(1000, 2000));
    body2 = new Body(random(width), random(height), random(-0.5, 0.5), random(-0.5, 0.5), random(500, 800));
    body3 = new Body(random(width), random(height), 0, 0, random(200, 400));

    let radius2 = center.dist(bottomRight);
    let radius3 = center.dist(bottomLeft);

    let angle2 = atan2(center.y - bottomRight.y, center.x - bottomRight.x);
    let angle3 = atan2(center.y - bottomLeft.y, center.x - bottomLeft.x);

    let speed2 = sqrt(G * body1.mass / radius2);
    let speed3 = sqrt(G * body1.mass / radius3);

    body2.vel = createVector(cos(angle2), sin(angle2)).mult(speed2);
    body3.vel = createVector(cos(angle3), sin(angle3)).mult(speed3);
}

function createSliders() {
    let mass1Slider = createSlider(100, 2000, body1.mass);
    mass1Slider.position(20, 20);
    mass1Slider.input(function () {
        body1.mass = mass1Slider.value();
    });

    let mass2Slider = createSlider(100, 2000, body2.mass);
    mass2Slider.position(20, 50);
    mass2Slider.input(function () {
        body2.mass = mass2Slider.value();
    });

    let mass3Slider = createSlider(100, 2000, body3.mass);
    mass3Slider.position(20, 80);
    mass3Slider.input(function () {
        body3.mass = mass3Slider.value();
    });
}

function draw() {
    background(255);

    body1.update([body2, body3]);
    body1.display();

    body2.update([body1, body3]);
    body2.display();

    body3.update([body1, body2]);
    body3.display();
}

class Body {
    constructor(x, y, vx, vy, mass) {
        this.pos = createVector(x, y);
        this.vel = createVector(vx, vy);
        this.mass = mass;
        this.radius = sqrt(mass);
        this.maxSpeed = 2.5;
    }

    update(others) {
        this.pos.add(this.vel);

        for (let other of others) {
            if (other !== this) {
                let force = p5.Vector.sub(other.pos, this.pos);
                let distanceSq = force.magSq();
                let distance = sqrt(distanceSq);

                let strength = G * this.mass * other.mass / max(distanceSq, 25);
                force.setMag(strength);

                this.vel.add(force.div(this.mass));
            }
        }

        this.vel.limit(this.maxSpeed);

        // Ensure the body stays within the visible area of the canvas
        if (this.pos.x - this.radius < 0 || this.pos.x + this.radius > width) {
            this.vel.x *= -1;
            this.pos.x = constrain(this.pos.x, this.radius, width - this.radius);
        }
        if (this.pos.y - this.radius < 0 || this.pos.y + this.radius > height) {
            this.vel.y *= -1;
            this.pos.y = constrain(this.pos.y, this.radius, height - this.radius);
        }

        // Maintain minimum separation between bodies
        for (let other of others) {
            if (other !== this) {
                let distance = this.pos.dist(other.pos);
                let minSep = this.radius + other.radius + 50;
                if (distance < minSep) {
                    let separationVector = p5.Vector.sub(this.pos, other.pos).setMag((minSep - distance) / 2);
                    this.pos.add(separationVector);
                    other.pos.sub(separationVector);
                }
            }
        }

        let thirdBodyNear = false;
        for (let pair of orbitingPairs) {
            let [body1, body2] = pair;
            let centroidX = (body1.pos.x + body2.pos.x) / 2;
            let centroidY = (body1.pos.y + body2.pos.y) / 2;
            if (dist(this.pos.x, this.pos.y, centroidX, centroidY) < 300) {
                thirdBodyNear = true;
                break;
            }
        }

        if (thirdBodyNear) {
            this.maxSpeed = 2.5;
        } else {
            this.maxSpeed = 4.5;
        }
    }

    display() {
        fill(0);
        ellipse(this.pos.x, this.pos.y, this.radius * 2);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
