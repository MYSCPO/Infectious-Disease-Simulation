import { collection, deleteDoc, doc, getDocs, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { db, ensureSignedIn } from '../firebase'
import type { LearnerDoc, RoleId, SchoolLevel, StageId } from '../types'
import { ROLE_LABELS } from '../types'
import { STAGES } from '../data/stages'
import { getDiseaseById } from '../data/diseases'
import { getCommonWildcardQuiz, getWildcardQuiz, type WildcardQuizQuestion } from '../data/wildcardQuiz'
import { getRelayFinalQuiz } from '../data/relayFinalQuiz'
import { createSession, updateSession } from './session'
import { serverNow } from './serverClock'

// ── 개인 자율 연수: 교직원이 진행자 없이 각자 편한 시간에 혼자 단계를 진행하고, 기록이 남는다.

const learnersCol = (code: string) => collection(db, 'sessions', code, 'learners')
const learnerRef = (code: string, id: string) => doc(db, 'sessions', code, 'learners', id)

export const SELF_STAGES: StageId[] = STAGES.map((s) => s.id)
export const SELF_READING_SEC = 30

export async function createSelfSession(input: {
  schoolName: string
  schoolLevel: SchoolLevel
  diseasePool: string[]
  facilitatorPin: string
}): Promise<string> {
  const code = await createSession({
    schoolName: input.schoolName,
    schoolLevel: input.schoolLevel,
    diseaseId: input.diseasePool[0],
    facilitatorPin: input.facilitatorPin,
  })
  await updateSession(code, { mode: 'self', diseasePool: input.diseasePool, selfClosed: false })
  return code
}

// 같은 기기에서 다시 열면 하던 단계부터 이어서 하도록, 참여자 ID를 방 코드별로 기억해 둔다.
const learnerKey = (code: string) => `idsim.learner.${code}`
export function loadLearnerId(code: string): string | null {
  try {
    return localStorage.getItem(learnerKey(code))
  } catch {
    return null
  }
}
function saveLearnerId(code: string, id: string) {
  try {
    localStorage.setItem(learnerKey(code), id)
  } catch {
    // 저장이 막힌 브라우저는 이어 하기만 안 될 뿐 진행에는 지장이 없다.
  }
}

export async function startLearner(
  code: string,
  input: { name: string; affiliation: string; role: RoleId; pool: string[] },
): Promise<string> {
  await ensureSignedIn()
  const ref = doc(learnersCol(code))
  const now = serverNow()
  const data: Omit<LearnerDoc, 'id'> = {
    name: input.name,
    affiliation: input.affiliation,
    role: input.role,
    // 후보가 여럿이면 한 사람에게 하나를 무작위로 배정한다.
    diseaseId: input.pool[Math.floor(Math.random() * input.pool.length)],
    stage: 'reading',
    checked: {},
    answers: {},
    startedAt: now,
    updatedAt: now,
    completedAt: null,
  }
  await setDoc(ref, data)
  saveLearnerId(code, ref.id)
  return ref.id
}

export async function updateLearner(code: string, id: string, partial: Partial<Omit<LearnerDoc, 'id'>>) {
  await ensureSignedIn()
  await updateDoc(learnerRef(code, id), { ...partial, updatedAt: serverNow() })
}

export function subscribeLearner(code: string, id: string, cb: (l: LearnerDoc | null) => void) {
  let unsub = () => {}
  let cancelled = false
  ensureSignedIn().then(() => {
    if (cancelled) return
    unsub = onSnapshot(learnerRef(code, id), (snap) => cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as LearnerDoc) : null))
  })
  return () => {
    cancelled = true
    unsub()
  }
}

export function subscribeLearners(code: string, cb: (list: LearnerDoc[]) => void) {
  let unsub = () => {}
  let cancelled = false
  ensureSignedIn().then(() => {
    if (cancelled) return
    unsub = onSnapshot(learnersCol(code), (snap) =>
      cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as LearnerDoc).sort((a, b) => a.startedAt - b.startedAt)),
    )
  })
  return () => {
    cancelled = true
    unsub()
  }
}

export async function deleteAllLearners(code: string) {
  await ensureSignedIn()
  const snap = await getDocs(learnersCol(code))
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
}

// 단계별 확인 퀴즈: 예방·대응1·대응2는 내 감염병 문제(서로 다른 문제), 대응3은 관리자 최종 의사결정 퀴즈,
// 복구는 전 교직원 공통 출결 문제. 참여자마다 시작 문제를 달리해 옆 사람과 답이 겹치지 않게 한다.
export function selfQuizFor(learner: Pick<LearnerDoc, 'id' | 'diseaseId'>, stage: StageId): WildcardQuizQuestion | null {
  let h = 0
  for (const ch of learner.id) h = (h * 31 + ch.charCodeAt(0)) % 9973
  if (stage === 'response3') {
    const q = getRelayFinalQuiz(learner.diseaseId)
    return { topic: '관리자 최종 의사결정', prompt: q.prompt, options: q.options }
  }
  if (stage === 'recovery') return getCommonWildcardQuiz(h)
  const round = ['prevention', 'response1', 'response2'].indexOf(stage)
  return getWildcardQuiz(learner.diseaseId, h + round)
}

export function learnerStatusLabel(l: LearnerDoc): string {
  if (l.stage === 'done') return '완료'
  if (l.stage === 'reading') return '진행 중 · 매뉴얼 읽기'
  return `진행 중 · ${STAGES.find((s) => s.id === l.stage)?.shortLabel ?? ''}`
}

export function learnerCorrect(l: LearnerDoc): number {
  return SELF_STAGES.filter((s) => l.answers[s] === true).length
}

function fmt(ts: number | null): string {
  if (!ts) return ''
  const d = new Date(ts)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
export function durationMin(l: LearnerDoc): number | null {
  return l.completedAt ? Math.max(1, Math.round((l.completedAt - l.startedAt) / 60000)) : null
}

// 엑셀 파일(.xlsx)로 내려받는다. CSV는 엑셀이 시각·"4/5"를 날짜로 바꿔 ####으로 보이므로,
// 모든 칸을 글자로 넣고 칸 너비를 지정한다. 라이브러리는 버튼을 누를 때만 불러온다.
export async function downloadLearnersXlsx(schoolName: string, learners: LearnerDoc[]) {
  const XLSX = await import('xlsx')
  const header = ['이름', '소속', '역할', '감염병', '상태', '시작', '완료', '소요(분)', '퀴즈 정답']
  const rows = learners.map((l) => [
    l.name,
    l.affiliation,
    ROLE_LABELS[l.role].split('(')[0],
    getDiseaseById(l.diseaseId).name,
    learnerStatusLabel(l),
    fmt(l.startedAt),
    fmt(l.completedAt),
    durationMin(l) ?? '',
    `${learnerCorrect(l)}문항 / ${SELF_STAGES.length}문항`,
  ])
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
  ws['!cols'] = [10, 12, 12, 14, 18, 18, 18, 9, 14].map((wch) => ({ wch }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '참여 현황')
  const today = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `${schoolName}_개인자율연수_참여현황_${today}.xlsx`)
}
