import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore'
import { auth, db, ensureSignedIn } from '../firebase'

// 기기마다 시계가 몇 초씩 어긋나 있어서, 진행자 PC가 저장한 시작 시각을 폰이 자기 시계로 계산하면
// 타이머가 3:06처럼 달라 보였다. 모든 기기가 서버 시계 기준으로 쓰고 계산하도록 차이를 한 번 재 둔다.
let offsetMs = 0
let syncing: Promise<void> | null = null

export function serverNow(): number {
  return Date.now() + offsetMs
}

async function measureOnce(): Promise<{ offset: number; rtt: number } | null> {
  await ensureSignedIn()
  const uid = auth.currentUser?.uid
  if (!uid) return null
  const ref = doc(db, 'sessions', '_clock', 'clocks', uid)
  // 서버 시각은 쓰기가 반영되는 순간에 찍히므로, 쓰기 왕복 시간의 가운데를 기준으로 삼는다.
  const t0 = Date.now()
  await setDoc(ref, { at: serverTimestamp() })
  const t1 = Date.now()
  const snap = await getDoc(ref)
  const at = snap.data()?.at as Timestamp | undefined
  if (!at) return null
  return { offset: at.toMillis() - (t0 + t1) / 2, rtt: t1 - t0 }
}

export function syncServerClock(): Promise<void> {
  if (!syncing) {
    syncing = (async () => {
      try {
        const samples = [await measureOnce(), await measureOnce().catch(() => null), await measureOnce().catch(() => null)].filter(
          (s): s is { offset: number; rtt: number } => s !== null,
        )
        if (samples.length > 0) {
          offsetMs = samples.sort((a, b) => a.rtt - b.rtt)[0].offset
        }
      } catch (e) {
        console.warn('서버 시계 맞추기 실패(기기 시계 사용)', e)
        syncing = null
      }
    })()
  }
  return syncing
}
