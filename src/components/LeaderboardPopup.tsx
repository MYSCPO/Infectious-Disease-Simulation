import { useEffect, useState } from 'react'
import type { GroupDoc } from '../types'
import Leaderboard from './Leaderboard'

export default function LeaderboardPopup({
  groups,
  highlightGroupId,
  durationMs = 3000,
  onClose,
}: {
  groups: GroupDoc[]
  highlightGroupId?: string
  durationMs?: number
  onClose: () => void
}) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const id = setTimeout(() => {
      setVisible(false)
      onClose()
    }, durationMs)
    return () => clearTimeout(id)
  }, [durationMs, onClose])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-5">
        <h3 className="text-center text-base font-black text-slate-800 mb-3">🏆 실시간 순위</h3>
        <Leaderboard groups={groups} highlightGroupId={highlightGroupId} />
      </div>
    </div>
  )
}
