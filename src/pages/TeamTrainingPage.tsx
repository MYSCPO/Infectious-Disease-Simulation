import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { SubmissionAnswer } from '../types'
import { ROLE_LABELS, ROLE_ORDER } from '../types'
import { useSession } from '../hooks/useSession'
import { useGroups, useMyGroupSubmission } from '../hooks/useGroupSubmissions'
import { getScenarioForDisease } from '../data/scenarioGenerator'
import { getDiseaseById } from '../data/diseases'
import { WILDCARDS } from '../data/wildcards'
import { getWildcardQuiz } from '../data/wildcardQuiz'
import { RESPONSE_JOB_TITLES } from '../data/roleChecklist'
import { clearParticipantIdentity, loadParticipantIdentity } from '../lib/participant'
import { releaseRole, saveDraftAnswer, submitCoopAnswer, submitGroupAnswer, submitSpeedQuizAnswer } from '../lib/session'
import StageBanner from '../components/StageBanner'
import StageTimer from '../components/StageTimer'
import ScenarioCard from '../components/ScenarioCard'
import RoleActionForm from '../components/RoleActionForm'
import ChecklistPanel from '../components/ChecklistPanel'
import WildcardModal from '../components/WildcardModal'
import WildcardQuizModal from '../components/WildcardQuizModal'
import DiseaseManualModal from '../components/DiseaseManualModal'
import LeaderboardPopup from '../components/LeaderboardPopup'
import FirstBloodToast from '../components/FirstBloodToast'
import MascotAvatar from '../components/MascotAvatar'
import { ROLE_MASCOTS } from '../data/mascots'
import { STAGES } from '../data/stages'

const SIMPLIFIED_STAGES = ['response1', 'response2']

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
  const [showManual, setShowManual] = useState(false)
  const [showLeaderboardPopup, setShowLeaderboardPopup] = useState(false)
  const [quizDismissedAt, setQuizDismissedAt] = useState<number | null>(null)
  const [firstBloodToastGroupId, setFirstBloodToastGroupId] = useState<string | null>(null)
  const prevStageRef = useRef<string | null>(null)
  const prevFirstBloodRef = useRef<string | null>(null)

  useEffect(() => {
    setAnswers(submission?.answers ?? [])
  }, [submission?.id, session?.currentStage])

  useEffect(() => {
    if (!session) return
    if (prevStageRef.current !== null && prevStageRef.current !== session.currentStage) {
      setShowLeaderboardPopup(true)
    }
    prevStageRef.current = session.currentStage
  }, [session?.currentStage])

  useEffect(() => {
    const current = session?.activeQuiz?.firstBloodGroupId ?? null
    if (current && current !== prevFirstBloodRef.current) {
      setFirstBloodToastGroupId(current)
    }
    prevFirstBloodRef.current = current
  }, [session?.activeQuiz?.firstBloodGroupId])

  if (loading) return <div className="p-8 text-center text-slate-400">불러오는 중...</div>
  if (!session) {
    return (
      <div className="p-8 text-center text-slate-500">
        세션을 찾을 수 없습니다. <Link to="/join" className="text-brand-600 underline">참가 코드로 다시 입장</Link>
      </div>
    )
  }

  const disease = getDiseaseById(group?.diseaseId ?? session.diseaseId)
  const scenarioStages = getScenarioForDisease(group?.diseaseId ?? session.diseaseId)
  const currentScenario = scenarioStages.find((s) => s.stage === session.currentStage)
  const activeWildcard = session.activeWildcardId ? WILDCARDS.find((w) => w.id === session.activeWildcardId) : null
  const missingRoles = ROLE_ORDER.filter((r) => !answers.some((a) => a.role === r))
  const allAnswered = missingRoles.length === 0
  const submitted = submission?.submitted ?? false
  const stageDef = STAGES.find((s) => s.id === session.currentStage)
  const quiz = group && session.activeQuiz ? getWildcardQuiz(group.diseaseId, session.activeQuiz.startedAt) : null
  const quizAnsweredForActive =
    group?.quizAnswer && session.activeQuiz && group.quizAnswer.quizStartedAt === session.activeQuiz.startedAt
      ? group.quizAnswer
      : null
  const isSimplifiedStage = SIMPLIFIED_STAGES.includes(session.currentStage)
  const memberNames = group ? [...new Set(Object.values(group.members).flatMap((names) => names ?? []))] : []

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
      await releaseRole(code, groupId, myRole!, identity!.name)
      clearParticipantIdentity()
    }
  }

  return (
    <div className="min-h-screen bg-paper-50 pb-24">
      <StageBanner current={session.currentStage} />

      <div className="max-w-5xl mx-auto px-4 py-5">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <div>
            <p className="text-sm text-slate-500">{session.schoolName}</p>
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2 flex-wrap">
              {group?.name ?? '조'}
              {group && (
                <span className="text-xs font-semibold bg-brand-100 text-brand-700 rounded-full px-2 py-0.5">
                  {getDiseaseById(group.diseaseId).name}
                </span>
              )}
              {group?.badge && <span className="text-lg" title="돌발 퀴즈 달성 배지">👑</span>}
              {group && (
                <span className="text-xs font-bold bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">
                  내 조 점수: {group.score ?? 0}pt
                </span>
              )}
              {stageDef && <StageTimer startedAt={session.stageStartedAt} minutes={stageDef.minutes} />}
            </h1>
          </div>
          {isMine && myRole ? (
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs font-bold text-brand-700">{ROLE_MASCOTS[myRole].name}</p>
                <Link to={`/join/${code}`} onClick={handleChangeRole} className="text-xs text-slate-400 underline">
                  역할 변경
                </Link>
              </div>
              <MascotAvatar role={myRole} motion={submitted ? 'bounce' : 'idle'} />
            </div>
          ) : (
            <Link to={`/join/${code}`} className="text-xs text-brand-600 underline">
              내 역할로 입장하기
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowManual(true)}
          className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-3 py-2 hover:bg-amber-100 transition-colors"
        >
          💡 {disease.name} 감염병 매뉴얼 보기
        </button>

        {isSimplifiedStage ? (
          <div className="space-y-4">
            {currentScenario && <ScenarioCard scenario={currentScenario} />}
            <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-4">
              <p className="text-sm font-bold text-brand-700 mb-1">📢 공통 상황 지침 + 돌발 퀴즈로 빠르게 워밍업해요</p>
              <p className="text-xs text-slate-500">
                이 단계는 역할별 문항을 풀지 않아요. 위 상황 개요를 다 함께 훑어보고, 아래 직무별 핵심 조치를 가볍게
                확인한 뒤 진행자가 보내는 돌발 퀴즈로 다 같이 재미있게 지식을 다져 보세요!
              </p>
            </div>
            <ChecklistPanel
              stage={session.currentStage}
              myRole={myRole}
              title="직무별 핵심 조치 한눈에 보기"
              roleLabels={RESPONSE_JOB_TITLES}
            />
          </div>
        ) : (
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
                  groupMembers={group?.members}
                />
              )}

              <div className="sticky bottom-0 bg-paper-50/95 backdrop-blur py-3">
                {submitted ? (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm text-center py-3 font-semibold">
                    제출 완료 · 진행자가 전체 공개할 때까지 기다려 주세요
                  </div>
                ) : allAnswered ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full rounded-full bg-brand-600 text-white py-3.5 text-sm font-bold hover:bg-brand-700 disabled:opacity-40 shadow-sm"
                  >
                    {submitting ? '제출 중...' : '모든 역할 선택 완료! 다음 단계로 제출하기 🚀'}
                  </button>
                ) : (
                  <div className="w-full rounded-full bg-paper-100 border border-slate-200 text-slate-500 py-3 text-sm font-semibold text-center px-3">
                    진행 현황 {ROLE_ORDER.length - missingRoles.length}/{ROLE_ORDER.length} · 미제출: {missingRoles.map((r) => ROLE_LABELS[r]).join(', ')} ⏳
                  </div>
                )}
              </div>
            </div>

            <div>
              <ChecklistPanel stage={session.currentStage} myRole={myRole} />
            </div>
          </div>
        )}
      </div>

      {showManual && (
        <DiseaseManualModal disease={disease} greetRole={myRole} onClose={() => setShowManual(false)} />
      )}

      {activeWildcard && dismissedWildcard !== activeWildcard.id && (
        <WildcardModal card={activeWildcard} onClose={() => setDismissedWildcard(activeWildcard.id)} />
      )}

      {session.activeQuiz &&
        group &&
        quiz &&
        session.activeQuiz.quizType === 'speed' &&
        quizDismissedAt !== session.activeQuiz.startedAt && (
          <WildcardQuizModal
            quiz={quiz}
            disease={disease}
            greetRole={myRole}
            startedAt={session.activeQuiz.startedAt}
            durationSec={session.activeQuiz.durationSec}
            quizType="speed"
            alreadyAnswered={quizAnsweredForActive}
            isFirstBlood={session.activeQuiz.firstBloodGroupId === group.id}
            firstBloodGroupName={
              session.activeQuiz.firstBloodGroupId
                ? (groups.find((g) => g.id === session.activeQuiz!.firstBloodGroupId)?.name ?? null)
                : null
            }
            onSubmit={(correct) => submitSpeedQuizAnswer(code, groupId, session.activeQuiz!.startedAt, correct)}
            onClose={() => setQuizDismissedAt(session.activeQuiz!.startedAt)}
          />
        )}

      {session.activeQuiz &&
        group &&
        quiz &&
        session.activeQuiz.quizType === 'coop' &&
        identity &&
        quizDismissedAt !== session.activeQuiz.startedAt && (
          <WildcardQuizModal
            quiz={quiz}
            disease={disease}
            greetRole={myRole}
            startedAt={session.activeQuiz.startedAt}
            durationSec={session.activeQuiz.durationSec}
            quizType="coop"
            myName={identity.name}
            memberNames={memberNames}
            coopProgress={group.coopProgress}
            onSubmit={(correct) =>
              submitCoopAnswer(code, groupId, session.activeQuiz!.startedAt, identity.name, correct)
            }
            onClose={() => setQuizDismissedAt(session.activeQuiz!.startedAt)}
          />
        )}

      {firstBloodToastGroupId && (
        <FirstBloodToast
          groupName={groups.find((g) => g.id === firstBloodToastGroupId)?.name ?? '어느 조'}
          onClose={() => setFirstBloodToastGroupId(null)}
        />
      )}

      {showLeaderboardPopup && (
        <LeaderboardPopup groups={groups} highlightGroupId={groupId} onClose={() => setShowLeaderboardPopup(false)} />
      )}
    </div>
  )
}
