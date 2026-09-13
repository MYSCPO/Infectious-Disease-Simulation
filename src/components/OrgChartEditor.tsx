import type { SessionOrgChart } from '../types'
import { ROLE_LABELS, ROLE_ORDER } from '../types'

export default function OrgChartEditor({
  value,
  onChange,
}: {
  value: SessionOrgChart
  onChange: (next: SessionOrgChart) => void
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {ROLE_ORDER.map((role) => (
        <label key={role} className="block">
          <span className="text-sm font-medium text-slate-700">{ROLE_LABELS[role]}</span>
          <input
            type="text"
            value={value[role]}
            onChange={(e) => onChange({ ...value, [role]: e.target.value })}
            placeholder={role === 'principal' ? '실제 교장 또는 교감 이름' : '담당 교직원 이름'}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </label>
      ))}
    </div>
  )
}
