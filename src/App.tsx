import React, { useCallback, useEffect, useState } from 'react'
import { AStarPathfinder } from './astar'
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLS, GRID_SIZE, ROWS } from './constants'
import { useDrawCanvas } from './hooks/useDrawCanvas'
import { useWalls } from './hooks/useWalls'
import { Vector2 } from './types'

function App() {
  const [minSegmentLength, setMinSegmentLength] = useState<number>(6)
  const [path, setPath] = useState<Vector2[]>([])
  const [start] = useState<Vector2>(new Vector2(2, 2))
  const [end] = useState<Vector2>(new Vector2(COLS - 3, ROWS - 7))

  const [draggingStatus, setDraggingStatus] = useState<{ isWall: boolean, startPoint: Vector2 } | null>(null)
  const { walls, clearWalls, setExampleWalls, batchSetWalls } = useWalls()

  const canvasRef = useDrawCanvas(path, walls, start, end)

  // Runs the pathfinding algorithm
  const runPathfinding = useCallback(() => {
    const pathfinder = new AStarPathfinder(COLS, ROWS, walls, start, end, minSegmentLength)
    const newPath = pathfinder.findPath() || []
    setPath(newPath)
  }, [walls, start, end, minSegmentLength])

  useEffect(() => {
    runPathfinding()
  }, [runPathfinding])

  return (
    <div className="App">
      <canvas
        id="gameCanvas"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        ref={canvasRef}
        onMouseUp={() => setDraggingStatus(null)}
        onContextMenu={e => e.preventDefault()}
        onMouseDown={(e) => {
          const startPoint = new Vector2(Math.floor(e.clientX / GRID_SIZE), Math.floor(e.clientY / GRID_SIZE))
          setDraggingStatus({ isWall: e.button === 0, startPoint })
        }}
        onMouseMove={(e) => {
          if (draggingStatus) {
            const canvas = canvasRef.current!
            const rect = canvas.getBoundingClientRect()
            const x = Math.floor((e.clientX - rect.left) / GRID_SIZE)
            const y = Math.floor((e.clientY - rect.top) / GRID_SIZE)
            batchSetWalls(draggingStatus.startPoint, new Vector2(x, y), draggingStatus.isWall)
          }
        }}
        style={{ border: '1px solid black' }}
      />
      <div id="controls">
        <button type="button" onClick={runPathfinding}>Run Pathfinding</button>
        <button type="button" onClick={clearWalls}>Reset Walls</button>
        <button type="button" onClick={setExampleWalls}>Load Example Walls</button>
        <span>Drag on the grid to toggle walls. (left: wall, right: clear)</span>
      </div>
      <div style={{ marginTop: 10 }}>
        <label>
          Min Segment Length:
          <input
            placeholder="segment"
            value={minSegmentLength}
            type="number"
            min={1}
            max={10}
            onChange={e => setMinSegmentLength(e.target.valueAsNumber)}
          />
        </label>
      </div>
    </div>
  )
}

export default App
