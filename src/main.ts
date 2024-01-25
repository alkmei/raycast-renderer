const TILESIZE = 32;

class CanvasHandler {
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

    for (let i = 0; i < 1200; i++) {
      const collision = player.simpleCast(
        gameMap,
        player.angle -
          toRadian(CanvasHandler.FOV / 2) +
          toRadian(CanvasHandler.FOV / 1200) * i
      );
      this.context.beginPath();
      this.context.moveTo(player.x, player.y);
      this.context.lineTo(collision.x * scale, collision.y * scale);
      this.context.stroke();
    }
  }

  renderCast(gameMap: GameMap, player: Player) {
    for (let i = 0; i < 1200; i++) {
      const collision = player.cast(
        gameMap,
        player.angle -
          toRadian(CanvasHandler.FOV / 2) +
          toRadian(CanvasHandler.FOV / 1200) * i
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

class GameMap {
  size: number;
  map: number[][];

  constructor(size: number) {
    this.size = size;
    this.map = new Array(size).fill(0).map(() => new Array(size).fill(0));
  }

  randomize() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        this.map[i][j] = Math.random() < 0.3 ? 1 : 0;
      }
    }
  }

  get(x: number, y: number) {
    if (x >= this.size || y >= this.size || x < 0 || y < 0) return 1;
    else return this.map[y][x];
  }
}

class Player {
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
        Math.pow(currentX - player.x, 2) + Math.pow(currentY - player.y, 2)
      ),
      angle: angle,
      vertical: false,
    };
  }

  castVertical(gameMap: GameMap, angle: number) {
    const right = Math.abs(Math.floor((angle - Math.PI / 2) / Math.PI) % 2);

    const firstX = right
      ? Math.floor(player.x / TILESIZE) * TILESIZE + TILESIZE
      : Math.floor(player.x / TILESIZE) * TILESIZE;
    const firstY = player.y + (firstX - player.x) * Math.tan(angle);

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
        Math.pow(currentX - player.x, 2) + Math.pow(currentY - player.y, 2)
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

const toRadian = (degree: number) => {
  return degree * (Math.PI / 180);
};

// Main Section
const canvasHandler = new CanvasHandler(
  document.getElementById("screen") as HTMLCanvasElement
);
const gameMap = new GameMap(8);
gameMap.randomize();

const player = new Player(0, 0, 0);

document.addEventListener("keydown", (e) => {
  if (e.key === "w") player.velocity = 2;
  if (e.key === "s") player.velocity = -2;
  if (e.key === "a") player.turnSpeed = toRadian(-10);
  if (e.key === "d") player.turnSpeed = toRadian(10);
});
document.addEventListener("keyup", (e) => {
  if (e.key === "w" || e.key === "s") player.velocity = 0;
  if (e.key === "a" || e.key === "d") player.turnSpeed = 0;
});

document.addEventListener("mousemove", (e) => {
  player.angle += e.movementX * 0.009;
});

// Game loop
window.requestAnimationFrame(gameLoop);

function gameLoop() {
  player.update();
  canvasHandler.clearScreen();

  canvasHandler.renderCast(gameMap, player);
  canvasHandler.renderMap(gameMap, player, 1);
  window.requestAnimationFrame(gameLoop);
}
