interface Vec {
  x: number;
  y: number;
}

export default class Helper {
  static toRadian = (degree: number) => {
    return degree * (Math.PI / 180);
  };

  static rotateVector = (vec: Vec, ang: number) => {
    ang = -ang * (Math.PI / 180);
    var cos = Math.cos(ang);
    var sin = Math.sin(ang);
    return {
      x: Math.round(10000 * (vec.x * cos - vec.y * sin)) / 10000,
      y: Math.round(10000 * (vec.x * sin + vec.y * cos)) / 10000,
    };
  };

  static addVector = (vec1: Vec, vec2: Vec) => {
    return {
      x: vec1.x + vec2.x,
      y: vec1.y + vec2.y,
    };
  };
}
