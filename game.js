const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load assets
const penguinImg = new Image();
penguinImg.src = 'assets/tire.png';

const backgroundImg = new Image();
backgroundImg.src = 'assets/hill_ramp.png';

const obstacleImg = new Image();
obstacleImg.src = 'assets/ramp.png';

// Game variables
let penguin = { x: 100, y: 500, velocityY: 0, isFlying: false };
let gravity = 0.5;
let launchPower = -15;
let altitude = 0;
let distance = 0;
let obstacles = [];
let backgroundX = 0;

// Initialize obstacles
function createObstacle() {
    return {
        x: canvas.width + Math.random() * 500,
        y: Math.random() * 400 + 100,
        width: 50,
        height: 50
    };
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scroll background
    backgroundX -= 2;
    if (backgroundX <= -canvas.width) backgroundX = 0;
    ctx.drawImage(backgroundImg, backgroundX, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImg, backgroundX + canvas.width, 0, canvas.width, canvas.height);

    // Update physics if penguin is flying
    if (penguin.isFlying) {
        penguin.velocityY += gravity;
        penguin.y += penguin.velocityY;
        altitude = Math.max(600 - penguin.y, 0);
        distance += 1;

        // Update stats in UI
        document.getElementById("altitude").textContent = Math.floor(altitude);
        document.getElementById("speed").textContent = Math.floor(Math.abs(penguin.velocityY) * 10);
        document.getElementById("distance").textContent = distance;

        // Stop at ground level
        if (penguin.y >= 500) {
            penguin.y = 500;
            penguin.isFlying = false;
        }

        // Check for collisions
        obstacles.forEach(obstacle => {
            if (penguin.x < obstacle.x + obstacle.width &&
                penguin.x + 40 > obstacle.x &&
                penguin.y < obstacle.y + obstacle.height &&
                penguin.y + 40 > obstacle.y) {
                penguin.isFlying = false;
            }
        });
    }

    // Move and draw obstacles
    obstacles.forEach((obstacle, index) => {
        obstacle.x -= 5;
        if (obstacle.x < -50) obstacles[index] = createObstacle();
        ctx.drawImage(obstacleImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw penguin
    ctx.drawImage(penguinImg, penguin.x, penguin.y, 40, 40);

    // Repeat
    requestAnimationFrame(gameLoop);
}

// Launch function
function launchPenguin() {
    if (!penguin.isFlying) {
        penguin.velocityY = launchPower;
        penguin.isFlying = true;
    }
}

// Event listener for launch button
document.getElementById("launchButton").addEventListener("click", launchPenguin);

// Initialize game
for (let i = 0; i < 5; i++) {
    obstacles.push(createObstacle());
}

gameLoop();
