// 브라우저 내장 음성인식(Web Speech API) 래퍼. iOS Safari·카카오톡 등 인앱 브라우저는
// 이 API를 지원하지 않으므로, 호출 전 반드시 isSpeechRecognitionSupported()로 분기해
// 미지원 환경에서는 수동 완료 버튼으로 대체해야 한다(RelayPanel 참고).

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
  results: ArrayLike<SpeechRecognitionResultLike>
}

interface SpeechRecognitionLike {
  lang: string
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

export function recognizeSpeech(): Promise<string> {
  return new Promise((resolve, reject) => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      reject(new Error('unsupported'))
      return
    }
    const recognition = new Ctor()
    recognition.lang = 'ko-KR'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    let settled = false
    recognition.onresult = (e) => {
      settled = true
      resolve(e.results?.[0]?.[0]?.transcript ?? '')
    }
    recognition.onerror = (e) => {
      settled = true
      reject(new Error(e.error ?? 'speech-recognition-error'))
    }
    recognition.onend = () => {
      if (!settled) reject(new Error('no-speech'))
    }
    recognition.start()
  })
}

export interface ReadingScore {
  passed: boolean // 핵심 키워드 2개 이상 인식 시 즉시 통과(다음 차례로 진행)
  bonus: boolean // 전체 문장 인식률이 높아 "명확한 대사 전달 보너스(+30pt)" 지급 대상인지
  matchedKeywords: number
}

// 완벽한 문장 정렬 없이도 "얼마나 정확히 읽었는지"를 근사하기 위해 (1) 핵심 키워드 일치 비율과
// (2) 인식된 글자 수와 원문 글자 수의 비율(너무 짧게 끊기거나 엉뚱한 말이 섞이면 낮아짐)을
// 평균한 값을 정확도로 사용한다. 정식 음성-텍스트 정렬 알고리즘은 아니지만, 현장 소음·발음
// 차이를 감안한 실용적 기준으로 충분하다.
export function scoreReading(transcript: string, line: string, keywords: string[]): ReadingScore {
  const normalize = (s: string) => s.replace(/\s+/g, '').toLowerCase()
  const t = normalize(transcript)
  const matchedKeywords = keywords.filter((k) => t.includes(normalize(k))).length
  const passThreshold = Math.min(2, keywords.length)
  const passed = matchedKeywords >= passThreshold

  const lineNorm = normalize(line)
  const keywordRatio = keywords.length > 0 ? matchedKeywords / keywords.length : 0
  const lengthRatio = t.length === 0 ? 0 : Math.min(t.length, lineNorm.length) / Math.max(t.length, lineNorm.length)
  const accuracy = (keywordRatio + lengthRatio) / 2

  return { passed, bonus: passed && accuracy >= 0.8, matchedKeywords }
}
