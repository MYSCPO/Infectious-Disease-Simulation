import {
  collection,
  doc,
  DocumentData,
  getDoc,
  onSnapshot,
  QuerySnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  updateDoc,
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
function subscribeAfterAuth(attach: () => Unsubscribe): Unsubscribe {
  let unsub: Unsubscribe | null = null
  let cancelled = false
  ensureSignedIn()
    .then(() => {
      if (!cancelled) unsub = attach()
    })
    .catch((e) => {
      console.error('익명 로그인 실패', e)
    })
  return () => {
    cancelled = true
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

export async function startTraining(code: string) {
  const now = Date.now()
  await updateSession(code, { trainingStartedAt: now, stageStartedAt: now, autoQuizSentAt: null, activeQuiz: null })
}

export function subscribeSession(code: string, cb: (session: SessionDoc | null) => void) {
  return subscribeAfterAuth(() =>
    onSnapshot(sessionRef(code), (snap) => {
      cb(snap.exists() ? (snap.data() as SessionDoc) : null)
    }),
  )
}

export async function updateSession(code: string, partial: Partial<SessionDoc>) {
  await ensureSignedIn()
  await updateDoc(sessionRef(code), { ...partial, updatedAt: serverTimestamp() })
}

export async function advanceToStage(code: string, stage: StageId) {
  await updateSession(code, {
    currentStage: stage,
    stageStartedAt: Date.now(),
    revealed: false,
    activeWildcardId: null,
    activeQuiz: null,
    autoQuizSentAt: null,
  })
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
) {
  await updateSession(code, {
    activeQuiz: { startedAt: Date.now(), durationSec, quizType, source, firstBloodGroupId: null },
  })
}

export async function endWildcardQuiz(code: string) {
  await updateSession(code, { activeQuiz: null })
}

// 스피드 퀴즈: 조 대표 답을 기록하고, 정답이면 세션 문서 트랜잭션으로 이 퀴즈의
// firstBloodGroupId가 비어있을 때만 이 조로 선점(전체 조 중 가장 먼저 맞힌 조만 보너스).
export async function submitSpeedQuizAnswer(
  code: string,
  groupId: string,
  quizStartedAt: number,
  correct: boolean,
): Promise<boolean> {
  await ensureSignedIn()
  await updateDoc(groupRef(code, groupId), { quizAnswer: { quizStartedAt, correct } })

  if (!correct) return false

  const sRef = sessionRef(code)
  const wonFirstBlood = await runTransaction(db, async (tx) => {
    const snap = await tx.get(sRef)
    const session = snap.data() as SessionDoc | undefined
    const activeQuiz = session?.activeQuiz
    if (!activeQuiz || activeQuiz.startedAt !== quizStartedAt) return false
    if (activeQuiz.firstBloodGroupId != null) return false
    tx.update(sRef, { 'activeQuiz.firstBloodGroupId': groupId, updatedAt: serverTimestamp() })
    return true
  })

  if (wonFirstBlood) {
    const gRef = groupRef(code, groupId)
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(gRef)
      const group = snap.data() as GroupDoc | undefined
      const currentScore = group?.score ?? 0
      tx.update(gRef, { score: currentScore + 50, badge: true })
    })
  }

  return wonFirstBlood
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
      startedAt: Date.now(),
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
    const finishedAt = isDone ? Date.now() : null
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
      ...(scoreDelta > 0 ? { score: (group.score ?? 0) + scoreDelta, badge: true } : {}),
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
      ...(correct ? { score: (group.score ?? 0) + 100, badge: true } : {}),
    })
    return 'ok'
  })
}

function docsToArray<T>(snap: QuerySnapshot<DocumentData>): T[] {
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T)
}

export function subscribeGroups(code: string, cb: (groups: GroupDoc[]) => void) {
  return subscribeAfterAuth(() =>
    onSnapshot(groupsCol(code), (snap) => {
      cb(docsToArray<GroupDoc>(snap))
    }),
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
    quizAnswer: null,
    coopProgress: null,
    relay: null,
    createdAt: Date.now(),
  }
  await setDoc(ref, data)
  return ref.id
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
  return subscribeAfterAuth(() =>
    onSnapshot(submissionsCol(code), (snap) => {
      const all = docsToArray<SubmissionDoc>(snap)
      cb(all.filter((s) => s.stage === stage))
    }),
  )
}

export function subscribeGroupSubmission(
  code: string,
  stage: StageId,
  groupId: string,
  cb: (sub: SubmissionDoc | null) => void,
) {
  return subscribeAfterAuth(() =>
    onSnapshot(submissionRef(code, stage, groupId), (snap) => {
      cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as SubmissionDoc) : null)
    }),
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
export async function createTestSession(): Promise<{ code: string; groupId: string; role: RoleId }> {
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

  const myGroupId = groupIds[0]
  const myRole: RoleId = 'surveillance'
  await claimRole(code, myGroupId, myRole, '테스트 참가자(나)')

  for (const gid of groupIds) {
    for (const role of ROLE_ORDER) {
      if (gid === myGroupId && role === myRole) continue
      await claimRole(code, gid, role, `테스트봇(${ROLE_LABELS[role]})`)
    }
  }

  return { code, groupId: myGroupId, role: myRole }
}
