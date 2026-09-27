import { useState } from 'react'
import type { RoleId } from '../types'
import { ROLE_DESCRIPTIONS, ROLE_LABELS, ROLE_ORDER } from '../types'
import { ROLE_MASCOTS } from '../data/mascots'
import MascotAvatar from './MascotAvatar'

const teamName = (r: RoleId) => ROLE_LABELS[r].split('(')[0]

function RoleDetail({ role }: { role: RoleId }) {
  return (
    <div className="flex items-start gap-3 text-left">
      <div className="shrink-0 scale-125 origin-top-left mr-3 mb-3">
        <MascotAvatar role={role} size="lg" motion="idle" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-black text-slate-800">
          {ROLE_MASCOTS[role].name} <span className="text-brand-700">· {teamName(role)}</span>
        </p>
        <p className="text-xs text-slate-600 leading-relaxed mt-1">{ROLE_DESCRIPTIONS[role].summary}</p>
        <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{ROLE_DESCRIPTIONS[role].example}</p>
      </div>
    </div>
  )
}

// 첫 화면 역할 소개. 게임 캐릭터 선택 화면처럼 PC는 마우스를 올리면, 폰은 터치하면 캐릭터가 커지며 역할 설명이 열린다.
export default function RoleShowcase() {
  const [active, setActive] = useState<RoleId | null>(null)

  return (
    <>
      {/* 폰: 얼굴·이름 한 줄 + 터치하면 아래에 설명 카드 */}
      <div className="sm:hidden">
        <div className="grid grid-cols-5 gap-1">
          {ROLE_ORDER.map((r) => {
            const on = active === r
            return (
              <button
                key={r}
                type="button"
                onClick={() => setActive(on ? null : r)}
                aria-expanded={on}
                className={`flex flex-col items-center gap-1 rounded-xl py-1.5 transition-all duration-200 ${on ? 'bg-white/15' : ''} ${active && !on ? 'opacity-50' : ''}`}
              >
                <div
                  className={`rounded-full p-0.5 border transition-transform duration-200 ${on ? 'scale-125 border-teal-300 bg-teal-300/30' : 'border-white/20 bg-white/15'}`}
                >
                  <MascotAvatar role={r} size="sm" motion={on ? 'none' : 'idle'} />
                </div>
                <span className="text-[10px] font-bold text-white leading-tight mt-0.5">{ROLE_MASCOTS[r].name}</span>
                <span className="text-[9px] text-teal-200/90 leading-tight whitespace-nowrap -mt-0.5">{teamName(r)}</span>
              </button>
            )
          })}
        </div>
        {active ? (
          <div className="mt-3 rounded-2xl bg-white p-3.5 shadow-lg">
            <RoleDetail role={active} />
          </div>
        ) : (
          <p className="mt-2 text-[11px] text-teal-200/70">캐릭터를 누르면 역할 설명을 볼 수 있어요</p>
        )}
      </div>

      {/* PC·태블릿: 카드에 마우스를 올리면 커지면서 위쪽에 설명 말풍선 */}
      <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
        {ROLE_ORDER.map((r) => {
          const on = active === r
          return (
            <div
              key={r}
              className="relative"
              onMouseEnter={() => setActive(r)}
              onMouseLeave={() => setActive(null)}
            >
              {on && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 z-30 rounded-2xl bg-white p-4 shadow-2xl">
                  <RoleDetail role={r} />
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45 bg-white" />
                </div>
              )}
              <button
                type="button"
                onClick={() => setActive(r)}
                onFocus={() => setActive(r)}
                onBlur={() => setActive(null)}
                className={`w-full backdrop-blur-md rounded-2xl p-3 flex items-center gap-2.5 text-left border transition-all duration-200 shadow-sm ${on ? 'bg-white/25 border-teal-300 scale-105 -translate-y-1' : 'bg-white/10 border-white/15'} ${active && !on ? 'opacity-60' : ''}`}
              >
                <div className={`shrink-0 rounded-full p-0.5 border transition-transform duration-200 ${on ? 'scale-125 border-teal-300 bg-teal-300/30' : 'border-white/20 bg-white/15'}`}>
                  <MascotAvatar role={r} size="sm" motion={on ? 'none' : 'idle'} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-white leading-tight truncate">{ROLE_MASCOTS[r].name}</span>
                  <span className="block text-[11px] text-teal-200/90 leading-tight truncate">{teamName(r)}</span>
                </div>
              </button>
            </div>
          )
        })}
      </div>
    </>
  )
}
