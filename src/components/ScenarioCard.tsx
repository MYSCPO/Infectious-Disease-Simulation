import type { ScenarioStage } from '../types'

export default function ScenarioCard({ scenario }: { scenario: ScenarioStage }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
      <div className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-1">상황 카드</div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{scenario.title}</h3>
      <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">{scenario.narrative}</p>
    </div>
  )
}
