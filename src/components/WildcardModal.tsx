import type { WildcardCard } from '../types'

export default function WildcardModal({ card, onClose }: { card: WildcardCard; onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border-t-4 border-amber-400">
        <div className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">돌발 상황 카드</div>
        <h3 className="text-xl font-bold text-slate-800 mb-3">{card.title}</h3>
        <p className="text-sm text-slate-700 leading-relaxed mb-4">{card.description}</p>
        <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-800">
          <span className="font-semibold">토론 포인트: </span>
          {card.discussionPrompt}
        </div>
        <p className="text-xs text-slate-400 mt-3">채점 없이 조별로 자유롭게 의견을 나눠 보세요.</p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-full bg-slate-800 text-white py-2 text-sm font-medium hover:bg-slate-700"
          >
            닫기
          </button>
        )}
      </div>
    </div>
  )
}
