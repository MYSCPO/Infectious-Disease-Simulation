import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { GroupDoc } from '../types'
import { useSession } from '../hooks/useSession'
import { useGroups, useStageSubmissions } from '../hooks/useGroupSubmissions'
import { getScenarioForDisease } from '../data/scenarioGenerator'
import { getDiseaseById } from '../data/diseases'
import { WILDCARDS } from '../data/wildcards'
import { STAGES, nextStage, prevStage } from '../data/stages'
import { advanceToStage, setActiveWildcard, setRevealed } from '../lib/session'
import StageBanner from '../components/StageBanner'
import ScenarioCard from '../components/ScenarioCard'
import SubmissionStatusGrid from '../components/SubmissionStatusGrid'
import RevealComparison from '../components/RevealComparison'

export default function FacilitatorPresentPage() {
  const { code = '' } = useParams()
  const navigate = useNavigate()
  const { session, loading } = useSession(code)
  const groups = useGroups(code)
  const submissions = useStageSubmissions(code, session?.currentStage)
  const [busy, setBusy] = useState(false)

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

  return (
    <div className="min-h-screen bg-paper-50">
      <StageBanner current={session.currentStage} />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">{session.schoolName} · 참가 코드 {code}</p>
            <h1 className="text-xl font-bold text-slate-800">진행자 화면</h1>
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

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleReveal}
            disabled={busy || session.revealed || submittedCount === 0}
            className="flex-1 min-w-[200px] rounded-full bg-emerald-600 text-white py-3 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40"
          >
            {session.revealed ? '공개됨' : allSubmitted ? '전체 공개하기' : `일부만 제출됨(${submittedCount}/${groups.length}) · 지금 공개하기`}
          </button>
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
          <h2 className="font-semibold text-slate-800 mb-3">돌발 상황 카드</h2>
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
            {applicableWildcards.length === 0 && <p className="text-xs text-slate-400">이 단계에 적용 가능한 돌발 카드가 없습니다.</p>}
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
                  {clusterGroups.map((g) => g.name).join(', ')} · {clusterSubmittedCount}/{clusterGroups.length} 제출
                </span>
              </div>

              {currentScenario && <ScenarioCard scenario={currentScenario} />}

              <SubmissionStatusGrid groups={clusterGroups} submissions={clusterSubmissions} />

              {session.revealed && currentScenario && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">공개된 답변 비교 · {disease.name}</h3>
                  <RevealComparison questions={currentScenario.questions} submissions={clusterSubmissions} />
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
