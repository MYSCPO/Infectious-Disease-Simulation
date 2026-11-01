import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { LearnerDoc, StageId } from '../types'
import { ROLE_LABELS } from '../types'
import { useSession } from '../hooks/useSession'
import { getDiseaseById } from '../data/diseases'
import { getScenarioForDisease } from '../data/scenarioGenerator'
import { getChecklistForStage } from '../data/roleChecklist'
import { STAGES } from '../data/stages'
import { ROLE_MASCOTS } from '../data/mascots'
import type { WildcardQuizQuestion } from '../data/wildcardQuiz'
import {
  learnerCorrect,
  loadLearnerId,
  SELF_READING_SEC,
  SELF_STAGES,
  selfQuizFor,
  subscribeLearner,
  updateLearner,
} from '../lib/selfStudy'
import { serverNow } from '../lib/serverClock'
import StageBanner from '../components/StageBanner'
import ScenarioCard from '../components/ScenarioCard'
import ChecklistPanel from '../components/ChecklistPanel'
import MascotAvatar from '../components/MascotAvatar'
import DiseaseManualContent, { gradeLabel } from '../components/DiseaseManualContent'
import DiseaseManualModal from '../components/DiseaseManualModal'
import RecommendedResources from '../components/RecommendedResources'
import ReferenceGrid from '../components/ReferenceGrid'
import SiteFooter from '../components/SiteFooter'

function QuizCard({
  quiz,
  answered,
  onAnswer,
  onHint,
}: {
  quiz: WildcardQuizQuestion
  answered: boolean | undefined
  onAnswer: (correct: boolean) => void
  onHint?: () => void
}) {
  const [picked, setPicked] = useState<string | null>(null)
  const done = answered !== undefined
  const correctOpt = quiz.options.find((o) => o.correct)

  return (
    <section className="rounded-2xl border-2 border-amber-300 bg-white p-5 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold rounded-full px-3 py-1 bg-amber-400 text-amber-950">✏️ 확인 퀴즈</span>
        <span className="text-[11px] font-semibold bg-paper-100 text-slate-500 rounded-full px-2 py-1">{quiz.topic}</span>
      </div>
      <p className="text-base font-bold text-slate-800 leading-relaxed">{quiz.prompt}</p>
      <div className="space-y-2">
        {quiz.options.map((o) => {
          const isPicked = picked === o.id
          const reveal = done
          return (
            <button
              key={o.id}
              type="button"
              disabled={done}
              onClick={() => {
                setPicked(o.id)
                onAnswer(o.correct)
              }}
              className={`w-full text-left rounded-xl border px-3 py-2.5 text-sm transition ${
                reveal && o.correct
                  ? 'border-emerald-400 bg-emerald-50 font-bold text-emerald-800'
                  : reveal && isPicked
                    ? 'border-rose-300 bg-rose-50 text-rose-700'
                    : 'border-slate-200 hover:border-brand-300'
              }`}
            >
              {reveal && o.correct ? '✅ ' : reveal && isPicked ? '❌ ' : ''}
              {o.text}
            </button>
          )
        })}
      </div>
      {done ? (
        <p className={`text-sm font-bold ${answered ? 'text-emerald-700' : 'text-rose-600'}`}>
          {answered ? '정답이에요! 👏' : `아쉬워요. 정답은 "${correctOpt?.text}"예요.`}
        </p>
      ) : (
        onHint && (
          <button
            type="button"
            onClick={onHint}
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-3 py-2 hover:bg-amber-100"
          >
            💡 힌트 보기 (감염병 매뉴얼)
          </button>
        )
      )}
    </section>
  )
}

export default function SelfRunPage() {
  const { code: rawCode = '' } = useParams()
  const code = rawCode.toUpperCase()
  const navigate = useNavigate()
  const { session } = useSession(code)
  const learnerId = useMemo(() => loadLearnerId(code), [code])
  const [learner, setLearner] = useState<LearnerDoc | null | undefined>(undefined)
  const [checkedNow, setCheckedNow] = useState<number[] | null>(null)
  const [showManual, setShowManual] = useState(false)
  const [readingLeft, setReadingLeft] = useState(SELF_READING_SEC)
  const [showDonePopup, setShowDonePopup] = useState(false)

  useEffect(() => {
    if (!learnerId) {
      navigate(`/self/${code}`, { replace: true })
      return
    }
    return subscribeLearner(code, learnerId, setLearner)
  }, [code, learnerId])

  const stage = learner?.stage
  useEffect(() => {
    setCheckedNow(null)
    window.scrollTo(0, 0)
  }, [stage])

  // 매뉴얼 읽기 30초: 이 화면에 들어온 시점부터 센다.
  useEffect(() => {
    if (stage !== 'reading') return
    const t0 = serverNow()
    setReadingLeft(SELF_READING_SEC)
    const id = setInterval(() => setReadingLeft(Math.max(0, SELF_READING_SEC - Math.floor((serverNow() - t0) / 1000))), 500)
    return () => clearInterval(id)
  }, [stage])

  // 완료 직후 1회만 추천 자료 안내 팝업을 띄운다.
  const popupKey = `idsim.selfDonePopup.${code}.${learnerId}`
  useEffect(() => {
    if (stage !== 'done') return
    try {
      if (!localStorage.getItem(popupKey)) setShowDonePopup(true)
    } catch {
      setShowDonePopup(true)
    }
  }, [stage])
  function closeDonePopup(goToResources: boolean) {
    setShowDonePopup(false)
    try {
      localStorage.setItem(popupKey, '1')
    } catch {
      // 다음에 다시 떠도 큰 문제는 없다.
    }
    if (goToResources) setTimeout(() => document.getElementById('recommended-resources')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  if (learner === undefined) return <div className="p-8 text-center text-slate-400">불러오는 중...</div>
  if (learner === null) {
    return (
      <div className="p-8 text-center text-slate-500 space-y-3">
        <p>연수 기록을 찾을 수 없어요. 담당 선생님이 기록을 정리했을 수 있어요.</p>
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.removeItem(`idsim.learner.${code}`)
            } catch {
              // 무시
            }
            navigate(`/self/${code}`, { replace: true })
          }}
          className="rounded-full bg-brand-600 text-white text-sm font-bold px-4 py-2"
        >
          처음부터 다시 시작하기
        </button>
      </div>
    )
  }

  const disease = getDiseaseById(learner.diseaseId)
  const mascot = ROLE_MASCOTS[learner.role]

  const header = (
    <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
      <div>
        <p className="text-sm text-slate-500">{session?.schoolName ?? ''} · 개인 자율 연수</p>
        <p className="text-lg font-bold text-slate-800 flex items-center gap-2 flex-wrap">
          {learner.name}
          <span className="text-xs font-semibold bg-brand-100 text-brand-700 rounded-full px-2 py-0.5">
            {disease.emoji} {disease.name}
          </span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className="text-xs font-bold text-brand-700">{mascot.name}</p>
          <p className="text-[11px] text-slate-400">{ROLE_LABELS[learner.role].split('(')[0]}</p>
        </div>
        <MascotAvatar role={learner.role} motion="idle" />
      </div>
    </div>
  )

  // ── 완료 화면
  if (learner.stage === 'done') {
    const minutes = learner.completedAt ? Math.max(1, Math.round((learner.completedAt - learner.startedAt) / 60000)) : null
    return (
      <div className="min-h-screen bg-paper-50 flex flex-col">
        <div className="flex-1 py-8 px-4">
          <div className="max-w-2xl mx-auto space-y-5">
            {header}
            <section className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 text-white p-6 text-center space-y-2">
              <div className="text-4xl">🎉</div>
              <h1 className="text-2xl font-black">개인 자율 연수 완료!</h1>
              <p className="text-brand-50 text-sm">
                {learner.name} 선생님, 수고 많으셨어요. 참여 기록이 담당 선생님께 전달되었어요.
              </p>
              <div className="flex justify-center gap-3 pt-2 text-sm">
                <span className="rounded-full bg-white/15 px-3 py-1">✏️ 퀴즈 정답 {learnerCorrect(learner)}/{SELF_STAGES.length}</span>
                {minutes && <span className="rounded-full bg-white/15 px-3 py-1">⏱ {minutes}분</span>}
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <h2 className="font-bold text-slate-800">
                {mascot.name}의 핵심 행동요령 <span className="text-sm font-normal text-slate-500">· {ROLE_LABELS[learner.role]} · {disease.name}</span>
              </h2>
              <p className="text-xs text-slate-400">실제 상황에서 다시 꺼내 볼 수 있도록 단계별로 정리했어요. 화면을 캡처해 두셔도 좋아요.</p>
              {SELF_STAGES.map((s) => {
                const items = getChecklistForStage(s, learner.diseaseId)[learner.role].items
                if (items.length === 0) return null
                return (
                  <div key={s} className="rounded-xl bg-paper-50 p-3">
                    <p className="text-xs font-bold text-brand-700 mb-1">{STAGES.find((x) => x.id === s)?.label}</p>
                    <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                      {items.map((it, i) => (
                        <li key={i}>{it}</li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </section>

            <RecommendedResources diseaseId={learner.diseaseId} />
          </div>
          <div className="mt-8">
            <ReferenceGrid title="📚 사후 학습 참고 자료실" />
          </div>
        </div>
        <SiteFooter />

        {showDonePopup && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6 text-center space-y-3">
              <div className="text-4xl">🎉</div>
              <h3 className="text-lg font-black text-slate-800">연수를 마쳤어요!</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                실제 상황에서 꼭 필요한 <b>감염병 정보와 출결 처리 기준</b>을 아래 자료실에서 한 번 더 확인해 보세요.
              </p>
              <button
                type="button"
                onClick={() => closeDonePopup(true)}
                className="w-full rounded-full bg-brand-600 text-white py-3 text-sm font-bold hover:bg-brand-700"
              >
                📚 추천 자료 보러 가기
              </button>
              <button type="button" onClick={() => closeDonePopup(false)} className="text-xs text-slate-400 underline">
                나중에
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── 매뉴얼 읽기
  if (learner.stage === 'reading') {
    return (
      <div className="min-h-screen bg-paper-50 pb-16">
        <StageBanner current="prevention" awaitingStart />
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
          {header}
          <section className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-center">
            <p className="text-sm font-bold text-amber-800">📖 훈련 시작 전 우리 조의 감염병 매뉴얼을 읽어보세요.</p>
            <p className={`text-3xl font-black tabular-nums mt-1 ${readingLeft > 0 ? 'text-amber-700' : 'text-emerald-600'}`}>
              {readingLeft > 0 ? `⏱ 0:${String(readingLeft).padStart(2, '0')}` : '✅ 다 읽었어요'}
            </p>
          </section>
          <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <div className="text-center">
              <span className="text-4xl">{disease.emoji}</span>
              <h2 className="text-lg font-black text-slate-800 mt-1">{disease.name}</h2>
              <span className="text-xs font-semibold bg-paper-100 text-slate-600 rounded-full px-3 py-1">{gradeLabel(disease)}</span>
            </div>
            <DiseaseManualContent disease={disease} />
          </section>
          <button
            type="button"
            disabled={readingLeft > 0}
            onClick={() => updateLearner(code, learner.id, { stage: 'prevention' })}
            className="w-full rounded-full bg-brand-600 text-white py-3.5 text-sm font-bold hover:bg-brand-700 disabled:opacity-40"
          >
            {readingLeft > 0 ? `▶ 훈련 시작 (${readingLeft}초 뒤 가능)` : '▶ 훈련 시작'}
          </button>
        </div>
      </div>
    )
  }

  // ── 단계 진행
  const current = learner.stage as StageId
  const idx = SELF_STAGES.indexOf(current)
  const scenario = getScenarioForDisease(learner.diseaseId).find((s) => s.stage === current)
  const myItems = getChecklistForStage(current, learner.diseaseId)[learner.role].items
  const checked = checkedNow ?? learner.checked[current] ?? []
  const allChecked = checked.length >= myItems.length
  const quiz = selfQuizFor(learner, current)
  const answered = learner.answers[current]
  const canNext = allChecked && (answered !== undefined || !quiz)
  const next = SELF_STAGES[idx + 1]

  async function goNext() {
    if (next) await updateLearner(code, learner!.id, { stage: next })
    else await updateLearner(code, learner!.id, { stage: 'done', completedAt: serverNow() })
  }

  return (
    <div className="min-h-screen bg-paper-50 pb-16">
      <StageBanner current={current} />
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {header}
        <button
          type="button"
          onClick={() => setShowManual(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-3 py-2 hover:bg-amber-100"
        >
          💡 {disease.name} 감염병 매뉴얼 보기
        </button>

        {scenario && <ScenarioCard scenario={scenario} />}

        {current === 'response3' && (
          <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
            <p className="text-sm font-bold text-violet-700">🏫 경계 단계: 5개 팀이 함께 움직여요</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              아래 체크리스트에서 발생감시팀 → 예방관리팀 → 학사관리팀 → 행정지원팀 → 관리자 순서로 각 팀의 조치를 훑어보고, 내 역할
              조치를 체크한 뒤 관리자 최종 의사결정 퀴즈를 풀어 보세요.
            </p>
          </div>
        )}

        <div className="rounded-xl border border-brand-200 bg-brand-50/50 px-4 py-2.5 text-xs font-semibold text-brand-700">
          {allChecked ? '✅ 내 역할 체크 완료! 아래 확인 퀴즈를 풀어 보세요.' : `✏️ 내 역할 체크리스트를 모두 체크해 주세요 (${checked.length}/${myItems.length})`}
        </div>

        <ChecklistPanel
          key={current}
          stage={current}
          myRole={learner.role}
          checkable
          diseaseId={learner.diseaseId}
          initialChecked={learner.checked[current]}
          onProgress={(idxs) => {
            setCheckedNow(idxs)
            updateLearner(code, learner.id, { checked: { ...learner.checked, [current]: idxs } }).catch((e) => console.error(e))
          }}
        />

        {allChecked && quiz && (
          <QuizCard
            key={`${current}-quiz`}
            quiz={quiz}
            answered={answered}
            onAnswer={(correct) => updateLearner(code, learner.id, { answers: { ...learner.answers, [current]: correct } })}
            onHint={current === 'recovery' ? undefined : () => setShowManual(true)}
          />
        )}

        <button
          type="button"
          onClick={goNext}
          disabled={!canNext}
          className="w-full rounded-full bg-slate-800 text-white py-3.5 text-sm font-bold hover:bg-slate-700 disabled:opacity-40"
        >
          {!allChecked
            ? '내 역할 체크리스트를 먼저 모두 체크해 주세요'
            : !canNext
              ? '확인 퀴즈를 풀어 주세요'
              : next
                ? `다음 단계로 (${STAGES.find((s) => s.id === next)?.shortLabel}) →`
                : '🎉 연수 마치기'}
        </button>
        <p className="text-center text-[11px] text-slate-400">
          중간에 나가도 괜찮아요. 같은 휴대폰으로 다시 열면 이 단계부터 이어서 할 수 있어요.{' '}
          <Link to="/" className="underline">
            첫 화면
          </Link>
        </p>
      </div>

      {showManual && <DiseaseManualModal disease={disease} greetRole={learner.role} onClose={() => setShowManual(false)} />}
    </div>
  )
}
