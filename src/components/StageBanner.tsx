import type { StageId } from '../types'
import { STAGES } from '../data/stages'

// 흐름도 맨 앞의 "입장"은 진행자가 ▶ 훈련 시작을 누르기 전(참가자 입장·매뉴얼 읽기) 상태를 나타낸다.
const ENTRY = {
  label: '입장 (훈련 시작 전)',
  shortLabel: '입장',
  description: '참가자가 입장해 우리 조 감염병 매뉴얼을 읽는 단계예요. 진행자가 ▶ 훈련 시작을 누르면 예방단계로 넘어가요.',
}

export default function StageBanner({ current, awaitingStart = false }: { current: StageId; awaitingStart?: boolean }) {
  // 입장 단계를 0번으로 두고 실제 단계들을 1번부터 센다.
  const currentIdx = awaitingStart ? 0 : STAGES.findIndex((s) => s.id === current) + 1
  const steps = [ENTRY, ...STAGES]
  const stage = steps[currentIdx]

  return (
    <div className="w-full bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
          {steps.map((s, i) => (
            <div key={s.shortLabel} className="flex items-center gap-1 sm:gap-2 shrink-0">
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
              {i < steps.length - 1 && <span className="text-slate-300">→</span>}
            </div>
          ))}
        </div>

        <div className="mt-3 bg-brand-50 border-2 border-brand-200 rounded-2xl px-4 py-3">
          <h2 className="text-lg sm:text-2xl font-black text-brand-800 flex items-center gap-2">
            📍 {stage.label}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{stage.description}</p>
        </div>
      </div>
    </div>
  )
}
