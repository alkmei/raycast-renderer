export default class GameMap {
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
