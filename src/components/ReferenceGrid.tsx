import { Link } from 'react-router-dom'

// 사전/사후 학습 참고 자료 4종. 훈련이 진행되는 화면(TeamTrainingPage)에는 넣지 않고,
// 최초 화면·입장 화면·결과(종료) 화면에서만 노출한다(훈련 중에는 참고할 필요가 적다는 판단).
export default function ReferenceGrid({ title = '📚 사전/사후 학습 참고 자료실' }: { title?: string }) {
  return (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm sm:text-base font-bold text-slate-700 flex items-center gap-2">
          <span>{title}</span>
        </h3>
        <span className="text-xs text-slate-400 hidden sm:inline-block">클릭하면 상세 페이지로 이동합니다</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        <Link
          to="/diseases"
          className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-300 transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-2xl mb-3 shadow-xs group-hover:scale-105 transition-transform">
              🦠
            </div>
            <h4 className="text-base font-bold text-slate-800 group-hover:text-brand-700 transition-colors mb-1.5 flex items-center justify-between">
              <span>모의훈련 대상 감염병</span>
              <span className="text-slate-300 group-hover:text-brand-600 transition-colors text-sm">→</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              수두, 백일해, 유행성이하선염 등 감염병 7종의 임상 증상·잠복기·치료 및 예방수칙을 살펴봐요.
            </p>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-brand-600 font-medium">
            <span>질환 정보 및 대응 수칙</span>
            <span className="group-hover:translate-x-0.5 transition-transform">자세히 보기</span>
          </div>
        </Link>

        <Link
          to="/guide"
          className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-300 transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-2xl mb-3 shadow-xs group-hover:scale-105 transition-transform">
              🩹
            </div>
            <h4 className="text-base font-bold text-slate-800 group-hover:text-brand-700 transition-colors mb-1.5 flex items-center justify-between">
              <span>호발 감염병 10종 가이드</span>
              <span className="text-slate-300 group-hover:text-brand-600 transition-colors text-sm">→</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              원인 병원체부터 전파 경로, 등교 중지 판단 기준까지 핵심 인포그래픽으로 한눈에 파악해요.
            </p>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-brand-600 font-medium">
            <span>인포그래픽 매뉴얼</span>
            <span className="group-hover:translate-x-0.5 transition-transform">자세히 보기</span>
          </div>
        </Link>

        <Link
          to="/attendance-guide"
          className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-300 transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl mb-3 shadow-xs group-hover:scale-105 transition-transform">
              📋
            </div>
            <h4 className="text-base font-bold text-slate-800 group-hover:text-brand-700 transition-colors mb-1.5 flex items-center justify-between">
              <span>등교중지 출결 처리 기준</span>
              <span className="text-slate-300 group-hover:text-brand-600 transition-colors text-sm">→</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              출석 인정 처리 원칙부터 진료확인서 등 증빙 제출 서류 규정까지 교육행정 절차를 정리했어요.
            </p>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-brand-600 font-medium">
            <span>학사 및 출결 가이드</span>
            <span className="group-hover:translate-x-0.5 transition-transform">자세히 보기</span>
          </div>
        </Link>

        <a
          href="https://infectious-disease-info.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-300 transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl mb-3 shadow-xs group-hover:scale-105 transition-transform">
              🗂️
            </div>
            <h4 className="text-base font-bold text-slate-800 group-hover:text-brand-700 transition-colors mb-1.5 flex items-center justify-between">
              <span>감염병 아카이빙 사이트</span>
              <span className="text-slate-400 group-hover:text-brand-600 transition-colors text-xs font-normal">↗</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              감염병포털, 질병관리청 및 교육청 공식 매뉴얼 등이 종합 수록된 외부 아카이브예요.
            </p>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-brand-600 font-medium">
            <span>공식 아카이브 포털</span>
            <span className="group-hover:translate-x-0.5 transition-transform">외부 링크 열기 ↗</span>
          </div>
        </a>
      </div>
    </div>
  )
}
