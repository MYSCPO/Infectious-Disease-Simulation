import type { RoleId } from '../types'

// 대응3단계 릴레이 낭독 대사. ROLE_ORDER 순서(발생감시팀→예방관리팀→학사관리팀→행정지원팀→관리자)로
// 돌아가며 읽으며, 감염병과 무관하게 3단계 체크리스트(ROLE_CHECKLISTS.response3)의 핵심 조치를
// 소리 내어 읽기 좋은 한 문장 선언문으로 다듬었다. keywords는 음성인식 통과·보너스 판정 기준이다.
export interface RelayLine {
  line: string
  keywords: string[]
}

export const RELAY_LINES: Record<RoleId, RelayLine> = {
  surveillance: {
    line: '발생감시팀은 능동감시 체계를 가동하여 확진환자 발생 추이를 매일 모니터링하겠습니다.',
    keywords: ['능동감시', '발생 추이', '모니터링'],
  },
  health: {
    line: '예방관리팀은 보건소에 역학조사를 요청하고 고위험군을 파악해 관리하겠습니다.',
    keywords: ['역학조사', '고위험군', '관리'],
  },
  academic: {
    line: '학사관리팀은 등교중지 학생의 수업 결손 대책을 마련하고 학사 일정을 조정하겠습니다.',
    keywords: ['등교중지', '수업 결손', '학사 일정'],
  },
  admin: {
    line: '행정지원팀은 교실과 보건실을 포함한 학교 시설을 주기적으로 소독하겠습니다.',
    keywords: ['소독', '학교 시설', '보건실'],
  },
  principal: {
    line: '관리자는 역학조사에 협조하고 휴업 필요성을 검토하여 최종 결정하겠습니다.',
    keywords: ['역학조사', '휴업', '최종 결정'],
  },
}
