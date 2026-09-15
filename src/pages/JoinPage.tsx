import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { RoleId } from '../types'
import { ROLE_CAPACITY, ROLE_DESCRIPTIONS, ROLE_LABELS, ROLE_ORDER } from '../types'
import { ROLE_MASCOTS } from '../data/mascots'
import { getDiseaseById } from '../data/diseases'
import MascotAvatar from '../components/MascotAvatar'
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
  const [infoRole, setInfoRole] = useState<RoleId | null>(null)
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
      const result = await claimRole(confirmedCode, groupId, role, name.trim(), ROLE_CAPACITY[role].max)
      if (result === 'full') {
        setError(`방금 정원이 다 찼습니다(${ROLE_LABELS[role]} 최대 ${ROLE_CAPACITY[role].max}명). 다른 역할을 선택해 주세요.`)
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
                    className={`rounded-lg border py-2 px-2 text-sm font-semibold flex items-center justify-center gap-1.5 ${
                      groupId === g.id ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>{g.name}</span>
                    <span className="text-xs font-medium text-slate-400">| {getDiseaseById(g.diseaseId).name}</span>
                  </button>
                ))}
                {groups.length === 0 && <p className="text-xs text-slate-400 col-span-2">진행자가 조를 편성하면 표시됩니다.</p>}
              </div>
            </section>

            {selectedGroup && (
              <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm font-medium text-slate-700">역할 선택</span>
                  <span className="inline-flex items-center gap-1.5 bg-brand-600 text-white text-sm font-bold rounded-full px-3 py-1.5">
                    선택한 조: {selectedGroup.name} ({getDiseaseById(selectedGroup.diseaseId).name})
                  </span>
                </div>
                <p className="text-xs text-slate-400 -mt-1">역할 이름 옆 ⓘ에 마우스를 올리거나 눌러보면 무슨 일을 하는지 볼 수 있어요.</p>
                <div className="grid grid-cols-1 gap-2">
                  {ROLE_ORDER.map((r) => {
                    const members = selectedGroup.members[r] ?? []
                    const showInfo = infoRole === r
                    const cap = ROLE_CAPACITY[r]
                    const isFull = cap.max != null && members.length >= cap.max
                    let badgeLabel: string
                    let badgeClass: string
                    if (cap.max != null) {
                      badgeLabel = isFull ? `선택 마감 (${members.length}/${cap.max}명)` : `${members.length}/${cap.max}명 선택 중`
                      badgeClass = isFull ? 'bg-rose-100 text-rose-600' : 'bg-amber-50 text-amber-700'
                    } else if (cap.recommended) {
                      badgeLabel = `현재 ${members.length}명 선택 중 (권장 ${cap.recommended}명)`
                      badgeClass = members.length > 0 ? 'bg-brand-100 text-brand-700' : 'bg-paper-100 text-slate-400'
                    } else {
                      badgeLabel = `현재 ${members.length}명 선택 중 (자유)`
                      badgeClass = members.length > 0 ? 'bg-brand-100 text-brand-700' : 'bg-paper-100 text-slate-400'
                    }
                    return (
                      <div
                        key={r}
                        className={`rounded-lg border text-sm ${
                          role === r
                            ? 'border-brand-600 bg-brand-50 text-brand-700'
                            : isFull
                              ? 'border-slate-100 bg-slate-50 text-slate-300'
                              : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between px-3 py-2 gap-2">
                          <button
                            type="button"
                            disabled={isFull}
                            onClick={() => setRole(r)}
                            className="flex-1 flex items-center gap-2.5 text-left disabled:cursor-not-allowed"
                          >
                            <MascotAvatar role={r} size="sm" motion="idle" />
                            <span>
                              <span className="block font-bold leading-tight">{ROLE_MASCOTS[r].name}</span>
                              <span className="block text-xs text-slate-400 leading-tight">{ROLE_LABELS[r]}</span>
                            </span>
                          </button>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs font-semibold rounded-full px-2 py-1 whitespace-nowrap ${badgeClass}`}>
                              {badgeLabel}
                            </span>
                            <button
                              type="button"
                              aria-label={`${ROLE_LABELS[r]} 역할 설명 보기`}
                              onClick={(e) => {
                                e.stopPropagation()
                                setInfoRole(showInfo ? null : r)
                              }}
                              onMouseEnter={() => setInfoRole(r)}
                              onMouseLeave={() => setInfoRole((cur) => (cur === r ? null : cur))}
                              className="w-5 h-5 rounded-full border border-current text-[11px] font-bold leading-none hover:bg-white/60"
                            >
                              i
                            </button>
                          </div>
                        </div>
                        {members.length > 0 && (
                          <p className="px-3 pb-2 text-xs text-slate-400">참여 중: {members.join(', ')}</p>
                        )}
                        {showInfo && (
                          <p className="px-3 pb-2 text-xs text-slate-500 leading-relaxed">
                            {ROLE_DESCRIPTIONS[r].summary}
                            <br />
                            <span className="text-slate-400">{ROLE_DESCRIPTIONS[r].example}</span>
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-slate-400">
                  감시맨·예방벨·학사대장은 인원 제한 없이 자유롭게, 지원통은 되도록 1명, 관리자는 최대 2명까지 함께할 수 있어요 🙂
                </p>
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
