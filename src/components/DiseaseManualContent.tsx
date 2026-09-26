import type { DiseaseInfo } from '../types'

export function gradeLabel(disease: DiseaseInfo): string {
  return disease.grade.endsWith('급') ? `법정감염병 ${disease.grade}` : disease.grade
}

export default function DiseaseManualContent({
  disease,
  cardClassName = 'bg-paper-50 rounded-2xl p-3',
}: {
  disease: DiseaseInfo
  cardClassName?: string
}) {
  return (
    <>
      <div className={cardClassName}>
        <h4 className="text-xs font-bold text-brand-700 mb-1">🤒 주요 증상</h4>
        <p className="text-sm text-slate-700 leading-relaxed">{disease.symptoms}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={cardClassName}>
          <h4 className="text-xs font-bold text-brand-700 mb-1">⏳ 잠복기</h4>
          <p className="text-sm font-bold text-amber-600 leading-relaxed">{disease.incubationPeriod}</p>
        </div>
        <div className={cardClassName}>
          <h4 className="text-xs font-bold text-brand-700 mb-1">🦠 전염 기간</h4>
          <p className="text-sm text-slate-700 leading-relaxed">{disease.infectiousPeriod}</p>
        </div>
      </div>

      <div className={cardClassName}>
        <h4 className="text-xs font-bold text-brand-700 mb-1">🏫 등교중지(격리) 기본 지침</h4>
        <p className="text-sm font-bold text-emerald-600 leading-relaxed">{disease.exclusionPeriod}</p>
      </div>

      <div className={cardClassName}>
        <h4 className="text-xs font-bold text-brand-700 mb-1">🛡️ 예방수칙</h4>
        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside leading-relaxed">
          {disease.prevention.map((p, i) => {
            const [keyword, ...rest] = p.split(':')
            const detail = rest.join(':').trim()
            return (
              <li key={i}>
                {detail ? (
                  <>
                    <span className="font-bold text-slate-900">{keyword}:</span> {detail}
                  </>
                ) : (
                  p
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <div className={cardClassName}>
        <h4 className="text-xs font-bold text-brand-700 mb-1">💊 치료</h4>
        <p className="text-sm text-slate-700 leading-relaxed">{disease.treatment}</p>
      </div>
    </>
  )
}
