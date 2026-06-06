canvas = document.getElementById("game");
 const ctx = canvas.getContext("2d");

function resizeGame() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
const
    const scale = Math.min(vw / 1600, vh / 1200);

    canvas.style.width = (1600 * scale) + "px";
    canvas.style.height = (1200 * scale) + "px";
}

window.addEventListener("resize", resizeGame);
resizeGame();

