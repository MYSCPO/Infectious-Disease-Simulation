import type { RoleId } from '../types'

// 참고 이미지(감시맨·예방벨·학사대장·지원통) 기반 팀 마스코트.
// 실제 일러스트 파일이 준비되면 emoji 대신 이미지 경로로 교체할 수 있도록 구조를 단순하게 유지한다.
export interface Mascot {
  emoji: string
  name: string // 캐릭터 이름
}

export const ROLE_MASCOTS: Record<RoleId, Mascot> = {
  surveillance: { emoji: '🦝', name: '감시맨' },
  health: { emoji: '🐻', name: '예방벨' },
  academic: { emoji: '🦉', name: '학사대장' },
  admin: { emoji: '🦫', name: '지원통' },
  principal: { emoji: '🎓', name: '관리자' },
}

// 발생감시팀 마스코트(감시맨)를 돌발 상황 알림의 고정 진행자로 사용한다.
export const ALERT_MASCOT: RoleId = 'surveillance'
