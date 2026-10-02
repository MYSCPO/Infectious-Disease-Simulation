import { serverNow } from '../lib/serverClock'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { GroupDoc } from '../types'
import { ROLE_LABELS, ROLE_ORDER } from '../types'
import { useSession } from '../hooks/useSession'
import { useGroups, useStageSubmissions } from '../hooks/useGroupSubmissions'
import { getScenarioForDisease } from '../data/scenarioGenerator'
import { getDiseaseById } from '../data/diseases'
import { COMMON_WILDCARD_QUIZZES, getCommonWildcardQuizCount, getWildcardQuizCount, WILDCARD_QUIZZES } from '../data/wildcardQuiz'
import { STAGES, nextStage, prevStage } from '../data/stages'
import {
  advanceToStage,
  drawDiseases,
  finishTraining,
  isDiseaseDrawPending,
  endWildcardQuiz,
  isAwaitingTrainingStart,
  startManualReading,
  startTraining,
  setRevealed,
  startWildcardQuiz,
  updateSession,
} from '../lib/session'
import { AUTO_QUIZ_DELAY_SEC, AUTO_QUIZ_PLAN } from '../data/autoQuiz'
import { useAutoQuizDispatch } from '../hooks/useAutoQuizDispatch'
import { loadParticipantIdentity } from '../lib/participant'
import StageBanner from '../components/StageBanner'
import StageTimer from '../components/StageTimer'
import { formatMmSs, MANUAL_READING_SEC, useReadingRemaining } from '../components/ReadingCountdown'
import MascotAvatar from '../components/MascotAvatar'
import ScenarioCard from '../components/ScenarioCard'
import SubmissionStatusGrid from '../components/SubmissionStatusGrid'
import RevealComparison from '../components/RevealComparison'
import Leaderboard from '../components/Leaderboard'
import ChecklistProgressGrid from '../components/ChecklistProgressGrid'
import EntryStatusGrid from '../components/EntryStatusGrid'
import JoinQrBadge from '../components/JoinQrBadge'
import DiseaseDrawReveal from '../components/DiseaseDrawReveal'

const SIMPLIFIED_STAGES = ['prevention', 'response1', 'response2', 'recovery']
const RELAY_STAGE = 'response3'

export default function FacilitatorPresentPage() {
  const { code = '' } = useParams()
  const navigate = useNavigate()
  const { session, loading } = useSession(code)
  const groups = useGroups(code)
  const submissions = useStageSubmissions(code, session?.currentStage)
  const [busy, setBusy] = useState(false)
  const [hideReentryNote, setHideReentryNote] = useState(false)
  const readingRemaining = useReadingRemaining(session?.readingStartedAt)
  const [now, setNow] = useState(serverNow())
  const savedIdentity = loadParticipantIdentity()
  const isTestSession = session?.schoolName === '테스트 학교(1인 체험)'
  const myIdentityHere = savedIdentity && savedIdentity.sessionCode === code ? savedIdentity : null

  useEffect(() => {
    const id = setInterval(() => setNow(serverNow()), 1000)
    return () => clearInterval(id)
  }, [])

  // 진행자가 매번 수동으로 챙기지 않아도, 단계 진입 후 일정 시간이 지나면 그 단계에 맞는
  // 돌발 퀴즈가 자동으로 나가도록 한다. 참가자 화면(TeamTrainingPage)도 동일한 훅을 쓰고
  // 있어서, 진행자가 참가자 화면을 보러 이동해 이 탭이 잠시 없어져도 자동 발송이 끊기지 않는다.
  useAutoQuizDispatch(code, session)

  if (loading) return <div className="p-8 text-center text-slate-400">불러오는 중...</div>
  if (!session) return <div className="p-8 text-center text-slate-500">세션을 찾을 수 없습니다.</div>

  // 조마다 다른 감염병을 배정할 수 있으므로, 같은 감염병을 다루는 조끼리 묶어서
  // 시나리오 카드·제출 현황·공개 비교를 감염병 단위로 보여준다.
  const clusters = groups.reduce<Record<string, GroupDoc[]>>((acc, g) => {
    const key = g.diseaseId || session.diseaseId
    ;(acc[key] ??= []).push(g)
    return acc
  }, {})
  const clusterEntries = Object.entries(clusters)

  const submittedCount = submissions.filter((s) => s.submitted).length
  const allSubmitted = groups.length > 0 && submittedCount >= groups.length
  const next = nextStage(session.currentStage)
  const prev = prevStage(session.currentStage)
  const isSimplifiedStage = SIMPLIFIED_STAGES.includes(session.currentStage)
  const isRelayStage = session.currentStage === RELAY_STAGE
  const topGroup = [...groups].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0]

  async function handleReveal() {
    setBusy(true)
    try {
      await setRevealed(code, true)
    } finally {
      setBusy(false)
    }
  }

  async function handleAdvance() {
    if (!next) {
      await finishTraining(code)
      navigate(`/facilitator/${code}/result`)
      return
    }
    setBusy(true)
    try {
      await advanceToStage(code, next)
    } finally {
      setBusy(false)
    }
  }

  async function handleBack() {
    if (!prev) return
    setBusy(true)
    try {
      await advanceToStage(code, prev)
    } finally {
      setBusy(false)
    }
  }

  const awaitingStart = isAwaitingTrainingStart(session)
  const drawPending = isDiseaseDrawPending(session)
  const drawPool = session.diseasePool ?? []

  async function handleDraw() {
    if (groups.length === 0) return
    if (!window.confirm(`${groups.length}개 조에 감염병 ${drawPool.length}가지를 추첨할까요? 추첨은 한 번만 할 수 있어요.`)) return
    setBusy(true)
    try {
      await drawDiseases(code, groups.map((g) => g.id), drawPool)
    } finally {
      setBusy(false)
    }
  }

  async function handleStartReading() {
    setBusy(true)
    try {
      await startManualReading(code)
    } finally {
      setBusy(false)
    }
  }

  async function handleStartTraining() {
    setBusy(true)
    try {
      await startTraining(code)
    } finally {
      setBusy(false)
    }
  }

  const autoPlan = AUTO_QUIZ_PLAN[session.currentStage]
  const autoQuizLabel = autoPlan
    ? autoPlan.source === 'common'
      ? '📋 보너스 퀴즈'
      : autoPlan.quizType === 'coop'
        ? '🤝 협동 미션'
        : '⚡ 스피드 퀴즈'
    : null
  const autoAlreadySent = session.autoQuizSentAt != null && session.autoQuizSentAt === session.stageStartedAt
  const autoRemainingSec =
    autoPlan && !autoAlreadySent && !awaitingStart && session.stageStartedAt != null
      ? Math.max(0, (autoPlan.delaySec ?? AUTO_QUIZ_DELAY_SEC) - Math.floor((now - session.stageStartedAt) / 1000))
      : null

  const quizActive = !!session.activeQuiz && now < session.activeQuiz.startedAt + session.activeQuiz.durationSec * 1000
  const quizRemainingSec = session.activeQuiz
    ? Math.max(0, Math.ceil((session.activeQuiz.startedAt + session.activeQuiz.durationSec * 1000 - now) / 1000))
    : 0

  async function handleSendQuiz(quizType: 'speed' | 'coop') {
    setBusy(true)
    try {
      await startWildcardQuiz(code, quizType)
      // 수동으로 보냈으면 이번 단계의 자동발송은 건너뛴다(중복 팝업 방지).
      if (session!.stageStartedAt != null) await updateSession(code, { autoQuizSentAt: session!.stageStartedAt })
    } finally {
      setBusy(false)
    }
  }

  // 감염병과 무관하게 전 조에 동일한 문제가 나가는 보너스 퀴즈(현재: 출결 처리 기준).
  async function handleSendBonusQuiz() {
    setBusy(true)
    try {
      await startWildcardQuiz(code, 'speed', 'common')
      if (session!.stageStartedAt != null) await updateSession(code, { autoQuizSentAt: session!.stageStartedAt })
    } finally {
      setBusy(false)
    }
  }

  async function handleEndQuiz() {
    setBusy(true)
    try {
      await endWildcardQuiz(code)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper-50">
      <JoinQrBadge code={code} />
      <StageBanner current={session.currentStage} awaitingStart={awaitingStart} />

      <div className="max-w-6xl mx-auto px-4 lg:pr-[160px] 2xl:pr-4 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-800">{session.schoolName} · 참가 코드 {code}</h1>
            <StageTimer startedAt={awaitingStart ? null : session.stageStartedAt} minutes={STAGES.find((s) => s.id === session.currentStage)?.minutes ?? 0} />
          </div>
          <div className="flex gap-2">
            <Link to={`/facilitator/${code}/groups`} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">
              조 편성 보기
            </Link>
            <Link to={`/facilitator/${code}/result`} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">
              결과 화면
            </Link>
          </div>
        </div>

        {session.facilitatorPinHash && !hideReentryNote && (
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed px-3 py-2">
            <p className="flex-1">
              🔑 나중에 이 훈련에 다시 들어올 때: 첫 화면 <b>⚙️ 진행자 설정</b> → <b>내가 만든 훈련 들어가기</b>에서 참가
              코드 <b>{code}</b>와 진행자 비밀번호를 입력하세요.
            </p>
            <button type="button" onClick={() => setHideReentryNote(true)} className="shrink-0 text-amber-600 underline">
              닫기
            </button>
          </div>
        )}

        {/* 실제 훈련은 입장 단계에서만, 테스트 방은 언제든 참가자 화면을 오가며 확인할 수 있다 */}
        {(awaitingStart || isTestSession) && (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-500 mb-2">👀 참가자 화면 미리 보기 (진행자가 참가자와 같은 화면을 확인할 때)</p>
            <div className="flex flex-wrap gap-2">
              {myIdentityHere && (
                <Link
                  to={`/team/${code}/${myIdentityHere.groupId}`}
                  className="inline-block rounded-full bg-brand-600 text-white text-xs font-bold px-3 py-2 hover:bg-brand-700"
                >
                  👤 내 참가자 화면 보기
                </Link>
              )}
              <Link
                to={`/join/${code}`}
                className={`inline-block rounded-full text-xs font-bold px-3 py-2 ${myIdentityHere ? "bg-white border border-brand-300 text-brand-700 hover:bg-brand-50" : "bg-brand-600 text-white hover:bg-brand-700"}`}
              >
                🚪 참가자 입장 화면부터 보기
              </Link>
            </div>
            {groups.length === 0 && <p className="text-xs text-slate-400 mt-2">먼저 조 편성에서 조를 추가해 주세요.</p>}
          </div>
        )}

        <section className="bg-white rounded-2xl border-2 border-amber-200 p-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="font-semibold text-slate-800">🏆 실시간 순위표</h2>
            {topGroup && (topGroup.score ?? 0) > 0 && (
              <span className="text-xs font-bold bg-amber-400 text-amber-950 rounded-full px-3 py-1">
                🥇 1위 {topGroup.name} · {topGroup.score}pt
              </span>
            )}
          </div>
          <Leaderboard groups={groups} />
        </section>

        {awaitingStart ? (
          <section className="rounded-2xl border-2 border-brand-300 bg-brand-50 p-5 text-center space-y-3">
            {drawPool.length >= 2 && (
              <div className="rounded-2xl bg-white border-2 border-amber-300 p-4 space-y-3">
                <p className="text-base font-bold text-amber-800">🎲 조별 감염병 추첨</p>
                {drawPending ? (
                  <>
                    <p className="text-sm text-slate-600">
                      후보: {drawPool.map((id) => getDiseaseById(id).name).join(' · ')}
                      <br />
                      참가자 화면은 추첨을 기다리고 있어요. 버튼을 누르면 이 화면과 참가자 폰에 동시에 추첨이 진행돼요.
                    </p>
                    <button
                      type="button"
                      onClick={handleDraw}
                      disabled={busy || groups.length === 0}
                      className="w-full max-w-md rounded-full bg-amber-500 text-white py-3.5 text-base font-bold hover:bg-amber-600 disabled:opacity-40 shadow-sm"
                    >
                      🎲 조별 감염병 추첨하기
                    </button>
                  </>
                ) : (
                  <DiseaseDrawReveal groups={groups} pool={drawPool} drawnAt={session.diseaseDrawnAt!} size="lg" />
                )}
              </div>
            )}
            <p className="text-base font-bold text-brand-800">🚪 입장 · 조별 입장 현황</p>
            <EntryStatusGrid groups={groups} />
            <p className="text-base font-bold text-brand-800 pt-2">📖 훈련 시작 전 · 우리 조의 감염병 매뉴얼 읽기</p>
            {readingRemaining == null ? (
              <>
                {drawPending && <p className="text-sm font-bold text-amber-700">먼저 위에서 🎲 감염병 추첨을 해 주세요.</p>}
                <p className="text-sm text-slate-600 leading-relaxed">
                  참가자가 모두 입장하면 아래 버튼을 눌러 주세요. 참가자 화면에 조별 감염병 매뉴얼 카드와
                  <br className="hidden sm:block" />
                  {MANUAL_READING_SEC}초 타이머가 함께 떠요.
                </p>
                <button
                  type="button"
                  onClick={handleStartReading}
                  disabled={busy || drawPending}
                  className="w-full max-w-md rounded-full bg-brand-600 text-white py-3.5 text-base font-bold hover:bg-brand-700 disabled:opacity-40 shadow-sm"
                >
                  📖 매뉴얼 읽기 시작 ({MANUAL_READING_SEC}초)
                </button>
                <button type="button" onClick={handleStartTraining} disabled={busy || drawPending} className="block mx-auto text-xs text-slate-500 underline disabled:opacity-40">
                  읽기 없이 바로 훈련 시작
                </button>
              </>
            ) : (
              <>
                <p className={`text-4xl font-black tabular-nums ${readingRemaining > 0 ? 'text-brand-700' : 'text-rose-600'}`}>
                  ⏱ {formatMmSs(readingRemaining)}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {readingRemaining > 0
                    ? '참가자들이 우리 조의 감염병 매뉴얼을 읽고 있어요.'
                    : '읽기 시간이 끝났어요. 훈련을 시작해 주세요!'}
                  <br className="hidden sm:block" />
                  훈련을 시작하면 예방단계 타이머가 돌고, {AUTO_QUIZ_DELAY_SEC}초 뒤 ⚡ 스피드 퀴즈가 전 조에 동시에 나가요.
                </p>
                <button
                  type="button"
                  onClick={handleStartTraining}
                  disabled={busy || readingRemaining > 0}
                  className={`w-full max-w-md rounded-full text-white py-3.5 text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-sm ${readingRemaining > 0 ? 'bg-slate-500' : 'bg-brand-600 hover:bg-brand-700 animate-pulse'}`}
                >
                  {readingRemaining > 0 ? `▶ 훈련 시작 (${readingRemaining}초 뒤 가능)` : '▶ 훈련 시작'}
                </button>
              </>
            )}
          </section>
        ) : (
        <div className="flex flex-wrap gap-3">
          {!isSimplifiedStage && !isRelayStage && (
            <button
              type="button"
              onClick={handleReveal}
              disabled={busy || session.revealed || submittedCount === 0}
              className="flex-1 min-w-[200px] rounded-full bg-emerald-600 text-white py-3 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40"
            >
              {session.revealed ? '공개됨' : allSubmitted ? '전체 공개하기' : `일부만 제출됨(${submittedCount}/${groups.length}) · 지금 공개하기`}
            </button>
          )}
          <button
            type="button"
            onClick={handleBack}
            disabled={busy || !prev}
            title={prev ? `이전 단계(${STAGES.find((s) => s.id === prev)?.shortLabel})로 돌아가기` : '첫 단계입니다'}
            className="rounded-full border border-slate-300 text-slate-600 px-5 py-3 text-sm font-semibold hover:bg-slate-100 disabled:opacity-40"
          >
            ← 이전 단계
          </button>
          <button
            type="button"
            onClick={handleAdvance}
            disabled={busy}
            className="flex-1 min-w-[200px] rounded-full bg-slate-800 text-white py-3 text-sm font-semibold hover:bg-slate-700 disabled:opacity-40"
          >
            {next ? `다음 단계로 (${STAGES.find((s) => s.id === next)?.shortLabel})` : '훈련 종료 · 결과 화면으로'}
          </button>
        </div>
        )}

        <section className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <h2 className="font-semibold text-slate-800">돌발 퀴즈</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {quizActive && (
                <span className="text-xs font-bold text-rose-600">
                  {session.activeQuiz?.source === 'common'
                    ? '📋 보너스 퀴즈'
                    : session.activeQuiz?.quizType === 'coop'
                      ? '🤝 협동 미션'
                      : '⚡ 스피드 퀴즈'}{' '}
                  진행 중 · {quizRemainingSec}초 남음
                </span>
              )}
              {quizActive ? (
                <button
                  type="button"
                  onClick={handleEndQuiz}
                  disabled={busy}
                  className="rounded-full px-4 py-2 text-xs font-bold transition-colors bg-rose-100 text-rose-700 hover:bg-rose-200"
                >
                  ⏹ 돌발 퀴즈 종료
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleSendQuiz('speed')}
                    disabled={busy}
                    className="rounded-full px-4 py-2 text-xs font-bold transition-colors bg-amber-400 text-amber-950 hover:bg-amber-500"
                  >
                    ⚡ 스피드 퀴즈 발송
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendQuiz('coop')}
                    disabled={busy}
                    className="rounded-full px-4 py-2 text-xs font-bold transition-colors bg-emerald-400 text-emerald-950 hover:bg-emerald-500"
                  >
                    🤝 협동 미션 발송
                  </button>
                  <button
                    type="button"
                    onClick={handleSendBonusQuiz}
                    disabled={busy}
                    className="rounded-full px-4 py-2 text-xs font-bold transition-colors bg-violet-400 text-violet-950 hover:bg-violet-500"
                  >
                    📋 보너스 퀴즈 발송
                  </button>
                </>
              )}
            </div>
          </div>

          {autoQuizLabel && (
            <p className="text-[11px] text-slate-400 mb-3">
              🤖 자동 발송:{' '}
              {awaitingStart
                ? `훈련 시작 후 ${AUTO_QUIZ_DELAY_SEC}초 뒤 ${autoQuizLabel} 발송 예정`
                : quizActive
                ? '이번 단계 발송 완료'
                : autoAlreadySent
                  ? `${autoQuizLabel} 발송 완료`
                  : `${autoQuizLabel} 약 ${autoRemainingSec}초 후 자동 발송 예정 (필요하면 위 버튼으로 직접 보내도 돼요)`}
            </p>
          )}

          <div className="mb-4 space-y-1.5">
            <p className="text-xs font-semibold text-slate-500">
              🎲 문제 은행(발송할 때마다 아래 영역 중 하나가 무작위로 출제, 단계와 무관하게 항상 발송 가능)
            </p>
            <div className="text-xs bg-violet-50 border border-violet-100 rounded-xl px-3 py-2">
              <span className="font-bold text-violet-700">📋 보너스(공통)</span>
              <span className="text-slate-600">
                {' '}
                · 문제 {getCommonWildcardQuizCount()}개 준비됨 (
                {Array.from(new Set(COMMON_WILDCARD_QUIZZES.map((q) => q.topic))).join(' · ')}) · 감염병과 무관하게
                전 조 동일 문제
              </span>
            </div>
            {clusterEntries.map(([diseaseId]) => {
              const disease = getDiseaseById(diseaseId)
              const count = getWildcardQuizCount(diseaseId)
              const topics = Array.from(new Set(WILDCARD_QUIZZES[diseaseId]?.map((q) => q.topic) ?? []))
              if (count === 0) return null
              return (
                <div key={diseaseId} className="text-xs bg-paper-50 border border-slate-100 rounded-xl px-3 py-2">
                  <span className="font-bold text-brand-700">{disease.name}</span>
                  <span className="text-slate-600"> · 문제 {count}개 준비됨 ({topics.join(' · ')})</span>
                </div>
              )
            })}
          </div>

        </section>

        {clusterEntries.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">아직 편성된 조가 없습니다. 조 편성 화면에서 조를 추가해 주세요.</p>
        )}

        {clusterEntries.map(([diseaseId, clusterGroups]) => {
          const disease = getDiseaseById(diseaseId)
          const scenarioStages = getScenarioForDisease(diseaseId)
          const currentScenario = scenarioStages.find((s) => s.stage === session.currentStage)
          const clusterGroupIds = new Set(clusterGroups.map((g) => g.id))
          const clusterSubmissions = submissions.filter((s) => clusterGroupIds.has(s.groupId))
          const clusterSubmittedCount = clusterSubmissions.filter((s) => s.submitted).length

          return (
            <section key={diseaseId} className="space-y-3 border-t-2 border-brand-100 pt-6 first:border-t-0 first:pt-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold bg-brand-600 text-white rounded-full px-3 py-1">{disease.name}</span>
                <span className="text-xs text-slate-500">
                  {clusterGroups.map((g) => g.name).join(', ')}
                  {!isSimplifiedStage && !isRelayStage && ` · ${clusterSubmittedCount}/${clusterGroups.length} 제출`}
                </span>
              </div>

              {currentScenario && <ScenarioCard scenario={currentScenario} />}

              {isSimplifiedStage ? (
                <div className="space-y-2">
                  <div className="rounded-xl border border-brand-200 bg-brand-50/50 px-4 py-3">
                    <p className="text-xs font-bold text-brand-700">📢 공통 브리핑 + 돌발 퀴즈 중심 단계입니다</p>
                    <p className="text-xs text-slate-500 mt-1">
                      참가자 화면에는 공통 브리핑과 체크리스트가 표시되고,
                      아래에서 조원별로 내 역할 체크리스트를 다 읽고 체크했는지 확인할 수 있어요.
                    </p>
                  </div>
                  <ChecklistProgressGrid groups={clusterGroups} stage={session.currentStage} />
                </div>
              ) : isRelayStage ? (
                <div className="space-y-2">
                  <div className="rounded-xl border border-violet-200 bg-violet-50/50 px-4 py-3">
                    <p className="text-xs font-bold text-violet-700">🎙️ 5개 역할 릴레이 낭독 + 최종 의사결정 퀴즈 단계입니다</p>
                    <p className="text-xs text-slate-500 mt-1">
                      각 조가 발생감시팀→예방관리팀→학사관리팀→행정지원팀→관리자 순서로 대사를 낭독하고, 관리자가
                      최종 의사결정 퀴즈를 제출합니다.
                    </p>
                  </div>
                  <RelayStatusGrid groups={clusterGroups} />
                </div>
              ) : (
                <>
                  <SubmissionStatusGrid groups={clusterGroups} submissions={clusterSubmissions} />

                  {session.revealed && currentScenario && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">공개된 답변 비교 · {disease.name}</h3>
                      <RevealComparison questions={currentScenario.questions} submissions={clusterSubmissions} />
                    </div>
                  )}
                </>
              )}
            </section>
          )
        })}
      </div>

    </div>
  )
}

function RelayStatusGrid({ groups }: { groups: GroupDoc[] }) {
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {groups.map((g) => {
        const relay = g.relay
        let status: string
        if (!relay) status = '아직 시작 전'
        else if (relay.turnIndex < ROLE_ORDER.length) status = `${ROLE_LABELS[ROLE_ORDER[relay.turnIndex]]} 낭독 중 (${relay.turnIndex}/${ROLE_ORDER.length})`
        else if (!relay.finalQuiz?.answered) status = '릴레이 완주 · 최종 퀴즈 대기 중'
        else status = relay.finalQuiz.correct ? '🏆 최종 의사결정 성공!' : '최종 퀴즈 제출 완료'

        return (
          <div key={g.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
            <span className="font-bold text-slate-700">{g.name}</span>
            <span className="text-slate-500"> · {status}</span>
          </div>
        )
      })}
    </div>
  )
}
