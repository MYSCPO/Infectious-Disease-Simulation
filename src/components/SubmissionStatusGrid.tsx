import type { GroupDoc, SubmissionDoc } from '../types'

export default function SubmissionStatusGrid({ groups, submissions }: { groups: GroupDoc[]; submissions: SubmissionDoc[] }) {
  const submittedIds = new Set(submissions.filter((s) => s.submitted).map((s) => s.groupId))

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {groups.map((g) => {
        const done = submittedIds.has(g.id)
        return (
          <div
            key={g.id}
            className={`relative rounded-2xl border p-3 text-center ${
              done ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'
            }`}
          >
            {g.badge && (
              <span className="absolute -top-2 -right-2 text-lg" title="돌발 퀴즈 달성 배지">
                👑
              </span>
            )}
            <div className="text-sm font-bold text-slate-800">{g.name}</div>
            <div
              className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5 ${
                done ? 'bg-emerald-100 text-emerald-700' : 'bg-paper-100 text-slate-500'
              }`}
            >
              {done ? '✅ 제출 완료' : '✏️ 작성 중'}
            </div>
          </div>
        )
      })}
      {groups.length === 0 && <p className="text-sm text-slate-400 col-span-full">아직 편성된 조가 없습니다.</p>}
    </div>
  )
}
