// ================= TWISTERS.NET SIMULATOR ENGINE =================

// State Tracking Variable Blocks
let isPlaying = false;
let currentPanel = null;
let vehicleSwappingAllowed = true; // Set false when entering active storm danger zones to force rule 1.1

// Simulation State Tracking
const gameState = {
    playerX: 400,
    playerY: 450,
    playerSpeed: 0,
    playerDirection: 0, // In radians
    targetDirection: 0,
    activeVehicleClass: 'Dealership',
    deploymentActive: false,
    money: 5000,
    audioBg: 100,
    audioSnd: 100,
    graphics: 'high'
};

// Natural System States (Tornado Variables)
const tornado = {
    x: 200,
    y: 200,
    intensity: 3, // EF3
    baseRadius: 40,
    coneWidth: 120,
    particles: []
};

// Canvas references
let canvas, ctx;
let lastTime = 0;

// Initialize on page readiness
window.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Bind Keyboard tracking keys for vehicle control
    window.addEventListener('keydown', handleKeyDown);
});

function resizeCanvas() {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}

// ================= ROUTING & SCREEN TRIGGERS =================
function startGameDirectly() {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    isPlaying = true;
    
    // Seed original complex tornado visual particles
    initTornadoParticles();
    
    // Fire up structural animation loops
    requestAnimationFrame(gameLoop);
}

function openMenuSettings() {
    togglePanel('settings-panel');
}

function togglePanel(panelId) {
    if (currentPanel === panelId) {
        closeAllPanels();
        return;
    }
    closeAllPanels();
    
    // Implements Vehicle Restriction Rule from Concept 1.1
    if (panelId === 'vehicles-panel' && !vehicleSwappingAllowed) {
        alert("VEHICLE SWAP RESTRICTED! You are inside an active storm boundary. Move away to a designated swap zone.");
        return;
    }

    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.remove('hidden');
        currentPanel = panelId;
    }
}

function closeAllPanels() {
    if (currentPanel) {
        document.getElementById(currentPanel).classList.add('hidden');
        currentPanel = null;
    }
}

// ================= INTERACTIVE HUD CONTROLS =================
function toggleDeployment() {
    gameState.deploymentActive = document.getElementById('deploy-toggle').checked;
    document.getElementById('deploy-status').innerText = gameState.deploymentActive ? "ON" : "OFF";
}

function selectVehicleClass(className) {
    gameState.activeVehicleClass = className;
    alert(`Vehicle switched to category: ${className.toUpperCase()}`);
    closeAllPanels();
}

function setGraphics(level) {
    gameState.graphics = level;
    document.getElementById('gfx-low').classList.remove('active');
    document.getElementById('gfx-med').classList.remove('active');
    document.getElementById('gfx-high').classList.remove('active');
    
    document.getElementById(`gfx-${level}`).classList.add('active');
}

function adjustAudio(type, value) {
    if (type === 'bg') {
        gameState.audioBg = Math.max(0, Math.min(100, gameState.audioBg + value));
        document.getElementById('val-bg').innerText = gameState.audioBg;
    } else {
        gameState.audioSnd = Math.max(0, Math.min(100, gameState.audioSnd + value));
        document.getElementById('val-snd').innerText = gameState.audioSnd;
    }
}

function toggleMobile() {
    const btn = document.getElementById('mobile-toggle');
    if (btn.innerText.includes('OFF')) {
        btn.innerText = "MOBILE CONTROLS: ON";
    } else {
        btn.innerText = "MOBILE CONTROLS: OFF";
    }
}

function openRatingScreen() {
    togglePanel('rating-panel');
}

// ================= REALTIME DRIVING LOGIC =================
function handleKeyDown(e) {
    if (!isPlaying) return;
    
    // Intercept Arrow keys / WASD to adjust direction vectors & speed steps
    switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
            gameState.playerSpeed = Math.min(125, gameState.playerSpeed + 8.5);
            break;
        case 's':
        case 'arrowdown':
            gameState.playerSpeed = Math.max(0, gameState.playerSpeed - 12);
            break;
        case 'a':
        case 'arrowleft':
            gameState.targetDirection -= 0.25;
            break;
        case 'd':
        case 'arrowright':
            gameState.targetDirection += 0.25;
            break;
    }
}

// ================= TORNADO PARTICLE SYSTEM (Anti-Sphere Rule 2) =================
function initTornadoParticles() {
    tornado.particles = [];
    // Generate complex spinning layered lines & dots instead of stacked spheres
    for (let i = 0; i < 400; i++) {
        tornado.particles.push({
            heightOffset: Math.random(), // Percentage altitude from floor to cloud deck
            angle: Math.random() * Math.PI * 2,
            distanceModifier: 0.4 + Math.random() * 0.6,
            speed: 2 + Math.random() * 5,
            size: 2 + Math.random() * 4
        });
    }
}

// ================= CORE SIMULATION TICKER LOOP =================
function gameLoop(timestamp) {
    if (!isPlaying) return;
    
    let dt = (timestamp - lastTime) / 1000;
    if (isNaN(dt)) dt = 0.016;
    lastTime = timestamp;

    updateSimulation(dt);
    renderSimulation();

    requestAnimationFrame(gameLoop);
}

function updateSimulation(dt) {
    // Smooth angle interpolation for cross direction tracking
    gameState.playerDirection += (gameState.targetDirection - gameState.playerDirection) * 0.1;
    
    // Natural friction drag on tires
    gameState.playerSpeed = Math.max(0, gameState.playerSpeed - 1.5 * dt);
    
    // Update live positional physics
    gameState.playerX += Math.cos(gameState.playerDirection) * gameState.playerSpeed * dt * 5;
    gameState.playerY += Math.sin(gameState.playerDirection) * gameState.playerSpeed * dt * 5;

    // Dynamically update UI text nodes matching concepts
    document.getElementById('hud-speed').innerText = `${gameState.playerSpeed.toFixed(1)} MPH`;
    
    // Map vector angles into standard text icons pointing direction
    const degrees = (gameState.playerDirection * 180 / Math.PI) % 360;
    document.getElementById('hud-arrow').style.transform = `rotate(${degrees}deg)`;

    // Simulate localized storm movement tracking
    tornado.x += Math.sin(timestampToSecs()) * 8 * dt;
    tornado.y += Math.cos(timestampToSecs() * 0.5) * 4 * dt;

    // Check proximity to restrict vehicle swapping safety features (Rule 1.1)
    let dx = gameState.playerX - tornado.x;
    let dy = gameState.playerY - tornado.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    
    if (dist < 320) {
        vehicleSwappingAllowed = false;
        document.getElementById('hud-veh-btn').classList.add('disabled');
        document.getElementById('location-text').innerText = "WARNING AREA: RADAR INTERCEPT ZONE";
        document.getElementById('location-text').style.background = "#cc0000";
    } else {
        vehicleSwappingAllowed = true;
        document.getElementById('hud-veh-btn').classList.remove('disabled');
        document.getElementById('location-text').innerText = "OKLAHOMA OUTSKIRTS";
        document.getElementById('location-text').style.background = "#990000";
    }

    // Update internal multi-layered physics engine loops for tornado vortex
    tornado.particles.forEach(p => {
        p.angle += p.speed * dt * (1.2 - p.heightOffset); // Higher elements spin with modified drag ratios
    });
}

function timestampToSecs() {
    return Date.now() / 1000;
}

function renderSimulation() {
    // Clear and draw ground
    ctx.fillStyle = "#1e221a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stylized background chase highway network
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 24;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    ctx.strokeStyle = "#ffcc00";
    ctx.lineWidth = 2;
    ctx.setLineDash([15, 10]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dashes

    // RENDER METEOROLOGICAL VORTEX SYSTEM (Matches Concept 2 specifications)
    // Build vertical shear layer dynamics 
    const groundY = canvas.height - 120;
    const cloudDeckY = 140;
    const totalHeight = groundY - cloudDeckY;

    tornado.particles.forEach(p => {
        // Compute calculated radius scaling upward to cloud deck level
        const currentRadius = tornado.baseRadius + (p.heightOffset * tornado.coneWidth);
        const pY = groundY - (p.heightOffset * totalHeight);
        
        // Circular orbit tracking equations around moving atmospheric center core
        const pX = tornado.x + Math.sin(p.angle) * currentRadius * p.distanceModifier;

        // Dynamic multi-layer alpha shading for cloud density layering
        const alpha = (0.2 + (1.0 - p.distanceModifier) * 0.6).toFixed(2);
        ctx.fillStyle = `rgba(100, 105, 115, ${alpha})`;

        ctx.beginPath();
        ctx.arc(pX, pY, p.size * (1 + p.heightOffset * 2), 0, Math.PI * 2);
        ctx.fill();
    });

    // Render Player chase target entity icon indicator
    ctx.fillStyle = "#00fffa";
    ctx.beginPath();
    ctx.arc(gameState.playerX % canvas.width, gameState.playerY % canvas.height, 10, 0, Math.PI * 2);
    ctx.fill();
                 }
            
