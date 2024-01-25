import config from "./config.json";
import Player from "./player";
import Helper from "./helper";
import GameMap from "./game_map";

const TILESIZE = config.tileSize;

export default class CanvasHandler {
  static WIDTH = 1200;
  static HEIGHT = 800;
  static FOV = 60;
  context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.context = canvas.getContext("2d")!;
    canvas.width = CanvasHandler.WIDTH;
    canvas.height = CanvasHandler.HEIGHT;
    canvas.addEventListener("click", async () => {
      await canvas.requestPointerLock();
    });
    this.clearScreen();
  }

  clearScreen() {
    this.context.fillStyle = "black";
    this.context.fillRect(0, 0, CanvasHandler.WIDTH, CanvasHandler.HEIGHT);
  }

  drawSlice(height: number, x: number) {
    const halfHeight = CanvasHandler.HEIGHT / 2;
    const y = halfHeight - height / 2;
    this.context.fillRect(x, y, 1, height);
  }

  renderMap(gameMap: GameMap, player: Player, scale: number) {
    this.context.fillStyle = "grey";
    for (let i = 0; i < gameMap.size; i++) {
      for (let j = 0; j < gameMap.size; j++) {
        if (gameMap.map[i][j] == 1) {
          this.context.fillRect(
            j * TILESIZE * scale,
            i * TILESIZE * scale,
            TILESIZE * scale,
            TILESIZE * scale
          );
        }
      }
    }

    this.context.fillStyle = "red";
    this.context.fillRect(player.x - 5, player.y - 5, 10, 10);

    this.context.strokeStyle = "red";

    for (let i = 0; i < CanvasHandler.WIDTH; i++) {
      const collision = player.simpleCast(
        gameMap,
        player.angle -
          Helper.toRadian(CanvasHandler.FOV / 2) +
          Helper.toRadian(CanvasHandler.FOV / 1200) * i
      );
      this.context.beginPath();
      this.context.moveTo(player.x, player.y);
      this.context.lineTo(collision.x * scale, collision.y * scale);
      this.context.stroke();
    }
  }

  renderCast(gameMap: GameMap, player: Player) {
    for (let i = 0; i < CanvasHandler.WIDTH; i++) {
      const collision = player.cast(
        gameMap,
        player.angle -
          Helper.toRadian(CanvasHandler.FOV / 2) +
          Helper.toRadian(CanvasHandler.FOV / CanvasHandler.WIDTH) * i
      );
      const distance = this.fixFishEye(
        collision.distance,
        collision.angle,
        player.angle
      );
      this.context.fillStyle = collision.vertical ? "silver" : "white";
      this.drawSlice(((TILESIZE * 5) / distance) * 277, i);
    }
  }

  fixFishEye(distance: number, angle: number, playerAngle: number) {
    const diff = angle - playerAngle;
    return distance * Math.cos(diff);
  }
}
