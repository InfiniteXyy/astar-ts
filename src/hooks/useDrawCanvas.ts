import type { Vector2 } from '../types';
import { useCallback, useEffect, useRef } from 'react';
import { COLS, GRID_SIZE, ROWS } from '../constants';

export function useDrawCanvas(path: Vector2[], walls: Set<string>, start: Vector2, end: Vector2) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draws the grid lines, walls, and the path
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#ccc';
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * GRID_SIZE, 0);
      ctx.lineTo(x * GRID_SIZE, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * GRID_SIZE);
      ctx.lineTo(canvas.width, y * GRID_SIZE);
      ctx.stroke();
    }

    // Draw walls
    ctx.fillStyle = 'black';
    walls.forEach((key) => {
      const [x, y] = key.split(',').map(Number);
      ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    });

    // Draw path
    if (path.length > 0) {
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < path.length; i++) {
        const pos = path[i];
        const x = pos.x * GRID_SIZE + GRID_SIZE / 2;
        const y = pos.y * GRID_SIZE + GRID_SIZE / 2;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
  }, [path, walls]);

  // Draws the start and end positions
  const drawEntities = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    // Draw start position
    ctx.fillStyle = 'green';
    ctx.fillRect(start.x * GRID_SIZE, start.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

    // Draw end position
    ctx.fillStyle = 'blue';
    ctx.fillRect(end.x * GRID_SIZE, end.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
  }, [end.x, end.y, start.x, start.y]);

  // Effect to draw the grid and entities whenever walls or path change
  useEffect(() => {
    drawGrid();
    drawEntities();
  }, [drawEntities, drawGrid]);

  return canvasRef;
}
