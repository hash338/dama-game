import { useState } from 'react'

const COLORS = ['#00e5ff', '#ff3d9a', '#ffd23d', '#3dff8b', '#b967ff']

function makePieces() {
  return Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    dur: 2 + Math.random() * 2,
    color: COLORS[i % 5],
    size: 6 + Math.random() * 8,
  }))
}

export default function Confetti() {
  const [pieces] = useState(makePieces)
  return (
    <div className="confetti">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.6,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  )
}