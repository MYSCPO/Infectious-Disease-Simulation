import { serverNow } from './serverClock'
import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  FieldPath,
  getDoc,
  onSnapshot,
  QuerySnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db, ensureSignedIn } from '../firebase'
import { hashFacilitatorPin } from './facilitatorAuth'
import type {
  GroupDoc,
  QuizSource,
  QuizType,
  RoleId,
  SchoolLevel,
  SessionDoc,
  SessionGaps,
  SessionOrgChart,
  StageId,
  SubmissionAnswer,
  SubmissionDoc,
} from '../types'
import { ROLE_LABELS, ROLE_ORDER } from '../types'
import { STAGES } from '../data/stages'
import { DISEASES } from '../data/diseases'

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 혼동되는 0/O, 1/I 제외

export function generateSessionCode(length = 5): string {
  let code = ''
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return code
}

// Firestore 보안 규칙이 인증 여부를 확인하므로, 익명 로그인이 끝나기 전에 리스너를 달면
// 권한 거부로 조용히 실패해 콜백이 영영 안 불리는 문제가 있었다(특히 QR·직접 링크로 막
// 들어온 새 기기처럼 로그인 기록이 전혀 없는 경우). 그래서 모든 구독 함수는 로그인이
// 끝난 뒤에만 onSnapshot을 붙이도록 이 헬퍼를 통해서만 리스너를 연다.
//
// 폰이 잠기거나 다른 앱으로 넘어갔다 오면 실시간 연결이 조용히 끊겨 진행자의 단계 전환이
// 참가자 화면에 반영되지 않는 일이 있었다. 그래서 (1) 리스너 오류 시 2초 뒤 다시 연결하고,
// (2) 화면이 다시 보이는 순간 리스너를 새로 붙여 최신 상태를 곧바로 받아온다.
function subscribeAfterAuth(attach: (onError: (e: unknown) => void) => Unsubscribe): Unsubscribe {
  let unsub: Unsubscribe | null = null
  let cancelled = false
  let retryTimer: number | undefined

  const connect = () => {
    if (cancelled) return
    ensureSignedIn()
      .then(() => {
        if (cancelled) return
        unsub?.()
        unsub = attach((e) => {
          console.warn('실시간 연결 오류, 다시 연결합니다', e)
          unsub?.()
          unsub = null
          window.clearTimeout(retryTimer)
          retryTimer = window.setTimeout(connect, 2000)
        })
      })
      .catch((e) => {
        console.error('익명 로그인 실패', e)
        window.clearTimeout(retryTimer)
        retryTimer = window.setTimeout(connect, 2000)
      })
  }

  const onVisible = () => {
    if (document.visibilityState === 'visible') connect()
  }

  connect()
  document.addEventListener('visibilitychange', onVisible)
  return () => {
    cancelled = true
    window.clearTimeout(retryTimer)
    document.removeEventListener('visibilitychange', onVisible)
    unsub?.()
  }
}

function sessionRef(code: string) {
  return doc(db, 'sessions', code)
}

function groupsCol(code: string) {
  return collection(db, 'sessions', code, 'groups')
}

function groupRef(code: string, groupId: string) {
  return doc(db, 'sessions', code, 'groups', groupId)
}

function submissionsCol(code: string) {
  return collection(db, 'sessions', code, 'submissions')
}

function submissionRef(code: string, stage: StageId, groupId: string) {
  return doc(db, 'sessions', code, 'submissions', `${stage}_${groupId}`)
}

export interface CreateSessionInput {
  schoolName: string
  schoolLevel: SchoolLevel
  diseaseId: string
  facilitatorPin?: string // 테스트 방은 비밀번호 없이 생성
}

export async function createSession(input: CreateSessionInput): Promise<string> {
  await ensureSignedIn()
  let code = generateSessionCode()
  // 극히 낮은 확률의 코드 충돌을 피하기 위해 존재 여부 확인 후 재시도
  for (let i = 0; i < 5; i++) {
    const snap = await getDoc(sessionRef(code))
    if (!snap.exists()) break
    code = generateSessionCode()
  }

  const emptyOrgChart: SessionOrgChart = { surveillance: '', health: '', academic: '', admin: '', principal: '' }
  const emptyGaps: SessionGaps = { observationRoomLocation: '', homeroomBackupPlan: '', weekendContactSystem: '' }

  const data: Omit<SessionDoc, 'createdAt' | 'updatedAt'> & { createdAt: unknown; updatedAt: unknown } = {
    code,
    schoolName: input.schoolName,
    schoolLevel: input.schoolLevel,
    diseaseId: input.diseaseId,
    orgChart: emptyOrgChart,
    gaps: emptyGaps,
    currentStage: STAGES[0].id,
    stageStartedAt: null,
    trainingStartedAt: null,
    revealed: false,
    activeWildcardId: null,
    activeQuiz: null,
    autoQuizSentAt: null,
    attendeeCount: 0,
    facilitatorPinHash: input.facilitatorPin ? await hashFacilitatorPin(code, input.facilitatorPin) : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  await setDoc(sessionRef(code), data)
  return code
}

export async function getSessionOnce(code: string): Promise<SessionDoc | null> {
  await ensureSignedIn()
  const snap = await getDoc(sessionRef(code))
  return snap.exists() ? (snap.data() as SessionDoc) : null
}

// 방을 미리 만들어 두어도 예방단계 타이머·자동 퀴즈가 먼저 돌지 않도록, 진행자가 누른 순간을 시작점으로 삼는다.
export function isAwaitingTrainingStart(session: SessionDoc): boolean {
  return session.currentStage === 'prevention' && !session.trainingStartedAt
}

export async function startManualReading(code: string) {
  await updateSession(code, { readingStartedAt: serverNow() })
}

export async function startTraining(code: string) {
  const now = serverNow()
  await updateSession(code, { trainingStartedAt: now, stageStartedAt: now, autoQuizSentAt: null, activeQuiz: null })
}

export function subscribeSession(code: string, cb: (session: SessionDoc | null) => void) {
  return subscribeAfterAuth((onError) =>
    onSnapshot(sessionRef(code), (snap) => {
      cb(snap.exists() ? (snap.data() as SessionDoc) : null)
    }, onError),
  )
}

export async function updateSession(code: string, partial: Partial<SessionDoc>) {
  await ensureSignedIn()
  await updateDoc(sessionRef(code), { ...partial, updatedAt: serverTimestamp() })
}

export async function advanceToStage(code: string, stage: StageId) {
  await updateSession(code, {
    currentStage: stage,
    stageStartedAt: serverNow(),
    revealed: false,
    activeWildcardId: null,
    activeQuiz: null,
    autoQuizSentAt: null,
    finishedAt: null,
  })
}

// 진행자가 복구단계 뒤 "훈련 종료"를 누르면 참가자 화면도 결과 화면으로 넘어간다.
export async function finishTraining(code: string) {
  await updateSession(code, { finishedAt: serverNow(), activeQuiz: null })
}

export async function setRevealed(code: string, revealed: boolean) {
  await updateSession(code, { revealed })
}

export async function setActiveWildcard(code: string, wildcardId: string | null) {
  await updateSession(code, { activeWildcardId: wildcardId })
}

// 돌발 퀴즈: 진행자가 발송하면 전 조 화면에 동시에 60초 팝업이 뜬다.
// - 스피드(speed): 조 대표가 먼저 맞히면 그 조만 +50pt(퍼스트 블러드) 선점
// - 협동(coop): 조원 전원이 개별 제출해서 모두 정답이면 그 조에 +100pt(팀워크 보너스)
// - source: 'disease'면 조가 맡은 감염병별 문제은행에서, 'common'이면 감염병과 무관한
//   공통 지식(보너스) 문제은행에서 전 조에 동일한 문제가 나간다.
export async function startWildcardQuiz(
  code: string,
  quizType: QuizType,
  source: QuizSource = 'disease',
  durationSec = 60,
  autoForStageStartedAt?: number,
): Promise<boolean> {
  // 훈련 방마다 낸 문제 수를 세어 다음 순번의 문제를 낸다(같은 문제가 다시 나오지 않게).
  // 자동 발송은 진행자·참가자 기기가 서버 시계 기준으로 거의 동시에 시도하므로, "이번 단계에 이미
  // 보냈는지" 확인과 발송을 한 트랜잭션에서 처리해 한 기기만 성공하게 한다(두 번째가 덮어써 문제가 바뀌던 문제).
  await ensureSignedIn()
  const sRef = sessionRef(code)
  return runTransaction(db, async (tx) => {
    const session = (await tx.get(sRef)).data() as SessionDoc | undefined
    if (!session) return false
    if (autoForStageStartedAt != null) {
      if (session.stageStartedAt !== autoForStageStartedAt) return false
      if (session.autoQuizSentAt === autoForStageStartedAt) return false
      if (session.activeQuiz) return false
    }
    const counterKey = source === 'common' ? 'commonQuizCount' : 'diseaseQuizCount'
    const round = session[counterKey] ?? 0
    tx.update(sRef, {
      activeQuiz: { startedAt: serverNow(), durationSec, quizType, source, round, firstBloodGroupId: null },
      [counterKey]: round + 1,
      // 진행자가 직접 보낸 경우에도 이번 단계 자동 발송은 끝난 것으로 표시한다.
      autoQuizSentAt: session.stageStartedAt ?? null,
      updatedAt: serverTimestamp(),
    })
    return true
  })
}

// 보너스(공통) 퀴즈: 전 조가 같은 문제를 풀므로, 조원 각자 한 번씩 답하고 조 점수는 정답률 x 100점
// (정답 1명마다 100/조원 수 만큼 더한다). 속도·전원 정답이 아니라 "조가 얼마나 정확히 아는지"를 잰다.
export async function submitBonusAnswer(
  code: string,
  groupId: string,
  quizStartedAt: number,
  memberName: string,
  correct: boolean,
) {
  await ensureSignedIn()
  const gRef = groupRef(code, groupId)
  await runTransaction(db, async (tx) => {
    const group = (await tx.get(gRef)).data() as GroupDoc | undefined
    if (!group) return
    const prev = group.bonusProgress?.quizStartedAt === quizStartedAt ? group.bonusProgress.answers : {}
    if (memberName in prev) return
    const memberCount = new Set(Object.values(group.members).flatMap((n) => n ?? [])).size || 1
    tx.update(gRef, {
      bonusProgress: { quizStartedAt, answers: { ...prev, [memberName]: correct } },
      ...(correct ? { score: (group.score ?? 0) + Math.round(100 / memberCount) } : {}),
    })
  })
}

export async function endWildcardQuiz(code: string) {
  await updateSession(code, { activeQuiz: null })
}

// 스피드 퀴즈: 조원 각자 한 번씩 답한다. 조 문서 트랜잭션으로 이 퀴즈에서 아직 스피드왕이 없을 때
// 처음 맞힌 사람을 스피드왕(개인상)으로 정하고 조에 +50pt를 준다. 조마다 감염병·난이도가 달라
// 다른 조와 속도를 겨루지 않고, 같은 문제를 푼 조원끼리만 겨룬다.
export async function submitSpeedQuizAnswer(
  code: string,
  groupId: string,
  quizStartedAt: number,
  memberName: string,
  correct: boolean,
) {
  await ensureSignedIn()
  const gRef = groupRef(code, groupId)
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(gRef)
    const group = snap.data() as GroupDoc | undefined
    if (!group) return

    const prev = group.speedProgress?.quizStartedAt === quizStartedAt ? group.speedProgress : null
    if (prev && memberName in prev.answers) return

    const answers = { ...(prev?.answers ?? {}), [memberName]: correct }
    const becomesWinner = correct && !prev?.winnerName
    const winnerName = becomesWinner ? memberName : (prev?.winnerName ?? null)

    tx.update(gRef, {
      speedProgress: { quizStartedAt, answers, winnerName },
      ...(becomesWinner
        ? {
            score: (group.score ?? 0) + 50,
            speedWins: { ...(group.speedWins ?? {}), [memberName]: (group.speedWins?.[memberName] ?? 0) + 1 },
            speedTimes: {
              ...(group.speedTimes ?? {}),
              [memberName]: (group.speedTimes?.[memberName] ?? 0) + Math.max(0, serverNow() - quizStartedAt),
            },
          }
        : {}),
    })
  })
}

// 협동 미션: 조 문서 트랜잭션으로 조원별 응답을 기록하고, 조에 등록된 전체 인원(중복 제거)이
// 모두 응답을 마쳤는지 확인해서 전원 정답이면 +100pt 지급(awarded로 중복 지급 방지).
export async function submitCoopAnswer(
  code: string,
  groupId: string,
  quizStartedAt: number,
  memberName: string,
  correct: boolean,
) {
  await ensureSignedIn()
  const gRef = groupRef(code, groupId)
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(gRef)
    const group = snap.data() as GroupDoc | undefined
    if (!group) return

    const prevProgress = group.coopProgress
    const answers: Record<string, boolean> =
      prevProgress && prevProgress.quizStartedAt === quizStartedAt ? { ...prevProgress.answers } : {}
    answers[memberName] = correct
    const alreadyAwarded = prevProgress && prevProgress.quizStartedAt === quizStartedAt ? prevProgress.awarded : false

    const allMemberNames = new Set<string>()
    for (const names of Object.values(group.members)) {
      for (const n of names ?? []) allMemberNames.add(n)
    }

    const everyoneAnswered = [...allMemberNames].every((n) => n in answers)
    const everyoneCorrect = everyoneAnswered && [...allMemberNames].every((n) => answers[n])
    const shouldAward = everyoneCorrect && !alreadyAwarded

    tx.update(gRef, {
      coopProgress: { quizStartedAt, answers, awarded: alreadyAwarded || shouldAward },
      ...(shouldAward ? { score: (group.score ?? 0) + 100, badge: true } : {}),
    })
  })
}

const RELAY_TIME_LIMIT_MS = 180_000 // 3분

// 대응3단계 릴레이 시작: 조원 누구나 시작할 수 있다.
export async function startRelay(code: string, groupId: string) {
  await ensureSignedIn()
  await updateDoc(groupRef(code, groupId), {
    relay: {
      startedAt: serverNow(),
      turnIndex: 0,
      turnResults: [],
      finishedAt: null,
      timeBonusAwarded: false,
      finalQuiz: null,
    },
  })
}

// 릴레이 한 차례(낭독) 제출. 지금 차례가 아니면 무시(동시 클릭으로 인한 중복 진행을 트랜잭션으로 방지).
// 마지막 차례(관리자)까지 끝나면 finishedAt을 기록하고, 3분 이내 완주 시 +50pt를 함께 지급한다.
export async function submitRelayTurn(
  code: string,
  groupId: string,
  role: RoleId,
  bonus: boolean,
  method: 'stt' | 'manual',
): Promise<'ok' | 'not-your-turn' | 'no-relay'> {
  await ensureSignedIn()
  const gRef = groupRef(code, groupId)
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(gRef)
    const group = snap.data() as GroupDoc | undefined
    const relay = group?.relay
    if (!group || !relay) return 'no-relay'
    if (ROLE_ORDER[relay.turnIndex] !== role) return 'not-your-turn'

    const turnResults = [...relay.turnResults, { role, bonus, method }]
    const turnIndex = relay.turnIndex + 1
    const isDone = turnIndex >= ROLE_ORDER.length
    const finishedAt = isDone ? serverNow() : null
    const withinTime = isDone && finishedAt !== null && finishedAt - relay.startedAt <= RELAY_TIME_LIMIT_MS
    const scoreDelta = (bonus ? 30 : 0) + (withinTime ? 50 : 0)

    tx.update(gRef, {
      relay: {
        ...relay,
        turnIndex,
        turnResults,
        finishedAt,
        timeBonusAwarded: relay.timeBonusAwarded || withinTime,
      },
      ...(scoreDelta > 0 ? { score: (group.score ?? 0) + scoreDelta } : {}),
    })
    return 'ok'
  })
}

// 릴레이 완주 후 "관리자" 대표가 제출하는 최종 의사결정 퀴즈. 정답이면 +100pt(1회만 지급).
export async function submitRelayFinalQuiz(
  code: string,
  groupId: string,
  optionId: string,
  correct: boolean,
): Promise<'ok' | 'already-answered' | 'no-relay'> {
  await ensureSignedIn()
  const gRef = groupRef(code, groupId)
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(gRef)
    const group = snap.data() as GroupDoc | undefined
    const relay = group?.relay
    if (!group || !relay) return 'no-relay'
    if (relay.finalQuiz?.answered) return 'already-answered'

    tx.update(gRef, {
      relay: {
        ...relay,
        finalQuiz: { answered: true, optionId, correct, awarded: correct },
      },
      ...(correct ? { score: (group.score ?? 0) + 100 } : {}),
    })
    return 'ok'
  })
}

function docsToArray<T>(snap: QuerySnapshot<DocumentData>): T[] {
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T)
}

export function subscribeGroups(code: string, cb: (groups: GroupDoc[]) => void) {
  return subscribeAfterAuth((onError) =>
    onSnapshot(groupsCol(code), (snap) => {
      cb(docsToArray<GroupDoc>(snap))
    }, onError),
  )
}

export async function createGroup(code: string, name: string, diseaseId: string): Promise<string> {
  await ensureSignedIn()
  const ref = doc(groupsCol(code))
  const data: Omit<GroupDoc, 'id'> = {
    name,
    diseaseId,
    members: {},
    score: 0,
    badge: false,
    speedProgress: null,
    speedWins: {},
    coopProgress: null,
    relay: null,
    createdAt: Date.now(),
  }
  await setDoc(ref, data)
  return ref.id
}

// 참가자가 내 역할 체크리스트를 체크·해제할 때마다 저장해 진행자 화면에서 조원별 진행 상황을 볼 수 있게 한다.
// 참가자 이름에 점(.) 등이 있어도 안전하도록 FieldPath로 경로를 지정한다.
export async function updateChecklistProgress(
  code: string,
  groupId: string,
  stage: StageId,
  memberName: string,
  checked: number[],
) {
  await ensureSignedIn()
  await updateDoc(groupRef(code, groupId), new FieldPath('checklistProgress', stage, memberName), { checked })
}

export async function deleteGroup(code: string, groupId: string) {
  await ensureSignedIn()
  await deleteDoc(groupRef(code, groupId))
}

// 감염병 후보가 2개 이상이고 아직 추첨하지 않았으면, 참가자는 역할 선택 전에 추첨 화면에서 기다린다.
export function isDiseaseDrawPending(session: SessionDoc): boolean {
  return (session.diseasePool?.length ?? 0) >= 2 && !session.diseaseDrawnAt
}

// 후보를 1개만 고르면 추첨 없이 모든 조에 바로 그 감염병을 지정한다.
export async function setDiseasePool(code: string, pool: string[], groupIds: string[]) {
  await ensureSignedIn()
  const batch = writeBatch(db)
  batch.update(sessionRef(code), {
    diseasePool: pool,
    diseaseDrawnAt: null,
    ...(pool.length > 0 ? { diseaseId: pool[0] } : {}),
    updatedAt: serverTimestamp(),
  })
  if (pool.length === 1) for (const id of groupIds) batch.update(groupRef(code, id), { diseaseId: pool[0] })
  await batch.commit()
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// 후보 감염병을 조에 최대한 고르게(개수 차이 1 이내) 무작위로 나눈다. 추첨은 한 번만 한다.
export async function drawDiseases(code: string, groupIds: string[], pool: string[]) {
  await ensureSignedIn()
  let list: string[] = []
  while (list.length < groupIds.length) list = list.concat(shuffle(pool))
  list = shuffle(list.slice(0, groupIds.length))
  const batch = writeBatch(db)
  groupIds.forEach((id, i) => batch.update(groupRef(code, id), { diseaseId: list[i] }))
  batch.update(sessionRef(code), { diseaseDrawnAt: serverNow(), updatedAt: serverTimestamp() })
  await batch.commit()
}

export async function updateGroupTeamSize(code: string, groupId: string, teamSize: number) {
  await ensureSignedIn()
  await updateDoc(groupRef(code, groupId), { teamSize })
}

export async function updateGroupDisease(code: string, groupId: string, diseaseId: string) {
  await ensureSignedIn()
  await updateDoc(groupRef(code, groupId), { diseaseId })
}

// 한 역할을 여러 명이 함께 맡을 수 있다(조 인원이 5명을 넘어도 모두 입장 가능하도록).
// 같은 이름이 중복 등록되지 않도록, 정원(maxCap)이 있으면 그 인원을 넘지 않도록
// 트랜잭션으로 확인 후 배열에 추가한다(동시 클릭으로 정원을 초과하는 경쟁을 막기 위함).
export async function claimRole(
  code: string,
  groupId: string,
  role: RoleId,
  memberName: string,
  maxCap?: number | null,
): Promise<'ok' | 'duplicate' | 'full'> {
  await ensureSignedIn()
  const ref = groupRef(code, groupId)
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    const current = (snap.data() as GroupDoc | undefined)?.members ?? {}
    const list = current[role] ?? []
    if (list.includes(memberName)) return 'duplicate'
    if (maxCap != null && list.length >= maxCap) return 'full'
    tx.update(ref, { members: { ...current, [role]: [...list, memberName] } })
    return 'ok'
  })
}

export async function releaseRole(code: string, groupId: string, role: RoleId, memberName: string) {
  await ensureSignedIn()
  const snap = await getDoc(groupRef(code, groupId))
  const current = { ...((snap.data() as GroupDoc | undefined)?.members ?? {}) }
  current[role] = (current[role] ?? []).filter((n) => n !== memberName)
  await updateDoc(groupRef(code, groupId), { members: current })
}

export function subscribeStageSubmissions(code: string, stage: StageId, cb: (subs: SubmissionDoc[]) => void) {
  return subscribeAfterAuth((onError) =>
    onSnapshot(submissionsCol(code), (snap) => {
      const all = docsToArray<SubmissionDoc>(snap)
      cb(all.filter((s) => s.stage === stage))
    }, onError),
  )
}

export function subscribeGroupSubmission(
  code: string,
  stage: StageId,
  groupId: string,
  cb: (sub: SubmissionDoc | null) => void,
) {
  return subscribeAfterAuth((onError) =>
    onSnapshot(submissionRef(code, stage, groupId), (snap) => {
      cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as SubmissionDoc) : null)
    }, onError),
  )
}

export async function saveDraftAnswer(
  code: string,
  stage: StageId,
  groupId: string,
  groupName: string,
  answers: SubmissionAnswer[],
) {
  await ensureSignedIn()
  const data: Omit<SubmissionDoc, 'id'> = {
    stage,
    groupId,
    groupName,
    answers,
    submitted: false,
    submittedAt: null,
  }
  await setDoc(submissionRef(code, stage, groupId), data, { merge: true })
}

export async function submitGroupAnswer(
  code: string,
  stage: StageId,
  groupId: string,
  groupName: string,
  answers: SubmissionAnswer[],
) {
  await ensureSignedIn()
  const data: Omit<SubmissionDoc, 'id'> = {
    stage,
    groupId,
    groupName,
    answers,
    submitted: true,
    submittedAt: Date.now(),
  }
  await setDoc(submissionRef(code, stage, groupId), data, { merge: true })
}

// 개발/점검용: 메인화면 "1인 모의훈련 테스트 모드"에서 진행자 세팅부터 조 편성까지 한 번에
// 자동으로 만들어 혼자서도 바로 전체 흐름을 체험할 수 있게 한다. 1조의 발생감시팀 한 자리만
// 실제 테스터 본인 몫으로 남겨 직접 답을 고르고 제출해볼 수 있고, 나머지는 모두 테스트봇이 채운다.
export async function createTestSession(): Promise<{ code: string }> {
  const code = await createSession({
    schoolName: '테스트 학교(1인 체험)',
    schoolLevel: '고등학교',
    diseaseId: DISEASES[0].id,
  })

  // 감염병 종류대로 전부 테스트해볼 수 있도록, 감염병 수만큼 조를 만들어 하나씩 배정한다.
  const groupIds: string[] = []
  for (let i = 0; i < DISEASES.length; i++) {
    const gid = await createGroup(code, `${i + 1}조`, DISEASES[i].id)
    groupIds.push(gid)
  }

  // "나"는 참가자 입장 화면에서 직접 이름·조·역할을 골라 들어온다(실제 참가자 흐름 그대로 체험).
  for (const gid of groupIds) {
    for (const role of ROLE_ORDER) {
      await claimRole(code, gid, role, `테스트봇(${ROLE_LABELS[role]})`)
    }
  }

  return { code }
}
