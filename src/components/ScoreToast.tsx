import { useEffect } from 'react'

const AUTO_CLOSE_MS = 3000

// 화면을 잠그지 않는 점수 알림 토스트. 상단에 잠깐 떴다가 3초 후 자동으로 사라지며,
// 언제든 ✕로 바로 닫을 수 있다(뒤 화면은 계속 조작 가능).
export default function ScoreToast({
  message,
  color = 'amber',
  onClose,
}: {
  message: string
  color?: 'amber' | 'emerald' | 'violet'
  onClose: () => void
}) {
  useEffect(() => {
    const id = setTimeout(onClose, AUTO_CLOSE_MS)
    return () => clearTimeout(id)
  }, [onClose])

  const bg = color === 'emerald' ? 'bg-emerald-500' : color === 'violet' ? 'bg-violet-500' : 'bg-amber-500'

  return (
    <div className="fixed top-3 inset-x-0 z-[60] flex justify-center px-4 pointer-events-none">
      <div className={`pointer-events-auto max-w-md w-full ${bg} text-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3`}>
        <p className="flex-1 text-sm font-bold leading-snug text-center">{message}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="shrink-0 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 text-xs font-bold"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
