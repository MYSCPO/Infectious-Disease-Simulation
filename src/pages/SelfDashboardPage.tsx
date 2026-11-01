import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { LearnerDoc } from '../types'
import { ROLE_LABELS } from '../types'
import { useSession } from '../hooks/useSession'
import { getDiseaseById } from '../data/diseases'
import { updateSession } from '../lib/session'
import {
  deleteAllLearners,
  downloadLearnersCsv,
  durationMin,
  learnerCorrect,
  learnerStatusLabel,
  SELF_STAGES,
  subscribeLearners,
} from '../lib/selfStudy'

function fmt(ts: number | null) {
  if (!ts) return '-'
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function SelfDashboardPage() {
  const { code = '' } = useParams()
  const { session, loading } = useSession(code)
  const [learners, setLearners] = useState<LearnerDoc[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => subscribeLearners(code, setLearners), [code])

  if (loading) return <div className="p-8 text-center text-slate-400">불러오는 중...</div>
  if (!session) return <div className="p-8 text-center text-slate-500">연수를 찾을 수 없습니다.</div>

  const joinUrl = `${window.location.origin}/self/${code}`
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(joinUrl)}`
  const done = learners.filter((l) => l.stage === 'done').length
  const closed = !!session.selfClosed

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`[${session!.schoolName}] 감염병 대응 개인 자율 연수\n${joinUrl}\n참가 코드: ${code}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 클립보드가 막혀도 주소는 화면에 보인다.
    }
  }

  return (
    <div className="min-h-screen bg-paper-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold text-slate-800">📅 개인 자율 연수 · 참여 현황</h1>
            <p className="text-sm text-slate-500 mt-1">
              {session.schoolName} · 감염병: {(session.diseasePool ?? [session.diseaseId]).map((id) => getDiseaseById(id).name).join(', ')}
            </p>
          </div>
          <Link to="/" className="text-xs text-brand-700 underline">
            메인 화면으로
          </Link>
        </div>

        <section className="bg-white rounded-2xl border-2 border-brand-200 p-5 grid sm:grid-cols-[1fr_auto] gap-4 items-center">
          <div className="space-y-2">
            <p className="text-xs text-slate-400">교직원에게 보낼 참여 주소 · 참가 코드</p>
            <p className="text-3xl font-black tracking-widest text-brand-700">{code}</p>
            <p className="text-xs text-slate-500 break-all">{joinUrl}</p>
            <button type="button" onClick={copyLink} className="rounded-full bg-brand-600 text-white text-sm font-semibold px-4 py-2 hover:bg-brand-700">
              {copied ? '✅ 복사됨! 메신저에 붙여 넣으세요' : '📋 안내 문구 복사 (메신저용)'}
            </button>
            <p className="text-[11px] text-slate-400">첫 화면에 참가 코드를 넣어도 바로 개인 연수로 들어가요.</p>
          </div>
          <img src={qr} alt="개인 자율 연수 QR 코드" width={160} height={160} className="rounded-xl border border-slate-200 mx-auto" />
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-semibold text-slate-800">
              👥 참여 현황 <span className="text-brand-700">완료 {done}명</span>
              <span className="text-slate-400 font-normal"> / 참여 {learners.length}명</span>
            </h2>
            <button
              type="button"
              onClick={() => downloadLearnersCsv(session.schoolName, learners)}
              disabled={learners.length === 0}
              className="rounded-full bg-slate-800 text-white text-sm font-semibold px-4 py-2 hover:bg-slate-700 disabled:opacity-40"
            >
              📥 CSV 다운로드 (엑셀)
            </button>
          </div>
          {learners.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">아직 참여한 선생님이 없어요. 위 주소를 교직원에게 보내 주세요.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b border-slate-200">
                    {['이름', '소속', '역할', '감염병', '상태', '시작', '완료', '소요', '퀴즈'].map((h) => (
                      <th key={h} className="py-2 pr-3 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {learners.map((l) => (
                    <tr key={l.id} className="border-b border-slate-100">
                      <td className="py-2 pr-3 font-semibold text-slate-800">{l.name}</td>
                      <td className="py-2 pr-3 text-slate-600">{l.affiliation || '-'}</td>
                      <td className="py-2 pr-3 text-slate-600">{ROLE_LABELS[l.role].split('(')[0]}</td>
                      <td className="py-2 pr-3 text-slate-600">{getDiseaseById(l.diseaseId).name}</td>
                      <td className="py-2 pr-3">
                        <span
                          className={`text-xs font-bold rounded-full px-2 py-0.5 ${
                            l.stage === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {learnerStatusLabel(l)}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-slate-500">{fmt(l.startedAt)}</td>
                      <td className="py-2 pr-3 text-slate-500">{fmt(l.completedAt)}</td>
                      <td className="py-2 pr-3 text-slate-500">{durationMin(l) ? `${durationMin(l)}분` : '-'}</td>
                      <td className="py-2 pr-3 text-slate-500">
                        {learnerCorrect(l)}/{SELF_STAGES.length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h2 className="font-semibold text-slate-800">⚙️ 연수 관리</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateSession(code, { selfClosed: !closed })}
              className={`rounded-full text-sm font-semibold px-4 py-2 border ${
                closed ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {closed ? '🔓 연수 다시 열기' : '🔒 연수 마감 (새 참여 막기)'}
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm('참여 기록을 모두 삭제할까요? 먼저 CSV를 내려받아 두세요. 삭제하면 되돌릴 수 없어요.')) return
                await deleteAllLearners(code)
              }}
              disabled={learners.length === 0}
              className="rounded-full text-sm font-semibold px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-40"
            >
              🗑️ 참여 기록 전체 삭제
            </button>
          </div>
          <p className="text-xs text-slate-400">
            {closed ? '마감됨: 새로 참여할 수 없어요(이미 시작한 선생님은 마저 끝낼 수 있어요).' : '진행 중: 주소를 받은 선생님 누구나 참여할 수 있어요.'}{' '}
            연수가 끝나면 CSV를 저장한 뒤 기록을 삭제해 주세요.
          </p>
        </section>
      </div>
    </div>
  )
}
