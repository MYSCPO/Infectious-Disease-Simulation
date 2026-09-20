import type { RoleId } from '../types'
import { ROLE_CHECKLISTS } from './roleChecklist'

// 대응3단계 릴레이 낭독 대사. ROLE_ORDER 순서(발생감시팀→예방관리팀→학사관리팀→행정지원팀→관리자)로
// 돌아가며 읽는다. 발생감시팀(담임교사)·예방관리팀(보건교사)은 「학교 감염병 대응 모의훈련
// 연수자료(수두)」 Ⅴ.대응3단계 시나리오의 실제 조치사항을 그대로 사용하고, 나머지 세 역할은
// 다른 단계와 동일하게 공통 체크리스트(ROLE_CHECKLISTS.response3)를 사용한다.
// keywords는 항목마다 하나씩 뽑은 핵심 단어로, 음성인식 정확도(보너스 지급) 판정 기준이다.
export interface RelayLine {
  items: string[]
  keywords: string[]
}

const RESPONSE3 = ROLE_CHECKLISTS.response3

export const RELAY_LINES: Record<RoleId, RelayLine> = {
  surveillance: {
    items: [
      '반 확진 학생 파악',
      '반 학생들의 결석·조퇴·지각 사유 확인과 (의심) 환자 파악',
      '매일 1교시 마치기 전까지 학년부장을 통해 보건교사에게 보고',
      '학생 감염병 관리조직을 활성화시켜 능동감시를 강화하면서 부장교사와 보건교사에게 통보',
      '추가 발견된 의심 학생에 대해 의료기관 진료를 안내하고 결과에 따라 등교중지 조치',
      '등교중지 학생에게 생활지도를 실시하고 필요한 행정조치를 학부모에게 안내',
    ],
    keywords: ['확진 학생', '능동감시', '등교중지'],
  },
  health: {
    items: [
      '유행 의심 상황 발생임을 학교장과 도교육청(NEIS)에 보고',
      '환자 발생 현황을 학교장과 교육청, 보건소에 보고',
      '매일 보건실 이용 학생의 감염병 증상 여부 확인',
      '(의심) 환자·완치자 등 일일 현황 집계',
      '미리 파악한 고위험군 명단을 활용하여, 고위험군이 노출되는 경우 학급교사를 통해 즉시 의료기관 진료를 받도록 안내(고위험군 교직원 포함)',
    ],
    keywords: ['도교육청', '현황 집계', '고위험군'],
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
