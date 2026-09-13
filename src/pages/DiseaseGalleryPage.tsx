import { Link } from 'react-router-dom'
import { DISEASES } from '../data/diseases'

export default function DiseaseGalleryPage() {
  return (
    <div className="min-h-screen bg-paper-50 pb-12">
      <header className="bg-brand-600 text-white py-10 px-4 text-center rounded-b-[2.5rem] mb-8">
        <p className="text-brand-50 text-sm font-semibold mb-1">📚 모의훈련 대상 감염병</p>
        <h1 className="text-2xl font-black">모의훈련에서 다루는 감염병 7종</h1>
        <p className="mt-2 text-brand-50 text-sm max-w-lg mx-auto leading-relaxed">
          카드를 눌러 증상·잠복기·감염기·치료와 예방을 확인하고, 바로 그 감염병으로 훈련을 시작할 수 있어요.
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {DISEASES.map((d) => (
            <Link
              key={d.id}
              to={`/diseases/${d.id}`}
              className="bg-white rounded-3xl border border-brand-100 shadow-sm p-5 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="text-4xl mb-3">{d.emoji}</div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-bold text-slate-800">{d.name}</h2>
                <span className="text-[11px] font-semibold bg-brand-100 text-brand-700 rounded-full px-2 py-0.5">
                  {d.grade}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{d.symptoms}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
