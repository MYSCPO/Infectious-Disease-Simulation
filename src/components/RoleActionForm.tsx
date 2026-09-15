import type { RoleId, RoleQuestion, SubmissionAnswer } from '../types'
import { ROLE_LABELS } from '../types'
import { ROLE_MASCOTS } from '../data/mascots'
import MascotAvatar from './MascotAvatar'

interface Props {
  questions: RoleQuestion[]
  myRole: RoleId | null
  answers: SubmissionAnswer[]
  onSelect: (role: RoleId, optionId: string) => void
  disabled: boolean
  revealed: boolean
}

export default function RoleActionForm({ questions, myRole, answers, onSelect, disabled, revealed }: Props) {
  const answerFor = (role: RoleId) => answers.find((a) => a.role === role)?.optionId

  return (
    <div className="space-y-4">
      {questions.map((q) => {
        const isMine = q.role === myRole
        const selected = answerFor(q.role)
        return (
          <div
            key={q.role}
            className={`rounded-2xl border p-4 ${
              isMine ? 'border-brand-300 bg-brand-50/40' : 'border-slate-200 bg-white opacity-90'
            }`}
          >
            <div className="flex items-start gap-2.5 mb-3">
              <MascotAvatar role={q.role} />
              <div className="relative flex-1 bg-paper-50 border border-slate-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-brand-700">
                    {ROLE_MASCOTS[q.role].name}
                    <span className="ml-1 font-normal text-slate-400">· {ROLE_LABELS[q.role]}</span>
                    {isMine ? <span className="ml-1 font-semibold text-brand-600">(내 역할)</span> : ''}
                  </span>
                  {!isMine && !selected && <span className="text-xs text-slate-400">아직 선택 전</span>}
                </div>
                <p className="text-sm sm:text-base font-medium text-slate-800">{q.prompt}</p>
              </div>
            </div>
            <div className="space-y-2">
              {q.options.map((opt) => {
                const isSelected = selected === opt.id
                const showResult = revealed
                let stateClass = 'border-slate-200 hover:border-brand-300'
                if (showResult) {
                  if (opt.correct) stateClass = 'border-emerald-400 bg-emerald-50'
                  else if (isSelected) stateClass = 'border-rose-300 bg-rose-50'
                  else stateClass = 'border-slate-100 opacity-60'
                } else if (isSelected) {
                  stateClass = 'border-brand-500 bg-brand-50'
                }
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={disabled || !isMine}
                    onClick={() => onSelect(q.role, opt.id)}
                    className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition ${stateClass} ${
                      disabled || !isMine ? 'cursor-default' : 'cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-0.5 shrink-0 h-4 w-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-brand-600 bg-brand-600' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>
                      <span className="flex-1">{opt.text}</span>
                      {showResult && opt.correct && <span className="text-emerald-600 text-xs font-semibold shrink-0">정답</span>}
                    </div>
                    {showResult && (isSelected || opt.correct) && (
                      <p className="mt-1.5 ml-6 text-xs text-slate-600">근거: {opt.rationale}</p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
