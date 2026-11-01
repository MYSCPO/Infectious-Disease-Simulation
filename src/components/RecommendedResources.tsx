import { Link } from 'react-router-dom'
import { getDiseaseById } from '../data/diseases'

const BASE = 'flex items-center gap-3 rounded-xl border px-4 py-3 hover:border-brand-300 hover:shadow-md transition-all'
const ITEM = `${BASE} bg-white border-slate-200`
const ITEM_HIGHLIGHT = `${BASE} bg-amber-50 border-amber-300`

// 훈련을 마친 뒤 실제 상황에서 다시 꺼내 볼 자료를 골라 권하는 카드.
// diseaseId가 있으면(참가자 본인 조의 감염병) 그 감염병 상세로 바로 보낸다.
export default function RecommendedResources({ diseaseId }: { diseaseId?: string | null }) {
  const disease = diseaseId ? getDiseaseById(diseaseId) : null
  return (
    <section id="recommended-resources" className="rounded-2xl border-2 border-brand-200 bg-brand-50/60 p-5 space-y-3">
      <div>
        <h2 className="font-bold text-brand-800">📚 연수 마무리 추천 자료</h2>
        <p className="text-sm text-slate-600 mt-1">
          오늘 훈련한 내용을 실제 상황에서 바로 꺼내 볼 수 있도록, 아래 자료를 한 번씩 살펴봐 주세요.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-2.5">
        <Link to={disease ? `/diseases/${disease.id}` : '/diseases'} className={ITEM}>
          <span className="text-2xl">{disease ? disease.emoji : '🦠'}</span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-slate-800">
              {disease ? `우리 조 감염병(${disease.name}) 자세히 보기` : '모의훈련 대상 감염병 전체 보기'}
            </span>
            <span className="block text-xs text-slate-500">증상 · 잠복기 · 등교중지 기준 · 예방수칙</span>
          </span>
        </Link>
        <Link to="/attendance-guide" className={ITEM_HIGHLIGHT}>
          <span className="text-2xl">📋</span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-slate-800">등교중지 출결 처리 기준</span>
            <span className="block text-xs text-amber-700 font-semibold">담임 선생님 필수 · 출석 인정과 제출 서류</span>
          </span>
        </Link>
        <Link to="/guide" className={ITEM}>
          <span className="text-2xl">🩹</span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-slate-800">호발 감염병 10종 가이드</span>
            <span className="block text-xs text-slate-500">원인부터 등교중지 기준까지 인포그래픽</span>
          </span>
        </Link>
        <a href="https://infectious-disease-info.netlify.app/" target="_blank" rel="noopener noreferrer" className={ITEM}>
          <span className="text-2xl">🗂️</span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-slate-800">감염병 아카이빙 사이트 ↗</span>
            <span className="block text-xs text-slate-500">감염병포털 · 질병관리청 · 교육청 공식 매뉴얼</span>
          </span>
        </a>
      </div>
    </section>
  )
}
