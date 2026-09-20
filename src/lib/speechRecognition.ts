// 브라우저 내장 음성인식(Web Speech API) 래퍼. iOS Safari·카카오톡 등 인앱 브라우저는
// 이 API를 지원하지 않으므로, 호출 전 반드시 isSpeechRecognitionSupported()로 분기해
// 미지원 환경에서는 수동 완료 버튼으로 대체해야 한다(RelayPanel 참고).
//
// 인식 결과(정확도)는 어디까지나 "명확한 대사 전달 보너스" 지급 여부를 가리는 보조 지표일 뿐,
// 다음 차례로의 진행 자체는 참가자가 직접 누르는 완료 버튼으로만 이루어진다(음성인식이 늦거나
// 실패해도 절대 진행이 막히지 않도록).

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

interface SpeechRecognitionResultLike {
  0: { transcript: string }
}

interface SpeechRecognitionEventLike {
  resultIndex?: number
  results: ArrayLike<SpeechRecognitionResultLike>
}

interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onerror: ((e: { error?: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() !== null
}

export interface RecognitionController {
  // 지금까지 인식된 구간을 멈추고 누적된 텍스트를 반환한다(완료 버튼을 눌렀을 때 1회 호출).
  stop: () => Promise<string>
}

// 참가자가 여러 문장을 이어 읽는 동안 끊기지 않도록 continuous 모드로 켜 두고, 완료 버튼을
// 누를 때까지 계속 듣는다. 시작 자체가 마이크 권한을 요구하므로 반드시 클릭 등 사용자 동작
// 안에서 호출해야 한다.
export function startContinuousRecognition(): RecognitionController | null {
  const Ctor = getSpeechRecognitionCtor()
  if (!Ctor) return null

  const recognition = new Ctor()
  recognition.lang = 'ko-KR'
  recognition.continuous = true
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  let transcript = ''
  recognition.onresult = (e) => {
    const startIndex = e.resultIndex ?? 0
    for (let i = startIndex; i < e.results.length; i++) {
      const chunk = e.results[i]?.[0]?.transcript ?? ''
      transcript += (transcript ? ' ' : '') + chunk
    }
  }
  recognition.onerror = () => {
    // 완료 버튼으로만 진행하므로 별도 에러 처리 없이 무시한다.
  }

  try {
    recognition.start()
  } catch {
    return null
  }

  let stopped = false
  return {
    stop: () =>
      new Promise((resolve) => {
        if (stopped) {
          resolve(transcript)
          return
        }
        stopped = true
        recognition.onend = () => resolve(transcript)
        try {
          recognition.stop()
        } catch {
          resolve(transcript)
        }
      }),
  }
}

export interface ReadingScore {
  bonus: boolean // 전체 문장 인식률이 높아 "명확한 대사 전달 보너스(+30pt)" 지급 대상인지
  matchedKeywords: number
}

// 완벽한 문장 정렬 없이도 "얼마나 정확히 읽었는지"를 근사하기 위해 (1) 핵심 키워드 일치 비율과
// (2) 인식된 글자 수와 원문 글자 수의 비율(너무 짧게 끊기거나 엉뚱한 말이 섞이면 낮아짐)을
// 평균한 값을 정확도로 사용한다. 정식 음성-텍스트 정렬 알고리즘은 아니지만, 현장 소음·발음
// 차이를 감안한 실용적 기준으로 충분하다. 이 점수는 보너스 지급 여부만 결정할 뿐, 다음
// 차례로의 진행 여부와는 무관하다(진행은 완료 버튼으로만 이루어짐).
export function scoreReading(transcript: string, line: string, keywords: string[]): ReadingScore {
  const normalize = (s: string) => s.replace(/\s+/g, '').toLowerCase()
  const t = normalize(transcript)
  const matchedKeywords = keywords.filter((k) => t.includes(normalize(k))).length

  const lineNorm = normalize(line)
  const keywordRatio = keywords.length > 0 ? matchedKeywords / keywords.length : 0
  const lengthRatio = t.length === 0 ? 0 : Math.min(t.length, lineNorm.length) / Math.max(t.length, lineNorm.length)
  const accuracy = (keywordRatio + lengthRatio) / 2

  return { bonus: accuracy >= 0.8, matchedKeywords }
}
