const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.7;

let distanceTraveled = 0;
let slingPower = 10;
let tireWeight = 1;
let slingshotHeight = 100; // Initial slingshot pole height
let bounceBoost = 5; // Boost power for tire bounce
let isDragging = false;
let startX, startY, releaseVelocityX, releaseVelocityY;
let cameraX = 0;
let backgroundOffset = 0;
let tireAngle = 0;
let money = 0;

const maxPullBackDistance = 100;
const bounceFactor = 0.6;

// Slingshot and tire positioning
const slingshotOffsetX = canvas.width * 0.6;
const slingshotCenter = { x: slingshotOffsetX, y: canvas.height - 50 };
const tire = {
    x: slingshotCenter.x,
    y: slingshotCenter.y,
    radius: 20,
    vx: 0,
    vy: 0,
    inAir: false,
    rolling: false,
    stopped: true,
    released: false,
};

// Draw function with parallax background, extended ground line, and slingshot visuals
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    cameraX = Math.max(0, tire.x - slingshotOffsetX);

    // Draw Sky Background (Static)
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Hills for Background Parallax (Distant Layer)
    drawHills(-cameraX * 0.3);

    // Draw Trees for Foreground Parallax (Closer Layer)
    drawTrees(-cameraX * 0.6);

    // Draw Ground Line
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(-cameraX, canvas.height - 30, canvas.width * 2, 30);

    // Draw Slingshot Arms, using dynamic slingshotHeight
    ctx.beginPath();
    ctx.moveTo(slingshotCenter.x - 20 - cameraX, slingshotCenter.y);
    ctx.lineTo(slingshotCenter.x - 20 - cameraX, slingshotCenter.y - slingshotHeight);
    ctx.moveTo(slingshotCenter.x + 20 - cameraX, slingshotCenter.y);
    ctx.lineTo(slingshotCenter.x + 20 - cameraX, slingshotCenter.y - slingshotHeight);
    ctx.strokeStyle = "brown";
    ctx.lineWidth = 8;
    ctx.stroke();

    // Draw Rubber Band if Tire is Held (not released)
    if (isDragging || (!tire.released && tire.inAir)) {
        ctx.beginPath();
        ctx.moveTo(slingshotCenter.x - 20 - cameraX, slingshotCenter.y - slingshotHeight);
        ctx.lineTo(tire.x - cameraX, tire.y);
        ctx.lineTo(slingshotCenter.x + 20 - cameraX, slingshotCenter.y - slingshotHeight);
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

// Function to draw distant hills
function drawHills(offset) {
    ctx.fillStyle = "#556B2F";
    ctx.beginPath();
    ctx.moveTo(offset, canvas.height - 80);
    for (let i = 0; i < canvas.width + 100; i += 100) {
        let hillHeight = 30 + Math.sin(i * 0.01) * 20;
        ctx.lineTo(offset + i, canvas.height - 80 - hillHeight);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();
}

// Function to draw foreground trees
function drawTrees(offset) {
    ctx.fillStyle = "#228B22";
    for (let i = 0; i < canvas.width + 100; i += 150) {
        ctx.beginPath();
        ctx.moveTo(offset + i, canvas.height - 30);
        ctx.lineTo(offset + i + 20, canvas.height - 80);
        ctx.lineTo(offset + i - 20, canvas.height - 80);
        ctx.closePath();
        ctx.fill();
    }
}

// Update function with bounce physics, ground friction, and bounce boost
function update() {
    if (tire.inAir) {
        tire.vy += 0.5 * tireWeight;
        tire.vx *= 0.99;
        tire.x += tire.vx;
        tire.y += tire.vy;
        tireAngle += tire.vx / tire.radius;

        if (tire.y >= canvas.height - 50) {
            tire.inAir = tire.vy > 2;
            tire.rolling = !tire.inAir;
            tire.vy = -tire.vy * bounceFactor;
            tire.y = canvas.height - 50;
        }
    } else if (tire.rolling) {
        tire.vx *= 0.98;
        tire.x += tire.vx;
        tireAngle += tire.vx / tire.radius;

        if (Math.abs(tire.vx) < 0.1) {
            tire.rolling = false;
            tire.stopped = true;
            tire.released = false;
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

// Restrict dragging to max pull-back distance and limit forward movement
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

        let dx = currentX + cameraX - slingshotCenter.x;
        let dy = currentY - slingshotCenter.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > maxPullBackDistance) {
            let angle = Math.atan2(dy, dx);
            tire.x = slingshotCenter.x + Math.cos(angle) * maxPullBackDistance;
            tire.y = slingshotCenter.y + Math.sin(angle) * maxPullBackDistance;
        } else {
            tire.x = currentX + cameraX;
            tire.y = currentY;
        }
    }
}

function release() {
    if (isDragging) {
        isDragging = false;
        tire.stopped = false;
        tire.released = true;
        releaseVelocityX = (slingshotCenter.x - tire.x) * slingPower / 50;
        releaseVelocityY = (slingshotCenter.y - tire.y) * slingPower / 50;
        tire.vx = releaseVelocityX;
        tire.vy = releaseVelocityY;
        tire.inAir = true;

        tire.x = slingshotCenter.x;
        tire.y = slingshotCenter.y;
    }
}

// Bounce Boost activation on Space key press
document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && tire.rolling) {
        tire.vy = -bounceBoost;
        tire.vx += 1; // Add a slight horizontal boost as well
        tire.inAir = true;
    }
});

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
        tireWeight -= 0.1;
        document.getElementById("money").innerText = money;
    }
}

function upgradePoleHeight() {
    if (money >= 10) {
        money -= 10;
        slingshotHeight += 20; // Increase pole height by 1 meter (20 pixels)
        document.getElementById("money").innerText = money;
    }
}

function upgradeBounceBoost() {
    if (money >= 10) {
        money -= 10;
        bounceBoost += 2; // Increase bounce boost power
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
