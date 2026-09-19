import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { RoleId } from '../types'
import { ROLE_CAPACITY, ROLE_DESCRIPTIONS, ROLE_LABELS, ROLE_ORDER } from '../types'
import { ROLE_MASCOTS } from '../data/mascots'
import { getDiseaseById } from '../data/diseases'
import MascotAvatar from '../components/MascotAvatar'
import { useSession } from '../hooks/useSession'
import { useGroups } from '../hooks/useGroupSubmissions'
import { claimRole, releaseRole } from '../lib/session'
import { loadParticipantIdentity, saveParticipantIdentity } from '../lib/participant'

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
  const [claiming, setClaiming] = useState(false)
  const [showOrgChart, setShowOrgChart] = useState(false)

  const { session, loading } = useSession(confirmedCode || undefined)
  const groups = useGroups(confirmedCode || undefined)

  useEffect(() => {
    if (confirmedCode && !loading && !session) {
      setError('해당 참가 코드를 찾을 수 없습니다. 코드를 다시 확인해 주세요.')
    }
  }, [confirmedCode, loading, session])

  // 새로고침 시 이미 참여 중이던 조·역할·이름을 복원
  useEffect(() => {
    const saved = loadParticipantIdentity()
    if (saved && saved.sessionCode === confirmedCode) {
      setGroupId(saved.groupId)
      setRole(saved.role)
      setName(saved.name)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmedCode])

  const selectedGroup = groups.find((g) => g.id === groupId)
  const filledRoles = selectedGroup ? ROLE_ORDER.filter((r) => (selectedGroup.members[r]?.length ?? 0) > 0) : []
  const allFilled = !!selectedGroup && filledRoles.length === ROLE_ORDER.length

  function handleCheckCode() {
    if (code.trim().length < 4) {
      setError('참가 코드를 정확히 입력해 주세요.')
      return
    }
    setError(null)
    setConfirmedCode(code.trim().toUpperCase())
  }

  async function handleSelectRole(r: RoleId) {
    if (!name.trim()) {
      setError('이름을 먼저 입력해 주세요.')
      return
    }
    if (role === r || claiming) return
    setClaiming(true)
    setError(null)
    try {
      if (role) {
        await releaseRole(confirmedCode, groupId, role, name.trim())
      }
      const result = await claimRole(confirmedCode, groupId, r, name.trim(), ROLE_CAPACITY[r].max)
      if (result === 'full') {
        setError(`방금 정원이 다 찼습니다(${ROLE_LABELS[r]} 최대 ${ROLE_CAPACITY[r].max}명). 다른 역할을 선택해 주세요.`)
        return
      }
      setRole(r)
      saveParticipantIdentity({ sessionCode: confirmedCode, groupId, role: r, name: name.trim() })
    } catch (e) {
      console.error(e)
      setError('역할 선택에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setClaiming(false)
    }
  }

  async function handleSelectGroup(nextGroupId: string) {
    if (nextGroupId === groupId || claiming) return
    if (role) {
      setClaiming(true)
      try {
        await releaseRole(confirmedCode, groupId, role, name.trim())
        setRole('')
      } finally {
        setClaiming(false)
      }
    }
    setGroupId(nextGroupId)
  }

  function handleStart() {
    navigate(`/team/${confirmedCode}/${groupId}`)
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
              <button
                type="button"
                onClick={() => setShowOrgChart((o) => !o)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-sm font-medium text-slate-700">🗂️ 우리 학교 감염병 대응 조직도</span>
                <span className="text-slate-400 text-xs">{showOrgChart ? '▲ 접기' : '▼ 역할별 담당자 보기'}</span>
              </button>
              {showOrgChart && (
                <div className="pt-1 space-y-3">
                  <img
                    src="/org-chart.png"
                    alt="학교감염병관리조직 구성도: 학교장·협력기관, 교감, 발생감시팀·예방관리팀·학사관리팀·행정지원팀"
                    className="w-full rounded-xl border border-slate-100"
                  />
                  <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-3">
                    <p className="text-xs font-bold text-brand-700 mb-2">우리 학교 실제 담당자</p>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li>
                        <span className="font-semibold text-slate-700">{ROLE_LABELS.principal}</span>:{' '}
                        {session.orgChart.principal || '담당자 미입력'}
                      </li>
                      {ROLE_ORDER.filter((r) => r !== 'principal').map((r) => (
                        <li key={r}>
                          <span className="font-semibold text-slate-700">{ROLE_LABELS[r]}</span>:{' '}
                          {session.orgChart[r] || '담당자 미입력'}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">
                    출처: 학교 감염병 예방·위기대응 매뉴얼(교육부) [그림 2-1] 학교감염병관리조직 구성
                  </p>
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <span className="text-sm font-medium text-slate-700">조 선택</span>
              <div className="grid grid-cols-2 gap-2">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    disabled={claiming}
                    onClick={() => handleSelectGroup(g.id)}
                    className={`rounded-lg border py-2 px-2 text-sm font-semibold flex items-center justify-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60 ${
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
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">이름</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!!role}
                    placeholder="이름을 입력하세요"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </label>
              </section>
            )}

            {selectedGroup && (
              <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm font-medium text-slate-700">역할 선택</span>
                  <span className="inline-flex items-center gap-1.5 bg-brand-600 text-white text-sm font-bold rounded-full px-3 py-1.5">
                    선택한 조: {selectedGroup.name} ({getDiseaseById(selectedGroup.diseaseId).name})
                  </span>
                </div>
                <p className="text-xs text-slate-400 -mt-1">
                  이름을 입력한 뒤 역할을 누르면 바로 참여돼요. 다른 역할을 눌러 언제든 바꿀 수 있고, 실시간으로 조원
                  현황이 아래에 표시됩니다.
                </p>
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
                            disabled={isFull || claiming}
                            onClick={() => handleSelectRole(r)}
                            className="flex-1 flex items-center gap-2.5 text-left disabled:cursor-not-allowed"
                          >
                            <MascotAvatar role={r} size="sm" motion="idle" />
                            <span>
                              <span className="block font-bold leading-tight">
                                {ROLE_MASCOTS[r].name}
                                {role === r && <span className="ml-1 text-xs font-semibold text-brand-600">· 나</span>}
                              </span>
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
                        <p className="px-3 pb-2 text-xs text-slate-400">
                          {members.length > 0 ? `참여 중: ${members.join(', ')}` : '아직 미배정 ⏳'}
                        </p>
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
                  감시맨·예방벨·학사대장은 인원 제한 없이 자유롭게, 지원통은 되도록 1명, 관리자는 되도록 2명(교장·교감)이
                  함께할 수 있어요 🙂
                </p>
              </section>
            )}

            {error && <p className="text-sm text-rose-600 text-center">{error}</p>}

            {selectedGroup && (
              <section className="bg-white rounded-2xl border-2 border-brand-200 p-5 space-y-3 text-center">
                <p className="text-sm font-bold text-slate-700">
                  {allFilled
                    ? `🎉 ${selectedGroup.name} 역할 편성이 모두 완료되었습니다!`
                    : `전체 역할이 골고루 편성되는 중입니다. (${filledRoles.length}/${ROLE_ORDER.length}개 역할 완료)`}
                </p>
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={!role || !allFilled}
                  className="w-full rounded-full bg-brand-600 text-white py-3 text-sm font-bold hover:bg-brand-700 disabled:opacity-40"
                >
                  {!role
                    ? '역할을 먼저 선택해 주세요'
                    : !allFilled
                      ? '조원들의 역할 선택을 기다리는 중... ⏳'
                      : '모의훈련 시작하기 🚀'}
                </button>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
