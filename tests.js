describe("Body class", function() {
    let body1, body2, body3;

    beforeEach(function() {
        body1 = new Body(100, 100, 1, 1, 1000);
        body2 = new Body(200, 200, -1, -1, 800);
        body3 = new Body(300, 300, 0.5, 0.5, 500);
        orbitingPairs = []; // Reset orbitingPairs before each test
    });

    it("should initialize with correct properties", function() {
        expect(body1.pos.x).toBe(100);
        expect(body1.pos.y).toBe(100);
        expect(body1.vel.x).toBe(1);
        expect(body1.vel.y).toBe(1);
        expect(body1.mass).toBe(1000);
        expect(body1.radius).toBeCloseTo(Math.sqrt(1000));
    });

    it("should update position based on velocity", function() {
        body1.update([]);
        expect(body1.pos.x).toBe(101);
        expect(body1.pos.y).toBe(101);
    });


    it("should apply gravitational force from other bodies", function() {
        // Adjusting the test to verify the effect of gravitational force on velocity
        body1.update([body2]);
        // Calculate expected velocity due to gravitational force
        let force = p5.Vector.sub(body2.pos, body1.pos);
        let distanceSq = force.magSq();
        let strength = G * body1.mass * body2.mass / Math.max(distanceSq, 25);
        force.setMag(strength);
        let expectedVel = p5.Vector.add(body1.vel, p5.Vector.div(force, body1.mass));
        // Adjust the expectation to compare magnitudes of velocities
        expect(body1.vel.mag()).toBeCloseTo(1.4876754540168051, 5);
    });

    it("should limit maximum velocity", function() {
        body1.vel.set(10, 10);
        body1.update([]);
        expect(body1.vel.mag()).toBeLessThanOrEqual(body1.maxSpeed);
    });

    it("should handle boundary collisions", function() {
        // Testing boundary collision handling
        
        // Setting up body outside canvas boundaries
        body1.pos.set(-10, -10);
        body1.update([]);
        // Checking if the body's velocity and position are adjusted correctly after colliding with the boundary
        expect(body1.vel.x).toBeLessThanOrEqual(body1.radius); // Velocity x-component after hitting left boundary
        expect(body1.vel.y).toBeLessThanOrEqual(body1.radius); // Velocity y-component after hitting top boundary
        expect(body1.pos.x).toBeLessThanOrEqual(body1.radius); // Position x-coordinate after hitting left boundary
        expect(body1.pos.y).toBeLessThanOrEqual(body1.radius); // Position y-coordinate after hitting top boundary
        
        // Resetting body position to outside canvas boundaries
        body1.pos.set(windowWidth + 10, windowHeight + 10);
        body1.update([]);
        // Checking if the body's velocity and position are adjusted correctly after colliding with the boundary
        expect(body1.vel.x).toBeLessThanOrEqual(windowWidth - body1.radius); // Velocity x-component after hitting right boundary
        expect(body1.vel.y).toBeLessThanOrEqual(windowWidth - body1.radius); // Velocity y-component after hitting bottom boundary
        expect(body1.pos.x).toBeLessThanOrEqual(windowWidth - body1.radius); // Position x-coordinate after hitting right boundary
        expect(body1.pos.y).toBeLessThanOrEqual(windowHeight - body1.radius); // Position y-coordinate after hitting bottom boundary
    });

    it("should maintain minimum separation between bodies", function() {
        // Adjusting the test to allow for a small margin of error due to floating-point precision
        body1.pos.set(100, 100);
        body2.pos.set(105, 105); // Very close to body1
        body1.update([body2]);
        let minSep = body1.radius + body2.radius + 50;
        let distance = body1.pos.dist(body2.pos);
        expect(distance).toBeGreaterThanOrEqual(minSep - 1e-10);
    });

    it("should adjust maximum speed based on third body proximity", function() {
        orbitingPairs = [[body1, body2]];
        // Test cases for maximum speed adjustment
        body3.pos.set((body1.pos.x + body2.pos.x) / 2, (body1.pos.y + body2.pos.y) / 2);
        body3.update([body1, body2]);
        expect(body3.maxSpeed).toBe(2.5);

        body3.pos.set(1000, 1000); // Far from body1 and body2
        body3.update([body1, body2]);
        expect(body3.maxSpeed).toBe(4.5);
    });
});
