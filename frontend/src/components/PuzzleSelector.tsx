import React from 'react'
import { Puzzle } from '../types'

interface Props {
  puzzles: Puzzle[]
  current: Puzzle | null
  onSelect: (puzzleId: string) => void
}

export function PuzzleSelector({ puzzles, current, onSelect }: Props) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2 text-text-primary">Select Puzzle</label>
      <select
        value={current?.id || ''}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-4 py-2.5 border-2 border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/95 backdrop-blur-sm text-text-primary font-medium shadow-sm hover:bg-white transition"
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

