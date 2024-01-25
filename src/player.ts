import config from "./config.json";
import GameMap from "./game_map";
import Helper from "./helper";

const TILESIZE = config.tileSize;

export default class Player {
  x: number;
  y: number;
  angle: number;
  velocity: number;
  turnSpeed: number;

  constructor(x: number, y: number, angle: number) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.velocity = 0;
    this.turnSpeed = 0;
  }

  initializeControls() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "w") this.velocity = 2;
      if (e.key === "s") this.velocity = -2;
      if (e.key === "a") this.turnSpeed = Helper.toRadian(-5);
      if (e.key === "d") this.turnSpeed = Helper.toRadian(5);
    });
    document.addEventListener("keyup", (e) => {
      if (e.key === "w" || e.key === "s") this.velocity = 0;
      if (e.key === "a" || e.key === "d") this.turnSpeed = 0;
    });
  }

  update() {
    this.angle += this.turnSpeed;
    this.x += this.velocity * Math.cos(this.angle);
    this.y += this.velocity * Math.sin(this.angle);
  }

  castHorizontal(gameMap: GameMap, angle: number) {
    const up = Math.abs(Math.floor(angle / Math.PI) % 2);

    const firstY = up
      ? Math.floor(this.y / TILESIZE) * TILESIZE
      : Math.floor(this.y / TILESIZE) * TILESIZE + TILESIZE;

    const firstX = this.x + (firstY - this.y) / Math.tan(angle);

    const dy = up ? -TILESIZE : TILESIZE;
    const dx = dy / Math.tan(angle);

    let currentX = firstX;
    let currentY = firstY;

    while (
      gameMap.get(
        Math.floor(currentX / TILESIZE),
        Math.floor(up ? currentY / TILESIZE - 1 : currentY / TILESIZE)
      ) == 0
    ) {
      currentX += dx;
      currentY += dy;
    }

    return {
      distance: Math.sqrt(
        Math.pow(currentX - this.x, 2) + Math.pow(currentY - this.y, 2)
      ),
      angle: angle,
      vertical: false,
    };
  }

  castVertical(gameMap: GameMap, angle: number) {
    const right = Math.abs(Math.floor((angle - Math.PI / 2) / Math.PI) % 2);

    const firstX = right
      ? Math.floor(this.x / TILESIZE) * TILESIZE + TILESIZE
      : Math.floor(this.x / TILESIZE) * TILESIZE;
    const firstY = this.y + (firstX - this.x) * Math.tan(angle);

    const dx = right ? TILESIZE : -TILESIZE;
    const dy = dx * Math.tan(angle);

    let currentX = firstX;
    let currentY = firstY;

    while (
      gameMap.get(
        Math.floor(
          right
            ? Math.floor(currentX / TILESIZE)
            : Math.floor(currentX / TILESIZE) - 1
        ),
        Math.floor(currentY / TILESIZE)
      ) == 0
    ) {
      currentX += dx;
      currentY += dy;
    }

    return {
      distance: Math.sqrt(
        Math.pow(currentX - this.x, 2) + Math.pow(currentY - this.y, 2)
      ),
      angle: angle,
      vertical: true,
    };
  }

  cast(gameMap: GameMap, angle: number) {
    const h = this.castHorizontal(gameMap, angle);
    const v = this.castVertical(gameMap, angle);
    return h.distance < v.distance ? h : v;
  }

  simpleCast(gameMap: GameMap, angle: number) {
    const ray = this.cast(gameMap, angle);
    return {
      x: this.x + ray.distance * Math.cos(ray.angle),
      y: this.y + ray.distance * Math.sin(ray.angle),
    };
  }
}
