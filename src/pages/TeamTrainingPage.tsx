import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { SubmissionAnswer } from '../types'
import { ROLE_LABELS, ROLE_ORDER } from '../types'
import { useSession } from '../hooks/useSession'
import { useGroups, useMyGroupSubmission } from '../hooks/useGroupSubmissions'
import { useAutoQuizDispatch } from '../hooks/useAutoQuizDispatch'
import { getScenarioForDisease } from '../data/scenarioGenerator'
import { getDiseaseById } from '../data/diseases'
import { WILDCARDS } from '../data/wildcards'
import { getCommonWildcardQuiz, getWildcardQuiz } from '../data/wildcardQuiz'
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
import ScoreToast from '../components/ScoreToast'
import RelayPanel from '../components/RelayPanel'
import MascotAvatar from '../components/MascotAvatar'
import { ROLE_MASCOTS } from '../data/mascots'
import { STAGES } from '../data/stages'

const SIMPLIFIED_STAGES = ['prevention', 'response1', 'response2', 'recovery']
const TEST_SCHOOL_NAME = '테스트 학교(1인 체험)'
const RELAY_STAGE = 'response3'

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
  const [scoreToast, setScoreToast] = useState<{ message: string; color: 'amber' | 'emerald' | 'violet' } | null>(null)
  const prevStageRef = useRef<string | null>(null)
  const prevFirstBloodRef = useRef<string | null>(null)
  const prevRelayRef = useRef<{ turnCount: number; finished: boolean; quizAnswered: boolean } | null>(null)

  // 진행자 탭이 잠시 없어져 있어도(예: 참가자 화면을 보러 이동) 자동 발송이 끊기지 않도록,
  // 참가자 화면도 동일한 자동 발송 타이머를 함께 들고 있는다.
  useAutoQuizDispatch(code, session)

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

  useEffect(() => {
    const relay = group?.relay
    const snapshot = {
      turnCount: relay?.turnResults.length ?? 0,
      finished: !!relay?.finishedAt,
      quizAnswered: !!relay?.finalQuiz?.answered,
    }
    const prev = prevRelayRef.current
    if (prev && relay) {
      if (snapshot.turnCount > prev.turnCount) {
        const last = relay.turnResults[relay.turnResults.length - 1]
        if (last?.bonus) {
          setScoreToast({ message: `🎙️ ${ROLE_LABELS[last.role]} 명확한 대사 전달 보너스! (+30pt)`, color: 'amber' })
        }
      }
      if (!prev.finished && snapshot.finished && relay.timeBonusAwarded) {
        setScoreToast({ message: '⏱️ 3분 내 릴레이 완수! (+50pt)', color: 'emerald' })
      }
      if (!prev.quizAnswered && snapshot.quizAnswered && relay.finalQuiz?.correct) {
        setScoreToast({ message: '🏆 비상대책본부 최종 의사결정 성공! (+100pt)', color: 'violet' })
      }
    }
    prevRelayRef.current = snapshot
  }, [group?.relay])

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
  const quiz =
    group && session.activeQuiz
      ? session.activeQuiz.source === 'common'
        ? getCommonWildcardQuiz(session.activeQuiz.startedAt)
        : getWildcardQuiz(group.diseaseId, session.activeQuiz.startedAt)
      : null
  const quizAnsweredForActive =
    group?.quizAnswer && session.activeQuiz && group.quizAnswer.quizStartedAt === session.activeQuiz.startedAt
      ? group.quizAnswer
      : null
  const isSimplifiedStage = SIMPLIFIED_STAGES.includes(session.currentStage)
  const isRelayStage = session.currentStage === RELAY_STAGE
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

        {session.schoolName === TEST_SCHOOL_NAME && (
          <Link
            to={`/facilitator/${code}/present`}
            className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-slate-800 text-white text-xs font-bold px-3 py-2 hover:bg-slate-700 transition-colors mr-2"
          >
            🖥️ 진행자 화면으로 돌아가기
          </Link>
        )}

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
              <p className="text-sm font-bold text-brand-700 mb-1">
                {session.currentStage === 'recovery'
                  ? '📢 공통 상황 지침 + 체크리스트로 마무리해요'
                  : '📢 공통 상황 지침 + 돌발 퀴즈로 빠르게 워밍업해요'}
              </p>
              <p className="text-xs text-slate-500">
                이 단계는 역할별 문항을 풀지 않아요. 위 상황 개요를 다 함께 훑어보고, 아래 체크리스트에서 역할별 핵심
                조치를 하나씩 확인하며 체크해 보세요. 진행자가 보내는 돌발 퀴즈로 다 같이 재미있게 지식을 다져요!
              </p>
            </div>
            <ChecklistPanel
              key={session.currentStage}
              stage={session.currentStage}
              myRole={myRole}
              checkable
              diseaseId={disease.id}
            />
          </div>
        ) : isRelayStage ? (
          <div className="space-y-4">
            {currentScenario && <ScenarioCard scenario={currentScenario} />}
            {group ? (
              <RelayPanel
                code={code}
                groupId={groupId}
                group={group}
                myRole={myRole}
                isTestSession={session.schoolName === TEST_SCHOOL_NAME}
              />
            ) : (
              <div className="p-6 text-center text-slate-400 text-sm">조 정보를 불러오는 중...</div>
            )}
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
              <ChecklistPanel stage={session.currentStage} myRole={myRole} diseaseId={disease.id} />
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
            isCommon={session.activeQuiz.source === 'common'}
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
            isCommon={session.activeQuiz.source === 'common'}
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

      {scoreToast && (
        <ScoreToast message={scoreToast.message} color={scoreToast.color} onClose={() => setScoreToast(null)} />
      )}

      {showLeaderboardPopup && (
        <LeaderboardPopup groups={groups} highlightGroupId={groupId} onClose={() => setShowLeaderboardPopup(false)} />
      )}
    </div>
  )
}
