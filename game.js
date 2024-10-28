const config = {
    type: Phaser.AUTO,
    width: 1200,  // Increased width
    height: 800,  // Increased height
    backgroundColor: '#87CEEB',
    parent: 'game-container',  // Attach canvas to #game-container
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
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
    this.load.image('tire', 'assets/tire.png');  // Tire image
    this.load.image('ground', 'assets/ground.png');  // Ground image
    this.load.image('hill_ramp', 'assets/hill_ramp.png');  // New hill/ramp image
}

function create() {
    // Display Title
    this.add.text(20, 20, 'Learn to Fly Web3 Clone', { fontSize: '32px', fill: '#FFF' });

    // Ground setup
    ground = this.physics.add.staticGroup();
    ground.create(600, 780, 'ground').setScale(2).refreshBody();  // Adjust position for new size
    
    // Hill/Ramp setup - Centered with the increased canvas size
    hillRamp = this.physics.add.staticSprite(600, 650, 'hill_ramp');  // Positioned based on canvas center
    
    // Tire setup - Start at the top of the hill, adjusted to the hill's height
    tire = this.physics.add.sprite(500, 570, 'tire');  // Position near the top left of hill image
    tire.setBounce(0.2);
    tire.setCollideWorldBounds(true);
    this.physics.add.collider(tire, ground);
    this.physics.add.collider(tire, hillRamp);

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
        tire.setVelocityX(100); // Initial nudge to start rolling down
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
