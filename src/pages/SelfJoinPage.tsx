import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { RoleId } from '../types'
import { ROLE_DESCRIPTIONS, ROLE_LABELS, ROLE_ORDER } from '../types'
import { useSession } from '../hooks/useSession'
import { ROLE_MASCOTS } from '../data/mascots'
import { getDiseaseById } from '../data/diseases'
import { loadLearnerId, startLearner } from '../lib/selfStudy'
import MascotAvatar from '../components/MascotAvatar'
import ReferenceGrid from '../components/ReferenceGrid'
import SiteFooter from '../components/SiteFooter'

const INPUT = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400'

export default function SelfJoinPage() {
  const { code: rawCode = '' } = useParams()
  const code = rawCode.toUpperCase()
  const navigate = useNavigate()
  const { session, loading } = useSession(code)
  const [name, setName] = useState('')
  const [affiliation, setAffiliation] = useState('')
  const [role, setRole] = useState<RoleId | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)

  // 이 기기에서 이미 시작한 연수가 있으면 하던 단계부터 이어서 한다.
  useEffect(() => {
    if (loadLearnerId(code)) navigate(`/self/${code}/run`, { replace: true })
  }, [code])

  async function handleStart() {
    if (!session) return
    if (!name.trim()) return setError('이름을 입력해 주세요.')
    if (!role) return setError('내 역할을 골라 주세요.')
    setError(null)
    setStarting(true)
    try {
      await startLearner(code, {
        name: name.trim(),
        affiliation: affiliation.trim(),
        role,
        pool: session.diseasePool?.length ? session.diseasePool : [session.diseaseId],
      })
      navigate(`/self/${code}/run`)
    } catch (e) {
      console.error(e)
      setError('시작하지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setStarting(false)
    }
  }

  const pool = session ? (session.diseasePool?.length ? session.diseasePool : [session.diseaseId]) : []

  return (
    <div className="min-h-screen bg-paper-50 flex flex-col">
      <div className="flex-1 py-8 px-4">
        <div className="max-w-md mx-auto space-y-5">
          <div className="text-center">
            <p className="text-xs font-bold text-brand-600">📅 개인 자율 연수</p>
            <h1 className="text-xl font-bold text-slate-800 mt-1">학교 감염병 위기 대응 모의훈련</h1>
          </div>

          {loading ? (
            <p className="text-center text-sm text-slate-400 py-10">불러오는 중...</p>
          ) : !session || session.mode !== 'self' ? (
            <p className="text-center text-sm text-slate-500 py-10">개인 자율 연수를 찾을 수 없어요. 주소나 참가 코드를 확인해 주세요.</p>
          ) : session.selfClosed ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-2">
              <div className="text-3xl">🔒</div>
              <p className="font-bold text-slate-700">연수가 마감되었어요</p>
              <p className="text-sm text-slate-500">담당 선생님께 문의해 주세요.</p>
            </div>
          ) : (
            <>
              <section className="bg-white rounded-2xl border border-brand-100 p-5 space-y-2">
                <p className="text-sm font-bold text-slate-700">{session.schoolName}</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  혼자서 약 10분 동안 예방 → 대응1~3 → 복구 단계를 따라가며, <b>내 역할</b>의 대응 요령을 익혀요. 단계마다 체크리스트를
                  모두 확인하고 확인 퀴즈 1문제를 풀면 다음 단계로 넘어가요.
                </p>
                <p className="text-xs text-slate-500">
                  🦠 연수 감염병: <b>{pool.map((id) => getDiseaseById(id).name).join(' · ')}</b>
                  {pool.length > 1 && ' (시작하면 그중 하나가 배정돼요)'}
                </p>
              </section>

              <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">이름</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름을 입력하세요" className={INPUT} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    소속 <span className="text-slate-400 font-normal">(학년·부서 등, 선택)</span>
                  </span>
                  <input value={affiliation} onChange={(e) => setAffiliation(e.target.value)} placeholder="예: 2학년, 교무부" className={INPUT} />
                </label>
              </section>

              <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
                <p className="text-sm font-medium text-slate-700">내 역할 선택</p>
                <p className="text-xs text-slate-400">학교 감염병 관리조직에서 내가 맡은(맡을) 팀을 골라요.</p>
                {ROLE_ORDER.map((r) => {
                  const on = role === r
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`w-full text-left rounded-xl border-2 p-3 flex gap-3 items-start transition-colors ${
                        on ? 'border-brand-500 bg-brand-50' : 'border-slate-100 hover:border-brand-200'
                      }`}
                    >
                      <MascotAvatar role={r} size="md" motion={on ? 'idle' : 'none'} />
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-slate-800">
                          {ROLE_MASCOTS[r].name} · {ROLE_LABELS[r]}
                        </span>
                        <span className="block text-xs text-slate-500 leading-relaxed mt-0.5">{ROLE_DESCRIPTIONS[r].summary}</span>
                      </span>
                    </button>
                  )
                })}
              </section>

              {error && <p className="text-sm text-rose-600 text-center">{error}</p>}
              <button
                type="button"
                onClick={handleStart}
                disabled={starting}
                className="w-full rounded-full bg-brand-600 text-white py-3.5 text-sm font-bold hover:bg-brand-700 disabled:opacity-50"
              >
                {starting ? '준비 중...' : '연수 시작하기 🚀'}
              </button>
              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                이름과 소속은 연수 참여 기록(담당 선생님의 참여 현황표)에만 쓰여요. 실제 학생·환자 정보는 입력하지 않아요.
              </p>
            </>
          )}
        </div>
        <div className="mt-10">
          <ReferenceGrid />
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
