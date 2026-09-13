import { Link, useParams } from 'react-router-dom'
import { getDiseaseById } from '../data/diseases'

export default function DiseaseDetailPage() {
  const { id = '' } = useParams()
  const disease = getDiseaseById(id)

  return (
    <div className="min-h-screen bg-paper-50 pb-12">
      <header className="bg-brand-600 text-white py-10 px-4 text-center rounded-b-[2.5rem] mb-8">
        <div className="text-5xl mb-2">{disease.emoji}</div>
        <h1 className="text-2xl font-black">{disease.name}</h1>
        <span className="inline-block mt-2 text-xs font-semibold bg-white/20 rounded-full px-3 py-1">
          법정감염병 {disease.grade}
        </span>
      </header>

      <main className="max-w-2xl mx-auto px-4 space-y-4">
        <Link to="/diseases" className="text-xs text-brand-700 underline">
          ← 감염병 갤러리로 돌아가기
        </Link>

        <section className="bg-white rounded-3xl border border-brand-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-brand-700 mb-1">🤒 증상</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{disease.symptoms}</p>
        </section>

        <section className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl border border-brand-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-brand-700 mb-1">⏳ 잠복기</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{disease.incubationPeriod}</p>
          </div>
          <div className="bg-white rounded-3xl border border-brand-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-brand-700 mb-1">🦠 감염 가능 기간</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{disease.infectiousPeriod}</p>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-brand-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-brand-700 mb-1">🏫 등교중지(격리) 기간</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{disease.exclusionPeriod}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs bg-paper-100 text-slate-600 rounded-full px-3 py-1">
              밀접접촉자 파악 {disease.contactTracing ? 'O' : 'X'}
            </span>
            <span className="text-xs bg-paper-100 text-slate-600 rounded-full px-3 py-1">
              일시적 격리 {disease.temporaryIsolation ? 'O' : 'X'}
            </span>
            <span className="text-xs bg-paper-100 text-slate-600 rounded-full px-3 py-1">
              마스크 착용 {disease.maskRequired ? 'O' : 'X'}
            </span>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-brand-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-brand-700 mb-1">💊 치료</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{disease.treatment}</p>
        </section>

        <section className="bg-white rounded-3xl border border-brand-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-brand-700 mb-2">🛡️ 예방수칙</h2>
          <ul className="text-sm text-slate-700 space-y-1.5 list-disc list-inside leading-relaxed">
            {disease.prevention.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </section>

        <Link
          to={`/diseases/${disease.id}/roles`}
          className="block text-center rounded-full bg-brand-600 text-white py-3 text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          역할별 대응 체크리스트 보기 →
        </Link>
      </main>
    </div>
  )
}
