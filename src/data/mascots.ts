import type { RoleId } from '../types'

// 팀 마스코트. 실제 일러스트(public/mascots/avatar/*.png, 각 원본을 인물 중심으로 자동 크롭한 버전)를 사용하고,
// emoji는 이미지 로드 실패 시 대체 표시용으로만 남겨둔다.
export interface Mascot {
  image: string
  emoji: string // 이미지 로드 실패 시 대체 표시
  name: string // 캐릭터 이름
}

export const ROLE_MASCOTS: Record<RoleId, Mascot> = {
  surveillance: { image: '/mascots/avatar/surveillance.png', emoji: '🦝', name: '감시맨' },
  health: { image: '/mascots/avatar/health.png', emoji: '🐻', name: '예방벨' },
  academic: { image: '/mascots/avatar/academic.png', emoji: '🦉', name: '학사대장' },
  admin: { image: '/mascots/avatar/admin.png', emoji: '🦫', name: '지원통' },
  principal: { image: '/mascots/avatar/principal.png', emoji: '🎓', name: '관리자' },
}

// 발생감시팀 마스코트(감시맨)를 돌발 상황 알림의 고정 진행자로 사용한다.
export const ALERT_MASCOT: RoleId = 'surveillance'
