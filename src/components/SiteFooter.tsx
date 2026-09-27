export default function SiteFooter() {
  return (
    <footer className="bg-navy-950 text-slate-300 py-12 px-4 sm:px-6 text-center border-t border-navy-900/60">
      <div className="max-w-2xl mx-auto space-y-3">
        <p className="text-white font-bold text-base flex items-center justify-center gap-2">
          <span>🩺</span>
          <span>학교 감염병 모의훈련 프로그램</span>
        </p>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          본 프로그램은 학교·교육청 감염병 담당자와 교직원의 위기대응 역량 강화를 위해 제작된 교육용 모의훈련
          도구입니다. 방과 후 연수, 교직원 자체 워크숍 등에서 자유롭게 활용하실 수 있습니다.
        </p>
        <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed pt-1">
          본 프로그램에서 안내하는 감염병 정보와 대응 절차는 학생 감염병 예방·위기대응 매뉴얼 등 교육부 및 질병관리청
          공식 자료를 바탕으로 구성되었습니다.
        </p>
        <div className="pt-4 border-t border-navy-900/50">
          <p className="text-[11px] text-slate-500 font-mono tracking-wider">
            Developed for educational purposes by jeong mi ae
          </p>
        </div>
      </div>
    </footer>
  )
}
