import { Link, useParams } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { useGroups } from '../hooks/useGroupSubmissions'
import { detectGaps } from '../lib/gapDetector'
import { getDiseaseById } from '../data/diseases'
import { STAGES } from '../data/stages'

export default function ResultPage() {
  const { code = '' } = useParams()
  const { session, loading } = useSession(code)
  const groups = useGroups(code)

  if (loading) return <div className="p-8 text-center text-slate-400">불러오는 중...</div>
  if (!session) return <div className="p-8 text-center text-slate-500">세션을 찾을 수 없습니다.</div>

  const gaps = detectGaps(session.orgChart, session.gaps)
  const diseaseGroupNames = groups.reduce<Record<string, string[]>>((acc, g) => {
    const id = g.diseaseId || session.diseaseId
    ;(acc[id] ??= []).push(g.name)
    return acc
  }, {})
  const badgedGroups = groups.filter((g) => g.badge)

  return (
    <div className="min-h-screen bg-paper-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">훈련 결과</h1>
          <p className="text-sm text-slate-500 mt-1">{session.schoolName} · 참가 코드 {code}</p>
        </div>

        <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
          <h2 className="font-semibold text-slate-800 mb-1">훈련 요약</h2>
          <div className="text-sm text-slate-600 space-y-1">
            <p>참여 조 수: {groups.length}개</p>
            <p>진행 단계: {STAGES.find((s) => s.id === session.currentStage)?.label}</p>
            <div>
              <p className="mb-1">감염병별 참여 조:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {Object.entries(diseaseGroupNames).map(([diseaseId, names]) => (
                  <li key={diseaseId}>
                    {getDiseaseById(diseaseId).name}: {names.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {badgedGroups.length > 0 && (
          <section className="bg-white rounded-2xl border border-amber-200 p-5 space-y-2">
            <h2 className="font-semibold text-slate-800 mb-1">🏆 돌발 퀴즈 달성 배지</h2>
            <div className="flex flex-wrap gap-2">
              {badgedGroups.map((g) => (
                <span key={g.id} className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold rounded-full px-3 py-1.5">
                  👑 {g.name}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-400">순위 없이, 돌발 퀴즈에 정답을 맞힌 조에게 주는 달성 기념 배지예요.</p>
          </section>
        )}

        <section className="bg-white rounded-2xl border border-amber-200 bg-amber-50/60 p-5 space-y-2">
          <h2 className="font-semibold text-amber-800 mb-1">우리 학교 대응 공백 목록</h2>
          {gaps.length === 0 ? (
            <p className="text-sm text-emerald-700">확인된 공백이 없습니다. 모든 항목이 입력되었습니다.</p>
          ) : (
            <ul className="text-sm text-amber-800 space-y-1.5 list-disc list-inside">
              {gaps.map((g) => (
                <li key={g.key}>{g.label}</li>
              ))}
            </ul>
          )}
        </section>

        <Link
          to={`/guidebook/${code}`}
          className="block text-center rounded-full bg-brand-600 text-white py-3 text-sm font-semibold hover:bg-brand-700"
        >
          맞춤형 가이드북 PDF 보기 / 다운로드
        </Link>
      </div>
    </div>
  )
}
