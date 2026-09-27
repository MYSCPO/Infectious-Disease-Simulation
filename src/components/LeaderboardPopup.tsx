import { useEffect, useRef } from 'react'
import type { GroupDoc } from '../types'
import Leaderboard from './Leaderboard'

// 단계 전환 때 잠깐 보여주는 순위. 화면을 누르면 바로 닫힌다.
export default function LeaderboardPopup({
  groups,
  highlightGroupId,
  durationMs = 1500,
  onClose,
}: {
  groups: GroupDoc[]
  highlightGroupId?: string
  durationMs?: number
  onClose: () => void
}) {
  // 부모가 다시 그려질 때마다 새 onClose가 넘어와도 타이머가 처음부터 다시 돌지 않도록 ref로 붙잡아 둔다.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const id = setTimeout(() => onCloseRef.current(), durationMs)
    return () => clearTimeout(id)
  }, [durationMs])

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4 cursor-pointer"
      onClick={() => onCloseRef.current()}
    >
      <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-5">
        <h3 className="text-center text-base font-black text-slate-800 mb-3">🏆 실시간 순위</h3>
        <Leaderboard groups={groups} highlightGroupId={highlightGroupId} />
      </div>
    </div>
  )
}
