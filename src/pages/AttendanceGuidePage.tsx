import { Link } from 'react-router-dom'

export default function AttendanceGuidePage() {
  return (
    <div className="min-h-screen bg-paper-50 pb-10">
      <header className="bg-brand-600 text-white py-8 px-4 text-center rounded-b-[2.5rem] mb-6">
        <p className="text-brand-50 text-sm font-semibold mb-1">📋 담임교사 필수 정보</p>
        <h1 className="text-xl sm:text-2xl font-black">등교중지 학생 출결 처리 기준</h1>
        <p className="mt-2 text-brand-50 text-sm max-w-lg mx-auto leading-relaxed">
          감염병으로 등교중지된 학생, 결석이 아니라 출석으로 인정돼요. 담임교사가 가장 많이 묻는 질문을
          한 번에 정리했습니다.
        </p>
      </header>

      <main className="max-w-2xl mx-auto px-4 space-y-5">
        <Link to="/" className="text-xs text-brand-700 underline inline-block">
          ← 메인으로 돌아가기
        </Link>

        <section className="bg-white rounded-2xl border border-brand-100 shadow-sm p-5 space-y-3">
          <h2 className="font-bold text-slate-800">기본 원칙 (출석 인정 결석 대상)</h2>
          <ul className="space-y-2.5 text-sm text-slate-600 leading-relaxed">
            <li className="flex gap-2">
              <span className="text-brand-500 font-bold">1.</span>
              <span>등교중지가 필요한 감염병으로 <b className="text-slate-800">확진된 경우</b> — 격리 기간 동안 등교중지 실시(격리 기간은 원칙적으로 의사 소견에 따름)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand-500 font-bold">2.</span>
              <span>등교중지가 필요한 감염병이 <b className="text-slate-800">의심되는 경우</b> — 확진 여부를 확인할 때까지 등교중지 실시</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand-500 font-bold">3.</span>
              <span>진료 결과 <b className="text-slate-800">감염병이 아니었더라도</b> — 결과 확인까지 걸린 기간은 출석으로 인정</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand-500 font-bold">4.</span>
              <span>신종감염병 유행 시 역학조사로 <b className="text-slate-800">자가격리 통보</b>를 받은 경우 — 증상 유무와 무관하게 등교중지 실시</span>
            </li>
          </ul>
          <p className="text-xs text-slate-400 pt-1">
            → 위 네 가지 모두 <b>결석이 아니라 "출석 인정 결석"</b>으로 처리됩니다.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-brand-100 shadow-sm p-5 space-y-3">
          <h2 className="font-bold text-slate-800">출결 처리 절차</h2>
          <ol className="space-y-2.5 text-sm text-slate-600 leading-relaxed list-none">
            <li className="flex gap-2">
              <span className="text-brand-500 font-bold">①</span>
              <span>의심증상으로 미등교 시 보호자에게 진료 안내, 학교에서 발견 시 보호자에게 연락해 진료 요청 + '등교중지 안내문' 배부</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand-500 font-bold">②</span>
              <span>등교중지 기간 확인 — 진료 결과에 기간이 명시돼 있으면 그 기간 적용, 명시 안 돼 있으면 보건교사가 최초 증상일 기준 해당 감염병의 전파 차단 등교중지 기간을 적용</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand-500 font-bold">③</span>
              <span>등교중지 기간 동안 생활수칙 안내(학교 밖 다중이용시설 출입 금지, 손 씻기·마스크 착용 등 개인위생 수칙 준수)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand-500 font-bold">④</span>
              <span>등교 재개 시 서류 제출 안내 및 등교중지 해제 판단(아래 참고)</span>
            </li>
          </ol>
        </section>

        <section className="bg-brand-50 rounded-2xl border border-brand-200 p-5 space-y-2">
          <h2 className="font-bold text-brand-700">📎 등교 재개 시 제출 서류 (택 1)</h2>
          <p className="text-sm text-slate-700">진료확인서 · 의사소견서 · 진단서 중 1개</p>
          <p className="text-xs text-slate-500">
            부득이한 경우 처방전도 인정(KOICD 질병분류센터 웹사이트에서 질병코드 확인 후)
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-brand-100 shadow-sm p-5 space-y-2">
          <h2 className="font-bold text-slate-800">등교중지 해제</h2>
          <ul className="space-y-1.5 text-sm text-slate-600 leading-relaxed list-disc list-inside">
            <li>등교 재개 여부는 원칙적으로 의사나 보건소의 의견에 따름</li>
            <li>증상이 소실되고, 진단서 등에 명시된 등교중지 기간이 종료되면 등교 재개</li>
            <li>종료 시점 이전이라도 감염성이 소실됐다는 진료확인서·소견서가 있으면 조기 등교 가능</li>
            <li>종료 시점 이후에도 증상이 남아있으면 진료확인서·소견서 제시로 기간 연장 가능</li>
          </ul>
        </section>

        <p className="text-xs text-slate-400 text-center pt-2">
          출처: 「학교 감염병 예방·위기대응 매뉴얼」(교육부) Ⅲ. 등교 중지 · 1. 등교 중지의 원칙과 절차
        </p>
      </main>
    </div>
  )
}
