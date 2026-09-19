import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { GroupDoc } from '../types'
import { ROLE_LABELS, ROLE_ORDER } from '../types'
import { useSession } from '../hooks/useSession'
import { useGroups, useStageSubmissions } from '../hooks/useGroupSubmissions'
import { getScenarioForDisease } from '../data/scenarioGenerator'
import { getDiseaseById } from '../data/diseases'
import { WILDCARDS } from '../data/wildcards'
import { getWildcardQuizCount, WILDCARD_QUIZZES } from '../data/wildcardQuiz'
import { STAGES, nextStage, prevStage } from '../data/stages'
import {
  advanceToStage,
  claimRole,
  endWildcardQuiz,
  setActiveWildcard,
  setRevealed,
  startWildcardQuiz,
  submitGroupAnswer,
} from '../lib/session'
import { loadParticipantIdentity } from '../lib/participant'
import StageBanner from '../components/StageBanner'
import StageTimer from '../components/StageTimer'
import MascotAvatar from '../components/MascotAvatar'
import ScenarioCard from '../components/ScenarioCard'
import SubmissionStatusGrid from '../components/SubmissionStatusGrid'
import RevealComparison from '../components/RevealComparison'
import Leaderboard from '../components/Leaderboard'
import FirstBloodToast from '../components/FirstBloodToast'

const SIMPLIFIED_STAGES = ['response1', 'response2']

export default function FacilitatorPresentPage() {
  const { code = '' } = useParams()
  const navigate = useNavigate()
  const { session, loading } = useSession(code)
  const groups = useGroups(code)
  const submissions = useStageSubmissions(code, session?.currentStage)
  const [busy, setBusy] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [firstBloodToastGroupId, setFirstBloodToastGroupId] = useState<string | null>(null)
  const prevFirstBloodRef = useRef<string | null>(null)
  const savedIdentity = loadParticipantIdentity()
  const myIdentityHere = savedIdentity && savedIdentity.sessionCode === code ? savedIdentity : null

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const current = session?.activeQuiz?.firstBloodGroupId ?? null
    if (current && current !== prevFirstBloodRef.current) {
      setFirstBloodToastGroupId(current)
    }
    prevFirstBloodRef.current = current
  }, [session?.activeQuiz?.firstBloodGroupId])

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
  const applicableWildcards = WILDCARDS.filter((w) => w.applicableStages.includes(session.currentStage))
  const isSimplifiedStage = SIMPLIFIED_STAGES.includes(session.currentStage)
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

  async function toggleWildcard(id: string) {
    setBusy(true)
    try {
      await setActiveWildcard(code, session!.activeWildcardId === id ? null : id)
    } finally {
      setBusy(false)
    }
  }

  const quizActive = !!session.activeQuiz && now < session.activeQuiz.startedAt + session.activeQuiz.durationSec * 1000
  const quizRemainingSec = session.activeQuiz
    ? Math.max(0, Math.ceil((session.activeQuiz.startedAt + session.activeQuiz.durationSec * 1000 - now) / 1000))
    : 0

  async function handleSendQuiz(quizType: 'speed' | 'coop') {
    setBusy(true)
    try {
      await startWildcardQuiz(code, quizType)
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

  // 개발/점검용: 진행자 혼자 전체 흐름을 빠르게 점검할 수 있도록 빈 역할을 테스트봇으로 채운다.
  async function handleGenerateBots() {
    setBusy(true)
    try {
      for (const g of groups) {
        for (const role of ROLE_ORDER) {
          if ((g.members[role]?.length ?? 0) === 0) {
            await claimRole(code, g.id, role, `테스트봇(${ROLE_LABELS[role]})`)
          }
        }
      }
    } finally {
      setBusy(false)
    }
  }

  // 개발/점검용: 현재 단계의 모든 조 제출을 정답 기준으로 즉시 완료 처리한다.
  async function handleAutoSubmitAll() {
    setBusy(true)
    try {
      for (const g of groups) {
        const stageScenario = getScenarioForDisease(g.diseaseId).find((s) => s.stage === session!.currentStage)
        if (!stageScenario) continue
        const answers = stageScenario.questions.map((q) => ({
          role: q.role,
          optionId: q.options.find((o) => o.correct)?.id ?? q.options[0].id,
        }))
        await submitGroupAnswer(code, session!.currentStage, g.id, g.name, answers)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper-50">
      <StageBanner current={session.currentStage} />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-800">{session.schoolName} · 참가 코드 {code}</h1>
            <StageTimer startedAt={session.stageStartedAt} minutes={STAGES.find((s) => s.id === session.currentStage)?.minutes ?? 0} />
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

        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4">
          <p className="text-xs font-bold text-slate-500 mb-2">🧪 테스트 모드 (혼자 전체 흐름 빠르게 점검용 · 실제 연수에서는 사용하지 마세요)</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleGenerateBots}
              disabled={busy || groups.length === 0}
              className="rounded-full bg-white border border-slate-300 text-slate-700 text-xs font-bold px-3 py-2 hover:bg-slate-100 disabled:opacity-40"
            >
              🧪 가상 참가자 자동 생성
            </button>
            <button
              type="button"
              onClick={handleAutoSubmitAll}
              disabled={busy || groups.length === 0}
              className="rounded-full bg-white border border-slate-300 text-slate-700 text-xs font-bold px-3 py-2 hover:bg-slate-100 disabled:opacity-40"
            >
              ⚡ 현재 단계 전체 자동 제출
            </button>
            {myIdentityHere && (
              <Link
                to={`/team/${code}/${myIdentityHere.groupId}`}
                className="rounded-full bg-brand-600 text-white text-xs font-bold px-3 py-2 hover:bg-brand-700"
              >
                👤 내 참가자 화면 보기
              </Link>
            )}
          </div>
          {groups.length === 0 && <p className="text-xs text-slate-400 mt-2">먼저 조 편성에서 조를 추가해 주세요.</p>}
        </div>

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

        <div className="flex flex-wrap gap-3">
          {!isSimplifiedStage && (
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

        <section className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="font-semibold text-slate-800">돌발 상황 카드</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {quizActive && (
                <span className="text-xs font-bold text-rose-600">
                  {session.activeQuiz?.quizType === 'coop' ? '🤝 협동 미션' : '⚡ 스피드 퀴즈'} 진행 중 · {quizRemainingSec}초 남음
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
                </>
              )}
            </div>
          </div>

          <div className="mb-4 space-y-1.5">
            <p className="text-xs font-semibold text-slate-500">
              🎲 감염병별 문제 은행(발송할 때마다 아래 영역 중 하나가 무작위로 출제, 단계와 무관하게 항상 발송 가능)
            </p>
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

          <div className="flex flex-wrap gap-2">
            {applicableWildcards.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => toggleWildcard(w.id)}
                disabled={busy}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${
                  session.activeWildcardId === w.id
                    ? 'bg-amber-400 border-amber-500 text-amber-950'
                    : 'border-amber-300 text-amber-700 hover:bg-amber-50'
                }`}
              >
                {w.title}
              </button>
            ))}
            {applicableWildcards.length === 0 && (
              <div className="w-full rounded-xl border-2 border-dashed border-brand-200 bg-paper-50 py-4 px-4 flex items-center justify-center gap-2 text-center">
                <MascotAvatar role="surveillance" size="sm" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  💡 {STAGES.find((s) => s.id === session.currentStage)?.label ?? '이 단계'}입니다. 상단의{' '}
                  <span className="font-bold text-amber-700">[⚡ 스피드 퀴즈 발송]</span> 또는{' '}
                  <span className="font-bold text-emerald-700">[🤝 협동 미션 발송]</span> 버튼을 통해 질병 기본 지식
                  퀴즈를 전 조에 발송할 수 있습니다.
                </p>
              </div>
            )}
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
                  {!isSimplifiedStage && ` · ${clusterSubmittedCount}/${clusterGroups.length} 제출`}
                </span>
              </div>

              {currentScenario && <ScenarioCard scenario={currentScenario} />}

              {isSimplifiedStage ? (
                <div className="rounded-xl border border-brand-200 bg-brand-50/50 px-4 py-3">
                  <p className="text-xs font-bold text-brand-700">📢 공통 브리핑 + 돌발 퀴즈 중심 단계입니다</p>
                  <p className="text-xs text-slate-500 mt-1">
                    이 단계는 역할별 문항 제출이 없어요. 참가자 화면에는 공통 브리핑과 체크리스트가 표시되고,
                    위 돌발 퀴즈 버튼으로 진행 속도를 조절해 주세요.
                  </p>
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

      {firstBloodToastGroupId && (
        <FirstBloodToast
          groupName={groups.find((g) => g.id === firstBloodToastGroupId)?.name ?? '어느 조'}
          onClose={() => setFirstBloodToastGroupId(null)}
        />
      )}
    </div>
  )
}
