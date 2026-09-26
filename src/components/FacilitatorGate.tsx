import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { hashFacilitatorPin, isFacilitatorUnlocked, markFacilitatorUnlocked } from '../lib/facilitatorAuth'

export default function FacilitatorGate({ children }: { children: ReactNode }) {
  const { code = '' } = useParams()
  const { session, loading } = useSession(code)
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [unlockedNow, setUnlockedNow] = useState(false)

  if (loading) return <div className="p-8 text-center text-slate-400">불러오는 중...</div>

  const pinHash = session?.facilitatorPinHash
  if (!session || !pinHash || unlockedNow || isFacilitatorUnlocked(code, pinHash)) return <>{children}</>

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setChecking(true)
    try {
      const hash = await hashFacilitatorPin(code, pin)
      if (hash === pinHash) {
        markFacilitatorUnlocked(code, hash)
        setUnlockedNow(true)
      } else {
        setError('비밀번호가 올바르지 않습니다.')
      }
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-sm border border-brand-100 max-w-xs w-full p-6 text-center space-y-3"
      >
        <div className="text-3xl">🔐</div>
        <h1 className="text-base font-bold text-slate-800">이 훈련의 진행자 비밀번호</h1>
        <p className="text-xs text-slate-500">
          {session.schoolName} · 참가 코드 {code}
          <br />
          훈련을 만들 때 정한 비밀번호를 입력해 주세요.
        </p>
        <input
          type="password"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value)
            setError(null)
          }}
          autoFocus
          placeholder="진행자 비밀번호"
          className="w-full text-center rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={checking || !pin}
          className="w-full rounded-full bg-brand-600 text-white py-2.5 text-sm font-bold hover:bg-brand-700 disabled:opacity-50"
        >
          확인
        </button>
        <Link to="/" className="block text-xs text-slate-400 underline">
          메인 화면으로
        </Link>
      </form>
    </div>
  )
}
