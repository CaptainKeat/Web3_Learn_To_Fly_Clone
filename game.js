const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800; // Fixed width for the game area
canvas.height = 500; // Fixed height for the game area

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
let tireAngle = 0;
let money = 0;
const bounceFactor = 0.5;
let poleHeightLevel = 0;

// Variables for zoom and background persistence
let zoomLevel = 1;
let targetZoom = 1;
let zoomSpeed = 0.005;
const minZoom = 1;
const maxZoom = 1.5;

const slingshotCenter = { x: canvas.width * 0.6, y: canvas.height - 50 };
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

// Background images in the 'assets' folder
const backgroundImages = [
    { image: new Image(), src: "assets/forest.png" },
    { image: new Image(), src: "assets/mountains.png" },
    { image: new Image(), src: "assets/desert.png" },
    { image: new Image(), src: "assets/plains.png" },
];

// Load each image and verify loading
let imagesLoaded = 0;
backgroundImages.forEach((bg) => {
    bg.image.src = bg.src;
    bg.image.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === backgroundImages.length) {
            update();
        }
    };
    bg.image.onerror = () => {
        console.error(`Failed to load image at ${bg.src}`);
    };
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Smooth zoom animation
    if (zoomLevel < targetZoom) {
        zoomLevel += zoomSpeed;
        if (zoomLevel > targetZoom) zoomLevel = targetZoom;
    }

    // Apply zoom centered on the tire
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(-tire.x, -tire.y);

    // Persistent Background Image (fixed at 0,0)
    const sectionIndex = Math.floor((distanceTraveled / 2000) % backgroundImages.length);
    const currentBackground = backgroundImages[sectionIndex]?.image;

    if (currentBackground && currentBackground.complete) {
        ctx.drawImage(currentBackground, -canvas.width, 0, canvas.width * 3, canvas.height);
    } else {
        console.warn("Background image is undefined or not fully loaded.");
    }

    // Ground
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(-canvas.width, canvas.height - 30, canvas.width * 3, 30);

    // Slingshot Arms
    ctx.beginPath();
    ctx.moveTo(slingshotCenter.x - 20, slingshotCenter.y);
    ctx.lineTo(slingshotCenter.x - 20, slingshotCenter.y - slingshotHeight);
    ctx.moveTo(slingshotCenter.x + 20, slingshotCenter.y);
    ctx.lineTo(slingshotCenter.x + 20, slingshotCenter.y - slingshotHeight);
    ctx.strokeStyle = "brown";
    ctx.lineWidth = 8;
    ctx.stroke();

    // Rubber Band
    if (isDragging || (!tire.released && tire.inAir)) {
        ctx.beginPath();
        ctx.moveTo(slingshotCenter.x - 20, slingshotCenter.y - slingshotHeight);
        ctx.lineTo(tire.x, tire.y);
        ctx.lineTo(slingshotCenter.x + 20, slingshotCenter.y - slingshotHeight);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Draw Tire with Rotation Effect
    ctx.save();
    ctx.translate(tire.x, tire.y);
    ctx.rotate(tireAngle);
    ctx.beginPath();
    ctx.arc(0, 0, tire.radius, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.restore();

    // Restore scale and translation after zoom
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

            // Update money display if element exists
            const moneyElement = document.getElementById("money");
            if (moneyElement) {
                moneyElement.innerText = money;
            }

            showUpgradeMenu();
            targetZoom = minZoom; // Reset zoom when stopping
        }
    }

    distanceTraveled = Math.round(tire.x - slingshotCenter.x);

    // Update distance display if element exists
    const distanceElement = document.getElementById("distance");
    if (distanceElement) {
        distanceElement.innerText = distanceTraveled;
    }

    draw();
    requestAnimationFrame(update);
}

// Modify release function to initiate zoom on release
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

        // Activate zoom effect after release
        targetZoom = maxZoom;
    }
}

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

        let dx = currentX - slingshotCenter.x;
        let dy = currentY - slingshotCenter.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > maxPullBackDistance) {
            let angle = Math.atan2(dy, dx);
            tire.x = slingshotCenter.x + Math.cos(angle) * maxPullBackDistance;
            tire.y = slingshotCenter.y + Math.sin(angle) * maxPullBackDistance;
        } else {
            tire.x = currentX;
            tire.y = currentY;
        }
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

function showUpgradeMenu() {
    document.getElementById("upgradeMenu").classList.remove("hidden");
}

function closeUpgradeMenu() {
    document.getElementById("upgradeMenu").classList.add("hidden");
    tire.x = slingshotCenter.x;
    tire.y = slingshotCenter.y;
}
canvas.addEventListener("mousedown", startDrag);
canvas.addEventListener("mousemove", drag);
canvas.addEventListener("mouseup", release);
canvas.addEventListener("touchstart", startDrag);
canvas.addEventListener("touchmove", drag);
canvas.addEventListener("touchend", release);
