import { useEffect, useRef, useState } from 'react'
import type { GroupDoc, RoleId } from '../types'
import { ROLE_LABELS, ROLE_ORDER } from '../types'
import { RELAY_LINES } from '../data/relayScript'
import { getRelayFinalQuiz } from '../data/relayFinalQuiz'
import {
  isSpeechRecognitionSupported,
  type RecognitionController,
  scoreReading,
  startContinuousRecognition,
} from '../lib/speechRecognition'
import { startRelay, submitRelayFinalQuiz, submitRelayTurn } from '../lib/session'
import MascotAvatar from './MascotAvatar'

const RELAY_BONUS_LIMIT_SEC = 180

export default function RelayPanel({
  code,
  groupId,
  group,
  myRole,
  isTestSession = false,
}: {
  code: string
  groupId: string
  group: GroupDoc
  myRole: RoleId | null
  isTestSession?: boolean
}) {
  const [starting, setStarting] = useState(false)
  const [listening, setListening] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [testOverride, setTestOverride] = useState(false)
  const [quizSelected, setQuizSelected] = useState<string | null>(null)
  const [quizSubmitting, setQuizSubmitting] = useState(false)
  const micRef = useRef<RecognitionController | null>(null)

  const relay = group.relay
  const sttSupported = isSpeechRecognitionSupported()
  const currentRole = relay && relay.turnIndex < ROLE_ORDER.length ? ROLE_ORDER[relay.turnIndex] : null
  const isMyTurn = !!currentRole && myRole === currentRole
  const canAct = isMyTurn || (isTestSession && testOverride)

  // 차례가 바뀌거나 화면을 벗어나면 혹시 남아있는 인식을 정리한다(진행 자체는 항상 완료
  // 버튼으로만 이루어지므로, 여기서는 자원 정리 목적일 뿐 결과를 기다리지 않는다).
  useEffect(() => {
    setTestOverride(false)
    return () => {
      micRef.current?.stop().catch(() => {})
      micRef.current = null
    }
  }, [currentRole])

  async function handleStart() {
    setStarting(true)
    try {
      await startRelay(code, groupId)
    } finally {
      setStarting(false)
    }
  }

  function handleStartListening() {
    const controller = startContinuousRecognition()
    if (controller) {
      micRef.current = controller
      setListening(true)
    }
  }

  // 음성인식 성공 여부와 무관하게, 참가자가 이 버튼을 누르면 그 즉시 다음 차례로 넘어간다.
  // 인식된 내용이 있으면 정확도를 근사해 보너스 지급 여부만 판단한다.
  async function handleComplete() {
    if (!currentRole) return
    setCompleting(true)
    try {
      let transcript = ''
      if (micRef.current) {
        transcript = await micRef.current.stop()
        micRef.current = null
      }
      setListening(false)

      if (!sttSupported) {
        await submitRelayTurn(code, groupId, currentRole, true, 'manual')
        return
      }
      const { items, keywords } = RELAY_LINES[currentRole]
      const score = scoreReading(transcript, items.join(' '), keywords)
      await submitRelayTurn(code, groupId, currentRole, score.bonus, transcript ? 'stt' : 'manual')
    } finally {
      setCompleting(false)
    }
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
          소리 내어 읽어요. 3분(180초) 안에 5개 역할 낭독을 모두 마치면 보너스 점수를 받아요! 시간이
          넘어가도 실패 처리되지는 않으니 편하게 진행하세요.
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

  if (currentRole) {
    const { items } = RELAY_LINES[currentRole]

    return (
      <div className="space-y-4">
        <RelayTimer startedAt={relay.startedAt} />
        <RelayProgress relay={relay} />
        {canAct ? (
          <div className="bg-white rounded-2xl border-2 border-brand-400 p-5 space-y-3 text-center">
            <div className="flex justify-center">
              <MascotAvatar role={currentRole} size="lg" motion="idle" />
            </div>
            <p className="text-xs font-bold text-brand-600">
              🎤 {isMyTurn ? '지금 당신 차례예요!' : `🧪 테스트로 ${ROLE_LABELS[currentRole]} 차례를 진행해요`} 아래
              조치사항을 순서대로 소리 내어 읽어주세요
            </p>
            <ul className="text-left text-sm font-semibold text-slate-800 leading-relaxed space-y-1.5 bg-paper-50 rounded-xl p-3">
              {items.map((item, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-brand-500">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {sttSupported ? (
              !listening ? (
                <button
                  type="button"
                  onClick={handleStartListening}
                  className="rounded-full bg-rose-500 text-white px-6 py-3 text-sm font-bold hover:bg-rose-600"
                >
                  🎙️ 눌러서 낭독 시작
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-rose-500 animate-pulse">🎙️ 듣고 있어요...</p>
                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={completing}
                    className="rounded-full bg-brand-600 text-white px-6 py-3 text-sm font-bold hover:bg-brand-700 disabled:opacity-50"
                  >
                    {completing ? '처리 중...' : '✅ 다 읽었어요 · 다음으로'}
                  </button>
                </div>
              )
            ) : (
              <>
                <p className="text-xs text-slate-400">
                  이 브라우저는 음성인식을 지원하지 않아요. 대사를 소리 내어 읽은 뒤 아래 버튼을 눌러주세요.
                </p>
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={completing}
                  className="rounded-full bg-brand-600 text-white px-6 py-3 text-sm font-bold hover:bg-brand-700 disabled:opacity-50"
                >
                  🔊 대사 소리 내어 읽기 완료
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center space-y-3">
            <div className="flex justify-center">
              <MascotAvatar role={currentRole} size="lg" motion="idle" />
            </div>
            <p className="text-sm font-semibold text-slate-600">
              ⏳ 지금은 <span className="text-brand-600 font-bold">{ROLE_LABELS[currentRole]}</span> 차례예요. 잠시만
              기다려 주세요.
            </p>
            {isTestSession && (
              <button
                type="button"
                onClick={() => setTestOverride(true)}
                className="text-xs underline text-slate-400 hover:text-slate-600"
              >
                🧪 테스트 모드: 이 역할로 대신 낭독하기
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  const quiz = getRelayFinalQuiz(group.diseaseId)
  const finalQuiz = relay.finalQuiz
  const canAnswerQuiz = myRole === 'principal' || (isTestSession && testOverride)

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
        ) : canAnswerQuiz ? (
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
          <>
            <p className="text-sm text-slate-500 text-center py-4">
              🧑‍💼 관리자 대표가 조원들과 상의해 최종 답을 제출하고 있어요. 잠시만 기다려 주세요.
            </p>
            {isTestSession && (
              <button
                type="button"
                onClick={() => setTestOverride(true)}
                className="text-xs underline text-slate-400 hover:text-slate-600 block mx-auto"
              >
                🧪 테스트 모드: 관리자 대신 제출하기
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function RelayTimer({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const elapsedSec = Math.floor((now - startedAt) / 1000)
  const remainingSec = RELAY_BONUS_LIMIT_SEC - elapsedSec
  const overTime = remainingSec <= 0
  const mm = String(Math.floor(Math.abs(remainingSec) / 60)).padStart(2, '0')
  const ss = String(Math.abs(remainingSec) % 60).padStart(2, '0')

  return (
    <div className="flex justify-center">
      <span
        className={`text-xs font-bold rounded-full px-3 py-1.5 ${
          overTime ? 'bg-slate-100 text-slate-400' : 'bg-rose-50 text-rose-600'
        }`}
      >
        {overTime ? `⏱️ 3분 보너스 시간 종료 (경과 ${mm}:${ss})` : `⏱️ 3분 내 완주 보너스까지 ${mm}:${ss} 남음`}
      </span>
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
