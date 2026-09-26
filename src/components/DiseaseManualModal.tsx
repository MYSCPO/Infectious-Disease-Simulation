import type { DiseaseInfo, RoleId } from '../types'
import { ROLE_MASCOTS } from '../data/mascots'
import MascotAvatar from './MascotAvatar'
import DiseaseManualContent, { gradeLabel } from './DiseaseManualContent'

export default function DiseaseManualModal({
  disease,
  greetRole,
  onClose,
  notice,
}: {
  disease: DiseaseInfo
  greetRole: RoleId | null
  onClose: () => void
  notice?: React.ReactNode
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
          {notice}
          <div className="text-center">
            <span className="text-4xl">{disease.emoji}</span>
            <h3 className="text-lg font-black text-slate-800 mt-1">{disease.name}</h3>
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
              <span className="text-xs font-semibold bg-paper-100 text-slate-600 rounded-full px-3 py-1">
                {gradeLabel(disease)}
              </span>
              {disease.badges.map((b) => (
                <span key={b} className="text-xs font-semibold bg-brand-50 text-brand-700 rounded-full px-3 py-1">
                  {b}
                </span>
              ))}
            </div>
          </div>

          <DiseaseManualContent disease={disease} />

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
