import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { RoleId } from '../types'
import { ROLE_MASCOTS } from '../data/mascots'
import MascotAvatar from '../components/MascotAvatar'
import ReferenceGrid from '../components/ReferenceGrid'
import SiteFooter from '../components/SiteFooter'
import { getSessionOnce } from '../lib/session'
import { hashFacilitatorPin, markFacilitatorUnlocked } from '../lib/facilitatorAuth'

const TEAM_ROLES: RoleId[] = ['surveillance', 'health', 'academic', 'admin', 'principal']

// 실제 보안 장치가 아니라, 교직원이 실수로 진행자 설정에 들어가는 것만 막는 가벼운 진입장벽입니다.
const FACILITATOR_PASSWORD = 'admin1234'

export default function MainPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [gateStep, setGateStep] = useState<'closed' | 'password' | 'choose' | 'open'>('closed')
  const [password, setPassword] = useState('')
  const [gateError, setGateError] = useState<string | null>(null)
  const [openCode, setOpenCode] = useState('')
  const [openPin, setOpenPin] = useState('')
  const [opening, setOpening] = useState(false)

  function closeGate() {
    setGateStep('closed')
    setPassword('')
    setOpenCode('')
    setOpenPin('')
    setGateError(null)
  }

  function handleJoinSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length < 4) {
      setError('참가 코드를 정확히 입력해 주세요.')
      return
    }
    navigate(`/join/${trimmed}`)
  }

  function handleGateSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password === FACILITATOR_PASSWORD) {
      setPassword('')
      setGateError(null)
      setGateStep('choose')
    } else {
      setGateError('비밀번호가 올바르지 않습니다.')
    }
  }

  async function handleOpenSubmit(e: React.FormEvent) {
    e.preventDefault()
    const c = openCode.trim().toUpperCase()
    setOpening(true)
    setGateError(null)
    try {
      const session = await getSessionOnce(c)
      if (!session) {
        setGateError('해당 참가 코드의 훈련이 없어요. 코드를 다시 확인해 주세요.')
        return
      }
      if (session.facilitatorPinHash) {
        const hash = await hashFacilitatorPin(c, openPin)
        if (hash !== session.facilitatorPinHash) {
          setGateError('진행자 비밀번호가 달라요.')
          return
        }
        markFacilitatorUnlocked(c, hash)
      }
      closeGate()
      navigate(`/facilitator/${c}/groups`)
    } catch (err) {
      console.error(err)
      setGateError('확인 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setOpening(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper-50">
      <header className="relative bg-brand-600 text-white py-12 px-4 text-center rounded-b-[2.5rem]">
        <button
          type="button"
          onClick={() => setGateStep('password')}
          className="absolute top-4 right-4 text-xs sm:text-sm font-semibold text-brand-50 hover:text-white bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5 transition-colors"
        >
          ⚙️ 진행자 설정
        </button>

        <p className="text-brand-50 text-sm font-semibold mb-2">🌱 하나 된 대응, 건강한 학교생활</p>
        <h1 className="text-2xl sm:text-3xl font-black">학교 감염병 위기 대응 모의훈련</h1>
        <p className="mt-3 text-brand-50 text-sm max-w-xl mx-auto leading-relaxed">
          시나리오를 단계별로 따라가며 발생감시팀·예방관리팀·학사관리팀·행정지원팀·관리자 역할을 조별로 수행하는 웹
          기반 모의훈련 프로그램이에요. 돌발 퀴즈와 릴레이 미션으로 점수를 모으고 실시간 순위표로 함께 경쟁하며,
          재미있게 배워요 :)
        </p>
      </header>

      <main className="flex-1 w-full">
        <div className="max-w-md w-full mx-auto px-4 py-10">
          <section className="bg-white rounded-3xl border border-brand-100 shadow-sm p-6 sm:p-8 text-center">
            <div className="grid grid-cols-5 gap-1.5 sm:gap-4 mb-3 justify-items-center">
              {TEAM_ROLES.map((r) => (
                <div key={r} className="flex flex-col items-center">
                  <MascotAvatar role={r} size="md" motion="idle" />
                  <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 text-center leading-tight">
                    {ROLE_MASCOTS[r].name}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mb-4">감시맨·예방벨·학사대장·지원통·관리자가 함께 기다리고 있어요!</p>

            <div className="text-4xl mb-2">🚨</div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">감염병 모의 훈련 참가하기</h2>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              진행자에게 받은 참가 코드를 입력하고 바로 입장하세요.
            </p>
            <form onSubmit={handleJoinSubmit} className="space-y-3">
              <input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  setError(null)
                }}
                placeholder="참가 코드 입력 (예: AB3CD)"
                maxLength={8}
                autoComplete="off"
                autoCapitalize="characters"
                className="w-full text-center tracking-[0.3em] text-xl sm:text-2xl font-bold rounded-2xl border-2 border-brand-200 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400"
              />
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <button
                type="submit"
                className="w-full rounded-full bg-brand-600 text-white py-3 text-base font-bold hover:bg-brand-700 transition-colors"
              >
                입장하기 →
              </button>
            </form>
          </section>
        </div>

        <div className="pb-6">
          <ReferenceGrid />
        </div>
      </main>

      <SiteFooter />

      {gateStep !== 'closed' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          {gateStep === 'password' && (
            <form onSubmit={handleGateSubmit} className="bg-white rounded-3xl shadow-xl max-w-xs w-full p-6 text-center space-y-3">
              <div className="text-3xl">🔒</div>
              <h3 className="text-base font-bold text-slate-800">진행자 설정 비밀번호</h3>
              <p className="text-xs text-slate-400">교직원이 실수로 들어오지 않도록 막는 간단한 확인이에요.</p>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setGateError(null)
                }}
                autoFocus
                placeholder="비밀번호 입력"
                className="w-full text-center rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              {gateError && <p className="text-xs text-rose-600">{gateError}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeGate}
                  className="flex-1 rounded-full border border-slate-200 text-slate-500 py-2.5 text-sm font-semibold hover:bg-slate-50"
                >
                  취소
                </button>
                <button type="submit" className="flex-1 rounded-full bg-brand-600 text-white py-2.5 text-sm font-bold hover:bg-brand-700">
                  확인
                </button>
              </div>
            </form>
          )}

          {gateStep === 'choose' && (
            <div className="bg-white rounded-3xl shadow-xl max-w-xs w-full p-6 text-center space-y-3">
              <div className="text-3xl">⚙️</div>
              <h3 className="text-base font-bold text-slate-800">무엇을 할까요?</h3>
              <button
                type="button"
                onClick={() => {
                  closeGate()
                  navigate('/facilitator/setup')
                }}
                className="w-full rounded-2xl bg-brand-600 text-white py-3 px-4 text-left hover:bg-brand-700"
              >
                <span className="block text-sm font-bold">➕ 새 훈련 만들기</span>
                <span className="block text-[11px] text-brand-50 mt-0.5">학교 정보를 입력하고 진행자 비밀번호를 정해요</span>
              </button>
              <button
                type="button"
                onClick={() => setGateStep('open')}
                className="w-full rounded-2xl border-2 border-brand-200 text-brand-700 py-3 px-4 text-left hover:bg-brand-50"
              >
                <span className="block text-sm font-bold">🔑 내가 만든 훈련 들어가기</span>
                <span className="block text-[11px] text-slate-500 mt-0.5">참가 코드와 진행자 비밀번호로 들어가요</span>
              </button>
              <button type="button" onClick={closeGate} className="text-xs text-slate-400 underline">
                닫기
              </button>
            </div>
          )}

          {gateStep === 'open' && (
            <form onSubmit={handleOpenSubmit} className="bg-white rounded-3xl shadow-xl max-w-xs w-full p-6 text-center space-y-3">
              <div className="text-3xl">🔑</div>
              <h3 className="text-base font-bold text-slate-800">내가 만든 훈련 들어가기</h3>
              <p className="text-xs text-slate-400">훈련을 만들 때 받은 참가 코드와 직접 정한 진행자 비밀번호를 입력해 주세요.</p>
              <input
                value={openCode}
                onChange={(e) => {
                  setOpenCode(e.target.value.toUpperCase())
                  setGateError(null)
                }}
                autoFocus
                maxLength={8}
                autoComplete="off"
                placeholder="참가 코드"
                className="w-full text-center rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 tracking-widest font-bold"
              />
              <input
                type="password"
                value={openPin}
                onChange={(e) => {
                  setOpenPin(e.target.value)
                  setGateError(null)
                }}
                placeholder="진행자 비밀번호"
                className="w-full text-center rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              {gateError && <p className="text-xs text-rose-600">{gateError}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setGateError(null)
                    setGateStep('choose')
                  }}
                  className="flex-1 rounded-full border border-slate-200 text-slate-500 py-2.5 text-sm font-semibold hover:bg-slate-50"
                >
                  뒤로
                </button>
                <button
                  type="submit"
                  disabled={opening || openCode.trim().length < 4 || !openPin}
                  className="flex-1 rounded-full bg-brand-600 text-white py-2.5 text-sm font-bold hover:bg-brand-700 disabled:opacity-40"
                >
                  {opening ? '확인 중...' : '들어가기'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
