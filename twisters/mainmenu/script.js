function drawMainMenu(ctx) {
    ctx.fillStyle = "#666";
    ctx.fillRect(0, 0, 1600, 1200);

    // Logo
    ctx.fillStyle = "#aaa";
    ctx.font = "120px Arial";
    ctx.fillText("TWISTERS", 450, 250);

    ctx.font = "70px Arial";
    ctx.fillText("Net", 1050, 300);

    // Menu buttons
    ctx.fillStyle = "white";
    ctx.font = "140px Georgia";

    ctx.fillText("Play", 100, 500);
    ctx.fillText("Settings", 100, 700);
    ctx.fillText("About", 100, 900);
    ctx.fillText("Vehicles", 100, 1100);

    // Credit
    ctx.fillStyle = "#ffb52e";
    ctx.font = "50px Georgia";
    ctx.fillText("CoinifyBCB", 1350, 1150);
}

let gameState = "menu";

function gameLoop() {
    if (gameState === "menu") {
        drawMainMenu(ctx);
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();

    const x = (e.clientX - rect.left) * (1600 / rect.width);
    const y = (e.clientY - rect.top) * (1200 / rect.height);

    if (x > 100 && x < 500 && y > 400 && y < 520) {
        gameState = "game";
    }
});
