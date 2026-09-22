// 프로그램 소개·출처·개발자 크레딧. 메인화면뿐 아니라 참가 화면(JoinPage)·결과 화면
// (ResultPage)에도 동일하게 노출해 어느 화면에서 끝나더라도 이 정보가 남아있게 한다.
export default function SiteFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-10 px-4 text-center">
      <p className="text-white font-bold mb-3">🩺 학교 감염병 모의훈련 프로그램</p>
      <p className="text-sm max-w-xl mx-auto leading-relaxed">
        본 프로그램은 학교·교육청 감염병 담당자와 교직원의 위기대응 역량 강화를 위해 제작된 교육용 모의훈련
        도구입니다. 방과 후 연수, 자체 워크숍 등에서 자유롭게 활용하실 수 있습니다.
      </p>
      <p className="text-xs text-slate-500 max-w-xl mx-auto mt-3 leading-relaxed">
        본 프로그램에서 안내하는 감염병 정보와 대응 절차는 학생 감염병 예방·위기대응 매뉴얼 등 공식 자료를
        참고해 제작했으며, 외부 링크로 연결되는 사이트의 내용과 데이터 저작권은 질병관리청, 교육청 등 해당
        공식 소속 기관에 귀속됩니다.
      </p>
      <p className="text-xs text-slate-500 font-mono mt-6">Developed for educational purposes by jeong mi ae</p>
    </footer>
  )
}
