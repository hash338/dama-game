import { useState, useEffect } from 'react'
import Shell from './components/Shell'
import Confetti from './components/Confetti'
import DamaMenu from './components/DamaMenu'
import {
  initialBoard,
  getMoves,
  applyMove,
  gameResult,
  getAIMove,
  countPieces,
  other,
} from './dama/dama'

const ORDER = Array.from({ length: 64 }, (_, i) => i)
const REVERSED = [...ORDER].reverse()
const NAME = { x: 'Cyan', o: 'Pink' }

export default function App() {
  const [config, setConfig] = useState(null)
  const [board, setBoard] = useState(initialBoard)
  const [turn, setTurn] = useState('x')
  const [starter, setStarter] = useState('x')
  const [selected, setSelected] = useState(null)
  const [noProgress, setNoProgress] = useState(0)
  const [lastMove, setLastMove] = useState(null)
  const [scores, setScores] = useState({ x: 0, o: 0, draw: 0 })

  const ai = config?.mode === 'cpu' ? other(config.human) : null
  const result = config ? gameResult(board, turn, noProgress) : null
  const over = !!result
  const moves = config && !over ? getMoves(board, turn) : []
  const myTurn = !over && !(ai && turn === ai)

  const doMove = (m) => {
    const nb = applyMove(board, m)
    const np = m.captured.length > 0 || !board[m.from].k ? 0 : noProgress + 1
    const nt = other(turn)
    setBoard(nb)
    setTurn(nt)
    setNoProgress(np)
    setSelected(null)
    setLastMove({ from: m.from, to: m.to })
    const r = gameResult(nb, nt, np)
    if (r) setScores((s) => ({ ...s, [r.winner]: s[r.winner] + 1 }))
  }

  // Dor l computer
  useEffect(() => {
    if (!config || !ai || over || turn !== ai) return
    const t = setTimeout(() => {
      const m = getAIMove(board, config.level, ai)
      if (m) doMove(m)
    }, 600)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, board, config, over])

  const click = (i) => {
    if (!myTurn) return
    if (selected !== null) {
      const cand = moves.filter((m) => m.from === selected && m.to === i)
      if (cand.length) {
        cand.sort((a, b) => b.captured.length - a.captured.length)
        doMove(cand[0])
        return
      }
    }
    const cell = board[i]
    if (i !== selected && cell && cell.p === turn && moves.some((m) => m.from === i)) {
      setSelected(i)
    } else {
      setSelected(null)
    }
  }

  const resetBoard = (first) => {
    setBoard(initialBoard())
    setTurn(first)
    setSelected(null)
    setNoProgress(0)
    setLastMove(null)
  }

  const start = (cfg) => {
    setConfig(cfg)
    setStarter('x')
    setScores({ x: 0, o: 0, draw: 0 })
    resetBoard('x')
  }

  const nextRound = () => {
    const ns = other(starter)
    setStarter(ns)
    resetBoard(ns)
  }

  if (!config) {
    return (
      <Shell>
        <DamaMenu onStart={start} />
      </Shell>
    )
  }

  const mustCapture = moves.length > 0 && moves[0].captured.length > 0
  const targetMap = new Map()
  if (selected !== null) {
    moves.forEach((m) => {
      if (m.from === selected) targetMap.set(m.to, m.captured.length > 0)
    })
  }
  const movable = new Set(moves.map((m) => m.from))
  const flip = !!ai && config.human === 'o'
  const order = flip ? REVERSED : ORDER
  const cnt = countPieces(board)

  let status
  if (result) {
    if (result.winner === 'draw') status = "It's a draw 🤝"
    else if (ai) status = result.winner === ai ? 'CPU wins 🤖' : 'You win 🎉'
    else status = `${NAME[result.winner]} wins 🎉`
  } else if (ai) {
    status = turn === ai ? 'CPU is thinking…' : mustCapture ? 'Your turn — capture!' : 'Your turn'
  } else {
    status = `${NAME[turn]}'s turn${mustCapture ? ' — capture!' : ''}`
  }

  const humanWon =
    result && result.winner !== 'draw' && (!ai || result.winner !== ai)

  return (
    <Shell>
      {humanWon && <Confetti />}
      <div className="card game">
        <div className="topbar">
          <button className="ghost" onClick={() => setConfig(null)}>← Menu</button>
          {ai && <span className={`badge ${config.level}`}>{config.level}</span>}
        </div>

        <div className="scoreboard">
          <div className={`score x ${!over && turn === 'x' ? 'on' : ''}`}>
            <b>●</b>
            <span>{scores.x}</span>
            <small>{ai ? (ai === 'x' ? 'CPU' : 'YOU') : 'P1'}</small>
          </div>
          <div className="score d">
            <b>=</b>
            <span>{scores.draw}</span>
            <small>DRAW</small>
          </div>
          <div className={`score o ${!over && turn === 'o' ? 'on' : ''}`}>
            <b>●</b>
            <span>{scores.o}</span>
            <small>{ai ? (ai === 'o' ? 'CPU' : 'YOU') : 'P2'}</small>
          </div>
        </div>

        <p className={`status ${over ? 'over' : ''}`}>{status}</p>

        <div className="dboard">
          {order.map((i) => {
            const cell = board[i]
            const cls = ['dcell']
            if (selected === i) cls.push('sel')
            if (lastMove && (lastMove.from === i || lastMove.to === i)) cls.push('last')
            if (targetMap.has(i)) cls.push('target', targetMap.get(i) ? 'cap' : 'step')
            return (
              <button key={i} className={cls.join(' ')} onClick={() => click(i)}>
                {cell && (
                  <span
                    className={`piece ${cell.p} ${cell.k ? 'k' : ''} ${
                      myTurn && movable.has(i) ? 'movable' : ''
                    }`}
                  >
                    {cell.k && '♛'}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="left">
          <span><i className="c" />{cnt.x}</span>
          <span><i className="p" />{cnt.o}</span>
        </div>

        <button className="start small" onClick={nextRound} disabled={!over}>
          {over ? 'NEXT ROUND ▶' : 'Playing…'}
        </button>
      </div>
    </Shell>
  )
}