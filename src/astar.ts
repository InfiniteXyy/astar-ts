import { Node, Vector2 } from './types';

export class AStarPathfinder {
  constructor(
    public cols: number,
    public rows: number,
    public walls: Set<string>,
    public start: Vector2,
    public end: Vector2,
    public minSegmentLength: number
  ) {}

  // Checks if a position is walkable (not blocked or out of bounds)
  isWalkable(position: Vector2): boolean {
    const key = `${position.x},${position.y}`;
    return (
      position.x >= 0 && position.y >= 0 && position.x < this.cols && position.y < this.rows && !this.walls.has(key)
    );
  }

  // Heuristic function (Manhattan distance)
  heuristic(a: Vector2, b: Vector2): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  // Main pathfinding function
  findPath(): Vector2[] | null {
    const openList: Node[] = [];
    const closedList: Node[] = [];

    const startNode = new Node(this.start, null, 0, this.heuristic(this.start, this.end), Vector2.zero, 0);

    openList.push(startNode);

    while (openList.length > 0) {
      // Get node with the lowest F cost
      openList.sort((a, b) => a.fCost - b.fCost);
      const currentNode = openList.shift()!;
      closedList.push(currentNode);

      // If the target is reached, retrace the path
      if (currentNode.position.equals(this.end)) {
        return this.retracePath(currentNode);
      }

      this.expandNode(currentNode, openList, closedList);
    }

    // No path found
    return null;
  }

  // Expands the current node to generate successors
  expandNode(currentNode: Node, openList: Node[], closedList: Node[]) {
    const directions = [Vector2.up, Vector2.down, Vector2.left, Vector2.right];

    for (const direction of directions) {
      if (direction.equals(currentNode.direction) || currentNode.direction.equals(Vector2.zero)) {
        // Continue moving in the same direction
        const newPos = currentNode.position.add(direction);
        if (!this.isWalkable(newPos)) {
          continue;
        }

        const segmentLength = currentNode.segmentLength + 1;

        const neighborNode = new Node(
          newPos,
          currentNode,
          currentNode.gCost + 1,
          this.heuristic(newPos, this.end),
          direction,
          segmentLength
        );

        if (this.isInClosedList(neighborNode, closedList)) {
          continue;
        }

        const existingNode = this.findInOpenList(neighborNode, openList);
        if (!existingNode || neighborNode.gCost < existingNode.gCost) {
          openList.push(neighborNode);
        }
      } else {
        // Check if we can change direction
        if (currentNode.segmentLength >= this.minSegmentLength) {
          // Move MinSegmentLength units in the new direction
          let canMove = true;
          let newPos = currentNode.position;

          for (let i = 1; i <= this.minSegmentLength; i++) {
            newPos = newPos.add(direction);
            if (!this.isWalkable(newPos)) {
              canMove = false;
              break;
            }
          }

          if (!canMove) {
            continue;
          }

          // Create new node at the new position
          const neighborNode = new Node(
            newPos,
            currentNode,
            currentNode.gCost + this.minSegmentLength,
            this.heuristic(newPos, this.end),
            direction,
            this.minSegmentLength
          );

          if (this.isInClosedList(neighborNode, closedList)) {
            continue;
          }

          const existingNode = this.findInOpenList(neighborNode, openList);
          if (!existingNode || neighborNode.gCost < existingNode.gCost) {
            openList.push(neighborNode);
          }
        }
      }
    }
  }

  // Retraces the path from the end node to the start node
  retracePath(endNode: Node): Vector2[] {
    const path: Vector2[] = [];
    let currentNode: Node | null = endNode;

    while (currentNode !== null) {
      path.push(currentNode.position);
      currentNode = currentNode.fatherNode;
    }

    return path.reverse();
  }

  // Checks if a node is in the closed list (by position and direction)
  isInClosedList(node: Node, closedList: Node[]): boolean {
    return closedList.some((n) => n.position.equals(node.position) && n.direction.equals(node.direction));
  }

  // Finds a node in the open list (by position and direction)
  findInOpenList(node: Node, openList: Node[]): Node | undefined {
    return openList.find((n) => n.position.equals(node.position) && n.direction.equals(node.direction));
  }
}
