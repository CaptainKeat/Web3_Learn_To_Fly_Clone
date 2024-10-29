const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.7;

let distanceTraveled = 0;
let slingPower = 10;
let tireWeight = 1;
let isDragging = false;
let startX, startY, releaseVelocityX, releaseVelocityY;
let cameraX = 0;
let backgroundOffset = 0;
let tireAngle = 0;
let money = 0;

// Adjusted slingshot position further to the right for more pull-back space
const slingshotOffsetX = canvas.width * 0.6; // New starting position for slingshot
const slingshotCenter = { x: slingshotOffsetX, y: canvas.height - 50 };
const tire = {
    x: slingshotCenter.x,
    y: slingshotCenter.y,
    radius: 20,
    vx: 0,
    vy: 0,
    inAir: false,
    rolling: false,
    stopped: true, // Initial state is stopped for upgrades
};

// Draw Function with Parallax Background
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate camera offset
    cameraX = Math.max(0, tire.x - slingshotOffsetX);

    // Draw Sky Background (Static)
    ctx.fillStyle = "#87CEEB"; // Sky color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Ground
    ctx.fillStyle = "#8B4513"; // Ground color
    ctx.fillRect(-cameraX + backgroundOffset, canvas.height - 30, canvas.width * 2, 30);

    // Draw Slingshot Arms
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

    // Draw Tire with Rotation Effect
    ctx.save();
    ctx.translate(tire.x - cameraX, tire.y);
    ctx.rotate(tireAngle);
    ctx.beginPath();
    ctx.arc(0, 0, tire.radius, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.restore();
}

// Update Function
function update() {
    if (tire.inAir) {
        tire.vy += 0.5 * tireWeight; // Gravity effect
        tire.vx *= 0.99; // Air friction
        tire.x += tire.vx;
        tire.y += tire.vy;
        tireAngle += tire.vx / tire.radius; // Rolling effect

        if (tire.y >= canvas.height - 50) { // Land on ground
            tire.inAir = false;
            tire.rolling = true;
            tire.y = canvas.height - 50;
        }
    } else if (tire.rolling) {
        tire.vx *= 0.98; // Ground friction
        tire.x += tire.vx;
        tireAngle += tire.vx / tire.radius;

        if (Math.abs(tire.vx) < 0.1) { // Stop rolling
            tire.rolling = false;
            tire.stopped = true;
            money += distanceTraveled;
            document.getElementById("money").innerText = money;
            showUpgradeMenu();
        }
    }

    distanceTraveled = Math.round(tire.x - slingshotCenter.x);
    document.getElementById("distance").innerText = distanceTraveled + " meters";

    draw();
    requestAnimationFrame(update);
}

// Allow dragging to the left but not forward of the slingshot
function startDrag(event) {
    if (!tire.inAir && !tire.rolling && tire.stopped) {
        isDragging = true;
        startX = event.touches ? event.touches[0].clientX : event.clientX;
        startY = event.touches ? event.touches[0].clientY : event.clientY;
    }
}

function drag(event) {
    if (isDragging) {
        let currentX = event.touches ? event.touches[0].clientX : event.clientX;
        let currentY = event.touches ? event.touches[0].clientY : event.clientY;
        tire.x = Math.min(currentX + cameraX, slingshotCenter.x); // Restrict forward movement
        tire.y = currentY;
    }
}

function release() {
    if (isDragging) {
        isDragging = false;
        tire.stopped = false;
        releaseVelocityX = (slingshotCenter.x - tire.x) * slingPower / 50;
        releaseVelocityY = (slingshotCenter.y - tire.y) * slingPower / 50;
        tire.vx = releaseVelocityX;
        tire.vy = releaseVelocityY;
        tire.inAir = true;

        tire.x = slingshotCenter.x;
        tire.y = slingshotCenter.y;
    }
}

// Upgrade Functions
function showUpgradeMenu() {
    document.getElementById("upgradeMenu").classList.remove("hidden");
}

function closeUpgradeMenu() {
    document.getElementById("upgradeMenu").classList.add("hidden");
    tire.x = slingshotCenter.x;
    tire.y = slingshotCenter.y;
}

function upgradeSling() {
    if (money >= 10) {
        money -= 10;
        slingPower += 5;
        document.getElementById("money").innerText = money;
    }
}

function upgradeTire() {
    if (money >= 10) {
        money -= 10;
        tireWeight -= 0.1; // Lighten the tire for more distance
        document.getElementById("money").innerText = money;
    }
}

update();
canvas.addEventListener("mousedown", startDrag);
canvas.addEventListener("mousemove", drag);
canvas.addEventListener("mouseup", release);
canvas.addEventListener("touchstart", startDrag);
canvas.addEventListener("touchmove", drag);
canvas.addEventListener("touchend", release);
