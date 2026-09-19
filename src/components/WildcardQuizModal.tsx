import { useEffect, useState } from 'react'
import type { DiseaseInfo, GroupCoopProgress, GroupQuizAnswer, RoleId } from '../types'
import type { WildcardQuizQuestion } from '../data/wildcardQuiz'
import DiseaseManualModal from './DiseaseManualModal'

const RESULT_AUTO_CLOSE_MS = 3000

interface SpeedProps {
  quizType: 'speed'
  alreadyAnswered: GroupQuizAnswer | null
  isFirstBlood: boolean
  firstBloodGroupName: string | null
  onSubmit: (correct: boolean) => void
  onClose: () => void
}

interface CoopProps {
  quizType: 'coop'
  myName: string
  memberNames: string[]
  coopProgress: GroupCoopProgress | null
  onSubmit: (correct: boolean) => void
  onClose: () => void
}

type ModeProps = SpeedProps | CoopProps

export default function WildcardQuizModal({
  quiz,
  disease,
  greetRole,
  startedAt,
  durationSec,
  ...mode
}: {
  quiz: WildcardQuizQuestion
  disease: DiseaseInfo
  greetRole: RoleId | null
  startedAt: number
  durationSec: number
} & ModeProps) {
  const [now, setNow] = useState(Date.now())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [])

  const remainingSec = Math.max(0, Math.ceil((startedAt + durationSec * 1000 - now) / 1000))
  const timeUp = remainingSec <= 0
  const correctText = quiz.options.find((o) => o.correct)?.text

  const isSpeed = mode.quizType === 'speed'
  const myAnswered = isSpeed
    ? mode.alreadyAnswered !== null
    : mode.coopProgress?.quizStartedAt === startedAt && mode.myName in (mode.coopProgress?.answers ?? {})

  const coopAnswers = !isSpeed && mode.coopProgress?.quizStartedAt === startedAt ? mode.coopProgress.answers : {}
  const coopSubmittedCount = !isSpeed ? Object.keys(coopAnswers).length : 0
  const coopTotal = !isSpeed ? mode.memberNames.length : 0
  const coopEveryoneAnswered = !isSpeed && coopTotal > 0 && mode.memberNames.every((n) => n in coopAnswers)
  const coopEveryoneCorrect = coopEveryoneAnswered && mode.memberNames.every((n) => coopAnswers[n])

  // 문제를 아직 풀지 않은 "진행 중" 상태만 닫을 수 없는 화면이고, 그 외(제출 완료·시간 종료)는
  // 결과를 잠깐 보여준 뒤 자동으로(3초) 또는 수동으로 닫아 화면 잠금을 풀어준다.
  const isLive = !myAnswered && !timeUp

  useEffect(() => {
    if (isLive) return
    const id = setTimeout(() => mode.onClose(), RESULT_AUTO_CLOSE_MS)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive])

  async function handleSubmit(optionId: string) {
    if (submitting || myAnswered || timeUp) return
    setSelectedId(optionId)
    setSubmitting(true)
    const correct = quiz.options.find((o) => o.id === optionId)?.correct ?? false
    try {
      await mode.onSubmit(correct)
    } finally {
      setSubmitting(false)
    }
  }

  const badgeLabel = isSpeed ? '⚡ 스피드 퀴즈' : '🤝 협동 미션'
  const badgeClass = isSpeed ? 'bg-amber-400 text-amber-950' : 'bg-emerald-400 text-emerald-950'
  const borderClass = isSpeed ? 'border-amber-400' : 'border-emerald-400'

  let resultBody: React.ReactNode | null = null

  if (isSpeed && myAnswered) {
    const correct = mode.alreadyAnswered!.correct
    resultBody = correct ? (
      mode.isFirstBlood ? (
        <div className="py-4">
          <div className="text-5xl mb-3">🏆</div>
          <h3 className="text-xl font-black text-amber-600 mb-1">⚡ 스피드 보너스 +50pt</h3>
          <p className="text-sm text-slate-500">우리 조가 전체에서 가장 먼저 맞혔어요!</p>
        </div>
      ) : (
        <div className="py-4">
          <div className="text-5xl mb-3">✅</div>
          <h3 className="text-xl font-black text-emerald-600 mb-1">정답이에요!</h3>
          <p className="text-sm text-slate-500">
            {mode.firstBloodGroupName ? `아쉽지만 ${mode.firstBloodGroupName}가 한발 더 빨랐어요.` : '아쉽지만 다른 조가 한발 더 빨랐어요.'}
          </p>
        </div>
      )
    ) : (
      <div className="py-4">
        <div className="text-5xl mb-3">🙂</div>
        <h3 className="text-lg font-bold text-slate-700 mb-1">아쉬워요, 다음 기회에!</h3>
        <p className="text-sm text-slate-500">정답: {correctText}</p>
      </div>
    )
  } else if (!isSpeed && coopEveryoneAnswered) {
    resultBody = coopEveryoneCorrect ? (
      <div className="py-4">
        <div className="text-5xl mb-3">🎉</div>
        <h3 className="text-xl font-black text-emerald-600 mb-1">🤝 협동 완료 +100pt</h3>
        <p className="text-sm text-slate-500">조원 {coopTotal}명 모두 맞혔어요!</p>
      </div>
    ) : (
      <div className="py-4">
        <div className="text-5xl mb-3">🙂</div>
        <h3 className="text-lg font-bold text-slate-700 mb-1">아쉬워요, 다음 기회에!</h3>
        <p className="text-sm text-slate-500">정답: {correctText}</p>
        <p className="text-xs text-slate-400 mt-1">조원 전원이 정답을 맞혀야 보너스를 받아요.</p>
      </div>
    )
  } else if (!isSpeed && myAnswered) {
    resultBody = (
      <div className="py-6">
        <div className="text-4xl mb-3">⏳</div>
        <h3 className="text-base font-bold text-slate-700 mb-1">제출 완료! 조원 응답을 기다리는 중</h3>
        <p className="text-sm text-slate-500">
          {coopSubmittedCount}/{coopTotal}명 제출
        </p>
      </div>
    )
  } else if (timeUp) {
    resultBody = (
      <div className="py-4">
        <div className="text-5xl mb-3">⏰</div>
        <h3 className="text-lg font-bold text-slate-700 mb-1">시간이 종료되었어요</h3>
        <p className="text-sm text-slate-500">정답: {correctText}</p>
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/70 flex items-center justify-center p-4">
        <div className={`relative bg-white rounded-3xl shadow-xl max-w-lg w-full p-6 border-t-4 ${borderClass} text-center`}>
          {resultBody ? (
            <>
              <button
                type="button"
                onClick={mode.onClose}
                aria-label="닫기"
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 text-sm font-bold"
              >
                ✕
              </button>
              {resultBody}
              <button
                type="button"
                onClick={mode.onClose}
                className="mt-2 rounded-full bg-slate-800 text-white text-sm font-bold px-6 py-2.5 hover:bg-slate-700"
              >
                확인
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
                <span className={`text-xs font-bold rounded-full px-3 py-1 ${badgeClass}`}>{badgeLabel}</span>
                <span className="text-[11px] font-semibold bg-paper-100 text-slate-500 rounded-full px-2 py-1">{quiz.topic}</span>
                <span className="text-lg font-black text-rose-600">{remainingSec}초</span>
              </div>
              <p className="text-base font-bold text-slate-800 mb-4 leading-relaxed">{quiz.prompt}</p>
              <div className="space-y-2 text-left">
                {quiz.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSubmit(opt.id)}
                    className={`w-full text-left rounded-xl border px-3 py-2.5 text-sm transition ${
                      selectedId === opt.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-300'
                    }`}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-3 py-2 hover:bg-amber-100"
              >
                💡 힌트 보기
              </button>
              <p className="text-xs text-slate-400 mt-3">
                {isSpeed
                  ? '우리 조에서 누구든 먼저 답을 고르면 바로 제출돼요. 전체에서 가장 빠른 조가 보너스를 받아요.'
                  : '조원 각자 답을 고르고 제출해요. 전원이 정답을 맞혀야 보너스를 받아요.'}
              </p>
            </>
          )}
        </div>
      </div>

      {showHint && <DiseaseManualModal disease={disease} greetRole={greetRole} onClose={() => setShowHint(false)} />}
    </>
  )
}
