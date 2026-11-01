import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { SchoolLevel } from '../types'
import { DISEASES } from '../data/diseases'
import { createSelfSession } from '../lib/selfStudy'
import { hashFacilitatorPin, markFacilitatorUnlocked } from '../lib/facilitatorAuth'
import BackLink from '../components/BackLink'

const SCHOOL_LEVELS: SchoolLevel[] = ['초등학교', '중학교', '고등학교']
const INPUT = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400'

export default function SelfSetupPage() {
  const navigate = useNavigate()
  const [schoolName, setSchoolName] = useState('')
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel>('중학교')
  const [pool, setPool] = useState<string[]>([DISEASES[0].id])
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function toggle(id: string) {
    setPool((p) => (p.includes(id) ? p.filter((x) => x !== id) : DISEASES.map((d) => d.id).filter((d) => d === id || p.includes(d))))
  }

  async function handleCreate() {
    if (!schoolName.trim()) return setError('학교명을 입력해 주세요.')
    if (pool.length === 0) return setError('감염병을 1개 이상 골라 주세요.')
    if (pin.length < 4) return setError('진행자 비밀번호를 4자 이상 입력해 주세요.')
    if (pin !== pinConfirm) return setError('진행자 비밀번호 확인이 일치하지 않습니다.')
    setError(null)
    setSubmitting(true)
    try {
      const code = await createSelfSession({ schoolName: schoolName.trim(), schoolLevel, diseasePool: pool, facilitatorPin: pin })
      markFacilitatorUnlocked(code, await hashFacilitatorPin(code, pin))
      navigate(`/facilitator/${code}/self`)
    } catch (e) {
      console.error(e)
      setError('만들지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <BackLink to="/" label="← 메인 화면으로 돌아가기" />
        <div>
          <h1 className="text-xl font-bold text-slate-800">📅 개인 자율 연수 만들기</h1>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            교직원이 각자 편한 시간에 혼자 모의훈련을 진행하고, 참여 기록이 남는 연수예요. 연수 시간을 따로 잡기 어려운
            학교에서 활용해 보세요.
          </p>
        </div>

        <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800">기본 정보</h2>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">학교명</span>
            <input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="예: OO중학교" className={INPUT} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">학교급</span>
            <select value={schoolLevel} onChange={(e) => setSchoolLevel(e.target.value as SchoolLevel)} className={INPUT}>
              {SCHOOL_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h2 className="font-semibold text-slate-800">🦠 연수할 감염병</h2>
          <p className="text-xs text-slate-400">여러 개를 고르면 참여하는 선생님마다 그중 하나가 무작위로 배정돼요.</p>
          <div className="flex flex-wrap gap-2">
            {DISEASES.map((d) => {
              const on = pool.includes(d.id)
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggle(d.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    on ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {on ? '✓ ' : ''}
                  {d.emoji} {d.name}
                </button>
              )
            })}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h2 className="font-semibold text-slate-800">🔐 진행자 비밀번호</h2>
          <p className="text-xs text-slate-400">참여 현황표와 CSV 다운로드를 볼 때 필요해요. 잊으면 찾을 수 없으니 꼭 기억해 두세요.</p>
          <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="비밀번호 (4자 이상)" autoComplete="new-password" className={INPUT} />
          <input type="password" value={pinConfirm} onChange={(e) => setPinConfirm(e.target.value)} placeholder="비밀번호 확인" autoComplete="new-password" className={INPUT} />
        </section>

        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="button"
          onClick={handleCreate}
          disabled={submitting}
          className="w-full rounded-full bg-brand-600 text-white py-3 text-sm font-semibold hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? '만드는 중...' : '참가 코드 발급하고 참여 현황표로 이동'}
        </button>
      </div>
    </div>
  )
}
