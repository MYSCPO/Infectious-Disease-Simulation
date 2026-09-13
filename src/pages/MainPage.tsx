import { Link } from 'react-router-dom'

export default function MainPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-brand-700 text-white py-10 px-4 text-center">
        <p className="text-brand-100 text-sm font-medium mb-2">하나 된 대응, 건강한 학교생활</p>
        <h1 className="text-2xl sm:text-3xl font-bold">학교 감염병 위기 대응 모의훈련</h1>
        <p className="mt-3 text-brand-100 text-sm max-w-xl mx-auto">
          시나리오를 단계별로 따라가며 담임·보건·생활부장·행정실장·관리자 역할을 조별로 수행하는 웹 기반 모의훈련
          프로그램입니다. 순위나 감점 없이, 모든 조가 제출하면 답을 한꺼번에 공개해 비교하고 토론합니다.
        </p>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 grid sm:grid-cols-2 gap-5">
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-1">모의훈련 시나리오</h2>
          <p className="text-sm text-slate-500 mb-4 flex-1">
            진행자가 학교 설정을 마친 뒤 조를 편성하고, 참가자는 각자 역할로 참여해 단계별 조치를 선택합니다.
          </p>
          <div className="space-y-2">
            <Link
              to="/facilitator/setup"
              className="block text-center rounded-lg bg-brand-600 text-white py-2.5 text-sm font-semibold hover:bg-brand-700"
            >
              진행자로 훈련 시작하기
            </Link>
            <Link
              to="/join"
              className="block text-center rounded-lg border border-brand-300 text-brand-700 py-2.5 text-sm font-semibold hover:bg-brand-50"
            >
              참가 코드로 입장하기
            </Link>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-1">감염병 아카이빙 사이트</h2>
          <p className="text-sm text-slate-500 mb-4 flex-1">
            학교 감염병 관련 매뉴얼, 공문, 통계 등을 모아둔 기존 아카이빙 사이트로 이동합니다.
          </p>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="block text-center rounded-lg border border-slate-300 text-slate-500 py-2.5 text-sm font-semibold cursor-not-allowed"
            title="기존 아카이빙 사이트 주소를 연결하면 활성화됩니다"
          >
            아카이빙 사이트 바로가기 (연결 예정)
          </a>
        </section>
      </main>

      <footer className="text-center text-xs text-slate-400 py-6">
        방과 후 연수 45분 기준 · 초·중·고 전 교직원 대상 · 4~6인 1조 편성
      </footer>
    </div>
  )
}
