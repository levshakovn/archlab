import React from 'react'
import { Puzzle } from '../types'

interface Props {
  puzzle: Puzzle | null
  onDragStart: (serviceType: string) => void
}

export function Sidebar({ puzzle, onDragStart }: Props) {
  if (!puzzle) return null

  return (
    <div className="w-64 bg-gradient-to-b from-white to-blue-50/30 border-r border-gray-200 p-4 overflow-y-auto h-full">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2 text-primary flex items-center gap-2">
          <span className="w-1 h-6 bg-primary rounded-full"></span>
          Scenario
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">{puzzle.scenario}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-success rounded-full"></span>
          Requirements
        </h3>
        <ul className="text-xs space-y-2">
          {puzzle.requirements.map((req, i) => (
            <li key={i} className="flex items-start gap-2 p-2 bg-white/60 rounded-lg border border-success/20 hover:bg-success/5 transition">
              <span className="text-success text-base flex-shrink-0 mt-0.5">✓</span>
              <span className="text-text-secondary leading-relaxed">{req}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-secondary rounded-full"></span>
          AWS Services
        </h3>
        <div className="space-y-2">
          {puzzle.allowedServices.map((service) => (
            <div
              key={service}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', service)
                onDragStart(service)
              }}
              className="p-2.5 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-lg cursor-grab hover:from-primary/20 hover:to-secondary/20 hover:border-primary/50 hover:shadow-md text-xs font-medium text-primary transition-all active:cursor-grabbing active:scale-95"
            >
              {service}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

