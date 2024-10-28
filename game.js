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
let spacebar;

function preload() {
    this.load.image('tire', 'assets/tire.png');  // Load tire image
    this.load.image('ground', 'assets/ground.png');  // Load ground image
}

function create() {
    this.add.text(20, 20, 'Learn to Fly Web3 Clone', { fontSize: '32px', fill: '#FFF' });

    // Tire setup
    this.tire = this.physics.add.sprite(100, 450, 'tire');
    this.tire.setBounce(0.2);
    this.tire.setCollideWorldBounds(true);

    // Ground setup
    const ground = this.physics.add.staticGroup();
    ground.create(400, 568, 'ground').setScale(2).refreshBody();
    this.physics.add.collider(this.tire, ground);

    // Define the spacebar key
    spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // AudioContext handling
    this.input.once('pointerdown', () => {
        if (this.sound.context.state === 'suspended') {
            this.sound.context.resume();
        }
    });
}

function update() {
    if (Phaser.Input.Keyboard.JustDown(spacebar)) {
        // Simulate a launch with tire speed boost
        const totalBoost = 1.5;  // Placeholder for any additional upgrades or boosts
        this.tire.setVelocityX(200 * totalBoost); // Adjust speed based on total boosts
    }
}
