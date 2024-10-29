const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load assets
const tireImg = new Image();
tireImg.src = 'assets/tire.png';

const hillImg = new Image();
hillImg.src = 'assets/hill_ramp.png';

const groundImg = new Image();
groundImg.src = 'assets/ground.png';

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
let tire = { x: 0, y: 0, velocityX: 0, velocityY: 0, isSliding: false, isAirborne: false, isRolling: false };
let gravity = 0.5;
let slideAcceleration = 0.2;
let altitude = 0;
let distance = 0;
let currentBackgroundIndex = 0;
let hillPathIndex = 0;

// Define hill path coordinates for a smooth slide down
const hillPath = [
    { x: 50, y: 400 }, { x: 100, y: 405 }, { x: 150, y: 410 },
    { x: 200, y: 430 }, { x: 250, y: 450 }, { x: 300, y: 470 },
    { x: 350, y: 490 }, { x: 400, y: 500 } // End of hill, ready to launch
];

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(backgrounds[currentBackgroundIndex], 0, 0, canvas.width, canvas.height);

    // Update tire physics
    if (tire.isSliding && hillPathIndex < hillPath.length) {
        // Move tire along the hill path
        tire.x = hillPath[hillPathIndex].x;
        tire.y = hillPath[hillPathIndex].y;
        tire.velocityX += slideAcceleration;

        hillPathIndex++;
        
        // Launch off the ramp at the end of the hill
        if (hillPathIndex >= hillPath.length) {
            tire.isSliding = false;
            tire.isAirborne = true;
            tire.velocityY = -tire.velocityX * 0.7; // Adjust upward velocity based on slide speed
        }
    }

    if (tire.isAirborne) {
        // Apply gravity for flight
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
            tire.isRolling = true; // Enable rolling after landing
        }

        // Change background based on distance
        if (distance > 200 && currentBackgroundIndex < backgrounds.length - 1) {
            currentBackgroundIndex++;
        }
    }

    if (tire.isRolling) {
        // Roll along the ground if there’s forward momentum
        tire.x += tire.velocityX;
        tire.velocityX *= 0.98; // Apply friction to slow down gradually

        // Stop rolling if speed is negligible
        if (Math.abs(tire.velocityX) < 0.1) {
            tire.isRolling = false;
        }
    }

    // Draw hill, tire, and ground
    ctx.drawImage(hillImg, 0, 400, 500, 200); // Draw the hill for sliding
    ctx.drawImage(groundImg, 0, 500, canvas.width, 100); // Draw ground
    ctx.drawImage(tireImg, tire.x, tire.y, 40, 40);

    // Repeat the game loop
    requestAnimationFrame(gameLoop);
}

// Event listener for starting the slide with Spacebar
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !tire.isSliding && !tire.isAirborne && !tire.isRolling) {
        tire.isSliding = true;
        tire.velocityX = 0;
        hillPathIndex = 0; // Reset to start of hill path
    }
});

// Start game loop
gameLoop();
