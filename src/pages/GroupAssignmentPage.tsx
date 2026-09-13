import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ROLE_LABELS, ROLE_ORDER } from '../types'
import { useSession } from '../hooks/useSession'
import { useGroups } from '../hooks/useGroupSubmissions'
import { createGroup } from '../lib/session'

export default function GroupAssignmentPage() {
  const { code = '' } = useParams()
  const { session } = useSession(code)
  const groups = useGroups(code)
  const [creating, setCreating] = useState(false)

  const joinUrl = `${window.location.origin}/join/${code}`

  async function handleAddGroup() {
    setCreating(true)
    try {
      await createGroup(code, `${groups.length + 1}조`)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">조 편성</h1>
          <p className="text-sm text-slate-500 mt-1">{session?.schoolName ?? '학교'} · 참가자는 아래 코드로 입장합니다.</p>
        </div>

        <section className="bg-white rounded-xl border border-slate-200 p-6 text-center">
          <p className="text-xs text-slate-400 mb-1">참가 코드</p>
          <p className="text-4xl font-black tracking-widest text-brand-700">{code}</p>
          <p className="text-xs text-slate-400 mt-2 break-all">{joinUrl}</p>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">조 목록 ({groups.length})</h2>
            <button
              type="button"
              onClick={handleAddGroup}
              disabled={creating}
              className="rounded-lg bg-brand-600 text-white text-sm font-semibold px-4 py-2 hover:bg-brand-700 disabled:opacity-50"
            >
              + 조 추가
            </button>
          </div>

          {groups.length === 0 && <p className="text-sm text-slate-400">아직 편성된 조가 없습니다. 조를 추가해 주세요.</p>}

          <div className="grid sm:grid-cols-2 gap-3">
            {groups.map((g) => (
              <div key={g.id} className="rounded-lg border border-slate-200 p-3">
                <div className="font-bold text-slate-800 mb-2">{g.name}</div>
                <div className="space-y-1">
                  {ROLE_ORDER.map((role) => (
                    <div key={role} className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{ROLE_LABELS[role]}</span>
                      <span className={g.members[role] ? 'text-brand-700 font-medium' : 'text-slate-300'}>
                        {g.members[role] || '미배정'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Link
          to={`/facilitator/${code}/present`}
          className="block text-center rounded-lg bg-slate-800 text-white py-3 text-sm font-semibold hover:bg-slate-700"
        >
          진행자 화면으로 이동 (훈련 시작)
        </Link>
      </div>
    </div>
  )
}
