export interface WildcardQuizOption {
  id: string
  text: string
  correct: boolean
}

export interface WildcardQuizQuestion {
  prompt: string
  options: WildcardQuizOption[]
}

// 돌발 퀴즈: 진행자가 발송하면 전 조에 동시에 뜨고, 조가 맡은 감염병에 맞는 문제가 자동으로 매칭된다.
// 정답 근거는 src/data/diseases.ts의 exclusionPeriod 등 이미 검증된 수치를 그대로 사용한다.
export const WILDCARD_QUIZZES: Record<string, WildcardQuizQuestion> = {
  influenza: {
    prompt: '인플루엔자 학생은 해열제 없이 정상 체온으로 회복된 후, 몇 시간이 지나야 등교할 수 있을까요?',
    options: [
      { id: 'a', text: '12시간', correct: false },
      { id: 'b', text: '24시간', correct: true },
      { id: 'c', text: '48시간', correct: false },
      { id: 'd', text: '72시간', correct: false },
    ],
  },
  chickenpox: {
    prompt: '수두 학생의 등교중지 기준은 무엇일까요?',
    options: [
      { id: 'a', text: '발열이 없어질 때까지', correct: false },
      { id: 'b', text: '모든 피부 병변에 가피(딱지)가 형성될 때까지', correct: true },
      { id: 'c', text: '진단서를 제출할 때까지', correct: false },
      { id: 'd', text: '무조건 3일간', correct: false },
    ],
  },
  mumps: {
    prompt: '유행성이하선염(볼거리)은 이하선염 증상 발생 후 며칠까지 등교를 중지해야 할까요?',
    options: [
      { id: 'a', text: '3일까지', correct: false },
      { id: 'b', text: '5일까지', correct: true },
      { id: 'c', text: '7일까지', correct: false },
      { id: 'd', text: '10일까지', correct: false },
    ],
  },
  epidemicKeratoconjunctivitis: {
    prompt: '유행성각결막염은 법정감염병이라서 강제로 등교를 중지시켜야 한다? (O/X)',
    options: [
      { id: 'o', text: 'O — 법정감염병이라 강제 격리해야 한다', correct: false },
      { id: 'x', text: 'X — 비법정감염병이라 강제 격리 없이 개인위생 수칙만 안내한다', correct: true },
    ],
  },
  tuberculosis: {
    prompt: '결핵 학생은 치료 시작 후 보통 며칠 이상 지나야(담당 의사 확인 후) 등교가 가능할까요?',
    options: [
      { id: 'a', text: '1주 이상', correct: false },
      { id: 'b', text: '2주 이상', correct: true },
      { id: 'c', text: '1개월 이상', correct: false },
      { id: 'd', text: '6개월 이상', correct: false },
    ],
  },
  norovirus: {
    prompt: '노로바이러스감염증은 구토·설사 증상이 완전히 사라진 후, 몇 시간이 지나야 등교할 수 있을까요?',
    options: [
      { id: 'a', text: '12시간', correct: false },
      { id: 'b', text: '24시간', correct: false },
      { id: 'c', text: '48시간', correct: true },
      { id: 'd', text: '72시간', correct: false },
    ],
  },
  handFootMouth: {
    prompt: '수족구병은 수포 발생 후 며칠간 등교중지가 권고될까요?',
    options: [
      { id: 'a', text: '3일간', correct: false },
      { id: 'b', text: '6일간', correct: true },
      { id: 'c', text: '10일간', correct: false },
      { id: 'd', text: '14일간', correct: false },
    ],
  },
}

export function getWildcardQuiz(diseaseId: string): WildcardQuizQuestion | null {
  return WILDCARD_QUIZZES[diseaseId] ?? null
}
