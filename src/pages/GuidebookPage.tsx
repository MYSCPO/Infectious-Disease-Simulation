import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import { useSession } from '../hooks/useSession'
import { useGroups } from '../hooks/useGroupSubmissions'
import { detectGaps } from '../lib/gapDetector'
import { updateSession } from '../lib/session'
import GuidebookDocument from '../components/GuidebookDocument'
import { saveGuidebookPdf } from '../lib/guidebookPdf'

export default function GuidebookPage() {
  const { code = '' } = useParams()
  const { session, loading } = useSession(code)
  const groups = useGroups(code)
  const contentRef = useRef<HTMLDivElement>(null)
  const pdfRef = useRef<HTMLDivElement>(null)
  const [pdfState, setPdfState] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [trainingDate, setTrainingDate] = useState(() => new Date().toISOString().slice(0, 10))

  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: session ? `${session.schoolName}_감염병대응모의훈련_가이드북` : '가이드북',
  })

  async function handleSavePdf() {
    if (!session || pdfState === 'working') return
    setPdfState('working')
    try {
      // 화면 폭과 상관없이 A4 폭(794px)으로 그린 사본을 이미지로 만든다(휴대폰에서 좁게 찌그러지지 않게).
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      await saveGuidebookPdf(pdfRef.current!, `${session.schoolName}_감염병대응모의훈련_가이드북`)
      setPdfState('done')
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') {
        setPdfState('idle')
        return
      }
      console.error(e)
      setPdfState('error')
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-400">불러오는 중...</div>
  if (!session) return <div className="p-8 text-center text-slate-500">세션을 찾을 수 없습니다.</div>

  const gaps = detectGaps(session.orgChart, session.gaps)

  return (
    <div className="min-h-screen bg-paper-100 py-6 px-4">
      <div className="no-print max-w-2xl mx-auto mb-5 bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
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
        <div className="ml-auto flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSavePdf}
            disabled={pdfState === 'working'}
            className="rounded-full bg-brand-600 text-white px-4 py-2 text-sm font-semibold hover:bg-brand-700 disabled:opacity-60"
          >
            {pdfState === 'working' ? 'PDF 만드는 중...' : '📥 PDF 파일 저장'}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="hidden sm:inline-block rounded-full border border-slate-300 text-slate-600 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            🖨️ 인쇄
          </button>
        </div>
        {pdfState === 'done' && (
          <p className="w-full text-xs text-emerald-700">
            ✅ PDF를 만들었어요. 휴대폰은 알림창이나 "다운로드" 폴더(내 파일)에서 확인할 수 있어요.
          </p>
        )}
        {pdfState === 'error' && (
          <p className="w-full text-xs text-rose-600">
            PDF를 만들지 못했어요. 카카오톡 등에서 열었다면 오른쪽 위 메뉴에서 "다른 브라우저로 열기" 후 다시 눌러 주세요.
          </p>
        )}
      </div>

      <div className="shadow-lg">
        <GuidebookDocument ref={contentRef} session={session} groups={groups} gaps={gaps} trainingDate={trainingDate} />
      </div>

      {/* PDF 파일용 사본: 화면 밖에 A4 폭으로 그려 두고, 저장할 때만 이미지로 만든다 */}
      {pdfState === 'working' && (
        <div aria-hidden="true" style={{ position: 'fixed', left: -10000, top: 0, width: 794 }}>
          <GuidebookDocument ref={pdfRef} session={session} groups={groups} gaps={gaps} trainingDate={trainingDate} />
        </div>
      )}
    </div>
  )
}
