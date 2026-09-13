import type { RoleId, SessionOrgChart } from '../types'
import { ROLE_LABELS, ROLE_ORDER } from '../types'

// 팀장을 흔히 맡는 직책 예시(고정 배정이 아니라 학교마다 유동적으로 운영됨을 안내하는 힌트일 뿐)
const ROLE_PLACEHOLDERS: Record<RoleId, string> = {
  surveillance: '예: 생활안전부장(학교마다 다를 수 있음)',
  health: '예: 보건교사',
  academic: '예: 교무부장',
  admin: '예: 행정실장',
  principal: '실제 교장 또는 교감 이름',
}

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
            placeholder={ROLE_PLACEHOLDERS[role]}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </label>
      ))}
    </div>
  )
}
