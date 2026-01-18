
import { Puzzle } from '../types'

interface Props {
  puzzles: Puzzle[]
  current: Puzzle | null
  onSelect: (puzzleId: string) => void
  bestScores?: Record<string, number> // Optional: for future visual indicators
}

export function PuzzleSelector({ puzzles, current, onSelect }: Props) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-text-primary">Puzzle</label>
      <select
        value={current?.id || ''}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-3 py-2 border-2 border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-text-primary text-sm font-medium shadow-sm hover:bg-gray-50 transition"
      >
        {puzzles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title}
          </option>
        ))}
      </select>
    </div>
  )
}

