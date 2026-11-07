export const N = 8
export const idx = (r, c) => r * N + c
const inB = (r, c) => r >= 0 && r < N && c >= 0 && c < N
export const other = (p) => (p === 'x' ? 'o' : 'x')

// 'x' (cyan) men ta7et la fo2, 'o' (pink) bil 3aks
const fwd = (p) => (p === 'x' ? -1 : 1)
const KING_DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]]
const manDirs = (p) => [[fwd(p), 0], [0, 1], [0, -1]]

export function initialBoard() {
  const b = Array(N * N).fill(null)
  for (let c = 0; c < N; c++) {
    b[idx(1, c)] = { p: 'o', k: false }
    b[idx(2, c)] = { p: 'o', k: false }
    b[idx(5, c)] = { p: 'x', k: false }
    b[idx(6, c)] = { p: 'x', k: false }
  }
  return b
}

export function countPieces(board) {
  const n = { x: 0, o: 0 }
  for (const cell of board) if (cell) n[cell.p]++
  return n
}

// Kel salasel l akl (multi-jump) li fi mnel qit3a men from
function captureChains(board, from) {
  const piece = board[from]
  const b = board.slice()
  b[from] = null
  const dirs = piece.k ? KING_DIRS : manDirs(piece.p)
  const results = []

  const dfs = (r, c, captured, last) => {
    let found = false
    for (const [dr, dc] of dirs) {
      if (last && dr === -last[0] && dc === -last[1]) continue
      if (piece.k) {
        let rr = r + dr
        let cc = c + dc
        while (inB(rr, cc) && !b[idx(rr, cc)]) { rr += dr; cc += dc }
        if (!inB(rr, cc)) continue
        const t = idx(rr, cc)
        if (b[t].p === piece.p || captured.includes(t)) continue
        let lr = rr + dr
        let lc = cc + dc
        while (inB(lr, lc) && !b[idx(lr, lc)]) {
          found = true
          dfs(lr, lc, [...captured, t], [dr, dc])
          lr += dr
          lc += dc
        }
      } else {
        const rr = r + dr
        const cc = c + dc
        const lr = r + 2 * dr
        const lc = c + 2 * dc
        if (!inB(lr, lc)) continue
        const t = idx(rr, cc)
        const target = b[t]
        if (target && target.p !== piece.p && !captured.includes(t) && !b[idx(lr, lc)]) {
          found = true
          dfs(lr, lc, [...captured, t], [dr, dc])
        }
      }
    }
    if (!found && captured.length) results.push({ to: idx(r, c), captured })
  }

  dfs(Math.floor(from / N), from % N, [], null)
  return results
}

function simpleMoves(board, from) {
  const piece = board[from]
  const r0 = Math.floor(from / N)
  const c0 = from % N
  const out = []
  if (piece.k) {
    for (const [dr, dc] of KING_DIRS) {
      let r = r0 + dr
      let c = c0 + dc
      while (inB(r, c) && !board[idx(r, c)]) {
        out.push({ from, to: idx(r, c), captured: [] })
        r += dr
        c += dc
      }
    }
  } else {
    for (const [dr, dc] of manDirs(piece.p)) {
      const r = r0 + dr
      const c = c0 + dc
      if (inB(r, c) && !board[idx(r, c)]) out.push({ from, to: idx(r, c), captured: [] })
    }
  }
  return out
}

// Iza fi akl, bterja3 bas l akl (ejbari). Gher heik l harakat l 3adiyye.
export function getMoves(board, player) {
  const caps = []
  for (let i = 0; i < board.length; i++) {
    const cell = board[i]
    if (cell && cell.p === player) {
      for (const ch of captureChains(board, i)) {
        caps.push({ from: i, to: ch.to, captured: ch.captured })
      }
    }
  }
  if (caps.length) return caps

  const out = []
  for (let i = 0; i < board.length; i++) {
    const cell = board[i]
    if (cell && cell.p === player) out.push(...simpleMoves(board, i))
  }
  return out
}

export function applyMove(board, move) {
  const b = board.slice()
  const piece = { ...b[move.from] }
  b[move.from] = null
  for (const i of move.captured) b[i] = null
  const row = Math.floor(move.to / N)
  if (!piece.k && ((piece.p === 'x' && row === 0) || (piece.p === 'o' && row === N - 1))) {
    piece.k = true
  }
  b[move.to] = piece
  return b
}

// null = lessa mostamerre, {winner:'x'|'o'|'draw'}
export function gameResult(board, turn, noProgress) {
  if (getMoves(board, turn).length === 0) return { winner: other(turn) }
  if (noProgress >= 50) return { winner: 'draw' }
  return null
}

/* ===================== AI ===================== */

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function evaluate(board, me) {
  let s = 0
  for (let i = 0; i < board.length; i++) {
    const cell = board[i]
    if (!cell) continue
    const r = Math.floor(i / N)
    let v = cell.k ? 320 : 100
    if (!cell.k) v += (cell.p === 'x' ? 7 - r : r) * 6
    s += cell.p === me ? v : -v
  }
  return s
}

let nodes = 0
const TIMEOUT = { timeout: true }

function search(board, player, depth, alpha, beta, me, deadline) {
  if ((++nodes & 255) === 0 && Date.now() > deadline) throw TIMEOUT

  const moves = getMoves(board, player)
  if (moves.length === 0) return player === me ? -100000 - depth : 100000 + depth
  if (depth <= 0 && (depth <= -4 || moves[0].captured.length === 0)) {
    return evaluate(board, me)
  }

  if (player === me) {
    let best = -Infinity
    for (const m of moves) {
      const v = search(applyMove(board, m), other(player), depth - 1, alpha, beta, me, deadline)
      if (v > best) best = v
      if (best > alpha) alpha = best
      if (beta <= alpha) break
    }
    return best
  }
  let best = Infinity
  for (const m of moves) {
    const v = search(applyMove(board, m), other(player), depth - 1, alpha, beta, me, deadline)
    if (v < best) best = v
    if (best < beta) beta = best
    if (beta <= alpha) break
  }
  return best
}

function searchRoot(board, moves, ai, depth, deadline) {
  let best = moves[0]
  let bestScore = -Infinity
  let alpha = -Infinity
  for (const m of moves) {
    const v = search(applyMove(board, m), other(ai), depth - 1, alpha, Infinity, ai, deadline)
    if (v > bestScore) {
      bestScore = v
      best = m
    }
    if (v > alpha) alpha = v
  }
  return { best, score: bestScore }
}

export function getAIMove(board, level, ai) {
  const moves = getMoves(board, ai)
  if (moves.length === 0) return null
  if (moves.length === 1) return moves[0]
  nodes = 0

  if (level === 'easy') return pick(moves)
  if (level === 'medium') return searchRoot(board, shuffle(moves), ai, 2, Infinity).best
  if (level === 'hard') {
    const depth = Math.random() < 0.15 ? 2 : 4
    return searchRoot(board, shuffle(moves), ai, depth, Infinity).best
  }

  // Extreme: iterative deepening la7add 1.2 sanye
  const deadline = Date.now() + 1200
  let ordered = shuffle(moves)
  let best = ordered[0]
  for (let d = 1; d <= 12; d++) {
    try {
      const res = searchRoot(board, ordered, ai, d, deadline)
      best = res.best
      ordered = [best, ...ordered.filter((m) => m !== best)]
    } catch {
      break
    }
  }
  return best
}