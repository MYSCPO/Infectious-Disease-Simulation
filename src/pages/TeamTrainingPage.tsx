import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { SubmissionAnswer } from '../types'
import { ROLE_ORDER } from '../types'
import { useSession } from '../hooks/useSession'
import { useGroups, useMyGroupSubmission } from '../hooks/useGroupSubmissions'
import { getScenarioForDisease } from '../data/scenarioGenerator'
import { getDiseaseById } from '../data/diseases'
import { WILDCARDS } from '../data/wildcards'
import { clearParticipantIdentity, loadParticipantIdentity } from '../lib/participant'
import { releaseRole, saveDraftAnswer, submitGroupAnswer } from '../lib/session'
import StageBanner from '../components/StageBanner'
import ScenarioCard from '../components/ScenarioCard'
import RoleActionForm from '../components/RoleActionForm'
import ChecklistPanel from '../components/ChecklistPanel'
import WildcardModal from '../components/WildcardModal'

export default function TeamTrainingPage() {
  const { code = '', groupId = '' } = useParams()
  const { session, loading } = useSession(code)
  const groups = useGroups(code)
  const group = groups.find((g) => g.id === groupId)

  const identity = useMemo(() => loadParticipantIdentity(), [])
  const isMine = identity && identity.sessionCode === code && identity.groupId === groupId
  const myRole = isMine ? identity.role : null

  const submission = useMyGroupSubmission(code, session?.currentStage, groupId)
  const [answers, setAnswers] = useState<SubmissionAnswer[]>([])
  const [dismissedWildcard, setDismissedWildcard] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setAnswers(submission?.answers ?? [])
  }, [submission?.id, session?.currentStage])

  if (loading) return <div className="p-8 text-center text-slate-400">불러오는 중...</div>
  if (!session) {
    return (
      <div className="p-8 text-center text-slate-500">
        세션을 찾을 수 없습니다. <Link to="/join" className="text-brand-600 underline">참가 코드로 다시 입장</Link>
      </div>
    )
  }

  const scenarioStages = getScenarioForDisease(group?.diseaseId ?? session.diseaseId)
  const currentScenario = scenarioStages.find((s) => s.stage === session.currentStage)
  const activeWildcard = session.activeWildcardId ? WILDCARDS.find((w) => w.id === session.activeWildcardId) : null
  const allAnswered = ROLE_ORDER.every((r) => answers.some((a) => a.role === r))
  const submitted = submission?.submitted ?? false

  async function handleSelect(role: (typeof ROLE_ORDER)[number], optionId: string) {
    const next = [...answers.filter((a) => a.role !== role), { role, optionId }]
    setAnswers(next)
    if (group) {
      await saveDraftAnswer(code, session!.currentStage, groupId, group.name, next)
    }
  }

  async function handleSubmit() {
    if (!group) return
    setSubmitting(true)
    try {
      await submitGroupAnswer(code, session!.currentStage, groupId, group.name, answers)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleChangeRole() {
    if (isMine) {
      await releaseRole(code, groupId, myRole!)
      clearParticipantIdentity()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <StageBanner current={session.currentStage} />

      <div className="max-w-5xl mx-auto px-4 py-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-slate-500">{session.schoolName}</p>
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {group?.name ?? '조'}
              {group && (
                <span className="text-xs font-semibold bg-brand-100 text-brand-700 rounded-full px-2 py-0.5">
                  {getDiseaseById(group.diseaseId).name}
                </span>
              )}
            </h1>
          </div>
          {isMine ? (
            <Link to={`/join/${code}`} onClick={handleChangeRole} className="text-xs text-slate-400 underline">
              역할 변경
            </Link>
          ) : (
            <Link to={`/join/${code}`} className="text-xs text-brand-600 underline">
              내 역할로 입장하기
            </Link>
          )}
        </div>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
          <div className="space-y-4">
            {currentScenario && <ScenarioCard scenario={currentScenario} />}

            {currentScenario && (
              <RoleActionForm
                questions={currentScenario.questions}
                myRole={myRole}
                answers={answers}
                onSelect={handleSelect}
                disabled={submitted}
                revealed={session.revealed}
              />
            )}

            <div className="sticky bottom-0 bg-slate-50/95 backdrop-blur py-3">
              {submitted ? (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm text-center py-3 font-semibold">
                  제출 완료 · 진행자가 전체 공개할 때까지 기다려 주세요
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!allAnswered || submitting}
                  className="w-full rounded-lg bg-brand-600 text-white py-3 text-sm font-semibold hover:bg-brand-700 disabled:opacity-40"
                >
                  {allAnswered ? (submitting ? '제출 중...' : '조 답변 제출하기') : '모든 역할의 조치를 선택하면 제출할 수 있어요'}
                </button>
              )}
            </div>
          </div>

          <div>
            <ChecklistPanel stage={session.currentStage} myRole={myRole} />
          </div>
        </div>
      </div>

      {activeWildcard && dismissedWildcard !== activeWildcard.id && (
        <WildcardModal card={activeWildcard} onClose={() => setDismissedWildcard(activeWildcard.id)} />
      )}
    </div>
  )
}
