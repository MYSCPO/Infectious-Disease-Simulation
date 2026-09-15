import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { RoleId, StageId } from '../types'
import { ROLE_LABELS, ROLE_ORDER } from '../types'
import { getDiseaseById } from '../data/diseases'
import { getScenarioForDisease } from '../data/scenarioGenerator'
import { STAGES } from '../data/stages'
import { ROLE_TAGS } from '../data/roleTags'
import { ROLE_MASCOTS } from '../data/mascots'
import MascotAvatar from '../components/MascotAvatar'

export default function DiseaseRoleGuidePage() {
  const { id = '' } = useParams()
  const disease = getDiseaseById(id)
  const scenario = getScenarioForDisease(id)

  const [activeStage, setActiveStage] = useState<StageId>('prevention')
  const [roleFilter, setRoleFilter] = useState<RoleId | 'all'>('all')
  const [expandedRole, setExpandedRole] = useState<RoleId | null>(null)

  const stageDef = STAGES.find((s) => s.id === activeStage)!
  const stageData = scenario.find((s) => s.stage === activeStage)
  const visibleRoles = ROLE_ORDER.filter((r) => roleFilter === 'all' || r === roleFilter)

  function selectStage(stageId: StageId) {
    setActiveStage(stageId)
    setExpandedRole(null)
  }

  return (
    <div className="min-h-screen bg-paper-50 pb-12">
      <header className="bg-brand-600 text-white pt-5 pb-10 px-4 text-center rounded-b-[2.5rem] mb-6">
        <div className="max-w-3xl mx-auto flex items-center gap-2 mb-5">
          <Link
            to="/"
            className="text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-full px-3 py-1.5 transition-colors"
          >
            🏠 메인 화면으로
          </Link>
          <Link
            to={`/diseases/${disease.id}`}
            className="text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-full px-3 py-1.5 transition-colors"
          >
            ← 이전 감염병 정보로
          </Link>
        </div>

        <div className="text-5xl mb-2">{disease.emoji}</div>
        <h1 className="text-2xl font-black">{disease.name} · 역할별 대응 체크리스트</h1>
        <p className="mt-2 text-brand-50 text-sm max-w-lg mx-auto leading-relaxed">
          실제 훈련 전에 단계마다 각 역할이 무엇을 해야 하는지 미리 한번 쭉 훑어보세요.
        </p>
      </header>

      <main className="max-w-3xl mx-auto px-4 space-y-4">
        {/* 단계 탭 */}
        <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
          {STAGES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => selectStage(s.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activeStage === s.id ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-brand-50'
              }`}
            >
              {s.shortLabel}
            </button>
          ))}
        </div>

        {/* 역할 필터 */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            className={`rounded-full px-3 py-1 text-xs font-semibold border ${
              roleFilter === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            전체
          </button>
          {ROLE_ORDER.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                roleFilter === r ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>

        {stageData && (
          <section className="bg-white rounded-3xl border border-brand-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold bg-brand-600 text-white rounded-full px-3 py-1">{stageDef.shortLabel}</span>
              <h2 className="text-sm font-bold text-slate-800">{stageDef.label}</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">{stageData.narrative}</p>

            <div className="space-y-2">
              {visibleRoles.map((role) => {
                const q = stageData.questions.find((qq) => qq.role === role)
                const correct = q?.options.find((o) => o.correct)
                const isOpen = expandedRole === role
                const tags = ROLE_TAGS[activeStage][role]

                return (
                  <div key={role} className="rounded-2xl border border-slate-100 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedRole(isOpen ? null : role)}
                      className="w-full flex items-start gap-3 p-3 text-left hover:bg-paper-50 transition-colors"
                    >
                      <MascotAvatar role={role} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className="text-sm font-bold text-slate-800">{ROLE_MASCOTS[role].name}</span>
                          <span className="text-xs text-slate-400">· {ROLE_LABELS[role]}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-1.5">
                          {tags.map((t) => (
                            <span key={t} className="text-[10px] font-semibold bg-brand-50 text-brand-600 rounded-full px-2 py-0.5">
                              {t}
                            </span>
                          ))}
                        </div>
                        {correct ? (
                          <p className="text-sm text-slate-700 leading-snug line-clamp-2">{correct.text}</p>
                        ) : (
                          <p className="text-xs text-slate-400">이 단계에는 별도로 명시된 조치가 없습니다.</p>
                        )}
                      </div>
                      <span className="text-slate-300 text-xs shrink-0 mt-1">{isOpen ? '▲' : '▼'}</span>
                    </button>
                    {isOpen && correct && (
                      <div className="px-3 pb-3 pl-[4.25rem]">
                        <p className="text-xs text-slate-500 bg-paper-50 rounded-xl p-3 leading-relaxed">💡 {correct.rationale}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
