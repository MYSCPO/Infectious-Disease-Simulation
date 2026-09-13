import type { RoleQuestion, SubmissionDoc } from '../types'
import { ROLE_LABELS } from '../types'

export default function RevealComparison({ questions, submissions }: { questions: RoleQuestion[]; submissions: SubmissionDoc[] }) {
  return (
    <div className="space-y-5">
      {questions.map((q) => {
        const correctOption = q.options.find((o) => o.correct)
        return (
          <div key={q.role} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs font-semibold text-brand-600 mb-1">{ROLE_LABELS[q.role]}</div>
            <p className="text-sm font-medium text-slate-800 mb-3">{q.prompt}</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b border-slate-200">
                    <th className="py-1 pr-3 font-medium">조</th>
                    <th className="py-1 font-medium">선택한 조치</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => {
                    const ans = sub.answers.find((a) => a.role === q.role)
                    const opt = ans ? q.options.find((o) => o.id === ans.optionId) : undefined
                    return (
                      <tr key={sub.groupId} className="border-b border-slate-100 last:border-0">
                        <td className="py-1.5 pr-3 font-semibold text-slate-700 whitespace-nowrap">{sub.groupName}</td>
                        <td className={`py-1.5 ${opt?.correct ? 'text-emerald-600' : opt ? 'text-rose-600' : 'text-slate-400'}`}>
                          {opt ? opt.text : '미제출'}
                        </td>
                      </tr>
                    )
                  })}
                  {submissions.length === 0 && (
                    <tr>
                      <td colSpan={2} className="py-2 text-slate-400">
                        제출된 답변이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {correctOption && (
              <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                <span className="font-semibold">정답: </span>
                {correctOption.text}
                <br />
                <span className="font-semibold">근거: </span>
                {correctOption.rationale}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
