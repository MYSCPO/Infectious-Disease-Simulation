import { useEffect, useState } from 'react'
import type { SessionDoc } from '../types'
import { subscribeSession } from '../lib/session'

export function useSession(code: string | undefined) {
  const [session, setSession] = useState<SessionDoc | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!code) {
      setLoading(false)
      return
    }
    setLoading(true)
    const unsub = subscribeSession(code, (s) => {
      setSession(s)
      setLoading(false)
    })
    return unsub
  }, [code])

  return { session, loading }
}
