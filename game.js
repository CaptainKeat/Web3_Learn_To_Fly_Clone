const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#87CEEB',
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
let spacebar, tire, ground, ramp, hill, isLaunched = false, distance = 0;

function preload() {
    this.load.image('tire', 'assets/tire.png');  // Tire image
    this.load.image('ground', 'assets/ground.png');  // Ground image
    this.load.image('ramp', 'assets/ramp.png');  // Ramp image
    this.load.image('hill', 'assets/hill.png');  // Hill image
}

function create() {
    // Display Title
    this.add.text(20, 20, 'Learn to Fly Web3 Clone', { fontSize: '32px', fill: '#FFF' });

    // Ground setup
    ground = this.physics.add.staticGroup();
    ground.create(400, 568, 'ground').setScale(2).refreshBody();
    
    // Hill setup
    hill = this.physics.add.staticSprite(150, 500, 'hill');
    
    // Ramp setup
    ramp = this.add.sprite(400, 540, 'ramp');
    this.physics.add.existing(ramp, true); // Static ramp
    
    // Tire setup
    tire = this.physics.add.sprite(100, 450, 'tire');
    tire.setBounce(0.2);
    tire.setCollideWorldBounds(true);
    this.physics.add.collider(tire, ground);
    this.physics.add.collider(tire, hill);
    this.physics.add.collider(tire, ramp);

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
    if (Phaser.Input.Keyboard.JustDown(spacebar) && !isLaunched) {
        // Launch the tire with an initial velocity after rolling down the hill
        tire.setVelocityX(200);  // Start rolling down the hill at a lower speed
        isLaunched = true;
    }

    // Increase distance while tire is moving
    if (isLaunched && tire.body.velocity.x > 0) {
        distance += tire.body.velocity.x * 0.016;  // Frame-based approximation
        this.distanceText.setText('Distance: ' + Math.floor(distance));
    }

    // Check if tire stops moving
    if (isLaunched && tire.body.velocity.x === 0) {
        isLaunched = false;
        this.distanceText.setText('Final Distance: ' + Math.floor(distance) + ' Press Space to Restart');
        distance = 0;  // Reset for the next round
    }
}
