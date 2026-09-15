import type { ReactNode } from 'react'
import type { RoleId } from '../types'
import { ROLE_MASCOTS } from '../data/mascots'
import type { MascotMotion } from './MascotAvatar'
import MascotAvatar from './MascotAvatar'

export default function MascotSpeechBubble({
  role,
  tag,
  motion = 'idle',
  children,
}: {
  role: RoleId
  tag?: string
  motion?: MascotMotion
  children: ReactNode
}) {
  const mascot = ROLE_MASCOTS[role]
  return (
    <div className="flex items-start gap-2.5">
      <MascotAvatar role={role} motion={motion} />
      <div className="relative flex-1 bg-white border border-brand-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm">
        <p className="text-xs font-bold text-brand-700 mb-1">
          {mascot.name}
          {tag && <span className="ml-1 font-normal text-slate-400">· {tag}</span>}
        </p>
        <div className="text-sm text-slate-700 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
