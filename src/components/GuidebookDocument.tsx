import { forwardRef } from 'react'
import type { GapItem } from '../lib/gapDetector'
import type { SessionDoc, GroupDoc } from '../types'
import { ROLE_LABELS, ROLE_ORDER } from '../types'
import { getDiseaseById } from '../data/diseases'
import { STAGES } from '../data/stages'
import { ROLE_CHECKLISTS } from '../data/roleChecklist'

interface Props {
  session: SessionDoc
  groups: GroupDoc[]
  gaps: GapItem[]
  trainingDate: string
}

const GuidebookDocument = forwardRef<HTMLDivElement, Props>(({ session, groups, gaps, trainingDate }, ref) => {
  const diseaseGroupNames = groups.reduce<Record<string, string[]>>((acc, g) => {
    const id = g.diseaseId || session.diseaseId
    ;(acc[id] ??= []).push(g.name)
    return acc
  }, {})
  const diseaseIds = Object.keys(diseaseGroupNames).length > 0 ? Object.keys(diseaseGroupNames) : [session.diseaseId]

  return (
    <div ref={ref} className="bg-white text-slate-900 max-w-[210mm] mx-auto">
      {/* 표지 */}
      <section className="min-h-[270mm] flex flex-col items-center justify-center text-center px-10">
        <p className="text-sm text-brand-600 font-semibold mb-3">하나 된 대응, 건강한 학교생활</p>
        <h1 className="text-3xl font-black text-slate-800 mb-2">학교 감염병 대응 모의훈련 가이드북</h1>
        <p className="text-lg text-slate-500 mb-10">{session.schoolName} ({session.schoolLevel})</p>
        <div className="text-sm text-slate-600 space-y-1">
          <p>훈련 일시: {trainingDate}</p>
          <p>대상 감염병: {diseaseIds.map((id) => getDiseaseById(id).name).join(', ')}</p>
          <p>참석자 수: {session.attendeeCount}명 · 참여 조: {groups.length}개</p>
        </div>
      </section>

      {/* 조직도 */}
      <section className="print-page-break px-10 py-10">
        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b-2 border-brand-600 pb-2">학생 감염병 관리조직</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 py-2 px-3 text-left">역할</th>
              <th className="border border-slate-300 py-2 px-3 text-left">담당자</th>
            </tr>
          </thead>
          <tbody>
            {ROLE_ORDER.map((role) => (
              <tr key={role}>
                <td className="border border-slate-300 py-2 px-3 font-medium">{ROLE_LABELS[role]}</td>
                <td className="border border-slate-300 py-2 px-3">{session.orgChart[role] || '(미지정)'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {diseaseIds.map((id) => {
          const disease = getDiseaseById(id)
          const namesForDisease = diseaseGroupNames[id]
          return (
            <div key={id} className="mt-8">
              <h2 className="text-xl font-bold text-slate-800 mb-1 border-b-2 border-brand-600 pb-2">
                대상 감염병 정보 · {disease.name}
              </h2>
              {namesForDisease && (
                <p className="text-xs text-slate-500 mb-3">담당 조: {namesForDisease.join(', ')}</p>
              )}
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr>
                    <td className="border border-slate-300 py-2 px-3 font-medium w-40">임상 증상</td>
                    <td className="border border-slate-300 py-2 px-3">{disease.symptoms}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 py-2 px-3 font-medium">감염 가능 기간</td>
                    <td className="border border-slate-300 py-2 px-3">{disease.infectiousPeriod}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 py-2 px-3 font-medium">등교중지(격리) 기간</td>
                    <td className="border border-slate-300 py-2 px-3">{disease.exclusionPeriod}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 py-2 px-3 font-medium">잠복기</td>
                    <td className="border border-slate-300 py-2 px-3">{disease.incubationPeriod}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 py-2 px-3 font-medium">
                      밀접접촉자 파악 / 일시적 격리 / 마스크 착용
                    </td>
                    <td className="border border-slate-300 py-2 px-3">
                      {disease.contactTracing ? 'O' : 'X'} / {disease.temporaryIsolation ? 'O' : 'X'} /{' '}
                      {disease.maskRequired ? 'O' : 'X'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )
        })}
      </section>

      {/* 단계별 표준 조치 */}
      {STAGES.map((stage) => {
        const checklist = ROLE_CHECKLISTS[stage.id]
        return (
          <section key={stage.id} className="print-page-break px-10 py-10">
            <h2 className="text-xl font-bold text-slate-800 mb-1 border-b-2 border-brand-600 pb-2">{stage.label}</h2>
            <p className="text-xs text-slate-500 mb-4">{stage.description}</p>
            <div className="space-y-3">
              {ROLE_ORDER.map((role) => {
                const content = checklist[role]
                return (
                  <div key={role} className="border border-slate-200 rounded-lg p-3">
                    <div className="text-sm font-bold text-brand-700 mb-1">{ROLE_LABELS[role]}</div>
                    {content.items.length > 0 ? (
                      <ul className="text-xs text-slate-700 list-disc list-inside space-y-0.5">
                        {content.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400">이 단계에서 별도로 명시된 조치가 없습니다.</p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      {/* 우리 학교 대응 공백 */}
      <section className="print-page-break px-10 py-10">
        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b-2 border-brand-600 pb-2">우리 학교 대응 공백 점검 결과</h2>
        {gaps.length === 0 ? (
          <p className="text-sm text-emerald-700">훈련 중 확인된 대응 공백이 없습니다.</p>
        ) : (
          <ul className="text-sm text-slate-700 space-y-2 list-disc list-inside">
            {gaps.map((g) => (
              <li key={g.key}>{g.label}</li>
            ))}
          </ul>
        )}

        <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">우리 학교 항목</h3>
        <table className="w-full text-sm border-collapse">
          <tbody>
            <tr>
              <td className="border border-slate-300 py-2 px-3 font-medium w-56">일시적 관찰실(격리 공간) 위치</td>
              <td className="border border-slate-300 py-2 px-3">{session.gaps.observationRoomLocation || '미입력'}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 py-2 px-3 font-medium">담임 공백 시 대체 인력 계획</td>
              <td className="border border-slate-300 py-2 px-3">{session.gaps.homeroomBackupPlan || '미입력'}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 py-2 px-3 font-medium">주말·휴일 비상 연락 체계</td>
              <td className="border border-slate-300 py-2 px-3">{session.gaps.weekendContactSystem || '미입력'}</td>
            </tr>
          </tbody>
        </table>

        <p className="text-xs text-slate-400 mt-8">
          본 가이드북은 「학교 감염병 대응 모의훈련」 실시 결과를 바탕으로 자동 생성되었으며, 훈련 실시 증빙 자료로 활용할
          수 있습니다.
        </p>
      </section>
    </div>
  )
})

GuidebookDocument.displayName = 'GuidebookDocument'
export default GuidebookDocument
