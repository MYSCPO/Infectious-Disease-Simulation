export interface RelayFinalQuizOption {
  id: string
  text: string
  correct: boolean
}

export interface RelayFinalQuizQuestion {
  prompt: string
  options: RelayFinalQuizOption[]
}

// 대응3단계 릴레이 완주 후 "관리자(교장·교감)" 대표가 조원과 상의해 제출하는 최종 의사결정 퀴즈.
// 감염병별 3단계 특성(전파 경로·조직 가동 시 핵심 판단 주체)에 맞게 개별 출제한다.
export const RELAY_FINAL_QUIZZES: Record<string, RelayFinalQuizQuestion> = {
  chickenpox: {
    prompt: '동일 학급 내 수두 확진자 2명 발생으로 3단계 전환 시, 발생감시팀(담임교사)이 가장 먼저 가동해야 하는 학급 단위 모니터링 체계는?',
    options: [
      { id: 'a', text: '학급 내 전체 학생 대상 능동감시(일일 증상 관찰 및 보건실 보고) 실시', correct: true },
      { id: 'b', text: '확진 학생의 짝꿍만 개별적으로 관찰', correct: false },
      { id: 'c', text: '다음 학기까지 특별한 조치 없이 관찰', correct: false },
      { id: 'd', text: '전교생 등교를 즉시 중지', correct: false },
    ],
  },
  influenza: {
    prompt: '인플루엔자 확진자가 학급 내 다수 발생하여 3단계 학생 감염병 관리 조직이 가동되었을 때, 단축수업 또는 자체 휴업 실시 필요성을 최종 검토하고 결정하는 주체는?',
    options: [
      { id: 'a', text: '학교장', correct: true },
      { id: 'b', text: '담임교사', correct: false },
      { id: 'c', text: '보건교사', correct: false },
      { id: 'd', text: '교육청 담당자', correct: false },
    ],
  },
  mumps: {
    prompt: '유행성이하선염 확진자가 2명 이상 발생해 3단계로 전환되었을 때, 예방관리팀(보건교사)이 보건소에 우선 요청해야 할 것은?',
    options: [
      { id: 'a', text: '역학조사 요청 및 고위험군 파악·관리 조치 요청', correct: true },
      { id: 'b', text: '전교생 MMR 재접종 지시', correct: false },
      { id: 'c', text: '학교 전체 휴업 승인 요청', correct: false },
      { id: 'd', text: '급식 중단 요청', correct: false },
    ],
  },
  epidemicKeratoconjunctivitis: {
    prompt: '유행성각결막염 의심 학생이 여러 학급에서 확인되어 3단계에 준하는 대응이 필요할 때, 등교중지 여부를 학부모와 상의해 최종 조율하는 주체는?',
    options: [
      { id: 'a', text: '학교장(관리자)', correct: true },
      { id: 'b', text: '보건소장', correct: false },
      { id: 'c', text: '교육청 담당 장학사', correct: false },
      { id: 'd', text: '같은 반 학부모 대표', correct: false },
    ],
  },
  handFootMouth: {
    prompt: '수족구병 의심 어린이가 여러 학급·병설유치원에서 확인되어 3단계 대응이 필요할 때, 학사관리팀(교무부장)이 조정해야 할 핵심 업무는?',
    options: [
      { id: 'a', text: '역학조사 대비 교직원 명부·학사일정표 준비 및 수업 결손 대책 조정', correct: true },
      { id: 'b', text: '전체 급식 메뉴 전면 교체', correct: false },
      { id: 'c', text: '모든 어린이 즉시 하원 조치', correct: false },
      { id: 'd', text: '장난감을 전량 폐기', correct: false },
    ],
  },
  pertussis: {
    prompt: '백일해 확진자가 2명 이상 발생해 전파력이 높은 상황에서 3단계로 전환되었을 때, 발생감시팀이 매일 모니터링해야 할 대상으로 가장 적절한 것은?',
    options: [
      { id: 'a', text: '확진자와 접촉한 학급 및 형제자매가 있는 저학년 학급의 발생 추이', correct: true },
      { id: 'b', text: '전교생의 급식 섭취량', correct: false },
      { id: 'c', text: '확진 학생의 성적 변화', correct: false },
      { id: 'd', text: '교직원의 휴가 사용 현황', correct: false },
    ],
  },
  scarletFever: {
    prompt: '성홍열 확진자가 2명 이상 발생해 3단계로 전환되었을 때, 관리자(교장·교감)가 최종적으로 검토·판단해야 할 사항은?',
    options: [
      { id: 'a', text: '역학조사 협조 및 추가 확산 시 휴업 필요성 검토', correct: true },
      { id: 'b', text: '전교생 항생제 예방 복용 지시', correct: false },
      { id: 'c', text: '급식실 즉시 폐쇄', correct: false },
      { id: 'd', text: '확진 학생의 전학 처리', correct: false },
    ],
  },
}

export function getRelayFinalQuiz(diseaseId: string): RelayFinalQuizQuestion {
  return RELAY_FINAL_QUIZZES[diseaseId] ?? RELAY_FINAL_QUIZZES.influenza
}
