import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import { useSession } from '../hooks/useSession'
import { useGroups } from '../hooks/useGroupSubmissions'
import { detectGaps } from '../lib/gapDetector'
import { updateSession } from '../lib/session'
import GuidebookDocument from '../components/GuidebookDocument'

export default function GuidebookPage() {
  const { code = '' } = useParams()
  const { session, loading } = useSession(code)
  const groups = useGroups(code)
  const contentRef = useRef<HTMLDivElement>(null)
  const [trainingDate, setTrainingDate] = useState(() => new Date().toISOString().slice(0, 10))

  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: session ? `${session.schoolName}_감염병대응모의훈련_가이드북` : '가이드북',
  })

  if (loading) return <div className="p-8 text-center text-slate-400">불러오는 중...</div>
  if (!session) return <div className="p-8 text-center text-slate-500">세션을 찾을 수 없습니다.</div>

  const gaps = detectGaps(session.orgChart, session.gaps)

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4">
      <div className="no-print max-w-2xl mx-auto mb-5 bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-600">
          훈련 일시:{' '}
          <input
            type="date"
            value={trainingDate}
            onChange={(e) => setTrainingDate(e.target.value)}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
          />
        </label>
        <label className="text-sm text-slate-600">
          참석자 수:{' '}
          <input
            type="number"
            min={0}
            value={session.attendeeCount}
            onChange={(e) => updateSession(code, { attendeeCount: Number(e.target.value) || 0 })}
            className="w-20 rounded border border-slate-300 px-2 py-1 text-sm"
          />
          명
        </label>
        <button
          type="button"
          onClick={handlePrint}
          className="ml-auto rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-semibold hover:bg-brand-700"
        >
          PDF로 저장 / 인쇄
        </button>
      </div>

      <div className="shadow-lg">
        <GuidebookDocument ref={contentRef} session={session} groups={groups} gaps={gaps} trainingDate={trainingDate} />
      </div>
    </div>
  )
}
