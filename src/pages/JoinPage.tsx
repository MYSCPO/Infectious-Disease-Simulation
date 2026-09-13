import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { RoleId } from '../types'
import { ROLE_LABELS, ROLE_ORDER } from '../types'
import { useSession } from '../hooks/useSession'
import { useGroups } from '../hooks/useGroupSubmissions'
import { claimRole } from '../lib/session'
import { saveParticipantIdentity } from '../lib/participant'

export default function JoinPage() {
  const { code: codeParam } = useParams()
  const navigate = useNavigate()
  const [code, setCode] = useState(codeParam?.toUpperCase() ?? '')
  const [confirmedCode, setConfirmedCode] = useState(codeParam ? codeParam.toUpperCase() : '')
  const [groupId, setGroupId] = useState('')
  const [role, setRole] = useState<RoleId | ''>('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)

  const { session, loading } = useSession(confirmedCode || undefined)
  const groups = useGroups(confirmedCode || undefined)

  useEffect(() => {
    if (confirmedCode && !loading && !session) {
      setError('해당 참가 코드를 찾을 수 없습니다. 코드를 다시 확인해 주세요.')
    }
  }, [confirmedCode, loading, session])

  const selectedGroup = groups.find((g) => g.id === groupId)

  function handleCheckCode() {
    if (code.trim().length < 4) {
      setError('참가 코드를 정확히 입력해 주세요.')
      return
    }
    setError(null)
    setConfirmedCode(code.trim().toUpperCase())
  }

  async function handleJoin() {
    if (!groupId || !role || !name.trim()) {
      setError('조, 역할, 이름을 모두 선택/입력해 주세요.')
      return
    }
    setJoining(true)
    setError(null)
    try {
      const claimed = await claimRole(confirmedCode, groupId, role, name.trim())
      if (!claimed) {
        setError('방금 다른 참가자가 먼저 선택한 역할입니다. 다른 역할을 선택해 주세요.')
        setRole('')
        return
      }
      saveParticipantIdentity({ sessionCode: confirmedCode, groupId, role, name: name.trim() })
      navigate(`/team/${confirmedCode}/${groupId}`)
    } catch (e) {
      console.error(e)
      setError('입장에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper-50 py-8 px-4">
      <div className="max-w-md mx-auto space-y-5">
        <h1 className="text-xl font-bold text-slate-800 text-center">모의훈련 참가하기</h1>

        {!confirmedCode || !session ? (
          <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">참가 코드</span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="예: AB3CD"
                className="mt-1 w-full text-center tracking-widest text-lg rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </label>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <button
              type="button"
              onClick={handleCheckCode}
              className="w-full rounded-full bg-brand-600 text-white py-2.5 text-sm font-semibold hover:bg-brand-700"
            >
              확인
            </button>
          </section>
        ) : (
          <>
            <p className="text-center text-sm text-slate-500">{session.schoolName} · 참가 코드 {confirmedCode}</p>

            <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <span className="text-sm font-medium text-slate-700">조 선택</span>
              <div className="grid grid-cols-2 gap-2">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGroupId(g.id)}
                    className={`rounded-lg border py-2 text-sm font-semibold ${
                      groupId === g.id ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
                {groups.length === 0 && <p className="text-xs text-slate-400 col-span-2">진행자가 조를 편성하면 표시됩니다.</p>}
              </div>
            </section>

            {selectedGroup && (
              <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <span className="text-sm font-medium text-slate-700">역할 선택</span>
                <div className="grid grid-cols-1 gap-2">
                  {ROLE_ORDER.map((r) => {
                    const takenBy = selectedGroup.members[r]
                    return (
                      <button
                        key={r}
                        type="button"
                        disabled={!!takenBy}
                        onClick={() => setRole(r)}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                          role === r
                            ? 'border-brand-600 bg-brand-50 text-brand-700'
                            : takenBy
                              ? 'border-slate-100 bg-slate-50 text-slate-300'
                              : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="font-medium">
                          {ROLE_LABELS[r]}
                          {r === 'principal' && ' (실제 교장·교감)'}
                        </span>
                        <span className="text-xs">{takenBy ? `${takenBy} 배정됨` : '선택 가능'}</span>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

            <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">이름</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </label>
            </section>

            {error && <p className="text-sm text-rose-600">{error}</p>}

            <button
              type="button"
              onClick={handleJoin}
              disabled={joining}
              className="w-full rounded-full bg-brand-600 text-white py-3 text-sm font-semibold hover:bg-brand-700 disabled:opacity-50"
            >
              {joining ? '입장 중...' : '입장하기'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
