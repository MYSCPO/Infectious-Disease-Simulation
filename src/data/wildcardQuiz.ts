export interface WildcardQuizOption {
  id: string
  text: string
  correct: boolean
}

export interface WildcardQuizQuestion {
  topic: string // 출제 영역 라벨(질병 특징/잠복기/등교중지 기준/예방·소독 지침)
  prompt: string
  options: WildcardQuizOption[]
}

// 돌발 퀴즈: 진행자가 발송하면 전 조에 동시에 뜨고, 조가 맡은 감염병에 맞는 문제 은행에서
// 하나가 자동으로 매칭된다(순수 지식 퀴즈 — 상황극 서술형 문제는 제외). 근거는
// src/data/diseases.ts에 이미 검증된 수치·수칙을 그대로 사용한다.
export const WILDCARD_QUIZZES: Record<string, WildcardQuizQuestion[]> = {
  influenza: [
    {
      topic: '등교중지 기준',
      prompt: '인플루엔자 학생은 해열제 없이 정상 체온으로 회복된 후, 몇 시간이 지나야 등교할 수 있을까요?',
      options: [
        { id: 'a', text: '12시간', correct: false },
        { id: 'b', text: '24시간', correct: true },
        { id: 'c', text: '48시간', correct: false },
        { id: 'd', text: '72시간', correct: false },
      ],
    },
    {
      topic: '질병 특징',
      prompt: '인플루엔자의 대표 증상으로 가장 옳은 것은?',
      options: [
        { id: 'a', text: '38도 이상 고열, 두통, 인후통, 근육통', correct: true },
        { id: 'b', text: '눈 충혈과 눈곱만 심함', correct: false },
        { id: 'c', text: '구토와 설사가 주 증상', correct: false },
        { id: 'd', text: '손·발·입안의 수포성 발진', correct: false },
      ],
    },
    {
      topic: '잠복기',
      prompt: '인플루엔자의 잠복기는 보통 며칠일까요?',
      options: [
        { id: 'a', text: '1~4일', correct: true },
        { id: 'b', text: '10~21일', correct: false },
        { id: 'c', text: '2~3주', correct: false },
        { id: 'd', text: '수년까지 가능', correct: false },
      ],
    },
    {
      topic: '예방·소독 지침',
      prompt: '인플루엔자 예방을 위해 가장 중요한 것은?',
      options: [
        { id: 'a', text: '매년 인플루엔자 예방접종', correct: true },
        { id: 'b', text: '특별한 예방법이 없다', correct: false },
        { id: 'c', text: '항생제를 매일 복용한다', correct: false },
        { id: 'd', text: '염소계 소독제로 매일 전신 소독', correct: false },
      ],
    },
  ],
  chickenpox: [
    {
      topic: '등교중지 기준',
      prompt: '수두 학생의 등교중지 기준은 무엇일까요?',
      options: [
        { id: 'a', text: '발열이 없어질 때까지', correct: false },
        { id: 'b', text: '모든 피부 병변에 가피(딱지)가 형성될 때까지', correct: true },
        { id: 'c', text: '진단서를 제출할 때까지', correct: false },
        { id: 'd', text: '무조건 3일간', correct: false },
      ],
    },
    {
      topic: '질병 특징',
      prompt: '수두의 대표 증상으로 가장 옳은 것은?',
      options: [
        { id: 'a', text: '두피·안면·몸통·팔다리로 퍼지는 수포성 발진', correct: true },
        { id: 'b', text: '급성 구토와 설사', correct: false },
        { id: 'c', text: '귀밑 침샘 부종', correct: false },
        { id: 'd', text: '2주 이상 지속되는 기침', correct: false },
      ],
    },
    {
      topic: '잠복기',
      prompt: '수두의 잠복기는 보통 며칠일까요?',
      options: [
        { id: 'a', text: '10~21일', correct: true },
        { id: 'b', text: '1~4일', correct: false },
        { id: 'c', text: '12~48시간', correct: false },
        { id: 'd', text: '5~7일', correct: false },
      ],
    },
    {
      topic: '예방·소독 지침',
      prompt: '예방접종력이 없는 학생은 수두 환자 노출 후 며칠 이내 백신 접종이 권장될까요?',
      options: [
        { id: 'a', text: '가능한 3일(최대 5일) 이내', correct: true },
        { id: 'b', text: '노출 후에는 접종해도 소용없다', correct: false },
        { id: 'c', text: '2주 이내', correct: false },
        { id: 'd', text: '1개월 이내', correct: false },
      ],
    },
  ],
  mumps: [
    {
      topic: '등교중지 기준',
      prompt: '유행성이하선염(볼거리)은 이하선염 증상 발생 후 며칠까지 등교를 중지해야 할까요?',
      options: [
        { id: 'a', text: '3일까지', correct: false },
        { id: 'b', text: '5일까지', correct: true },
        { id: 'c', text: '7일까지', correct: false },
        { id: 'd', text: '10일까지', correct: false },
      ],
    },
    {
      topic: '질병 특징',
      prompt: '유행성이하선염의 대표 증상으로 가장 옳은 것은?',
      options: [
        { id: 'a', text: '귀밑 침샘(이하선) 부종과 씹거나 삼킬 때 통증', correct: true },
        { id: 'b', text: '손·발·입안의 수포성 발진', correct: false },
        { id: 'c', text: '38도 이상 고열과 근육통만', correct: false },
        { id: 'd', text: '급성 구토와 설사', correct: false },
      ],
    },
    {
      topic: '잠복기',
      prompt: '유행성이하선염의 잠복기는 보통 어느 정도일까요?',
      options: [
        { id: 'a', text: '2~3주', correct: true },
        { id: 'b', text: '1~4일', correct: false },
        { id: 'c', text: '10~21일', correct: false },
        { id: 'd', text: '12~48시간', correct: false },
      ],
    },
    {
      topic: '예방·소독 지침',
      prompt: '유행성이하선염 예방을 위해 반드시 확인해야 할 것은?',
      options: [
        { id: 'a', text: 'MMR 예방접종 완료 여부', correct: true },
        { id: 'b', text: 'BCG 접종 여부', correct: false },
        { id: 'c', text: '매년 독감 접종 여부', correct: false },
        { id: 'd', text: '염소계 소독제 사용 여부', correct: false },
      ],
    },
  ],
  epidemicKeratoconjunctivitis: [
    {
      topic: '등교중지 기준',
      prompt: '유행성각결막염은 법정감염병이라서 강제로 등교를 중지시켜야 한다? (O/X)',
      options: [
        { id: 'o', text: 'O — 법정감염병이라 강제 격리해야 한다', correct: false },
        { id: 'x', text: 'X — 비법정감염병이라 강제 격리 없이 개인위생 수칙만 안내한다', correct: true },
      ],
    },
    {
      topic: '질병 특징',
      prompt: '유행성각결막염의 대표 증상으로 가장 옳은 것은?',
      options: [
        { id: 'a', text: '충혈, 눈곱, 이물감, 눈물(한쪽에서 양쪽으로 번짐)', correct: true },
        { id: 'b', text: '38도 이상 고열과 인후통', correct: false },
        { id: 'c', text: '급성 구토와 설사', correct: false },
        { id: 'd', text: '손·발·입안의 수포성 발진', correct: false },
      ],
    },
    {
      topic: '잠복기',
      prompt: '유행성각결막염의 잠복기는 보통 며칠일까요?',
      options: [
        { id: 'a', text: '5~7일', correct: true },
        { id: 'b', text: '1~4일', correct: false },
        { id: 'c', text: '10~21일', correct: false },
        { id: 'd', text: '2~3주', correct: false },
      ],
    },
    {
      topic: '예방·소독 지침',
      prompt: '유행성각결막염 예방을 위해 가장 중요한 것은?',
      options: [
        { id: 'a', text: '개인 수건 사용, 눈 만지지 않기', correct: true },
        { id: 'b', text: '마스크 2중 착용', correct: false },
        { id: 'c', text: '예방접종', correct: false },
        { id: 'd', text: '항생제 예방 복용', correct: false },
      ],
    },
  ],
  handFootMouth: [
    {
      topic: '등교중지 기준',
      prompt: '수족구병은 수포 발생 후 며칠간 등교중지가 권고될까요?',
      options: [
        { id: 'a', text: '3일간', correct: false },
        { id: 'b', text: '6일간', correct: true },
        { id: 'c', text: '10일간', correct: false },
        { id: 'd', text: '14일간', correct: false },
      ],
    },
    {
      topic: '질병 특징',
      prompt: '수족구병의 대표 증상으로 가장 옳은 것은?',
      options: [
        { id: 'a', text: '손·발·입안의 수포성 발진과 섭식 곤란', correct: true },
        { id: 'b', text: '38도 이상 고열과 인후통만', correct: false },
        { id: 'c', text: '귀밑 침샘 부종', correct: false },
        { id: 'd', text: '급성 구토와 설사만', correct: false },
      ],
    },
    {
      topic: '잠복기',
      prompt: '수족구병의 잠복기는 보통 며칠일까요?',
      options: [
        { id: 'a', text: '3~6일', correct: true },
        { id: 'b', text: '12~48시간', correct: false },
        { id: 'c', text: '10~21일', correct: false },
        { id: 'd', text: '2~3주', correct: false },
      ],
    },
    {
      topic: '예방·소독 지침',
      prompt: '수족구병 예방을 위해 특히 중요한 것은?',
      options: [
        { id: 'a', text: '장난감·집기 소독 및 손 씻기', correct: true },
        { id: 'b', text: '항생제 예방 복용', correct: false },
        { id: 'c', text: '마스크 2중 착용', correct: false },
        { id: 'd', text: '해열제 매일 복용', correct: false },
      ],
    },
  ],
  pertussis: [
    {
      topic: '등교중지 기준',
      prompt: '백일해는 적절한 항생제 치료를 받은 경우, 투약 후 며칠까지 등교를 중지해야 할까요?',
      options: [
        { id: 'a', text: '3일까지', correct: false },
        { id: 'b', text: '5일까지', correct: true },
        { id: 'c', text: '10일까지', correct: false },
        { id: 'd', text: '치료해도 최소 3주까지', correct: false },
      ],
    },
    {
      topic: '질병 특징',
      prompt: '백일해의 대표 증상으로 가장 옳은 것은?',
      options: [
        { id: 'a', text: "발작성 기침과 기침 후 '훕(Whoop)' 소리", correct: true },
        { id: 'b', text: '눈 충혈과 눈곱', correct: false },
        { id: 'c', text: '손·발·입안의 수포성 발진', correct: false },
        { id: 'd', text: '급성 구토와 설사', correct: false },
      ],
    },
    {
      topic: '잠복기',
      prompt: '백일해의 잠복기는 보통 며칠일까요?',
      options: [
        { id: 'a', text: '7~10일', correct: true },
        { id: 'b', text: '1~4일', correct: false },
        { id: 'c', text: '10~21일', correct: false },
        { id: 'd', text: '2~3주', correct: false },
      ],
    },
    {
      topic: '예방·소독 지침',
      prompt: '백일해 예방을 위해 반드시 확인해야 할 예방접종은?',
      options: [
        { id: 'a', text: 'DTaP/Tdap 접종 여부', correct: true },
        { id: 'b', text: 'MMR 접종 여부', correct: false },
        { id: 'c', text: 'BCG 접종 여부', correct: false },
        { id: 'd', text: '매년 독감 접종 여부', correct: false },
      ],
    },
  ],
  scarletFever: [
    {
      topic: '등교중지 기준',
      prompt: '성홍열은 항생제 치료를 시작한 후 몇 시간이 지나야 등교할 수 있을까요?',
      options: [
        { id: 'a', text: '12시간', correct: false },
        { id: 'b', text: '24시간', correct: true },
        { id: 'c', text: '48시간', correct: false },
        { id: 'd', text: '72시간', correct: false },
      ],
    },
    {
      topic: '질병 특징',
      prompt: '성홍열의 대표 증상으로 가장 옳은 것은?',
      options: [
        { id: 'a', text: '갑작스러운 발열, 전신 선홍색 발진, 딸기혀', correct: true },
        { id: 'b', text: '귀밑 침샘(이하선) 부종', correct: false },
        { id: 'c', text: '손·발·입안의 수포성 발진', correct: false },
        { id: 'd', text: '급성 구토와 설사', correct: false },
      ],
    },
    {
      topic: '잠복기',
      prompt: '성홍열의 잠복기는 보통 며칠일까요?',
      options: [
        { id: 'a', text: '1~7일(평균 2~5일)', correct: true },
        { id: 'b', text: '10~21일', correct: false },
        { id: 'c', text: '2~3주', correct: false },
        { id: 'd', text: '12~48시간', correct: false },
      ],
    },
    {
      topic: '예방·소독 지침',
      prompt: '성홍열 예방을 위해 특히 주의해야 할 것은?',
      options: [
        { id: 'a', text: '수저·컵·타월 등 개인 물품 공유 금지', correct: true },
        { id: 'b', text: '전용 예방접종을 반드시 맞는다', correct: false },
        { id: 'c', text: '항생제를 미리 예방적으로 복용한다', correct: false },
        { id: 'd', text: '마스크 착용은 필요 없다', correct: false },
      ],
    },
  ],
}

export function getWildcardQuiz(diseaseId: string, seed: number): WildcardQuizQuestion | null {
  const list = WILDCARD_QUIZZES[diseaseId]
  if (!list || list.length === 0) return null
  const idx = Math.abs(Math.floor(seed)) % list.length
  return list[idx]
}

export function getWildcardQuizCount(diseaseId: string): number {
  return WILDCARD_QUIZZES[diseaseId]?.length ?? 0
}

// 보너스 퀴즈: 감염병 종류와 무관하게 전 조에 동일한 문제가 나가는 공통 지식 문제은행.
// 근거: 「학교 감염병 예방·위기대응 매뉴얼」 Ⅲ. 등교 중지(출석 인정 원칙·제출 서류 등).
export const COMMON_WILDCARD_QUIZZES: WildcardQuizQuestion[] = [
  {
    topic: '출결 처리',
    prompt: '등교중지가 필요한 감염병이 의심되어 학교에 가지 못한 기간, 진료 결과 감염병이 아니었던 것으로 확인됐다면 그 기간은 어떻게 처리될까요?',
    options: [
      { id: 'a', text: '결과 확인까지의 기간도 출석으로 인정된다', correct: true },
      { id: 'b', text: '무단결석으로 처리된다', correct: false },
      { id: 'c', text: '조퇴로 처리된다', correct: false },
      { id: 'd', text: '학교장 재량으로 매번 다르게 처리된다', correct: false },
    ],
  },
  {
    topic: '제출 서류',
    prompt: '등교중지 학생이 등교를 재개할 때 제출 서류로 인정되지 않는 것은?',
    options: [
      { id: 'a', text: '진료확인서', correct: false },
      { id: 'b', text: '의사소견서', correct: false },
      { id: 'c', text: '학부모가 직접 작성한 확인 메모', correct: true },
      { id: 'd', text: '진단서', correct: false },
    ],
  },
  {
    topic: '등교중지 원칙',
    prompt: '신종감염병 유행 시 역학조사 결과 자가격리 통보를 받은 학생은, 증상이 없어도 등교중지 대상이다? (O/X)',
    options: [
      { id: 'o', text: 'O — 증상 유무와 무관하게 등교중지 실시', correct: true },
      { id: 'x', text: 'X — 증상이 없으면 등교중지 대상이 아니다', correct: false },
    ],
  },
]

export function getCommonWildcardQuiz(seed: number): WildcardQuizQuestion {
  const idx = Math.abs(Math.floor(seed)) % COMMON_WILDCARD_QUIZZES.length
  return COMMON_WILDCARD_QUIZZES[idx]
}

export function getCommonWildcardQuizCount(): number {
  return COMMON_WILDCARD_QUIZZES.length
}
