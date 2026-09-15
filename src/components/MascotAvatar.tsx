import { useState } from 'react'
import type { RoleId } from '../types'
import { ROLE_MASCOTS } from '../data/mascots'

// idle: 은은하게 둥실거림(대기) · bounce: 정답 공개 등 축하 모션 · shake: 돌발 상황 등 경고 모션 · none: 정지
export type MascotMotion = 'idle' | 'bounce' | 'shake' | 'none'

const MOTION_CLASS: Record<MascotMotion, string> = {
  idle: 'mascot-motion-idle',
  bounce: 'animate-bounce',
  shake: 'mascot-motion-shake',
  none: '',
}

export default function MascotAvatar({
  role,
  size = 'md',
  motion = 'none',
}: {
  role: RoleId
  size?: 'sm' | 'md' | 'lg'
  motion?: MascotMotion
}) {
  const mascot = ROLE_MASCOTS[role]
  const [errored, setErrored] = useState(false)
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-base' : size === 'lg' ? 'w-14 h-14 text-3xl' : 'w-11 h-11 text-2xl'

  return (
    <div
      className={`shrink-0 rounded-full bg-brand-100 border border-brand-200 overflow-hidden flex items-center justify-center ${sizeClass} ${MOTION_CLASS[motion]}`}
      title={mascot.name}
    >
      {errored ? (
        <span>{mascot.emoji}</span>
      ) : (
        <img
          src={mascot.image}
          alt={mascot.name}
          className="w-full h-full object-cover"
          onError={() => setErrored(true)}
        />
      )}
    </div>
  )
}
