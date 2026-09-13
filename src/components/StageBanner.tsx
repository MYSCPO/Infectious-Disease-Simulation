import type { StageId } from '../types'
import { STAGES } from '../data/stages'

export default function StageBanner({ current }: { current: StageId }) {
  const currentIdx = STAGES.findIndex((s) => s.id === current)
  const stage = STAGES[currentIdx]

  return (
    <div className="w-full bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
          {STAGES.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1 sm:gap-2 shrink-0">
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs sm:text-sm font-medium whitespace-nowrap ${
                  i === currentIdx
                    ? 'bg-brand-600 text-white'
                    : i < currentIdx
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                <span>{s.shortLabel}</span>
              </div>
              {i < STAGES.length - 1 && <span className="text-slate-300">→</span>}
            </div>
          ))}
        </div>
        <h2 className="mt-2 text-base sm:text-lg font-bold text-slate-800">{stage.label}</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{stage.description}</p>
      </div>
    </div>
  )
}
