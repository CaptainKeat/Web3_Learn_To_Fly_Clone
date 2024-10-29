const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.7;

let distanceTraveled = 0;
let slingPower = 10;
let tireWeight = 1;
let isDragging = false;
let startX, startY, releaseVelocityX, releaseVelocityY;
let cameraX = 0; // New camera offset variable

// Slingshot Position, adjusted to be relative to camera
const slingshotOffsetX = 150; // Distance from left side of screen
const slingshotCenter = { x: slingshotOffsetX, y: canvas.height - 50 };
const tire = {
    x: slingshotCenter.x,
    y: slingshotCenter.y,
    radius: 20,
    vx: 0,
    vy: 0,
    inAir: false,
    rolling: false,
};

// Draw Function
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate camera offset
    cameraX = Math.max(0, tire.x - slingshotOffsetX);

    // Draw Ground
    ctx.fillStyle = "#8B4513"; // Ground color
    ctx.fillRect(-cameraX, canvas.height - 30, canvas.width * 2, 30);

    // Draw Slingshot Arms relative to camera
    ctx.beginPath();
    ctx.moveTo(slingshotCenter.x - 20 - cameraX, slingshotCenter.y);
    ctx.lineTo(slingshotCenter.x - 20 - cameraX, slingshotCenter.y - 100);
    ctx.moveTo(slingshotCenter.x + 20 - cameraX, slingshotCenter.y);
    ctx.lineTo(slingshotCenter.x + 20 - cameraX, slingshotCenter.y - 100);
    ctx.strokeStyle = "brown";
    ctx.lineWidth = 8;
    ctx.stroke();

    // Draw Rubber Band
    if (isDragging || tire.inAir) {
        ctx.beginPath();
        ctx.moveTo(slingshotCenter.x - 20 - cameraX, slingshotCenter.y - 100);
        ctx.lineTo(tire.x - cameraX, tire.y);
        ctx.lineTo(slingshotCenter.x + 20 - cameraX, slingshotCenter.y - 100);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Draw Tire relative to camera
    ctx.beginPath();
    ctx.arc(tire.x - cameraX, tire.y, tire.radius, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
}

// Update Function
function update() {
    if (tire.inAir) {
        tire.vy += 0.5 * tireWeight; // Gravity effect
        tire.vx *= 0.99; // Air friction
        tire.x += tire.vx;
        tire.y += tire.vy;

        // Tire lands on ground
        if (tire.y >= canvas.height - 50) {
            tire.inAir = false;
            tire.rolling = true;
            tire.y = canvas.height - 50;
        }
    } else if (tire.rolling) {
        // Tire rolling on ground
        tire.vx *= 0.98; // Ground friction
        tire.x += tire.vx;
        if (Math.abs(tire.vx) < 0.1) {
            tire.rolling = false; // Stop if too slow
        }
    }

    // Update distance counter
    distanceTraveled = Math.round(tire.x - slingshotCenter.x);
    document.getElementById("distance").innerText = distanceTraveled + " meters";

    draw();
    requestAnimationFrame(update);
}

// Mouse and Touch Events
canvas.addEventListener("mousedown", startDrag);
canvas.addEventListener("touchstart", startDrag);
canvas.addEventListener("mousemove", drag);
canvas.addEventListener("touchmove", drag);
canvas.addEventListener("mouseup", release);
canvas.addEventListener("touchend", release);

function startDrag(event) {
    if (!tire.inAir && !tire.rolling) {
        isDragging = true;
        startX = event.touches ? event.touches[0].clientX : event.clientX;
        startY = event.touches ? event.touches[0].clientY : event.clientY;
    }
}

function drag(event) {
    if (isDragging) {
        let currentX = event.touches ? event.touches[0].clientX : event.clientX;
        let currentY = event.touches ? event.touches[0].clientY : event.clientY;
        tire.x = currentX + cameraX; // Adjust drag position by camera offset
        tire.y = currentY;
    }
}

function release() {
    if (isDragging) {
        isDragging = false;
        releaseVelocityX = (slingshotCenter.x - tire.x) * slingPower / 50;
        releaseVelocityY = (slingshotCenter.y - tire.y) * slingPower / 50;
        tire.vx = releaseVelocityX;
        tire.vy = releaseVelocityY;
        tire.inAir = true;

        // Reset tire back to slingshot origin visually
        tire.x = slingshotCenter.x;
        tire.y = slingshotCenter.y;
    }
}

// Upgrade Functions
document.getElementById("upgradeSling").addEventListener("click", () => {
    slingPower += 5;
});

document.getElementById("upgradeTire").addEventListener("click", () => {
    tireWeight -= 0.1; // Lower weight makes it fly further
});

update();
