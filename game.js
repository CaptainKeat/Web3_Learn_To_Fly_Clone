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

// Background images for each terrain type
const backgroundImages = [
    { image: new Image(), src: "assets/forest.png" },  // Add paths to high-quality images
    { image: new Image(), src: "assets/mountains.png" },
    { image: new Image(), src: "assets/desert.png" },
    { image: new Image(), src: "assets/plains.png" },
];

// Load each image
backgroundImages.forEach((bg) => {
    bg.image.src = bg.src;
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cameraX = Math.max(0, tire.x - slingshotOffsetX);

    // Select background image based on distance
    const sectionIndex = Math.floor((distanceTraveled / 2000) % backgroundImages.length);
    const currentBackground = backgroundImages[sectionIndex].image;

    // Draw background image (fixed, doesn't move with the ground)
    ctx.drawImage(currentBackground, 0, 0, canvas.width, canvas.height);

    // Ground (consistent brown rectangle)
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
}

// Update function for gameplay
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

// Dragging and release functions remain the same
// Adjusted physics and scaling should now control the distance and appearance effectively

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

// Bounce Boost activation on Space key press, with usage limitation
document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && tire.rolling && bounceBoostUsed < bounceBoostCount) {
        tire.vy = -bounceBoost;
        tire.vx += 1;
        tire.inAir = true;
        bounceBoostUsed++;
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
        slingshotHeight += 20;
        poleHeightLevel++;
        document.getElementById("poleLevel").innerText = poleHeightLevel;
        document.getElementById("money").innerText = money;
    }
}

function upgradeBounceBoost() {
    if (money >= 10) {
        money -= 10;
        bounceBoostCount++;
        document.getElementById("boostLevel").innerText = bounceBoostCount;
        document.getElementById("money").innerText = money;
    }
}

function upgradePullBack() {
    if (money >= 10) {
        money -= 10;
        maxPullBackDistance += 10;
        pullBackLevel++;
        document.getElementById("pullBackLevel").innerText = pullBackLevel;
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
