import type { QuizSource, QuizType, StageId } from '../types'

// 진행자가 매 단계 수동으로 돌발 퀴즈를 챙기지 않아도, 단계 진입 후 일정 시간이 지나면
// 자동으로 발송되도록 하는 단계별 계획. 대응3단계는 릴레이+최종 퀴즈가 이미 그 역할을 하므로
// 자동 발송 대상에서 제외한다.
export const AUTO_QUIZ_DELAY_SEC = 25

export const AUTO_QUIZ_PLAN: Partial<Record<StageId, { quizType: QuizType; source: QuizSource }>> = {
  prevention: { quizType: 'speed', source: 'disease' },
  response1: { quizType: 'coop', source: 'disease' },
  response2: { quizType: 'speed', source: 'disease' },
  recovery: { quizType: 'speed', source: 'common' },
}
