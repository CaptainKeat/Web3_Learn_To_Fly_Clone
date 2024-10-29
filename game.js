const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load assets
const penguinImg = new Image();
penguinImg.src = 'assets/penguin.png';

const hillImg = new Image();
hillImg.src = 'assets/hill.png';

const backgrounds = [
    'assets/background1.png',
    'assets/background2.png',
    'assets/background3.png'
].map(src => {
    const img = new Image();
    img.src = src;
    return img;
});

// Game variables
let penguin = { x: 50, y: 400, velocityX: 0, velocityY: 0, isSliding: false, isAirborne: false };
let gravity = 0.5;
let friction = 0.05;
let slideAcceleration = 0.2;
let altitude = 0;
let distance = 0;
let currentBackgroundIndex = 0;

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(backgrounds[currentBackgroundIndex], 0, 0, canvas.width, canvas.height);

    // Update penguin physics
    if (penguin.isSliding) {
        penguin.velocityX += slideAcceleration;
        penguin.x += penguin.velocityX;

        // Launch off the hill once it reaches the end
        if (penguin.x > 250) {
            penguin.isSliding = false;
            penguin.isAirborne = true;
            penguin.velocityY = -penguin.velocityX * 0.7; // Adjust upward velocity based on slide speed
        }
    }

    if (penguin.isAirborne) {
        penguin.velocityY += gravity;
        penguin.y += penguin.velocityY;
        penguin.x += penguin.velocityX;

        altitude = Math.max(600 - penguin.y, 0);
        distance += penguin.velocityX * 0.1;

        document.getElementById("altitude").textContent = Math.floor(altitude);
        document.getElementById("speed").textContent = Math.floor(Math.abs(penguin.velocityX) * 10);
        document.getElementById("distance").textContent = Math.floor(distance);

        // Land if penguin reaches the ground
        if (penguin.y >= 500) {
            penguin.y = 500;
            penguin.isAirborne = false;
            penguin.velocityX *= 0.9; // Slow down on landing
        }

        // Change background based on distance
        if (distance > 200 && currentBackgroundIndex < backgrounds.length - 1) {
            currentBackgroundIndex++;
        }
    }

    // Draw hill and penguin
    if (!penguin.isAirborne) ctx.drawImage(hillImg, 0, 400, 300, 200);
    ctx.drawImage(penguinImg, penguin.x, penguin.y, 40, 40);

    // Repeat the game loop
    requestAnimationFrame(gameLoop);
}

// Event listener for starting the slide with Spacebar
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !penguin.isSliding && !penguin.isAirborne) {
        penguin.isSliding = true;
        penguin.velocityX = 0;
    }
});

// Start game loop
gameLoop();
