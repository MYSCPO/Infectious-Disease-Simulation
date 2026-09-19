import { useState } from 'react'
import type { RoleId, StageId } from '../types'
import { ROLE_LABELS, ROLE_ORDER } from '../types'
import { ROLE_CHECKLISTS } from '../data/roleChecklist'
import { getStage } from '../data/stages'

export default function ChecklistPanel({
  stage,
  myRole,
  title = '구성원별 대응 체크리스트',
  roleLabels = ROLE_LABELS,
}: {
  stage: StageId
  myRole: RoleId | null
  title?: string
  roleLabels?: Record<RoleId, string>
}) {
  const [open, setOpen] = useState(true)
  const checklist = ROLE_CHECKLISTS[stage]
  const stageDef = getStage(stage)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 lg:pointer-events-none"
      >
        <div>
          <div className="text-xs font-semibold text-brand-600 uppercase tracking-wide">{title}</div>
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
                {roleLabels[role]} {isMine && '(나)'}
              </div>
              {content.items.length > 0 ? (
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  {content.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
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
