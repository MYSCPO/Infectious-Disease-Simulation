import type { GroupDoc, StageId } from '../types'
import { ROLE_LABELS, ROLE_ORDER } from '../types'
import { getChecklistForStage } from '../data/roleChecklist'

// 진행자 화면: 체크리스트 단계에서 조원별로 "내 역할 체크리스트를 다 읽고 체크했는지"를 보여준다.
export default function ChecklistProgressGrid({ groups, stage }: { groups: GroupDoc[]; stage: StageId }) {
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {groups.map((g) => {
        const checklist = getChecklistForStage(stage, g.diseaseId)
        const progress = g.checklistProgress?.[stage] ?? {}
        const people = ROLE_ORDER.flatMap((role) =>
          (g.members[role] ?? []).map((name) => {
            const total = checklist[role].items.length
            const done = Math.min(progress[name]?.checked.length ?? 0, total)
            return { name, role, done, total }
          }),
        ).filter((p) => !p.name.startsWith('테스트봇'))
        const finished = people.filter((p) => p.total > 0 && p.done >= p.total).length

        return (
          <div key={g.id} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-800">{g.name}</span>
              <span
                className={`text-xs font-bold rounded-full px-2 py-0.5 ${
                  people.length > 0 && finished === people.length ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}
              >
                체크 완료 {finished}/{people.length}명
              </span>
            </div>
            {people.length === 0 ? (
              <p className="text-xs text-slate-400">아직 입장한 조원이 없어요.</p>
            ) : (
              <ul className="space-y-1">
                {people.map((p) => (
                  <li key={`${p.role}-${p.name}`} className="flex items-center justify-between text-xs gap-2">
                    <span className="text-slate-600 truncate">
                      {p.name} <span className="text-slate-400">· {ROLE_LABELS[p.role].split('(')[0]}</span>
                    </span>
                    <span className={`shrink-0 font-semibold ${p.done >= p.total ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {p.done >= p.total ? '✅ 완료' : `⏳ ${p.done}/${p.total}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
