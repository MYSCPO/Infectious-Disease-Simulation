import type { RoleId } from '../types'
import { ROLE_MASCOTS } from '../data/mascots'

export default function MascotAvatar({
  role,
  size = 'md',
}: {
  role: RoleId
  size?: 'sm' | 'md' | 'lg'
}) {
  const mascot = ROLE_MASCOTS[role]
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-base' : size === 'lg' ? 'w-14 h-14 text-3xl' : 'w-11 h-11 text-2xl'
  return (
    <div
      className={`shrink-0 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center ${sizeClass}`}
      title={mascot.name}
    >
      {mascot.emoji}
    </div>
  )
}
