import type { GroupDoc } from '../types'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard({ groups, highlightGroupId }: { groups: GroupDoc[]; highlightGroupId?: string }) {
  const sorted = [...groups].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  const maxScore = Math.max(1, ...sorted.map((g) => g.score ?? 0))

  return (
    <div className="space-y-2">
      {sorted.map((g, i) => {
        const score = g.score ?? 0
        const isTop = i === 0 && score > 0
        const isMine = g.id === highlightGroupId
        return (
          <div
            key={g.id}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 border ${
              isTop ? 'border-amber-300 bg-amber-50' : isMine ? 'border-brand-300 bg-brand-50' : 'border-slate-100 bg-white'
            }`}
          >
            <span className="w-6 text-center text-sm font-bold text-slate-500">{MEDALS[i] ?? i + 1}</span>
            <span className="w-16 shrink-0 text-sm font-bold text-slate-800 truncate">{g.name}</span>
            <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${isTop ? 'bg-amber-400' : 'bg-brand-400'}`}
                style={{ width: `${Math.max(4, (score / maxScore) * 100)}%` }}
              />
            </div>
            <span className="w-14 shrink-0 text-right text-sm font-black text-slate-700">{score}pt</span>
          </div>
        )
      })}
      {sorted.length === 0 && <p className="text-xs text-slate-400 text-center py-4">아직 편성된 조가 없어요.</p>}
    </div>
  )
}
