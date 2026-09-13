import { Link } from 'react-router-dom'

export default function MainPage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper-50">
      <header className="bg-brand-600 text-white py-12 px-4 text-center rounded-b-[2.5rem]">
        <p className="text-brand-50 text-sm font-semibold mb-2">🌱 하나 된 대응, 건강한 학교생활</p>
        <h1 className="text-2xl sm:text-3xl font-black">학교 감염병 위기 대응 모의훈련</h1>
        <p className="mt-3 text-brand-50 text-sm max-w-xl mx-auto leading-relaxed">
          시나리오를 단계별로 따라가며 담임·보건·생활부장·행정실장·관리자 역할을 조별로 수행하는 웹 기반 모의훈련
          프로그램이에요. 순위나 감점 없이, 모든 조가 제출하면 답을 한꺼번에 공개해서 함께 비교하고 이야기 나눠요 :)
        </p>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 grid sm:grid-cols-3 gap-5">
        <section className="bg-white rounded-3xl border border-brand-100 shadow-sm p-6 flex flex-col">
          <div className="text-3xl mb-2">🧑‍🤝‍🧑</div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">모의훈련 시나리오</h2>
          <p className="text-sm text-slate-500 mb-4 flex-1 leading-relaxed">
            진행자가 학교 설정을 마친 뒤 조를 편성하고, 참가자는 각자 역할로 참여해 단계별 조치를 선택해요.
          </p>
          <div className="space-y-2">
            <Link
              to="/facilitator/setup"
              className="block text-center rounded-full bg-brand-600 text-white py-2.5 text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              진행자로 훈련 시작하기
            </Link>
            <Link
              to="/join"
              className="block text-center rounded-full border border-brand-300 text-brand-700 py-2.5 text-sm font-semibold hover:bg-brand-50 transition-colors"
            >
              참가 코드로 입장하기
            </Link>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-brand-100 shadow-sm p-6 flex flex-col">
          <div className="text-3xl mb-2">📚</div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">감염병 정보 둘러보기</h2>
          <p className="text-sm text-slate-500 mb-4 flex-1 leading-relaxed">
            훈련 전에 우리 학교 주요 감염병의 증상·잠복기·감염기·치료와 예방을 카드로 가볍게 살펴볼 수 있어요.
          </p>
          <Link
            to="/diseases"
            className="block text-center rounded-full bg-brand-100 text-brand-700 py-2.5 text-sm font-semibold hover:bg-brand-200 transition-colors"
          >
            감염병 갤러리 보기
          </Link>
        </section>

        <section className="bg-white rounded-3xl border border-brand-100 shadow-sm p-6 flex flex-col">
          <div className="text-3xl mb-2">🗂️</div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">감염병 아카이빙 사이트</h2>
          <p className="text-sm text-slate-500 mb-4 flex-1 leading-relaxed">
            학교 감염병 관련 매뉴얼, 공문, 통계 등을 모아둔 아카이빙 사이트로 이동해요.
          </p>
          <a
            href="https://infectious-disease-info.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center rounded-full border border-slate-200 text-slate-600 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            아카이빙 사이트 바로가기 ↗
          </a>
        </section>
      </main>

      <footer className="text-center text-xs text-slate-400 py-6">
        방과 후 연수 20~30분 기준 · 초·중·고 전 교직원 대상 · 4~6인 1조 편성
      </footer>
    </div>
  )
}
