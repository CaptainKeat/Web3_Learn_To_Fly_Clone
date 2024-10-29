const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.7;

let distanceTraveled = 0;
let slingPower = 4;
let tireWeight = 1;
let slingshotHeight = 80;
let bounceBoost = 3;
let bounceBoostCount = 0;
let bounceBoostUsed = 0;
let maxPullBackDistance = 70;
let pullBackLevel = 0;
let isDragging = false;
let startX, startY, releaseVelocityX, releaseVelocityY;
let cameraX = 0;
let tireAngle = 0;
let money = 0;
const bounceFactor = 0.5;
let poleHeightLevel = 0;

const slingshotOffsetX = canvas.width * 0.6;
const slingshotCenter = { x: slingshotOffsetX, y: canvas.height - 50 };
const tire = {
    x: slingshotCenter.x,
    y: slingshotCenter.y,
    radius: 15,
    vx: 0,
    vy: 0,
    inAir: false,
    rolling: false,
    stopped: true,
    released: false,
};

// Variables for animated background elements
let cloudOffset = 0;
let mountainOffset = 0;
let treeOffset = 0;
let bushOffset = 0;

// Draw function with animated background layers
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cameraX = Math.max(0, tire.x - slingshotOffsetX);

    // Draw Sky Background
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Animated Background Layers
    drawClouds(-cameraX * 0.1 + cloudOffset);
    drawMountains(-cameraX * 0.2 + mountainOffset);
    drawTrees(-cameraX * 0.4 + treeOffset);
    drawBushes(-cameraX * 0.5 + bushOffset);

    // Ground
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(-cameraX, canvas.height - 30, canvas.width * 2, 30);

    // Slingshot Arms
    ctx.beginPath();
    ctx.moveTo(slingshotCenter.x - 20 - cameraX, slingshotCenter.y);
    ctx.lineTo(slingshotCenter.x - 20 - cameraX, slingshotCenter.y - slingshotHeight);
    ctx.moveTo(slingshotCenter.x + 20 - cameraX, slingshotCenter.y);
    ctx.lineTo(slingshotCenter.x + 20 - cameraX, slingshotCenter.y - slingshotHeight);
    ctx.strokeStyle = "brown";
    ctx.lineWidth = 8;
    ctx.stroke();

    // Rubber Band
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

    // Animate Background Layers
    cloudOffset -= 0.2;
    mountainOffset -= 0.1;
    treeOffset -= 0.4;
    bushOffset -= 0.5;
}

// Background Layers
function drawClouds(offset) {
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < canvas.width + 100; i += 200) {
        ctx.beginPath();
        ctx.arc(offset + i, 100, 40, 0, Math.PI * 2);
        ctx.arc(offset + i + 50, 120, 30, 0, Math.PI * 2);
        ctx.arc(offset + i - 50, 110, 35, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawMountains(offset) {
    ctx.fillStyle = "#A9A9A9";
    ctx.beginPath();
    ctx.moveTo(offset, canvas.height - 100);
    for (let i = 0; i < canvas.width + 100; i += 200) {
        let mountainHeight = 60 + Math.sin(i * 0.05) * 20;
        ctx.lineTo(offset + i, canvas.height - 100 - mountainHeight);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();
}

function drawTrees(offset) {
    ctx.fillStyle = "#228B22";
    for (let i = 0; i < canvas.width + 100; i += 120) {
        ctx.beginPath();
        ctx.moveTo(offset + i, canvas.height - 30);
        ctx.lineTo(offset + i + 15, canvas.height - 80);
        ctx.lineTo(offset + i - 15, canvas.height - 80);
        ctx.closePath();
        ctx.fill();
    }
}

function drawBushes(offset) {
    ctx.fillStyle = "#006400";
    for (let i = 0; i < canvas.width + 100; i += 80) {
        ctx.beginPath();
        ctx.arc(offset + i, canvas.height - 40, 15, 0, Math.PI * 2);
        ctx.arc(offset + i + 20, canvas.height - 35, 12, 0, Math.PI * 2);
        ctx.arc(offset + i - 20, canvas.height - 35, 12, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Update function for gameplay and animation
function update() {
    if (tire.inAir) {
        tire.vy += 0.3 * tireWeight;
        tire.vx *= 0.98;
        tire.x += tire.vx;
        tire.y += tire.vy;
        tireAngle += tire.vx / tire.radius;

        if (tire.y >= canvas.height - 50) {
            tire.inAir = tire.vy > 1.5;
            tire.rolling = !tire.inAir;
            tire.vy = -tire.vy * bounceFactor;
            tire.y = canvas.height - 50;
        }
    } else if (tire.rolling) {
        tire.vx *= 0.96;
        tire.x += tire.vx;
        tireAngle += tire.vx / tire.radius;

        if (Math.abs(tire.vx) < 0.05) {
            tire.rolling = false;
            tire.stopped = true;
            tire.released = false;
            bounceBoostUsed = 0;
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

// Dragging, release, and upgrade functions remain the same

update();
canvas.addEventListener("mousedown", startDrag);
canvas.addEventListener("mousemove", drag);
canvas.addEventListener("mouseup", release);
canvas.addEventListener("touchstart", startDrag);
canvas.addEventListener("touchmove", drag);
canvas.addEventListener("touchend", release);
