import { useState } from 'react'
import { getDiseaseById } from '../data/diseases'
import { COMMON_WILDCARD_QUIZZES, WILDCARD_QUIZZES, type WildcardQuizOption } from '../data/wildcardQuiz'
import { getRelayFinalQuiz } from '../data/relayFinalQuiz'

// 진행자 화면의 '문제 은행' 목록. 각 줄을 누르면 실제 문항을 펼쳐 볼 수 있다.
// 진행자 화면은 빔프로젝터로 띄우는 경우가 많아, 정답은 '정답 표시'를 켰을 때만 강조한다.

interface PreviewQuestion {
  label?: string
  prompt: string
  options: WildcardQuizOption[]
}

function QuestionList({ questions, showAnswers }: { questions: PreviewQuestion[]; showAnswers: boolean }) {
  return (
    <ol className="mt-2 space-y-2.5">
      {questions.map((q, i) => (
        <li key={i} className="bg-white rounded-lg border border-slate-100 px-3 py-2.5">
          <p className="text-[13px] font-semibold text-slate-800 leading-relaxed">
            <span className="text-slate-400 mr-1">{i + 1}.</span>
            {q.label && (
              <span className="inline-block mr-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500 align-[1px]">
                {q.label}
              </span>
            )}
            {q.prompt}
          </p>
          <ul className="mt-1.5 grid sm:grid-cols-2 gap-1">
            {q.options.map((o) => {
              const mark = showAnswers && o.correct
              return (
                <li
                  key={o.id}
                  className={`text-xs rounded-md px-2 py-1 leading-relaxed ${
                    mark ? 'bg-emerald-50 text-emerald-700 font-bold' : 'bg-slate-50 text-slate-600'
                  }`}
                >
                  {mark ? '✅ ' : `${o.id.toUpperCase()}. `}
                  {o.text}
                </li>
              )
            })}
          </ul>
        </li>
      ))}
    </ol>
  )
}

function Row({
  title,
  summary,
  tone,
  questions,
  showAnswers,
}: {
  title: string
  summary: string
  tone: 'violet' | 'brand'
  questions: PreviewQuestion[]
  showAnswers: boolean
}) {
  const [open, setOpen] = useState(false)
  const box = tone === 'violet' ? 'bg-violet-50 border-violet-100' : 'bg-paper-50 border-slate-100'
  const titleColor = tone === 'violet' ? 'text-violet-700' : 'text-brand-700'
  return (
    <div className={`text-xs border rounded-xl px-3 py-2 ${box}`}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between gap-2 text-left">
        <span>
          <span className={`font-bold ${titleColor}`}>{title}</span>
          <span className="text-slate-600"> · {summary}</span>
        </span>
        <span className="shrink-0 text-[11px] font-semibold text-slate-400">{open ? '접기 ▲' : '문항 보기 ▼'}</span>
      </button>
      {open && <QuestionList questions={questions} showAnswers={showAnswers} />}
    </div>
  )
}

export default function QuizBankPreview({ diseaseIds }: { diseaseIds: string[] }) {
  const [showAnswers, setShowAnswers] = useState(false)
  const commonTopics = Array.from(new Set(COMMON_WILDCARD_QUIZZES.map((q) => q.topic)))

  return (
    <div className="mb-4 space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-500">
          🎲 문제 은행(발송할 때마다 아래 영역 중 하나가 무작위로 출제, 단계와 무관하게 항상 발송 가능)
        </p>
        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showAnswers}
            onChange={(e) => setShowAnswers(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
          />
          정답 표시
        </label>
      </div>
      <p className="text-[11px] text-slate-400">
        각 줄을 누르면 문항을 볼 수 있어요. 화면을 빔프로젝터로 띄운 상태라면 정답 표시는 끈 채로 확인해 주세요.
      </p>
      <Row
        title="📋 보너스(공통)"
        summary={`문제 ${COMMON_WILDCARD_QUIZZES.length}개 준비됨 (${commonTopics.join(' · ')}) · 감염병과 무관하게 전 조 동일 문제`}
        tone="violet"
        questions={COMMON_WILDCARD_QUIZZES.map((q) => ({ label: q.topic, prompt: q.prompt, options: q.options }))}
        showAnswers={showAnswers}
      />
      {diseaseIds.map((diseaseId) => {
        const list = WILDCARD_QUIZZES[diseaseId] ?? []
        if (list.length === 0) return null
        const disease = getDiseaseById(diseaseId)
        const topics = Array.from(new Set(list.map((q) => q.topic)))
        const final = getRelayFinalQuiz(diseaseId)
        return (
          <Row
            key={diseaseId}
            title={disease.name}
            summary={`문제 ${list.length}개 준비됨 (${topics.join(' · ')}) + 대응3 최종 의사결정 퀴즈`}
            tone="brand"
            questions={[
              ...list.map((q) => ({ label: q.topic, prompt: q.prompt, options: q.options })),
              { label: '🎙️ 대응3 최종 의사결정', prompt: final.prompt, options: final.options },
            ]}
            showAnswers={showAnswers}
          />
        )
      })}
    </div>
  )
}
