import { useEffect, useState } from 'react'
import type { RoleId, StageId } from '../types'
import { ROLE_LABELS, ROLE_ORDER } from '../types'
import { getChecklistForStage } from '../data/roleChecklist'
import { getStage } from '../data/stages'

const MS_PER_CHAR = 70
const MAX_TYPING_MS = 4000

export default function ChecklistPanel({
  stage,
  myRole,
  checkable = false,
  diseaseId,
  initialChecked,
  onProgress,
}: {
  stage: StageId
  myRole: RoleId | null
  checkable?: boolean
  diseaseId?: string
  initialChecked?: number[]
  onProgress?: (checkedIndexes: number[]) => void
}) {
  const [open, setOpen] = useState(true)
  const [checked, setChecked] = useState<Set<string>>(
    () => new Set(myRole ? (initialChecked ?? []).map((i) => `${myRole}-${i}`) : []),
  )

  function report(next: Set<string>) {
    if (!myRole || !onProgress) return
    const prefix = `${myRole}-`
    onProgress([...next].filter((k) => k.startsWith(prefix)).map((k) => Number(k.slice(prefix.length))))
  }
  const checklist = getChecklistForStage(stage, diseaseId)
  const stageDef = getStage(stage)

  // 체크를 누르면 바로 체크되지 않고, 흐린 문장이 읽는 속도(초당 약 14자, 최대 4초)로 앞에서부터 진하게
  // 채워진 뒤 체크가 완성된다. 문장을 따라 읽으며 내 역할의 조치를 한 번 더 새기게 하려는 장치.
  const [typing, setTyping] = useState<{ key: string; text: string; shown: number } | null>(null)

  useEffect(() => {
    if (!typing) return
    if (typing.shown >= typing.text.length) {
      const next = new Set(checked).add(typing.key)
      setChecked(next)
      report(next)
      setTyping(null)
      return
    }
    const perChar = Math.min(MS_PER_CHAR, MAX_TYPING_MS / typing.text.length)
    const id = window.setTimeout(() => setTyping((t) => (t ? { ...t, shown: t.shown + 1 } : t)), perChar)
    return () => window.clearTimeout(id)
  }, [typing])

  function toggleItem(key: string, text: string) {
    if (typing) return
    if (checked.has(key)) {
      const next = new Set(checked)
      next.delete(key)
      setChecked(next)
      report(next)
      return
    }
    setTyping({ key, text, shown: 0 })
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
              {checkable && isMine && content.items.length > 0 && (
                <p className="text-[11px] text-brand-600 mb-1.5">✏️ 체크를 누르면 문장이 읽는 속도로 채워져요. 함께 따라 읽어 보세요.</p>
              )}
              {content.items.length > 0 ? (
                checkable && isMine ? (
                  <ul className="text-xs space-y-1.5">
                    {content.items.map((item, i) => {
                      const key = `${role}-${i}`
                      const done = checked.has(key)
                      const isTyping = typing?.key === key
                      return (
                        <li key={i}>
                          <label className={`flex items-start gap-2 ${typing && !isTyping ? 'cursor-wait' : 'cursor-pointer'}`}>
                            <input
                              type="checkbox"
                              checked={done}
                              disabled={!!typing && !isTyping}
                              onChange={() => toggleItem(key, item)}
                              className={`mt-0.5 w-4 h-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-400 ${isTyping ? 'animate-pulse ring-2 ring-brand-300' : ''}`}
                            />
                            {isTyping ? (
                              <span className="font-bold">
                                <span className="text-brand-700">{item.slice(0, typing.shown)}</span>
                                <span className="text-slate-300">{item.slice(typing.shown)}</span>
                              </span>
                            ) : (
                              <span className={done ? 'text-emerald-700 font-bold' : 'text-slate-400'}>{item}</span>
                            )}
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
