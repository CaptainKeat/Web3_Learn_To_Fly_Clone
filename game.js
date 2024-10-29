const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    backgroundColor: '#87CEEB',
    parent: 'game-container',
    physics: {
        default: 'matter',  // Use Matter physics
        matter: {
            gravity: { y: 1 },  // Adjusted gravity for better rolling physics
            debug: true         // Enable debug to visualize collisions
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
let spacebar, tire, ground, hillRamp, isLaunched = false, distance = 0;

function preload() {
    this.load.image('tire', 'assets/tire.png');      // Tire image
    this.load.image('ground', 'assets/ground.png');  // Ground image
    this.load.image('hill_ramp', 'assets/hill_ramp.png');  // Hill image
}

function create() {
    // Display Title
    this.add.text(20, 20, 'Learn to Fly Web3 Clone', { fontSize: '32px', fill: '#FFF' });

    // Ground setup - Static ground image that doesn't move
    ground = this.matter.add.image(600, 780, 'ground', null, { isStatic: true });
    ground.setScale(2);
    
    // Hill/Ramp setup - Static hill image with a rectangular collision box
    hillRamp = this.matter.add.image(600, 650, 'hill_ramp', null, { isStatic: true });
    hillRamp.setStatic(true);
    hillRamp.setRectangle(400, 100); // Custom collision box to match the hill's general shape
    
    // Tire setup - Start at the top left of the hill, positioned higher
    tire = this.matter.add.image(150, 500, 'tire');  // Adjusted position for the top left of the hill
    tire.setCircle();  // Set to a circular body for rolling
    tire.setBounce(0.2);
    tire.setFriction(0.005);
    tire.setCollideWorldBounds(true);

    // Define the spacebar key
    spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // AudioContext handling
    this.input.once('pointerdown', () => {
        if (this.sound.context.state === 'suspended') {
            this.sound.context.resume();
        }
    });

    // Distance tracker display
    this.distanceText = this.add.text(20, 50, 'Distance: 0', { fontSize: '20px', fill: '#FFF' });
}

function update() {
    // Check for launch
    if (Phaser.Input.Keyboard.JustDown(spacebar) && !isLaunched) {
        isLaunched = true;
        tire.setVelocityX(5); // Initial nudge to start rolling down
    }

    // Track distance as the tire moves
    if (isLaunched && tire.body.velocity.x > 0) {
        distance += tire.body.velocity.x * 0.016;
        this.distanceText.setText('Distance: ' + Math.floor(distance));
    }

    // Check if tire has stopped moving
    if (isLaunched && tire.body.velocity.x === 0) {
        isLaunched = false;
        this.distanceText.setText('Final Distance: ' + Math.floor(distance) + ' Press Space to Restart');
        distance = 0;  // Reset for the next run
    }
}
