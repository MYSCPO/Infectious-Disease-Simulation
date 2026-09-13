import { Link, useParams } from 'react-router-dom'
import { getDiseaseById } from '../data/diseases'
import { getScenarioForDisease } from '../data/scenarioGenerator'
import { STAGES } from '../data/stages'
import { ROLE_LABELS, ROLE_ORDER } from '../types'

export default function DiseaseRoleGuidePage() {
  const { id = '' } = useParams()
  const disease = getDiseaseById(id)
  const scenario = getScenarioForDisease(id)

  return (
    <div className="min-h-screen bg-paper-50 pb-12">
      <header className="bg-brand-600 text-white py-10 px-4 text-center rounded-b-[2.5rem] mb-8">
        <div className="text-5xl mb-2">{disease.emoji}</div>
        <h1 className="text-2xl font-black">{disease.name} · 역할별 대응 체크리스트</h1>
        <p className="mt-2 text-brand-50 text-sm max-w-lg mx-auto leading-relaxed">
          실제 훈련 전에 단계마다 각 역할이 무엇을 해야 하는지 미리 한번 쭉 훑어보세요.
        </p>
      </header>

      <main className="max-w-3xl mx-auto px-4 space-y-6">
        <Link to={`/diseases/${disease.id}`} className="text-xs text-brand-700 underline">
          ← {disease.name} 정보로 돌아가기
        </Link>

        {STAGES.map((stage) => {
          const stageData = scenario.find((s) => s.stage === stage.id)
          if (!stageData) return null
          return (
            <section key={stage.id} className="bg-white rounded-3xl border border-brand-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold bg-brand-600 text-white rounded-full px-3 py-1">{stage.shortLabel}</span>
                <h2 className="text-sm font-bold text-slate-800">{stage.label}</h2>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">{stageData.narrative}</p>

              <div className="grid sm:grid-cols-2 gap-3">
                {ROLE_ORDER.map((role) => {
                  const q = stageData.questions.find((qq) => qq.role === role)
                  const correct = q?.options.find((o) => o.correct)
                  return (
                    <div key={role} className="rounded-2xl border border-slate-100 bg-paper-50 p-3">
                      <div className="text-xs font-semibold text-brand-700 mb-1">{ROLE_LABELS[role]}</div>
                      {correct ? (
                        <>
                          <p className="text-sm text-slate-800 leading-relaxed mb-1">{correct.text}</p>
                          <p className="text-xs text-slate-400 leading-relaxed">{correct.rationale}</p>
                        </>
                      ) : (
                        <p className="text-xs text-slate-400">이 단계에는 별도로 명시된 조치가 없습니다.</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}

        <div className="bg-white rounded-3xl border border-brand-100 shadow-sm p-5 text-center space-y-3">
          <p className="text-sm text-slate-600">다 확인하셨나요? 진행자라면 이 감염병으로 바로 훈련을 시작할 수 있어요.</p>
          <Link
            to={`/facilitator/setup?disease=${disease.id}`}
            className="block text-center rounded-full bg-brand-600 text-white py-3 text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            진행자로 이 감염병 훈련 시작하기 →
          </Link>
        </div>
      </main>
    </div>
  )
}
