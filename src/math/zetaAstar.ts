import { Node, Vector2 } from '../types'

export class ZetaAStarPathfinder {
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
    const key = `${position.x},${position.y}`
    return (
      position.x >= 0 && position.y >= 0 && position.x < this.cols && position.y < this.rows && !this.walls.has(key)
    )
  }

  // Heuristic function (Euclidean distance)
  heuristic(a: Vector2, b: Vector2): number {
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  // Checks for line-of-sight between two positions
  lineOfSight(pos1: Vector2, pos2: Vector2): boolean {
    // Implementing Bresenham's Line Algorithm for line-of-sight
    let x0 = pos1.x
    let y0 = pos1.y
    const x1 = pos2.x
    const y1 = pos2.y

    const dx = Math.abs(x1 - x0)
    const dy = Math.abs(y1 - y0)

    const sx = x0 < x1 ? 1 : -1
    const sy = y0 < y1 ? 1 : -1

    let err = dx - dy

    while (x0 !== x1 || y0 !== y1) {
      if (!this.isWalkable(new Vector2(x0, y0))) {
        return false
      }

      const e2 = 2 * err
      if (e2 > -dy) {
        err -= dy
        x0 += sx
      }
      if (e2 < dx) {
        err += dx
        y0 += sy
      }
    }

    return this.isWalkable(pos2)
  }

  // Main pathfinding function
  findPath(): Vector2[] | null {
    const openList: Node[] = []
    const closedList: Set<string> = new Set()

    const startNode = new Node({
      position: this.start,
      fatherNode: null,
      gCost: 0,
      hCost: this.heuristic(this.start, this.end),
      direction: Vector2.zero,
      segmentLength: 0,
    })

    openList.push(startNode)

    while (openList.length > 0) {
      // Get node with the lowest F cost
      openList.sort((a, b) => a.fCost - b.fCost)
      const currentNode = openList.shift()!
      const currentKey = `${currentNode.position.x},${currentNode.position.y}`
      closedList.add(currentKey)

      // If the target is reached, retrace the path
      if (currentNode.position.equals(this.end)) {
        return this.retracePath(currentNode)
      }

      // Get neighbors (cardinal directions)
      const neighbors = this.getNeighbors(currentNode.position)

      for (const neighborPos of neighbors) {
        const neighborKey = `${neighborPos.x},${neighborPos.y}`
        if (closedList.has(neighborKey)) {
          continue
        }

        const tentativeGCost = currentNode.gCost + this.distance(currentNode.position, neighborPos)

        let neighborNode = this.findInOpenList(neighborPos, openList)

        if (!neighborNode) {
          neighborNode = new Node({
            position: neighborPos,
            fatherNode: currentNode,
            gCost: tentativeGCost,
            hCost: this.heuristic(neighborPos, this.end),
            direction: Vector2.zero,
            segmentLength: 0,
          })
          openList.push(neighborNode)
        } else if (tentativeGCost < neighborNode.gCost) {
          neighborNode.gCost = tentativeGCost
          neighborNode.fatherNode = currentNode
        }

        // Theta* modification: attempt to connect neighbor directly to currentNode's parent
        if (currentNode.fatherNode && this.lineOfSight(currentNode.fatherNode.position, neighborPos)) {
          const segmentLength = this.distance(currentNode.fatherNode.position, neighborPos)

          // Enforce MinSegmentLength constraint
          if (segmentLength >= this.minSegmentLength) {
            const newGCost = currentNode.fatherNode.gCost + segmentLength

            if (newGCost < neighborNode.gCost) {
              neighborNode.gCost = newGCost
              neighborNode.fatherNode = currentNode.fatherNode
            }
          }
        }
      }
    }

    // No path found
    return null
  }

  // Returns neighboring positions (cardinal directions only)
  getNeighbors(position: Vector2): Vector2[] {
    const neighbors: Vector2[] = []
    const directions = [Vector2.up, Vector2.down, Vector2.left, Vector2.right]

    for (const dir of directions) {
      const newPos = position.add(dir)
      if (this.isWalkable(newPos)) {
        neighbors.push(newPos)
      }
    }

    return neighbors
  }

  // Calculates the distance between two positions
  distance(a: Vector2, b: Vector2): number {
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  // Retraces the path from the end node to the start node
  retracePath(endNode: Node): Vector2[] {
    const path: Vector2[] = []
    let currentNode: Node | null = endNode

    while (currentNode !== null) {
      path.push(currentNode.position)
      currentNode = currentNode.fatherNode
    }

    return path.reverse()
  }

  // Finds a node in the open list by position
  findInOpenList(position: Vector2, openList: Node[]): Node | undefined {
    return openList.find((n) => n.position.equals(position))
  }
}
