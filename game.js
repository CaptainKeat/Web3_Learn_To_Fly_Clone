
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

function preload() {
    this.load.image('penguin', 'assets/penguin.png'); // placeholder image
    this.load.image('ground', 'assets/ground.png');
}

function create() {
    this.add.text(20, 20, 'Learn to Fly Web3 Clone', { fontSize: '32px', fill: '#FFF' });

    // Penguin setup
    this.penguin = this.physics.add.sprite(100, 450, 'penguin');
    this.penguin.setBounce(0.2);
    this.penguin.setCollideWorldBounds(true);

    // Ground setup
    const ground = this.physics.add.staticGroup();
    ground.create(400, 568, 'ground').setScale(2).refreshBody();
    this.physics.add.collider(this.penguin, ground);
}

function update() {
    if (this.input.keyboard.checkDown(spacebar, 1000)) {
        const totalBoost = inventory.boosters.boostEffect + inventory.launchers.boostEffect + inventory.gliders.boostEffect;
        this.penguin.setVelocityX(200 * totalBoost); // Base speed scaled by total boosts
    }
}
