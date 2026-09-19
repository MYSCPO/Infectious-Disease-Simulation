import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { RoleId } from '../types'
import { ROLE_MASCOTS } from '../data/mascots'
import MascotAvatar from '../components/MascotAvatar'

const TEAM_ROLES: RoleId[] = ['surveillance', 'health', 'academic', 'admin', 'principal']

// 실제 보안 장치가 아니라, 교직원이 실수로 진행자 설정에 들어가는 것만 막는 가벼운 진입장벽입니다.
const FACILITATOR_PASSWORD = 'admin1234'

export default function MainPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [showGate, setShowGate] = useState(false)
  const [password, setPassword] = useState('')
  const [gateError, setGateError] = useState<string | null>(null)

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
      setShowGate(false)
      setPassword('')
      setGateError(null)
      navigate('/facilitator/setup')
    } else {
      setGateError('비밀번호가 올바르지 않습니다.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper-50">
      <header className="relative bg-brand-600 text-white py-12 px-4 text-center rounded-b-[2.5rem]">
        <button
          type="button"
          onClick={() => setShowGate(true)}
          className="absolute top-4 right-4 text-xs sm:text-sm font-semibold text-brand-50 hover:text-white bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5 transition-colors"
        >
          ⚙️ 진행자 설정
        </button>

        <p className="text-brand-50 text-sm font-semibold mb-2">🌱 하나 된 대응, 건강한 학교생활</p>
        <h1 className="text-2xl sm:text-3xl font-black">학교 감염병 위기 대응 모의훈련</h1>
        <p className="mt-3 text-brand-50 text-sm max-w-xl mx-auto leading-relaxed">
          시나리오를 단계별로 따라가며 발생감시팀·예방관리팀·학사관리팀·행정지원팀·관리자 역할을 조별로 수행하는 웹
          기반 모의훈련 프로그램이에요. 순위나 감점 없이, 모든 조가 제출하면 답을 한꺼번에 공개해서 함께 비교하고
          이야기 나눠요 :)
        </p>
      </header>

      <main className="flex-1 w-full">
        <div className="max-w-md w-full mx-auto px-4 py-10">
          <section className="bg-white rounded-3xl border border-brand-100 shadow-sm p-6 sm:p-8 text-center">
            <div className="flex justify-center flex-wrap gap-3 sm:gap-4 mb-3">
              {TEAM_ROLES.map((r) => (
                <div key={r} className="flex flex-col items-center">
                  <MascotAvatar role={r} size="lg" motion="idle" />
                  <span className="text-[10px] text-slate-400 mt-0.5">{ROLE_MASCOTS[r].name}</span>
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

        <div className="max-w-3xl w-full mx-auto px-4 pb-6">
          <h3 className="text-sm font-bold text-slate-500 mb-3">📚 사전/사후 학습 참고 자료실</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <Link
              to="/diseases"
              className="bg-white rounded-2xl border border-brand-100 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col"
            >
              <div className="text-2xl mb-1">🦠</div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">모의훈련 대상 감염병</h4>
              <p className="text-xs text-slate-500 leading-relaxed flex-1">
                감염병 7종의 증상·잠복기·치료·예방을 살펴봐요.
              </p>
            </Link>

            <Link
              to="/guide"
              className="bg-white rounded-2xl border border-brand-100 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col"
            >
              <div className="text-2xl mb-1">🩹</div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">호발 감염병 10종 가이드</h4>
              <p className="text-xs text-slate-500 leading-relaxed flex-1">
                원인부터 등교 중지 기준까지 인포그래픽으로 봐요.
              </p>
            </Link>

            <a
              href="https://infectious-disease-info.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl border border-brand-100 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col"
            >
              <div className="text-2xl mb-1">🗂️</div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">감염병 아카이빙 사이트 ↗</h4>
              <p className="text-xs text-slate-500 leading-relaxed flex-1">
                매뉴얼·공문·통계를 모아둔 사이트로 이동해요.
              </p>
            </a>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-300 py-10 px-4 text-center">
        <p className="text-white font-bold mb-3">🩺 학교 감염병 모의훈련 프로그램</p>
        <p className="text-sm max-w-xl mx-auto leading-relaxed">
          본 프로그램은 학교·교육청 감염병 담당자와 교직원의 위기대응 역량 강화를 위해 제작된 교육용 모의훈련
          도구입니다. 방과 후 연수, 자체 워크숍 등에서 자유롭게 활용하실 수 있습니다.
        </p>
        <p className="text-xs text-slate-500 max-w-xl mx-auto mt-3 leading-relaxed">
          본 프로그램에서 안내하는 감염병 정보와 대응 절차는 학생 감염병 예방·위기대응 매뉴얼 등 공식 자료를
          참고해 제작했으며, 외부 링크로 연결되는 사이트의 내용과 데이터 저작권은 질병관리청, 교육청 등 해당
          공식 소속 기관에 귀속됩니다.
        </p>
        <p className="text-xs text-slate-500 font-mono mt-6">Developed for educational purposes by jeong mi ae</p>
      </footer>

      {showGate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleGateSubmit}
            className="bg-white rounded-3xl shadow-xl max-w-xs w-full p-6 text-center space-y-3"
          >
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
                onClick={() => {
                  setShowGate(false)
                  setPassword('')
                  setGateError(null)
                }}
                className="flex-1 rounded-full border border-slate-200 text-slate-500 py-2.5 text-sm font-semibold hover:bg-slate-50"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 rounded-full bg-brand-600 text-white py-2.5 text-sm font-bold hover:bg-brand-700"
              >
                확인
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
