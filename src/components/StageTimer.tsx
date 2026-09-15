import { useEffect, useState } from 'react'

// 조별 타이머는 강제 규칙이 아니라 진행 속도를 가늠하는 참고용 표시라, 시간이 지나도
// 자동으로 다음 단계로 넘기지 않는다(진행자가 "다음 단계로"를 직접 눌러야 함).
export default function StageTimer({
  startedAt,
  minutes,
  tone = 'light',
}: {
  startedAt: number | null
  minutes: number
  tone?: 'light' | 'dark'
}) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!startedAt) return null

  const totalSec = minutes * 60
  const elapsed = Math.floor((now - startedAt) / 1000)
  const remaining = totalSec - elapsed
  const over = remaining <= 0
  const abs = Math.abs(remaining)
  const mm = String(Math.floor(abs / 60)).padStart(2, '0')
  const ss = String(abs % 60).padStart(2, '0')

  const baseClass =
    tone === 'dark'
      ? over
        ? 'bg-rose-100 text-rose-600'
        : 'bg-white/15 text-white'
      : over
        ? 'bg-rose-50 text-rose-600 border border-rose-200'
        : 'bg-white text-brand-700 border border-brand-200'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${baseClass}`}>
      ⏱ {over ? `+${mm}:${ss}` : `${mm}:${ss}`}
      {over && <span className="text-xs font-semibold">시간 종료</span>}
    </span>
  )
}
