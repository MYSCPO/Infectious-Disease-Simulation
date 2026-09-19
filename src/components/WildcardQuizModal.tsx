import { useEffect, useState } from 'react'
import type { DiseaseInfo, GroupCoopProgress, GroupQuizAnswer, RoleId } from '../types'
import type { WildcardQuizQuestion } from '../data/wildcardQuiz'
import DiseaseManualModal from './DiseaseManualModal'

interface SpeedProps {
  quizType: 'speed'
  alreadyAnswered: GroupQuizAnswer | null
  isFirstBlood: boolean
  onSubmit: (correct: boolean) => void
}

interface CoopProps {
  quizType: 'coop'
  myName: string
  memberNames: string[]
  coopProgress: GroupCoopProgress | null
  onSubmit: (correct: boolean) => void
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

  let body: React.ReactNode

  if (isSpeed && myAnswered) {
    const correct = mode.alreadyAnswered!.correct
    body = correct ? (
      mode.isFirstBlood ? (
        <div className="py-4">
          <div className="text-5xl mb-3">🏆</div>
          <h3 className="text-xl font-black text-amber-600 mb-1">퍼스트 블러드! +50pt</h3>
          <p className="text-sm text-slate-500">우리 조가 전체에서 가장 먼저 맞혔어요!</p>
        </div>
      ) : (
        <div className="py-4">
          <div className="text-5xl mb-3">✅</div>
          <h3 className="text-xl font-black text-emerald-600 mb-1">정답이에요!</h3>
          <p className="text-sm text-slate-500">아쉽지만 다른 조가 한발 더 빨랐어요.</p>
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
    body = coopEveryoneCorrect ? (
      <div className="py-4">
        <div className="text-5xl mb-3">🎉</div>
        <h3 className="text-xl font-black text-emerald-600 mb-1">전원 정답! 팀워크 보너스 +100pt</h3>
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
    body = (
      <div className="py-6">
        <div className="text-4xl mb-3">⏳</div>
        <h3 className="text-base font-bold text-slate-700 mb-1">제출 완료! 조원 응답을 기다리는 중</h3>
        <p className="text-sm text-slate-500">
          {coopSubmittedCount}/{coopTotal}명 제출
        </p>
      </div>
    )
  } else if (timeUp) {
    body = (
      <div className="py-4">
        <div className="text-5xl mb-3">⏰</div>
        <h3 className="text-lg font-bold text-slate-700 mb-1">시간이 종료되었어요</h3>
        <p className="text-sm text-slate-500">정답: {correctText}</p>
      </div>
    )
  } else {
    body = (
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
          {isSpeed ? '우리 조에서 누구든 먼저 답을 고르면 바로 제출돼요. 전체에서 가장 빠른 조가 보너스를 받아요.' : '조원 각자 답을 고르고 제출해요. 전원이 정답을 맞혀야 보너스를 받아요.'}
        </p>
      </>
    )
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/70 flex items-center justify-center p-4">
        <div className={`bg-white rounded-3xl shadow-xl max-w-lg w-full p-6 border-t-4 ${borderClass} text-center`}>
          {body}
        </div>
      </div>

      {showHint && <DiseaseManualModal disease={disease} greetRole={greetRole} onClose={() => setShowHint(false)} />}
    </>
  )
}
