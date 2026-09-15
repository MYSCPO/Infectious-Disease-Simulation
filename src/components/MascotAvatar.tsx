import { useState } from 'react'
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
  const [errored, setErrored] = useState(false)
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-base' : size === 'lg' ? 'w-14 h-14 text-3xl' : 'w-11 h-11 text-2xl'

  return (
    <div
      className={`shrink-0 rounded-full bg-brand-100 border border-brand-200 overflow-hidden flex items-center justify-center ${sizeClass}`}
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
