import { useEffect, useState } from 'react'
import type { GroupQuizAnswer } from '../types'
import type { WildcardQuizQuestion } from '../data/wildcardQuiz'

export default function WildcardQuizModal({
  quiz,
  startedAt,
  durationSec,
  alreadyAnswered,
  onSubmit,
}: {
  quiz: WildcardQuizQuestion
  startedAt: number
  durationSec: number
  alreadyAnswered: GroupQuizAnswer | null
  onSubmit: (correct: boolean) => void
}) {
  const [now, setNow] = useState(Date.now())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [])

  const remainingSec = Math.max(0, Math.ceil((startedAt + durationSec * 1000 - now) / 1000))
  const timeUp = remainingSec <= 0
  const answered = alreadyAnswered !== null

  async function handleSubmit(optionId: string) {
    if (submitting || answered || timeUp) return
    setSelectedId(optionId)
    setSubmitting(true)
    const correct = quiz.options.find((o) => o.id === optionId)?.correct ?? false
    try {
      await onSubmit(correct)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-6 border-t-4 border-amber-400 text-center">
        {answered ? (
          alreadyAnswered!.correct ? (
            <div className="py-4">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-xl font-black text-emerald-600 mb-1">정답! 위기 대응 성공</h3>
              <p className="text-sm text-slate-500">🏆 우리 조가 황금 배지를 획득했어요!</p>
            </div>
          ) : (
            <div className="py-4">
              <div className="text-5xl mb-3">🙂</div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">아쉬워요, 다음 기회에!</h3>
              <p className="text-sm text-slate-500">정답: {quiz.options.find((o) => o.correct)?.text}</p>
            </div>
          )
        ) : timeUp ? (
          <div className="py-4">
            <div className="text-5xl mb-3">⏰</div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">시간이 종료되었어요</h3>
            <p className="text-sm text-slate-500">정답: {quiz.options.find((o) => o.correct)?.text}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-xs font-bold bg-amber-400 text-amber-950 rounded-full px-3 py-1">🚨 돌발 퀴즈</span>
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
            <p className="text-xs text-slate-400 mt-4">우리 조에서 누구든 먼저 답을 고르면 바로 제출돼요.</p>
          </>
        )}
      </div>
    </div>
  )
}
