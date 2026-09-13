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
  updateDoc,
} from 'firebase/firestore'
import { db, ensureSignedIn } from '../firebase'
import type {
  GroupDoc,
  RoleId,
  SchoolLevel,
  SessionDoc,
  SessionGaps,
  SessionOrgChart,
  StageId,
  SubmissionAnswer,
  SubmissionDoc,
} from '../types'
import { STAGES } from '../data/stages'

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 혼동되는 0/O, 1/I 제외

export function generateSessionCode(length = 5): string {
  let code = ''
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return code
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

  const emptyOrgChart: SessionOrgChart = { homeroom: '', health: '', safetyHead: '', admin: '', principal: '' }
  const emptyGaps: SessionGaps = { observationRoomLocation: '', homeroomBackupPlan: '', weekendContactSystem: '' }

  const data: Omit<SessionDoc, 'createdAt' | 'updatedAt'> & { createdAt: unknown; updatedAt: unknown } = {
    code,
    schoolName: input.schoolName,
    schoolLevel: input.schoolLevel,
    diseaseId: input.diseaseId,
    orgChart: emptyOrgChart,
    gaps: emptyGaps,
    currentStage: STAGES[0].id,
    revealed: false,
    activeWildcardId: null,
    attendeeCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  await setDoc(sessionRef(code), data)
  return code
}

export function subscribeSession(code: string, cb: (session: SessionDoc | null) => void) {
  return onSnapshot(sessionRef(code), (snap) => {
    cb(snap.exists() ? (snap.data() as SessionDoc) : null)
  })
}

export async function updateSession(code: string, partial: Partial<SessionDoc>) {
  await ensureSignedIn()
  await updateDoc(sessionRef(code), { ...partial, updatedAt: serverTimestamp() })
}

export async function advanceToStage(code: string, stage: StageId) {
  await updateSession(code, { currentStage: stage, revealed: false, activeWildcardId: null })
}

export async function setRevealed(code: string, revealed: boolean) {
  await updateSession(code, { revealed })
}

export async function setActiveWildcard(code: string, wildcardId: string | null) {
  await updateSession(code, { activeWildcardId: wildcardId })
}

function docsToArray<T>(snap: QuerySnapshot<DocumentData>): T[] {
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T)
}

export function subscribeGroups(code: string, cb: (groups: GroupDoc[]) => void) {
  return onSnapshot(groupsCol(code), (snap) => {
    cb(docsToArray<GroupDoc>(snap))
  })
}

export async function createGroup(code: string, name: string): Promise<string> {
  await ensureSignedIn()
  const ref = doc(groupsCol(code))
  const data: Omit<GroupDoc, 'id'> = { name, members: {}, createdAt: Date.now() }
  await setDoc(ref, data)
  return ref.id
}

// 여러 참가자가 동시에 같은 조에 폰으로 접속해 역할을 선택할 수 있으므로,
// 트랜잭션으로 "이미 선점된 역할" 경합을 막는다.
export async function claimRole(code: string, groupId: string, role: RoleId, memberName: string): Promise<boolean> {
  await ensureSignedIn()
  const ref = groupRef(code, groupId)
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    const current = (snap.data() as GroupDoc | undefined)?.members ?? {}
    if (current[role]) return false
    tx.update(ref, { members: { ...current, [role]: memberName } })
    return true
  })
}

export async function releaseRole(code: string, groupId: string, role: RoleId) {
  await ensureSignedIn()
  const snap = await getDoc(groupRef(code, groupId))
  const current = { ...((snap.data() as GroupDoc | undefined)?.members ?? {}) }
  delete current[role]
  await updateDoc(groupRef(code, groupId), { members: current })
}

export function subscribeStageSubmissions(code: string, stage: StageId, cb: (subs: SubmissionDoc[]) => void) {
  return onSnapshot(submissionsCol(code), (snap) => {
    const all = docsToArray<SubmissionDoc>(snap)
    cb(all.filter((s) => s.stage === stage))
  })
}

export function subscribeGroupSubmission(
  code: string,
  stage: StageId,
  groupId: string,
  cb: (sub: SubmissionDoc | null) => void,
) {
  return onSnapshot(submissionRef(code, stage, groupId), (snap) => {
    cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as SubmissionDoc) : null)
  })
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
