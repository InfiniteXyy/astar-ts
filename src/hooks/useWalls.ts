import { useCallback, useState } from 'react';
import { COLS, ROWS } from '../constants';
import { Vector2 } from '../types';

export function useWalls() {
  const [walls, setWalls] = useState<Set<string>>(new Set());

  const clearWalls = useCallback(() => {
    setWalls(new Set());
  }, []);

  const setExampleWalls = useCallback(() => {
    const newWalls = new Set<string>();
    for (let i = 5; i < COLS - 6; i++) {
      for (let j = 0; j < ROWS - 4; j++) {
        if (j !== ROWS - 10) newWalls.add(`${i},${j}`);
      }
    }
    setWalls(newWalls);
  }, []);

  const batchSetWalls = useCallback((start: Vector2, end: Vector2, isWall: boolean) => {
    setWalls((prevWalls) => {
      const newWalls = new Set(prevWalls);
      const topLeft = new Vector2(Math.min(start.x, end.x), Math.min(start.y, end.y));
      const bottomRight = new Vector2(Math.max(start.x, end.x), Math.max(start.y, end.y));
      for (let x = topLeft.x; x <= bottomRight.x; x++) {
        for (let y = topLeft.y; y <= bottomRight.y; y++) {
          const key = `${x},${y}`;
          if (isWall) {
            newWalls.add(key);
          } else {
            newWalls.delete(key);
          }
        }
      }
      return newWalls;
    });
  }, []);

  return { walls, clearWalls, setExampleWalls, batchSetWalls };
}
