import { Link } from 'react-router-dom'

// 사전/사후 학습 참고 자료 4종. 훈련이 진행되는 화면(TeamTrainingPage)에는 넣지 않고,
// 최초 화면·입장 화면·결과(종료) 화면에서만 노출한다(훈련 중에는 참고할 필요가 적다는 판단).
export default function ReferenceGrid({ title = '📚 사전/사후 학습 참고 자료실' }: { title?: string }) {
  return (
    <div className="max-w-3xl w-full mx-auto px-4">
      <h3 className="text-sm font-bold text-slate-500 mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/diseases"
          className="bg-white rounded-2xl border border-brand-100 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col"
        >
          <div className="text-2xl mb-1">🦠</div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">모의훈련 대상 감염병</h4>
          <p className="text-xs text-slate-500 leading-relaxed flex-1">감염병 7종의 증상·잠복기·치료·예방을 살펴봐요.</p>
        </Link>

        <Link
          to="/guide"
          className="bg-white rounded-2xl border border-brand-100 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col"
        >
          <div className="text-2xl mb-1">🩹</div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">호발 감염병 10종 가이드</h4>
          <p className="text-xs text-slate-500 leading-relaxed flex-1">원인부터 등교 중지 기준까지 인포그래픽으로 봐요.</p>
        </Link>

        <Link
          to="/attendance-guide"
          className="bg-white rounded-2xl border border-brand-100 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col"
        >
          <div className="text-2xl mb-1">📋</div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">등교중지 출결 처리 기준</h4>
          <p className="text-xs text-slate-500 leading-relaxed flex-1">출석 인정 원칙부터 제출 서류까지 한 번에 정리했어요.</p>
        </Link>

        <a
          href="https://infectious-disease-info.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-2xl border border-brand-100 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col"
        >
          <div className="text-2xl mb-1">🗂️</div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">감염병 아카이빙 사이트 ↗</h4>
          <p className="text-xs text-slate-500 leading-relaxed flex-1">매뉴얼·공문·통계를 모아둔 사이트로 이동해요.</p>
        </a>
      </div>
    </div>
  )
}
