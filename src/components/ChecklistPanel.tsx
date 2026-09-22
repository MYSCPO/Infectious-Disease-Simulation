import { useState } from 'react'
import type { RoleId, StageId } from '../types'
import { ROLE_LABELS, ROLE_ORDER } from '../types'
import { ROLE_CHECKLISTS } from '../data/roleChecklist'
import { getStage } from '../data/stages'

export default function ChecklistPanel({
  stage,
  myRole,
  checkable = false,
}: {
  stage: StageId
  myRole: RoleId | null
  checkable?: boolean
}) {
  const [open, setOpen] = useState(true)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const checklist = ROLE_CHECKLISTS[stage]
  const stageDef = getStage(stage)

  function toggleItem(key: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 lg:pointer-events-none"
      >
        <div>
          <div className="text-xs font-semibold text-brand-600 uppercase tracking-wide">구성원별 대응 체크리스트</div>
          <div className="text-sm font-bold text-slate-800">{stageDef.shortLabel} · {checklist[ROLE_ORDER[0]].situation}</div>
        </div>
        <span className="text-slate-400 lg:hidden">{open ? '▲' : '▼'}</span>
      </button>
      <div className={`${open ? 'block' : 'hidden'} lg:block px-4 pb-4 space-y-3 max-h-[70vh] overflow-y-auto`}>
        {ROLE_ORDER.map((role) => {
          const content = checklist[role]
          const isMine = role === myRole
          return (
            <div
              key={role}
              className={`rounded-lg border p-3 ${isMine ? 'border-brand-300 bg-brand-50/50' : 'border-slate-100 bg-slate-50'}`}
            >
              <div className={`text-sm font-semibold mb-1 ${isMine ? 'text-brand-700' : 'text-slate-700'}`}>
                {ROLE_LABELS[role]} {isMine && '(내 역할)'}
              </div>
              {content.items.length > 0 ? (
                checkable && isMine ? (
                  <ul className="text-xs space-y-1.5">
                    {content.items.map((item, i) => {
                      const key = `${role}-${i}`
                      const done = checked.has(key)
                      return (
                        <li key={i}>
                          <label className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={done}
                              onChange={() => toggleItem(key)}
                              className="mt-0.5 w-4 h-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                            />
                            <span className={done ? 'text-emerald-700 font-bold' : 'text-slate-600'}>{item}</span>
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                    {content.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )
              ) : (
                <p className="text-xs text-slate-400">이 단계에서 별도로 명시된 조치가 없습니다.</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
