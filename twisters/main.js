
const canvas = document.getElementById("game");

function resizeGame() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const scale = Math.min(vw / 1600, vh / 1200);

    canvas.style.width = (1600 * scale) + "px";
    canvas.style.height = (1200 * scale) + "px";
}

window.addEventListener("resize", resizeGame);
resizeGame();
