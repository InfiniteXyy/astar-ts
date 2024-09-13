import React, { useCallback, useEffect, useState } from 'react'
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLS, GRID_SIZE, ROWS } from './constants'
import { useDrawCanvas } from './hooks/useDrawCanvas'
import { useWalls } from './hooks/useWalls'
import { AStarPathfinder } from './math/astar'
import { ZetaAStarPathfinder } from './math/zetaAstar'
import { Vector2 } from './types'
import { WallsHistory } from './WallsHistory'

function App() {
  const [algorithm, setAlgorithm] = useState<'AStar' | 'ZetaAStar'>('AStar')
  const [minSegmentLength, setMinSegmentLength] = useState<number>(6)
  const { walls, setWalls, clearWalls, setExampleWalls, batchSetWalls } = useWalls()
  const [path, setPath] = useState<Vector2[]>([])
  const [start, setStartPoint] = useState<Vector2>(new Vector2(2, 2))
  const [end, setEndPoint] = useState<Vector2>(new Vector2(COLS - 3, ROWS - 7))

  const [draggingStatus, setDraggingStatus] = useState<{
    type: 'moveStart' | 'moveEnd' | 'markWall' | 'markEmpty'
    startPoint: Vector2
  } | null>(null)

  const canvasRef = useDrawCanvas(path, walls, start, end)

  // Runs the pathfinding algorithm
  const runPathfinding = useCallback(() => {
    const PathFinder = algorithm === 'AStar' ? AStarPathfinder : ZetaAStarPathfinder
    const pathfinder = new PathFinder(COLS, ROWS, walls, start, end, minSegmentLength)
    const newPath = pathfinder.findPath() || []
    setPath(newPath)
  }, [algorithm, walls, start, end, minSegmentLength])

  useEffect(() => {
    runPathfinding()
  }, [runPathfinding])

  return (
    <div className="App">
      <div>
        <canvas
          id="gameCanvas"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          ref={canvasRef}
          onMouseUp={() => setDraggingStatus(null)}
          onContextMenu={(e) => e.preventDefault()}
          onMouseDown={(e) => {
            const startPoint = new Vector2(
              Math.floor((e.clientX - GRID_SIZE / 2) / GRID_SIZE),
              Math.floor((e.clientY - GRID_SIZE / 2) / GRID_SIZE)
            )
            if (startPoint.equals(start)) {
              setDraggingStatus({ type: 'moveStart', startPoint })
            } else if (startPoint.equals(end)) {
              setDraggingStatus({ type: 'moveEnd', startPoint })
            } else {
              setDraggingStatus({ type: e.button === 0 ? 'markWall' : 'markEmpty', startPoint })
            }
          }}
          onMouseMove={(e) => {
            if (!draggingStatus) return
            const canvas = canvasRef.current!
            const rect = canvas.getBoundingClientRect()
            const x = Math.floor((e.clientX - rect.left) / GRID_SIZE)
            const y = Math.floor((e.clientY - rect.top) / GRID_SIZE)

            if (draggingStatus.type.startsWith('mark')) {
              batchSetWalls(draggingStatus.startPoint, new Vector2(x, y), draggingStatus.type === 'markWall')
            }
            if (draggingStatus.type === 'moveStart') {
              setStartPoint(new Vector2(x, y))
            }
            if (draggingStatus.type === 'moveEnd') {
              setEndPoint(new Vector2(x, y))
            }
          }}
          style={{ border: '1px solid black' }}
        />
        <WallsHistory walls={walls} setWalls={setWalls} />
      </div>

      <div>
        <button type="button" onClick={runPathfinding}>
          Run Pathfinding
        </button>
        <button type="button" onClick={clearWalls}>
          Reset Walls
        </button>
        <button type="button" onClick={setExampleWalls}>
          Load Example Walls
        </button>
        <span>Drag on the grid to toggle walls. (left: wall, right: clear)</span>
      </div>

      <label style={{ marginTop: 10, display: algorithm === 'ZetaAStar' ? 'none' : 'block' }}>
        Min Segment Length:
        <input
          placeholder="segment"
          value={minSegmentLength}
          type="number"
          min={1}
          max={10}
          onChange={(e) => setMinSegmentLength(e.target.valueAsNumber)}
        />
      </label>

      <label style={{ marginTop: 10, display: 'block' }}>
        Use Zeta AStar
        <input
          type="checkbox"
          checked={algorithm === 'ZetaAStar'}
          onChange={(e) => {
            const next = e.target.checked ? 'ZetaAStar' : 'AStar'
            setAlgorithm(next)
            setMinSegmentLength(next === 'ZetaAStar' ? 1 : 6)
          }}
        />
      </label>
    </div>
  )
}

export default App
