import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ROLE_LABELS, ROLE_ORDER } from '../types'
import { useSession } from '../hooks/useSession'
import { useGroups } from '../hooks/useGroupSubmissions'
import { createGroup, updateGroupDisease } from '../lib/session'
import { DISEASES } from '../data/diseases'
import MascotAvatar from '../components/MascotAvatar'

export default function GroupAssignmentPage() {
  const { code = '' } = useParams()
  const { session } = useSession(code)
  const groups = useGroups(code)
  const [creating, setCreating] = useState(false)
  const [nextDiseaseId, setNextDiseaseId] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (session && !nextDiseaseId) setNextDiseaseId(session.diseaseId)
  }, [session, nextDiseaseId])

  const joinUrl = `${window.location.origin}/join/${code}`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(joinUrl)}`

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 클립보드 접근 실패 시 조용히 무시(코드가 화면에 이미 크게 보임)
    }
  }

  async function handleAddGroup() {
    setCreating(true)
    try {
      await createGroup(code, `${groups.length + 1}조`, nextDiseaseId || DISEASES[0].id)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">조 편성</h1>
          <p className="text-sm text-slate-500 mt-1">{session?.schoolName ?? '학교'} · 참가자는 아래 코드로 입장합니다.</p>
        </div>

        <section className="bg-white rounded-2xl border-2 border-brand-200 p-6 text-center">
          <p className="text-xs text-slate-400 mb-1">참가 코드</p>
          <p className="text-4xl font-black tracking-widest text-brand-700">{code}</p>
          <button
            type="button"
            onClick={handleCopyCode}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-600 text-white text-sm font-semibold px-4 py-2 hover:bg-brand-700 transition-colors"
          >
            {copied ? '✅ 복사됨!' : '📋 코드 복사'}
          </button>
          <p className="text-xs text-slate-400 mt-2 break-all">{joinUrl}</p>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center">
            <img
              src={qrCodeUrl}
              alt="참가 QR 코드"
              width={180}
              height={180}
              className="rounded-xl border border-slate-200"
            />
            <p className="text-xs text-slate-400 mt-2">📱 이 QR을 스캔하면 참가 코드 입력 없이 바로 입장 화면으로 이동해요</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-semibold text-slate-800">조 목록 ({groups.length})</h2>
            <div className="flex items-center gap-2">
              <select
                value={nextDiseaseId}
                onChange={(e) => setNextDiseaseId(e.target.value)}
                className="rounded-lg border border-slate-300 px-2 py-2 text-xs"
              >
                {DISEASES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddGroup}
                disabled={creating}
                className="rounded-full bg-brand-600 text-white text-sm font-semibold px-4 py-2 hover:bg-brand-700 disabled:opacity-50"
              >
                + 조 추가
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            조마다 다른 감염병을 배정할 수 있습니다. 위 선택값은 "다음에 추가할 조"에 적용되며, 이미 만든 조는 아래
            목록에서 각각 변경할 수 있습니다.
          </p>

          {groups.length === 0 && <p className="text-sm text-slate-400">아직 편성된 조가 없습니다. 조를 추가해 주세요.</p>}

          <div className="grid sm:grid-cols-2 gap-3">
            {groups.map((g) => (
              <div key={g.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-slate-800">{g.name}</div>
                  <select
                    value={g.diseaseId}
                    onChange={(e) => updateGroupDisease(code, g.id, e.target.value)}
                    className="rounded border border-slate-300 px-1.5 py-1 text-xs text-brand-700 font-medium"
                  >
                    {DISEASES.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  {ROLE_ORDER.map((role) => {
                    const members = g.members[role] ?? []
                    return (
                      <div key={role} className="flex items-start justify-between text-xs gap-2">
                        <span className="text-slate-500 shrink-0 pt-1">{ROLE_LABELS[role]}</span>
                        {members.length > 0 ? (
                          <div className="flex flex-wrap justify-end gap-1">
                            {members.map((name) => (
                              <span
                                key={name}
                                className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 rounded-full pl-0.5 pr-2 py-0.5"
                              >
                                <MascotAvatar role={role} size="sm" />
                                {name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-300">미배정</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Link
          to={`/facilitator/${code}/present`}
          className="block text-center rounded-full bg-slate-800 text-white py-3 text-sm font-semibold hover:bg-slate-700"
        >
          진행자 화면으로 이동
        </Link>
      </div>
    </div>
  )
}
