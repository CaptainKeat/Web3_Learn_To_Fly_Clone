const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.7;

let distanceTraveled = 0;
let slingPower = 10;
let tireWeight = 1;
let isDragging = false;
let startX, startY, releaseVelocityX, releaseVelocityY;
let backgroundX = 0;

// Tire Position and Sling
const tire = {
    x: 100,
    y: canvas.height - 50,
    radius: 20,
    vx: 0,
    vy: 0,
    inAir: false,
    rolling: false,
};

// Draw Function
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Background
    ctx.fillStyle = "#8B4513"; // Ground color
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

    // Draw Sling
    ctx.beginPath();
    ctx.moveTo(100, canvas.height - 50);
    if (isDragging) {
        ctx.lineTo(tire.x, tire.y);
    } else {
        ctx.lineTo(tire.x - 30, tire.y); // Static look for sling when not pulled
    }
    ctx.strokeStyle = "brown";
    ctx.lineWidth = 5;
    ctx.stroke();

    // Draw Tire
    ctx.beginPath();
    ctx.arc(tire.x, tire.y, tire.radius, 0, Math.PI * 2);
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

    // Scroll background
    if (tire.x > canvas.width / 2) {
        backgroundX -= tire.vx;
        distanceTraveled += Math.abs(tire.vx);
        document.getElementById("distance").innerText = Math.round(distanceTraveled);
    }

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
        tire.x = currentX;
        tire.y = currentY;
    }
}

function release() {
    if (isDragging) {
        isDragging = false;
        releaseVelocityX = (100 - tire.x) * slingPower / 50;
        releaseVelocityY = (canvas.height - 50 - tire.y) * slingPower / 50;
        tire.vx = releaseVelocityX;
        tire.vy = releaseVelocityY;
        tire.inAir = true;
        tire.x = 100;
        tire.y = canvas.height - 50;
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
