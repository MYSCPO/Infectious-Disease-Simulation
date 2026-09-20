import { useState } from 'react'
import type { GroupDoc, RoleId } from '../types'
import { ROLE_LABELS, ROLE_ORDER } from '../types'
import { RELAY_LINES } from '../data/relayScript'
import { getRelayFinalQuiz } from '../data/relayFinalQuiz'
import { isSpeechRecognitionSupported, recognizeSpeech, scoreReading } from '../lib/speechRecognition'
import { startRelay, submitRelayFinalQuiz, submitRelayTurn } from '../lib/session'
import MascotAvatar from './MascotAvatar'

export default function RelayPanel({
  code,
  groupId,
  group,
  myRole,
}: {
  code: string
  groupId: string
  group: GroupDoc
  myRole: RoleId | null
}) {
  const [starting, setStarting] = useState(false)
  const [listening, setListening] = useState(false)
  const [attemptError, setAttemptError] = useState<string | null>(null)
  const [quizSelected, setQuizSelected] = useState<string | null>(null)
  const [quizSubmitting, setQuizSubmitting] = useState(false)

  const relay = group.relay
  const sttSupported = isSpeechRecognitionSupported()

  async function handleStart() {
    setStarting(true)
    try {
      await startRelay(code, groupId)
    } finally {
      setStarting(false)
    }
  }

  async function handleReadWithMic(role: RoleId) {
    setAttemptError(null)
    setListening(true)
    try {
      const transcript = await recognizeSpeech()
      const { line, keywords } = RELAY_LINES[role]
      const score = scoreReading(transcript, line, keywords)
      if (!score.passed) {
        setAttemptError('핵심 단어가 잘 인식되지 않았어요. 대사를 다시 또박또박 읽어주세요.')
        return
      }
      await submitRelayTurn(code, groupId, role, score.bonus, 'stt')
    } catch {
      setAttemptError('음성인식에 문제가 생겼어요. 소리 내어 읽으셨다면 아래 버튼으로 완료 처리해 주세요.')
    } finally {
      setListening(false)
    }
  }

  async function handleManualComplete(role: RoleId) {
    setAttemptError(null)
    await submitRelayTurn(code, groupId, role, true, 'manual')
  }

  async function handleSubmitQuiz() {
    if (!quizSelected) return
    setQuizSubmitting(true)
    try {
      const quiz = getRelayFinalQuiz(group.diseaseId)
      const correct = quiz.options.find((o) => o.id === quizSelected)?.correct ?? false
      await submitRelayFinalQuiz(code, groupId, quizSelected, correct)
    } finally {
      setQuizSubmitting(false)
    }
  }

  if (!relay) {
    return (
      <div className="bg-white rounded-2xl border-2 border-dashed border-brand-300 p-6 text-center space-y-3">
        <div className="text-4xl">🏁</div>
        <h3 className="text-base font-bold text-slate-800">대응3단계 릴레이 낭독을 시작해요</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          발생감시팀 → 예방관리팀 → 학사관리팀 → 행정지원팀 → 관리자 순서로, 각 역할이 자기 차례에 대사를
          소리 내어 읽어요. 3분 안에 5명이 모두 완주하면 보너스 점수를 받아요!
        </p>
        <button
          type="button"
          onClick={handleStart}
          disabled={starting}
          className="rounded-full bg-brand-600 text-white px-6 py-3 text-sm font-bold hover:bg-brand-700 disabled:opacity-50"
        >
          {starting ? '준비 중...' : '🏁 릴레이 시작하기'}
        </button>
      </div>
    )
  }

  if (relay.turnIndex < ROLE_ORDER.length) {
    const currentRole = ROLE_ORDER[relay.turnIndex]
    const isMyTurn = myRole === currentRole
    const { line } = RELAY_LINES[currentRole]

    return (
      <div className="space-y-4">
        <RelayProgress relay={relay} />
        {isMyTurn ? (
          <div className="bg-white rounded-2xl border-2 border-brand-400 p-5 space-y-3 text-center">
            <div className="flex justify-center">
              <MascotAvatar role={currentRole} size="lg" motion="idle" />
            </div>
            <p className="text-xs font-bold text-brand-600">🎤 지금 당신 차례예요!</p>
            <p className="text-base font-bold text-slate-800 leading-relaxed">"{line}"</p>
            {sttSupported ? (
              <>
                <button
                  type="button"
                  onClick={() => handleReadWithMic(currentRole)}
                  disabled={listening}
                  className="rounded-full bg-rose-500 text-white px-6 py-3 text-sm font-bold hover:bg-rose-600 disabled:opacity-50"
                >
                  {listening ? '🎙️ 듣고 있어요...' : '🎙️ 눌러서 소리 내어 읽기'}
                </button>
                {attemptError && (
                  <div className="space-y-2">
                    <p className="text-xs text-rose-600">{attemptError}</p>
                    <button
                      type="button"
                      onClick={() => handleManualComplete(currentRole)}
                      className="text-xs underline text-slate-400"
                    >
                      계속 안 되면 여기를 눌러 완료 처리
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-xs text-slate-400">
                  이 브라우저는 음성인식을 지원하지 않아요. 대사를 소리 내어 읽은 뒤 아래 버튼을 눌러주세요.
                </p>
                <button
                  type="button"
                  onClick={() => handleManualComplete(currentRole)}
                  className="rounded-full bg-brand-600 text-white px-6 py-3 text-sm font-bold hover:bg-brand-700"
                >
                  🔊 대사 소리 내어 읽기 완료
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center space-y-2">
            <div className="flex justify-center">
              <MascotAvatar role={currentRole} size="lg" motion="idle" />
            </div>
            <p className="text-sm font-semibold text-slate-600">
              ⏳ 지금은 <span className="text-brand-600 font-bold">{ROLE_LABELS[currentRole]}</span> 차례예요. 잠시만
              기다려 주세요.
            </p>
          </div>
        )}
      </div>
    )
  }

  const quiz = getRelayFinalQuiz(group.diseaseId)
  const finalQuiz = relay.finalQuiz

  return (
    <div className="space-y-4">
      <RelayProgress relay={relay} />
      <div className="bg-white rounded-2xl border-2 border-violet-300 p-5 space-y-3">
        <p className="text-xs font-bold text-violet-600">🚨 돌발 위기관리 상황판 · 최종 의사결정</p>
        <p className="text-sm font-bold text-slate-800 leading-relaxed">{quiz.prompt}</p>
        {finalQuiz?.answered ? (
          <div className="text-center py-2">
            {finalQuiz.correct ? (
              <>
                <div className="text-4xl mb-2">🏆</div>
                <p className="text-base font-black text-emerald-600">최종 의사결정 성공! +100pt</p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">🙂</div>
                <p className="text-sm font-bold text-slate-600">아쉬워요, 다음 기회에!</p>
                <p className="text-xs text-slate-400 mt-1">정답: {quiz.options.find((o) => o.correct)?.text}</p>
              </>
            )}
          </div>
        ) : myRole === 'principal' ? (
          <>
            <div className="space-y-2 text-left">
              {quiz.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setQuizSelected(opt.id)}
                  className={`w-full text-left rounded-xl border px-3 py-2.5 text-sm transition ${
                    quizSelected === opt.id ? 'border-violet-500 bg-violet-50' : 'border-slate-200 hover:border-violet-300'
                  }`}
                >
                  {opt.text}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleSubmitQuiz}
              disabled={!quizSelected || quizSubmitting}
              className="w-full rounded-full bg-violet-600 text-white py-3 text-sm font-bold hover:bg-violet-700 disabled:opacity-40"
            >
              {quizSubmitting ? '제출 중...' : '조원과 상의한 대표 답 제출하기'}
            </button>
          </>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">
            🧑‍💼 관리자 대표가 조원들과 상의해 최종 답을 제출하고 있어요. 잠시만 기다려 주세요.
          </p>
        )}
      </div>
    </div>
  )
}

function RelayProgress({ relay }: { relay: NonNullable<GroupDoc['relay']> }) {
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {ROLE_ORDER.map((r, i) => {
        const done = i < relay.turnIndex
        const current = i === relay.turnIndex
        return (
          <span
            key={r}
            className={`text-[11px] font-bold rounded-full px-2.5 py-1 ${
              done ? 'bg-emerald-100 text-emerald-700' : current ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'
            }`}
          >
            {done ? '✓ ' : ''}
            {ROLE_LABELS[r]}
          </span>
        )
      })}
    </div>
  )
}
