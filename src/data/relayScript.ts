import type { RoleId } from '../types'
import { ROLE_CHECKLISTS } from './roleChecklist'

// 대응3단계 릴레이 낭독 대사. ROLE_ORDER 순서(발생감시팀→예방관리팀→학사관리팀→행정지원팀→관리자)로
// 돌아가며 읽으며, 다른 단계의 체크리스트와 동일하게 3단계 체크리스트(ROLE_CHECKLISTS.response3)의
// 실제 조치 항목을 그대로 사용한다(한 문장으로 요약하지 않고 항목별로 소리 내어 읽는다).
// keywords는 항목마다 하나씩 뽑은 핵심 단어로, 음성인식 통과·보너스 판정 기준이다.
export interface RelayLine {
  items: string[]
  keywords: string[]
}

const RESPONSE3 = ROLE_CHECKLISTS.response3

export const RELAY_LINES: Record<RoleId, RelayLine> = {
  surveillance: {
    items: RESPONSE3.surveillance.items,
    keywords: ['능동감시', '확진 학생', '학생 명부'],
  },
  health: {
    items: RESPONSE3.health.items,
    keywords: ['역학조사', '가정통신문', '고위험군'],
  },
  academic: {
    items: RESPONSE3.academic.items,
    keywords: ['수업 결손', '학사일정표', '진료확인서'],
  },
  admin: {
    items: RESPONSE3.admin.items,
    keywords: ['환기', '소독', '시설 자료'],
  },
  principal: {
    items: RESPONSE3.principal.items,
    keywords: ['역학조사', '등교중지', '휴업'],
  },
}
