import { Link } from 'react-router-dom'

const PDF_PATH = '/guide/school-infectious-disease-guide.pdf'

export default function GuideDocumentPage() {
  return (
    <div className="min-h-screen bg-paper-50 pb-10">
      <header className="bg-brand-600 text-white py-8 px-4 text-center rounded-b-[2.5rem] mb-6">
        <p className="text-brand-50 text-sm font-semibold mb-1">🩹 신속 대응 가이드</p>
        <h1 className="text-xl sm:text-2xl font-black">학교 호발 감염병 10종 신속 대응 가이드</h1>
        <p className="mt-2 text-brand-50 text-sm max-w-lg mx-auto leading-relaxed">
          원인부터 등교 중지 기준까지 한눈에 보는 인포그래픽 매뉴얼이에요.
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Link to="/" className="text-xs text-brand-700 underline">
            ← 메인으로 돌아가기
          </Link>
          <a
            href={PDF_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold bg-brand-100 text-brand-700 rounded-full px-3 py-1.5 hover:bg-brand-200 transition-colors"
          >
            새 탭에서 크게 보기 ↗
          </a>
        </div>

        <div className="bg-white rounded-3xl border border-brand-100 shadow-sm p-3 sm:p-4">
          <iframe
            src={PDF_PATH}
            title="학교 호발 감염병 10종 신속 대응 가이드"
            className="w-full h-[75vh] rounded-2xl border border-slate-100"
          />
          <p className="text-xs text-slate-400 mt-3 text-center">
            휴대폰 브라우저에서 화면이 보이지 않으면 위의 "새 탭에서 크게 보기"를 눌러주세요.
          </p>
        </div>
      </main>
    </div>
  )
}
