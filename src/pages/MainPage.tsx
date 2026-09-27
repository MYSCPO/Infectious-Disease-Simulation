import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { RoleId } from '../types'
import { ROLE_LABELS } from '../types'
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
    <div className="min-h-screen flex flex-col bg-paper-50 selection:bg-brand-100 selection:text-brand-900">
      {/* 히어로 섹션: Deep Blue & Medical Teal 그라데이션과 시원한 레이아웃 */}
      <header className="relative bg-gradient-to-b from-navy-950 via-[#0e2a44] to-brand-900 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 text-center rounded-b-[2.5rem] sm:rounded-b-[3.5rem] shadow-xl overflow-hidden">
        {/* 은은한 배경 조명 장식 */}
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-brand-500/15 blur-[120px] rounded-full pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-0 w-80 h-80 bg-sky-500/10 blur-[100px] rounded-full pointer-events-none"
        />

        {/* 상단 바: 진행자 설정 버튼 */}
        <div className="max-w-5xl mx-auto flex justify-end mb-4 relative z-10">
          <button
            type="button"
            onClick={() => setGateStep('password')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-teal-100 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 transition-all duration-200 hover:scale-[1.02] shadow-sm"
          >
            <span>⚙️</span>
            <span>진행자 설정</span>
          </button>
        </div>

        {/* 메인 타이틀 & 소개 카피 */}
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-teal-500/15 border border-teal-300/25 text-teal-200 text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-full mb-4 shadow-sm backdrop-blur-sm">
            <span>🌱</span>
            <span>하나 된 대응, 건강한 학교생활</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            학교 감염병 위기 대응 모의훈련
          </h1>

          <p className="mt-4 text-teal-50/90 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-normal">
            시나리오를 단계별로 따라가며 발생감시팀·예방관리팀·학사관리팀·행정지원팀·관리자 역할을 조별로 수행하는
            웹 기반 모의훈련 프로그램이에요. 돌발 퀴즈와 릴레이 미션으로 함께 대응하며 배웁니다.
          </p>

          {/* 역할별 캐릭터 미니 프로필 카드/칩 영역 */}
          <div className="mt-5 pt-4 sm:mt-8 sm:pt-6 border-t border-white/10">
            <p className="text-xs text-teal-200/80 font-medium mb-3">
              우리 학교를 지키는 5가지 핵심 대응 역할
            </p>
            {/* 폰에서는 카드가 여러 줄로 쌓여 참가 코드 입력 칸이 밀려나므로 얼굴·이름만 한 줄로 보여준다 */}
            <div className="grid grid-cols-5 gap-1 sm:hidden">
              {TEAM_ROLES.map((r) => (
                <div key={r} className="flex flex-col items-center gap-1">
                  <div className="bg-white/15 rounded-full p-0.5 border border-white/20">
                    <MascotAvatar role={r} size="sm" motion="idle" />
                  </div>
                  <span className="text-[10px] font-bold text-white leading-tight">{ROLE_MASCOTS[r].name}</span>
                </div>
              ))}
            </div>
            <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
              {TEAM_ROLES.map((r) => {
                const mascot = ROLE_MASCOTS[r]
                const roleLabel = ROLE_LABELS[r]
                return (
                  <div
                    key={r}
                    className="group bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 text-left transition-all duration-200 shadow-sm hover:-translate-y-0.5"
                  >
                    <div className="shrink-0 bg-white/15 rounded-full p-0.5 border border-white/20">
                      <MascotAvatar role={r} size="sm" motion="idle" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs sm:text-sm font-bold text-white leading-tight truncate">
                        {mascot.name}
                      </span>
                      <span className="block text-[11px] text-teal-200/90 leading-tight truncate">
                        {roleLabel.split('(')[0]}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 w-full pb-16">
        {/* 참가 코드 입력 폼: 시선이 집중되는 입체적 포커스 카드 */}
        <div className="max-w-lg w-full mx-auto px-4 -mt-8 sm:-mt-10 relative z-20">
          <section className="bg-white rounded-3xl border border-brand-100/80 shadow-[0_20px_50px_rgba(13,148,136,0.16),0_10px_25px_rgba(15,23,42,0.08)] p-6 sm:p-9 text-center backdrop-blur-sm transition-all">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 text-3xl mb-3 shadow-inner">
              🚨
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              감염병 모의 훈련 참가하기
            </h2>
            <p className="text-sm text-slate-500 mt-1.5 mb-6 leading-relaxed">
              진행자에게 부여받은 참가 코드를 입력하고 바로 입장하세요.
            </p>

            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div>
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
                  className="w-full text-center tracking-[0.35em] text-2xl sm:text-3xl font-black text-slate-900 placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-medium placeholder:text-base rounded-2xl border-2 border-slate-200 bg-slate-50/70 hover:border-slate-300 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 py-3.5 sm:py-4 px-4 transition-all outline-none"
                />
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-sm font-semibold text-rose-600 flex items-center justify-center gap-1.5">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 hover:from-teal-500 hover:via-teal-600 hover:to-teal-700 active:scale-[0.99] text-white py-4 text-base sm:text-lg font-bold shadow-lg shadow-teal-700/25 hover:shadow-xl hover:shadow-teal-700/35 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>입장하기</span>
                <span className="text-xl">→</span>
              </button>
            </form>

            <p className="mt-4 text-xs text-slate-400">
              💡 코드는 대소문자 구분 없이 입력하실 수 있습니다.
            </p>
          </section>
        </div>

        {/* 하단 모던 참고 자료실 카드 그리드 */}
        <div className="mt-12 sm:mt-16">
          <ReferenceGrid />
        </div>
      </main>

      <SiteFooter />

      {/* 진행자 비밀번호 및 훈련 관리 모달 */}
      {gateStep !== 'closed' && (
        <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-4 transition-all">
          {gateStep === 'password' && (
            <form onSubmit={handleGateSubmit} className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 sm:p-7 text-center space-y-4 border border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mx-auto shadow-inner">
                🔒
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">진행자 설정 비밀번호</h3>
                <p className="text-xs text-slate-500 mt-1">교직원이 실수로 들어오지 않도록 막는 확인 단계입니다.</p>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setGateError(null)
                }}
                autoFocus
                placeholder="비밀번호 입력"
                className="w-full text-center rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
              {gateError && <p className="text-xs font-semibold text-rose-600">{gateError}</p>}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={closeGate}
                  className="flex-1 rounded-xl border border-slate-200 text-slate-600 py-3 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-brand-600 text-white py-3 text-sm font-bold hover:bg-brand-700 transition-colors shadow-sm"
                >
                  확인
                </button>
              </div>
            </form>
          )}

          {gateStep === 'choose' && (
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 sm:p-7 text-center space-y-4 border border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-2xl mx-auto border border-brand-100">
                ⚙️
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">진행자 메뉴</h3>
                <p className="text-xs text-slate-500 mt-1">원하시는 작업을 선택해 주세요.</p>
              </div>
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    closeGate()
                    navigate('/facilitator/setup')
                  }}
                  className="group w-full rounded-2xl bg-brand-600 text-white py-3.5 px-4 text-left hover:bg-brand-700 transition-all shadow-md shadow-brand-700/20 flex items-center justify-between"
                >
                  <div>
                    <span className="block text-sm font-bold">➕ 새 훈련 만들기</span>
                    <span className="block text-[11px] text-teal-100 mt-0.5">학교 정보를 입력하고 모의훈련을 개설해요</span>
                  </div>
                  <span className="text-teal-200 group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGateStep('open')}
                  className="group w-full rounded-2xl border-2 border-brand-200 bg-white text-brand-800 py-3.5 px-4 text-left hover:bg-brand-50 transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="block text-sm font-bold">🔑 내가 만든 훈련 들어가기</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">기존 참가 코드와 비밀번호로 관리자 화면에 접속해요</span>
                  </div>
                  <span className="text-brand-600 group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              </div>
              <button
                type="button"
                onClick={closeGate}
                className="text-xs text-slate-400 hover:text-slate-600 underline pt-2"
              >
                닫기
              </button>
            </div>
          )}

          {gateStep === 'open' && (
            <form onSubmit={handleOpenSubmit} className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 sm:p-7 text-center space-y-4 border border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-2xl mx-auto border border-sky-100">
                🔑
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">내가 만든 훈련 들어가기</h3>
                <p className="text-xs text-slate-500 mt-1">훈련 개설 시 발급된 참가 코드와 진행자 비밀번호를 입력해 주세요.</p>
              </div>
              <div className="space-y-2">
                <input
                  value={openCode}
                  onChange={(e) => {
                    setOpenCode(e.target.value.toUpperCase())
                    setGateError(null)
                  }}
                  autoFocus
                  maxLength={8}
                  autoComplete="off"
                  placeholder="참가 코드 (예: AB3CD)"
                  className="w-full text-center rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 tracking-widest font-bold"
                />
                <input
                  type="password"
                  value={openPin}
                  onChange={(e) => {
                    setOpenPin(e.target.value)
                    setGateError(null)
                  }}
                  placeholder="진행자 비밀번호"
                  className="w-full text-center rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              {gateError && <p className="text-xs font-semibold text-rose-600">{gateError}</p>}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setGateError(null)
                    setGateStep('choose')
                  }}
                  className="flex-1 rounded-xl border border-slate-200 text-slate-600 py-3 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  뒤로
                </button>
                <button
                  type="submit"
                  disabled={opening || openCode.trim().length < 4 || !openPin}
                  className="flex-1 rounded-xl bg-brand-600 text-white py-3 text-sm font-bold hover:bg-brand-700 transition-colors disabled:opacity-40 shadow-sm"
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

