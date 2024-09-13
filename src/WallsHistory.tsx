import { useWallsHistory } from './hooks/useWallsHistory'

export function WallsHistory({ walls, setWalls }: { walls: Set<string>; setWalls: (walls: Set<string>) => void }) {
  const { wallsHistory, addWallsToHistory, removeHistory } = useWallsHistory()

  return (
    <div style={{ float: 'right' }}>
      <h4>Walls history</h4>
      <div>
        {Object.entries(wallsHistory ?? {}).map(([key, localWalls], index) => (
          <div key={key}>
            ({index})
            <button type="button" onClick={() => setWalls(new Set(localWalls))}>
              {key}
            </button>
            <button type="button" onClick={() => removeHistory(key)}>
              x
            </button>
          </div>
        ))}
      </div>
      <button style={{ marginTop: 30 }} type="button" onClick={() => addWallsToHistory(walls)}>
        save current
      </button>
    </div>
  )
}
