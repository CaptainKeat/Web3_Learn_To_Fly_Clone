const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.7;

let distanceTraveled = 0;
let slingPower = 10;
let tireWeight = 1;
let isDragging = false;
let startX, startY, releaseVelocityX, releaseVelocityY;

// Tire Position and Sling
const tire = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    radius: 20,
    vx: 0,
    vy: 0,
    inAir: false,
};

// Draw Function
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Sling
    ctx.beginPath();
    ctx.moveTo(tire.x, tire.y);
    ctx.lineTo(canvas.width / 2, canvas.height - 50);
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
        tire.x += tire.vx;
        tire.y += tire.vy;
        distanceTraveled = Math.max(distanceTraveled, Math.round(tire.x - canvas.width / 2));
        
        // Stop when hitting the ground
        if (tire.y >= canvas.height - 50) {
            tire.inAir = false;
            document.getElementById("distance").innerText = distanceTraveled;
        }
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
    if (!tire.inAir) {
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
        releaseVelocityX = (canvas.width / 2 - tire.x) * slingPower / 50;
        releaseVelocityY = (canvas.height - 50 - tire.y) * slingPower / 50;
        tire.vx = releaseVelocityX;
        tire.vy = releaseVelocityY;
        tire.inAir = true;
        tire.x = canvas.width / 2;
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
