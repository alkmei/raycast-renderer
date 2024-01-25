import CanvasHandler from "./canvas_handler";
import Player from "./player";
import GameMap from "./game_map";

// Main Section
const canvasHandler = new CanvasHandler(
  document.getElementById("screen") as HTMLCanvasElement
);
const gameMap = new GameMap(8);
gameMap.randomize();

const player = new Player(0, 0, 0);
player.initializeControls();

// Game loop
window.requestAnimationFrame(gameLoop);

function gameLoop() {
  player.update();
  canvasHandler.clearScreen();

  canvasHandler.renderCast(gameMap, player);
  canvasHandler.renderMap(gameMap, player, 1);
  window.requestAnimationFrame(gameLoop);
}
