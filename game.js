const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load assets
const tireImg = new Image();
tireImg.src = 'assets/tire.png';

const hillImg = new Image();
hillImg.src = 'assets/hill_ramp.png';

const backgrounds = [
    'assets/background1.png',
    'assets/background2.png',
].map(src => {
    const img = new Image();
    img.src = src;
    return img;
});

// Game variables
let tire = { x: 50, y: 400, velocityX: 0, velocityY: 0, isSliding: false, isAirborne: false };
let gravity = 0.5;
let slideAcceleration = 0.2;
let altitude = 0;
let distance = 0;
let currentBackgroundIndex = 0;

// Hill slope function
function getHillY(x) {
    // This function defines the hill's shape.
    if (x < 250) return 400 + (x * 0.4); // Adjust slope based on x position
    return 500; // Flat ground after hill
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(backgrounds[currentBackgroundIndex], 0, 0, canvas.width, canvas.height);

    // Update tire physics
    if (tire.isSliding) {
        tire.velocityX += slideAcceleration;
        tire.x += tire.velocityX;

        // Keep the tire on the hill's slope
        tire.y = getHillY(tire.x);

        // Launch off the hill once it reaches the end
        if (tire.x > 250) {
            tire.isSliding = false;
            tire.isAirborne = true;
            tire.velocityY = -tire.velocityX * 0.7; // Adjust upward velocity based on slide speed
        }
    }

    if (tire.isAirborne) {
        tire.velocityY += gravity;
        tire.y += tire.velocityY;
        tire.x += tire.velocityX;

        altitude = Math.max(600 - tire.y, 0);
        distance += tire.velocityX * 0.1;

        document.getElementById("altitude").textContent = Math.floor(altitude);
        document.getElementById("speed").textContent = Math.floor(Math.abs(tire.velocityX) * 10);
        document.getElementById("distance").textContent = Math.floor(distance);

        // Land if tire reaches the ground
        if (tire.y >= 500) {
            tire.y = 500;
            tire.isAirborne = false;
            tire.velocityX *= 0.9; // Slow down on landing
        }

        // Change background based on distance
        if (distance > 200 && currentBackgroundIndex < backgrounds.length - 1) {
            currentBackgroundIndex++;
        }
    }

    // Draw hill and tire
    if (!tire.isAirborne) ctx.drawImage(hillImg, 0, 400, 300, 200);
    ctx.drawImage(tireImg, tire.x, tire.y, 40, 40);

    // Repeat the game loop
    requestAnimationFrame(gameLoop);
}

// Event listener for starting the slide with Spacebar
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !tire.isSliding && !tire.isAirborne) {
        tire.isSliding = true;
        tire.velocityX = 0;
    }
});

// Start game loop
gameLoop();
