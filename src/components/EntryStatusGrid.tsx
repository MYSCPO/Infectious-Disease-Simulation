import type { GroupDoc } from '../types'
import { requiredRoleCount, ROLE_LABELS, ROLE_ORDER } from '../types'

// 진행자 화면 "입장" 단계: 조별로 누가 어떤 역할로 들어왔는지, 입장 기준(조 인원)을 채웠는지 보여준다.
export default function EntryStatusGrid({ groups }: { groups: GroupDoc[] }) {
  if (groups.length === 0) return null
  return (
    <div className="grid sm:grid-cols-2 gap-2 text-left">
      {groups.map((g) => {
        const filled = ROLE_ORDER.filter((r) => (g.members[r] ?? []).some((n) => !n.startsWith('테스트봇')))
        const required = requiredRoleCount(g)
        const ready = filled.length >= required
        return (
          <div key={g.id} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-800">{g.name}</span>
              <span
                className={`text-xs font-bold rounded-full px-2 py-0.5 ${ready ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
              >
                {ready ? '✅ 입장 완료' : `⏳ 역할 ${filled.length}/${required}`}
              </span>
            </div>
            <ul className="space-y-0.5">
              {ROLE_ORDER.map((r) => {
                const people = (g.members[r] ?? []).filter((n) => !n.startsWith('테스트봇'))
                return (
                  <li key={r} className="flex justify-between gap-2 text-xs">
                    <span className="text-slate-500">{ROLE_LABELS[r].split('(')[0]}</span>
                    <span className={people.length > 0 ? 'text-slate-700 font-medium' : 'text-slate-300'}>
                      {people.length > 0 ? people.join(', ') : '미배정'}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
