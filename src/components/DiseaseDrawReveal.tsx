import { useEffect, useState } from 'react'
import type { GroupDoc } from '../types'
import { getDiseaseById } from '../data/diseases'
import { serverNow } from '../lib/serverClock'

const START_DELAY_MS = 1200
const STOP_GAP_MS = 700
const SPIN_TICK_MS = 90

export function sortGroupsByName(groups: GroupDoc[]): GroupDoc[] {
  const num = (n: string) => parseInt(n, 10) || 0
  return [...groups].sort((a, b) => num(a.name) - num(b.name) || a.name.localeCompare(b.name))
}

// 모든 기기가 서버 시계 기준 같은 시각(drawnAt)에서 출발해, 조마다 차례로 슬롯이 멈춘다.
export function drawRevealEndsAt(drawnAt: number, groupCount: number): number {
  return drawnAt + START_DELAY_MS + Math.max(0, groupCount - 1) * STOP_GAP_MS + 300
}

export default function DiseaseDrawReveal({
  groups,
  pool,
  drawnAt,
  size = 'md',
  onDone,
}: {
  groups: GroupDoc[]
  pool: string[]
  drawnAt: number
  size?: 'md' | 'lg'
  onDone?: () => void
}) {
  const sorted = sortGroupsByName(groups)
  const endsAt = drawRevealEndsAt(drawnAt, sorted.length)
  const [now, setNow] = useState(serverNow())
  const done = now >= endsAt

  useEffect(() => {
    if (done) {
      onDone?.()
      return
    }
    const id = setInterval(() => setNow(serverNow()), SPIN_TICK_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  return (
    <div className={`grid gap-2 ${size === 'lg' ? 'sm:grid-cols-3' : 'grid-cols-2'}`}>
      {sorted.map((g, i) => {
        const stopAt = drawnAt + START_DELAY_MS + i * STOP_GAP_MS
        const stopped = now >= stopAt
        const shownId = stopped ? g.diseaseId : pool[(Math.floor(now / SPIN_TICK_MS) + i * 3) % pool.length]
        const d = getDiseaseById(shownId)
        return (
          <div
            key={g.id}
            className={`rounded-2xl border-2 px-3 py-3 text-center transition-all duration-300 ${
              stopped ? 'border-brand-400 bg-brand-50 scale-100' : 'border-slate-200 bg-white scale-95'
            }`}
          >
            <p className={`font-black text-slate-700 ${size === 'lg' ? 'text-lg' : 'text-sm'}`}>{g.name}</p>
            <p className={`mt-1 ${size === 'lg' ? 'text-4xl' : 'text-3xl'} ${stopped ? '' : 'opacity-60 blur-[1px]'}`}>{d.emoji}</p>
            <p
              className={`mt-1 font-bold ${size === 'lg' ? 'text-base' : 'text-sm'} ${
                stopped ? 'text-brand-700' : 'text-slate-400'
              }`}
            >
              {d.name}
            </p>
          </div>
        )
      })}
    </div>
  )
}
