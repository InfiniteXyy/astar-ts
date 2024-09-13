// Represents a 2D integer vector
export class Vector2 {
  constructor(public x: number, public y: number) {}

  add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  equals(v: Vector2): boolean {
    return this.x === v.x && this.y === v.y;
  }

  negate(): Vector2 {
    return new Vector2(-this.x, -this.y);
  }

  static up = new Vector2(0, -1);
  static down = new Vector2(0, 1);
  static left = new Vector2(-1, 0);
  static right = new Vector2(1, 0);
  static zero = new Vector2(0, 0);
}

// Represents a node in the pathfinding grid
export class Node {
  constructor(
    public position: Vector2,
    public fatherNode: Node | null,
    public gCost: number, // Cost from start to current node
    public hCost: number, // Heuristic cost to target
    public direction: Vector2, // Movement direction from parent
    public segmentLength: number // Length of current segment
  ) {}

  // Total cost (F = G + H)
  get fCost(): number {
    return this.gCost + this.hCost;
  }

  clone(): Node {
    return new Node(this.position, this.fatherNode, this.gCost, this.hCost, this.direction, this.segmentLength);
  }
}
