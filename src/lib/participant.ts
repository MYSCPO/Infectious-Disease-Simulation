import type { RoleId } from '../types'

export interface ParticipantIdentity {
  sessionCode: string
  groupId: string
  role: RoleId
  name: string
}

const STORAGE_KEY = 'idsim.participant'

// 새로고침해도 같은 조·역할로 돌아올 수 있도록 브라우저(폰)에 로컬 저장한다.
export function saveParticipantIdentity(identity: ParticipantIdentity) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identity))
  } catch {
    // 저장 실패(프라이빗 모드 등)는 무시 — 새로고침 시 다시 입장하면 된다.
  }
}

export function loadParticipantIdentity(): ParticipantIdentity | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ParticipantIdentity) : null
  } catch {
    return null
  }
}

export function clearParticipantIdentity() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
