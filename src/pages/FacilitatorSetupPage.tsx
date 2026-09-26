import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { SchoolLevel } from '../types'
import { DISEASES, getDiseaseById } from '../data/diseases'
import { createSession, createTestSession, updateSession } from '../lib/session'
import { saveParticipantIdentity } from '../lib/participant'
import { hashFacilitatorPin, markFacilitatorUnlocked } from '../lib/facilitatorAuth'
import OrgChartEditor from '../components/OrgChartEditor'

const SCHOOL_LEVELS: SchoolLevel[] = ['초등학교', '중학교', '고등학교']

export default function FacilitatorSetupPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedDisease = searchParams.get('disease')
  const [schoolName, setSchoolName] = useState('')
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel>('고등학교')
  const [diseaseId, setDiseaseId] = useState(preselectedDisease ? getDiseaseById(preselectedDisease).id : DISEASES[0].id)
  const [orgChart, setOrgChart] = useState({ surveillance: '', health: '', academic: '', admin: '', principal: '' })
  const [gaps, setGaps] = useState({ observationRoomLocation: '', homeroomBackupPlan: '', weekendContactSystem: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testLoading, setTestLoading] = useState(false)
  const [testError, setTestError] = useState<string | null>(null)
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')

  async function handleTestMode() {
    setTestLoading(true)
    setTestError(null)
    try {
      const { code: testCode, groupId, role } = await createTestSession()
      saveParticipantIdentity({ sessionCode: testCode, groupId, role, name: '테스트 참가자(나)' })
      navigate(`/facilitator/${testCode}/present`)
    } catch (e) {
      console.error(e)
      setTestError('테스트 방 생성에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setTestLoading(false)
    }
  }

  async function handleCreate() {
    if (!schoolName.trim()) {
      setError('학교명을 입력해 주세요.')
      return
    }
    if (pin.length < 4) {
      setError('진행자 비밀번호를 4자 이상 입력해 주세요.')
      return
    }
    if (pin !== pinConfirm) {
      setError('진행자 비밀번호 확인이 일치하지 않습니다.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const code = await createSession({ schoolName: schoolName.trim(), schoolLevel, diseaseId, facilitatorPin: pin })
      markFacilitatorUnlocked(code, await hashFacilitatorPin(code, pin))
      await updateSession(code, { orgChart, gaps })
      navigate(`/facilitator/${code}/groups`)
    } catch (e) {
      console.error(e)
      setError('세션 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">진행자 학교 설정</h1>
          <p className="text-sm text-slate-500 mt-1">
            학교급·조직도·대상 감염병과 우리 학교 대응 공백 확인 항목을 입력하면 참가 코드가 발급됩니다.
          </p>
        </div>

        <section className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4">
          <p className="text-xs font-bold text-slate-500 mb-2">
            🧪 실제 학교 설정 없이 전체 흐름부터 빠르게 보고 싶으신가요?
          </p>
          <button
            type="button"
            onClick={handleTestMode}
            disabled={testLoading}
            className="w-full rounded-full bg-white border border-slate-300 text-slate-700 py-2.5 text-xs font-bold hover:bg-slate-100 disabled:opacity-50"
          >
            {testLoading ? '테스트 방 만드는 중...' : '🧪 테스트 모드 (1인 흐름 체험)'}
          </button>
          {testError && <p className="text-xs text-rose-600 mt-1">{testError}</p>}
          <p className="text-[11px] text-slate-400 mt-1">
            테스트용 학교·조·참가자를 자동으로 만들어 진행자 대시보드로 바로 이동해요. 실제 연수에는 아래 설정을
            채워 정식으로 진행해 주세요.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800">기본 정보</h2>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">학교명</span>
            <input
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="예: OO고등학교"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">학교급</span>
            <select
              value={schoolLevel}
              onChange={(e) => setSchoolLevel(e.target.value as SchoolLevel)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              {SCHOOL_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">기본 감염병 (조 생성 시 기본값)</span>
            <select
              value={diseaseId}
              onChange={(e) => setDiseaseId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              {DISEASES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.grade})
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-400">
              조마다 다른 감염병을 배정해 교직원 전체가 다양한 감염병을 경험하게 할 수 있습니다(조 편성 화면에서 조별로
              변경). 여기서 고르는 값은 새 조를 만들 때의 기본값입니다. 수두는 첨부 자료의 실제 서사 시나리오를
              사용하고, 다른 감염병은 동일 절차 템플릿에 해당 질병 정보를 반영해 생성됩니다.
            </span>
          </label>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800">조직도 (역할별 실제 담당자)</h2>
          <p className="text-xs text-slate-400">
            관리자 역할은 실제 교장·교감이 맡는 것을 권장합니다. 조 편성 단계에서 참가자 이름과 별도로, 여기서는 학교의
            공식 담당자를 기록합니다.
          </p>
          <OrgChartEditor value={orgChart} onChange={setOrgChart} />
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800">우리 학교 항목 (대응 공백 확인)</h2>
          <p className="text-xs text-slate-400">비워두면 결과 화면과 가이드북에 "대응 공백"으로 표시됩니다.</p>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">일시적 관찰실(격리 공간) 위치</span>
            <input
              value={gaps.observationRoomLocation}
              onChange={(e) => setGaps({ ...gaps, observationRoomLocation: e.target.value })}
              placeholder="예: 보건실 옆 상담실"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">담임 공백(이동·격리) 시 대체 인력 계획</span>
            <input
              value={gaps.homeroomBackupPlan}
              onChange={(e) => setGaps({ ...gaps, homeroomBackupPlan: e.target.value })}
              placeholder="예: 동학년 부장교사가 대체"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">주말·휴일 비상 연락 체계</span>
            <input
              value={gaps.weekendContactSystem}
              onChange={(e) => setGaps({ ...gaps, weekendContactSystem: e.target.value })}
              placeholder="예: 보건교사 비상연락망 운영"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </label>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h2 className="font-semibold text-slate-800">🔐 이 훈련의 진행자 비밀번호</h2>
          <p className="text-xs text-slate-400">
            조 편성·훈련 진행·결과 화면은 이 비밀번호를 아는 진행자만 열 수 있어요. 다른 기기에서 다시 관리할 때도
            필요하니 꼭 기억해 두세요(비밀번호를 잊으면 찾을 수 없어요).
          </p>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="비밀번호 (4자 이상)"
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <input
            type="password"
            value={pinConfirm}
            onChange={(e) => setPinConfirm(e.target.value)}
            placeholder="비밀번호 확인"
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </section>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <button
          type="button"
          onClick={handleCreate}
          disabled={submitting}
          className="w-full rounded-full bg-brand-600 text-white py-3 text-sm font-semibold hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? '생성 중...' : '참가 코드 발급하고 조 편성으로 이동'}
        </button>
      </div>
    </div>
  )
}
