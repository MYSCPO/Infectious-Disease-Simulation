import { useEffect } from 'react'

const AUTO_CLOSE_MS = 4000

export default function FirstBloodToast({ groupName, onClose }: { groupName: string; onClose: () => void }) {
  useEffect(() => {
    const id = setTimeout(onClose, AUTO_CLOSE_MS)
    return () => clearTimeout(id)
  }, [onClose])

  return (
    <div className="fixed top-3 inset-x-0 z-[60] flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto max-w-md w-full bg-amber-500 text-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
        <span className="text-xl shrink-0">⚡</span>
        <p className="flex-1 text-sm font-bold leading-snug">
          [{groupName}]가 가장 빠르게 정답을 맞혀 스피드 보너스(+50pt)를 획득했습니다!
        </p>
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
