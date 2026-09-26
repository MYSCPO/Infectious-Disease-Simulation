// 훈련(세션)별 진행자 비밀번호. 평문 대신 참가 코드와 섞은 SHA-256 해시만 저장한다.
// 서버 검증이 아닌 화면 단계의 확인이라, 다른 학교 진행자가 실수로 들어오는 것을 막는 용도다.
export async function hashFacilitatorPin(code: string, pin: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${code}:${pin}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

const storageKey = (code: string) => `facilitator-unlocked:${code}`

export function markFacilitatorUnlocked(code: string, pinHash: string) {
  try {
    localStorage.setItem(storageKey(code), pinHash)
  } catch {
    // 저장이 막힌 브라우저에서는 매번 비밀번호를 다시 묻는다.
  }
}

export function isFacilitatorUnlocked(code: string, pinHash: string): boolean {
  try {
    return localStorage.getItem(storageKey(code)) === pinHash
  } catch {
    return false
  }
}
