import { useLocalStorage } from 'react-use'

export const useWallsHistory = () => {
  const [wallsHistory, setWallsHistory] = useLocalStorage<{ [key: string]: string[] }>('history', {})

  const addWallsToHistory = (walls: Set<string>) => {
    const key = Date.now().toString()
    setWallsHistory({ ...wallsHistory, [key]: [...walls] })
  }

  const removeHistory = (key: string) => {
    const newHistory = { ...wallsHistory }
    delete newHistory[key]
    setWallsHistory(newHistory)
  }

  return { wallsHistory, addWallsToHistory, removeHistory }
}
