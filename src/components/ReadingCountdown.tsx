import { useEffect, useState } from 'react'

export const MANUAL_READING_SEC = 60

export function useReadingRemaining(startedAt: number | null | undefined): number | null {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!startedAt) return
    const id = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(id)
  }, [startedAt])
  if (!startedAt) return null
  return Math.max(0, MANUAL_READING_SEC - Math.floor((now - startedAt) / 1000))
}

export function formatMmSs(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
}
