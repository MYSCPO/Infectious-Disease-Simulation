import type { SessionGaps, SessionOrgChart } from '../types'
import { ROLE_LABELS, ROLE_ORDER } from '../types'

export interface GapItem {
  key: string
  label: string
}

// PRD: "우리 학교의 대응 공백(관찰실 위치, 담임 공백 대체, 주말 연락 체계 등)을 훈련 중에 확인해 가이드북으로 남긴다."
export function detectGaps(orgChart: SessionOrgChart, gaps: SessionGaps): GapItem[] {
  const found: GapItem[] = []

  for (const role of ROLE_ORDER) {
    if (!orgChart[role]?.trim()) {
      found.push({ key: `org_${role}`, label: `${ROLE_LABELS[role]} 담당자가 조직도에 지정되지 않았습니다.` })
    }
  }

  if (!gaps.observationRoomLocation?.trim()) {
    found.push({ key: 'observationRoom', label: '일시적 관찰실(격리 공간) 위치가 지정되지 않았습니다.' })
  }
  if (!gaps.homeroomBackupPlan?.trim()) {
    found.push({ key: 'homeroomBackup', label: '담임교사 공백(이동·격리) 시 대체 인력 계획이 없습니다.' })
  }
  if (!gaps.weekendContactSystem?.trim()) {
    found.push({ key: 'weekendContact', label: '주말·휴일 비상 연락 체계가 마련되어 있지 않습니다.' })
  }

  return found
}
