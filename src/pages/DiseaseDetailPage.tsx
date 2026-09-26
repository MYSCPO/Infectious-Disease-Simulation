import { useParams } from 'react-router-dom'
import BackLink from '../components/BackLink'
import { getDiseaseById } from '../data/diseases'
import DiseaseManualContent, { gradeLabel } from '../components/DiseaseManualContent'

export default function DiseaseDetailPage() {
  const { id = '' } = useParams()
  const disease = getDiseaseById(id)

  return (
    <div className="min-h-screen bg-paper-50 pb-12">
      <header className="bg-brand-600 text-white py-10 px-4 text-center rounded-b-[2.5rem] mb-8">
        <div className="text-5xl mb-2">{disease.emoji}</div>
        <h1 className="text-2xl font-black">{disease.name}</h1>
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
          <span className="text-xs font-semibold bg-white/20 rounded-full px-3 py-1">{gradeLabel(disease)}</span>
          {disease.badges.map((b) => (
            <span key={b} className="text-xs font-semibold bg-white text-brand-700 rounded-full px-3 py-1">
              {b}
            </span>
          ))}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 space-y-4">
        <BackLink to="/diseases" label="← 감염병 갤러리로 돌아가기" />

        <DiseaseManualContent
          disease={disease}
          cardClassName="bg-white rounded-3xl border border-brand-100 shadow-sm p-5"
        />
      </main>
    </div>
  )
}
