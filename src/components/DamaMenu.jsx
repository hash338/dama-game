import { useState } from 'react'

const LEVELS = [
  { id: 'easy', label: 'Easy', icon: '🌱', color: '#3dff8b', desc: 'Random moves' },
  { id: 'medium', label: 'Medium', icon: '⚡', color: '#ffd23d', desc: 'Thinks 2 moves' },
  { id: 'hard', label: 'Hard', icon: '🔥', color: '#ff8a3d', desc: 'Thinks 4 moves' },
  { id: 'extreme', label: 'Extreme', icon: '💀', color: '#ff2e63', desc: 'Deep thinker' },
]

export default function DamaMenu({ onStart }) {
  const [mode, setMode] = useState('cpu')
  const [level, setLevel] = useState('medium')
  const [human, setHuman] = useState('x')

  return (
    <div className="card menu">
      <h1 className="logo dama">
        <span className="lx">DA</span>
        <span className="lo">MA</span>
      </h1>
      <p className="tagline">Arabic Dama · pick your battle</p>

      <div className="row two">
        <button
          className={`pill ${mode === 'cpu' ? 'active' : ''}`}
          onClick={() => setMode('cpu')}
        >
          🤖 Vs Computer
        </button>
        <button
          className={`pill ${mode === 'pvp' ? 'active' : ''}`}
          onClick={() => setMode('pvp')}
        >
          👥 2 Players
        </button>
      </div>

      {mode === 'cpu' && (
        <>
          <h3 className="label">Difficulty</h3>
          <div className="levels">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                className={`level ${level === l.id ? 'active' : ''}`}
                style={{ '--c': l.color }}
                onClick={() => setLevel(l.id)}
              >
                <span className="icon">{l.icon}</span>
                <strong>{l.label}</strong>
                <small>{l.desc}</small>
              </button>
            ))}
          </div>

          <h3 className="label">You play as</h3>
          <div className="row two">
            <button
              className={`pill sym x ${human === 'x' ? 'active' : ''}`}
              onClick={() => setHuman('x')}
            >
              ● 1st
            </button>
            <button
              className={`pill sym o ${human === 'o' ? 'active' : ''}`}
              onClick={() => setHuman('o')}
            >
              ● 2nd
            </button>
          </div>
        </>
      )}

      <details className="rules">
        <summary>📖 How to play</summary>
        <ul>
          <li>Each player has 16 pieces placed on the second and third rows.</li>
          <li>A piece can move one step forward diagonally (left or right), never backward.</li>
          <li>Capturing is mandatory: jump over an opponent's piece and continue capturing if another capture is possible..</li>
          <li>When a piece reaches the last row, it becomes a King (Dama), allowing it to move and capture from a distance.</li>
          <li>You win by capturing all your opponent's pieces or blocking all their possible moves.</li>
        </ul>
      </details>

      <button className="start" onClick={() => onStart({ mode, level, human })}>
        START GAME
      </button>

      <footer className="credit">
        Made By: <span>Hasan Younes</span>
      </footer>
    </div>
  )
}