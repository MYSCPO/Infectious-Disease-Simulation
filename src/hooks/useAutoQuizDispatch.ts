import { useEffect } from 'react'
import type { SessionDoc } from '../types'
import { AUTO_QUIZ_DELAY_SEC, AUTO_QUIZ_PLAN } from '../data/autoQuiz'
import { isAwaitingTrainingStart, startWildcardQuiz, updateSession } from '../lib/session'

// 단계 진입 후 일정 시간이 지나면 그 단계에 맞는 돌발 퀴즈가 자동으로 나가도록 하는 타이머.
// 진행자 화면과 참가자 화면 양쪽에서 이 훅을 쓴다 — 진행자가 참가자 화면을 보러 이동해서
// 진행자 탭이 잠시 없어지거나, 진행자 탭 자체가 닫혀 있어도 열려 있는 참가자 기기 중 아무거나
// 하나만 있으면 자동 발송이 끊기지 않는다. 여러 기기가 동시에 이 타이머를 갖고 있어도
// autoQuizSentAt 가드 덕분에 중복 발송되지 않는다(먼저 쓴 기기가 이기고 나머지는 무시됨).
export function useAutoQuizDispatch(code: string, session: SessionDoc | null | undefined) {
  useEffect(() => {
    if (!session) return
    if (isAwaitingTrainingStart(session)) return
    const plan = AUTO_QUIZ_PLAN[session.currentStage]
    if (!plan) return
    if (session.stageStartedAt == null) return
    if (session.autoQuizSentAt === session.stageStartedAt) return
    if (session.activeQuiz) return

    const stageStartedAt = session.stageStartedAt
    const remainingMs = AUTO_QUIZ_DELAY_SEC * 1000 - (Date.now() - stageStartedAt)

    const id = setTimeout(async () => {
      await startWildcardQuiz(code, plan.quizType, plan.source)
      await updateSession(code, { autoQuizSentAt: stageStartedAt })
    }, Math.max(0, remainingMs))

    return () => clearTimeout(id)
  }, [code, session?.currentStage, session?.stageStartedAt, session?.trainingStartedAt, session?.autoQuizSentAt, !!session?.activeQuiz])
}
