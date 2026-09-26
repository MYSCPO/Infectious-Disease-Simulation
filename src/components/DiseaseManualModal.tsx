import type { DiseaseInfo, RoleId } from '../types'
import { ROLE_MASCOTS } from '../data/mascots'
import MascotAvatar from './MascotAvatar'

export default function DiseaseManualModal({
  disease,
  greetRole,
  onClose,
}: {
  disease: DiseaseInfo
  greetRole: RoleId | null
  onClose: () => void
}) {
  const mascot = ROLE_MASCOTS[greetRole ?? 'health']

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
        <div className="bg-brand-600 rounded-t-3xl px-5 pt-5 pb-4 text-center">
          <div className="flex justify-center mb-2">
            <MascotAvatar role={greetRole ?? 'health'} size="lg" motion="idle" />
          </div>
          <div className="relative inline-block bg-white rounded-2xl rounded-bl-sm px-4 py-2 mb-1">
            <p className="text-sm font-bold text-brand-700">
              선생님, {disease.name} 핵심 지침을 확인해보세요!
            </p>
          </div>
          <p className="text-xs text-brand-50">{mascot.name}이(가) 알려드려요</p>
        </div>

        <div className="p-5 space-y-3">
          <div className="text-center">
            <span className="text-4xl">{disease.emoji}</span>
            <h3 className="text-lg font-black text-slate-800 mt-1">{disease.name}</h3>
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
              <span className="text-xs font-semibold bg-paper-100 text-slate-600 rounded-full px-3 py-1">
                {disease.grade.endsWith('급') ? `법정감염병 ${disease.grade}` : disease.grade}
              </span>
              {disease.badges.map((b) => (
                <span key={b} className="text-xs font-semibold bg-brand-50 text-brand-700 rounded-full px-3 py-1">
                  {b}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-paper-50 rounded-2xl p-3">
            <h4 className="text-xs font-bold text-brand-700 mb-1">🤒 주요 증상</h4>
            <p className="text-sm text-slate-700 leading-relaxed">{disease.symptoms}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-paper-50 rounded-2xl p-3">
              <h4 className="text-xs font-bold text-brand-700 mb-1">⏳ 잠복기</h4>
              <p className="text-sm font-bold text-amber-600 leading-relaxed">{disease.incubationPeriod}</p>
            </div>
            <div className="bg-paper-50 rounded-2xl p-3">
              <h4 className="text-xs font-bold text-brand-700 mb-1">🦠 전염 기간</h4>
              <p className="text-sm text-slate-700 leading-relaxed">{disease.infectiousPeriod}</p>
            </div>
          </div>

          <div className="bg-paper-50 rounded-2xl p-3">
            <h4 className="text-xs font-bold text-brand-700 mb-1">🏫 등교중지(격리) 기본 지침</h4>
            <p className="text-sm font-bold text-emerald-600 leading-relaxed">{disease.exclusionPeriod}</p>
          </div>

          <div className="bg-paper-50 rounded-2xl p-3">
            <h4 className="text-xs font-bold text-brand-700 mb-1">🛡️ 예방수칙</h4>
            <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
              {disease.prevention.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>

          <div className="bg-paper-50 rounded-2xl p-3">
            <h4 className="text-xs font-bold text-brand-700 mb-1">💊 치료</h4>
            <p className="text-sm text-slate-700 leading-relaxed">{disease.treatment}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-brand-600 text-white py-3 text-sm font-bold hover:bg-brand-700"
          >
            확인했어요, 훈련으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}
