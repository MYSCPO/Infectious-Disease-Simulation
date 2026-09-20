// 도메인 전반에서 사용하는 타입 정의

export type SchoolLevel = '초등학교' | '중학교' | '고등학교'

export type RoleId = 'surveillance' | 'health' | 'academic' | 'admin' | 'principal'

// 출처: 학교 「학생감염병관리조직」 실제 운영 조직도(발생감시팀/예방관리팀/학사관리팀/행정지원팀 + 관리자).
// "생활부장"처럼 고정된 특정 직책이 항상 존재하는 것이 아니라 학교마다 다른 교사가 팀장을 맡는 경우가
// 많아, 역할은 팀 단위로 표시하고 실제 담당자 이름은 조직도 화면에서 자유롭게 입력받는다.
export const ROLE_LABELS: Record<RoleId, string> = {
  surveillance: '발생감시팀',
  health: '예방관리팀',
  academic: '학사관리팀',
  admin: '행정지원팀',
  principal: '관리자(교장·교감)',
}

// 참가자가 역할을 고를 때 "무슨 일을 하는지 / 보통 누가 맡는지" 감을 잡도록 안내하는 설명
export const ROLE_DESCRIPTIONS: Record<RoleId, { summary: string; example: string }> = {
  surveillance: {
    summary: '학생의 이상 증상을 가장 먼저 발견해 보건교사에게 알리고, 확산 시 능동감시(추가 환자 파악)를 담당해요.',
    example: '예: 생활안전부장, 담임교사, 학년부장, 늘봄전담 등',
  },
  health: {
    summary: '감염병 여부를 확인하고 격리·진료를 안내하며, 보건소·교육청 신고와 예방교육을 담당해요.',
    example: '예: 보건교사',
  },
  academic: {
    summary: '수업 결손 대책을 마련하고 등교중지 학생의 출결 처리, 학사 일정 조정을 담당해요.',
    example: '예: 교무부장',
  },
  admin: {
    summary: '방역물품 구매, 시설 소독, 예산 등 행정 지원을 담당해요.',
    example: '예: 행정실장',
  },
  principal: {
    summary: '보고를 받아 등교중지·휴업 등 최종 의사결정을 내리고 대외 보고를 담당해요.',
    example: '예: 교장 또는 교감',
  },
}

export const ROLE_ORDER: RoleId[] = ['surveillance', 'health', 'academic', 'admin', 'principal']

// 역할별 정원 안내. max가 있으면 그 인원에서 선택 마감(서버에서도 강제), recommended는
// 권장 인원일 뿐 강제하지 않는다(예: 행정지원팀은 보통 행정실 전담 인력이 1명이라 권장만 함).
export const ROLE_CAPACITY: Record<RoleId, { max: number | null; recommended?: number }> = {
  surveillance: { max: null },
  health: { max: null },
  academic: { max: null },
  admin: { max: null, recommended: 1 },
  principal: { max: null, recommended: 2 }, // 교장·교감 2인 체제가 일반적이라 권장 2명(강제 마감은 없음)
}

export type StageId = 'prevention' | 'response1' | 'response2' | 'response3' | 'recovery'

export interface StageDef {
  id: StageId
  order: number
  label: string
  shortLabel: string
  description: string
  minutes: number
}

export interface DiseaseInfo {
  id: string
  name: string
  emoji: string // 갤러리 카드용 아이콘
  grade: string // 법정감염병 등급
  symptoms: string
  infectiousPeriod: string
  exclusionPeriod: string // 등교중지(격리) 기간
  incubationPeriod: string // 잠복기
  contactTracing: boolean // 밀접접촉자 파악 필요 여부
  temporaryIsolation: boolean // 일시적 격리 필요 여부
  maskRequired: boolean // 마스크 착용 필요 여부
  treatment: string // 치료 개요
  prevention: string[] // 예방수칙. 각 항목은 "키워드: 설명" 형식(상세 페이지에서 키워드만 굵게 강조)
  badges: string[] // 학교 현장 판단을 돕는 핵심 특징 태그(예: #등교중지_필수)
}

export interface ChecklistStageContent {
  situation: string
  items: string[]
}

export type RoleChecklist = Record<RoleId, ChecklistStageContent>

export interface ActionOption {
  id: string
  text: string
  correct: boolean
  rationale: string // 매뉴얼·체크리스트 근거
}

export interface RoleQuestion {
  role: RoleId
  prompt: string
  options: ActionOption[]
}

export interface ScenarioStage {
  stage: StageId
  title: string
  narrative: string // 상황 카드 서술
  questions: RoleQuestion[]
}

export interface WildcardCard {
  id: string
  title: string
  description: string
  discussionPrompt: string
  applicableStages: StageId[]
}

// --- Firestore 문서 모델 ---

export interface SchoolGapItem {
  key: string
  label: string
}

export interface SessionOrgChart {
  surveillance: string
  health: string
  academic: string
  admin: string
  principal: string
}

export interface SessionGaps {
  observationRoomLocation: string
  homeroomBackupPlan: string
  weekendContactSystem: string
}

export type QuizType = 'speed' | 'coop'

export interface ActiveQuiz {
  startedAt: number
  durationSec: number
  quizType: QuizType
  firstBloodGroupId: string | null // speed 모드에서 전체 조 중 가장 먼저 정답을 맞힌 조(트랜잭션으로 1회만 선점)
}

export interface SessionDoc {
  code: string
  schoolName: string
  schoolLevel: SchoolLevel
  diseaseId: string // 조 생성 시 기본으로 적용되는 감염병(조별로 다르게 재지정 가능)
  orgChart: SessionOrgChart
  gaps: SessionGaps
  currentStage: StageId
  stageStartedAt: number | null // 현재 단계 타이머 기준 시각
  revealed: boolean
  activeWildcardId: string | null
  activeQuiz: ActiveQuiz | null // 진행자가 발송한 돌발 퀴즈(전 조 동시 진행)
  attendeeCount: number
  createdAt: number
  updatedAt: number
}

export interface GroupQuizAnswer {
  quizStartedAt: number // 어느 돌발 퀴즈에 대한 응답인지 식별
  correct: boolean
}

export interface GroupCoopProgress {
  quizStartedAt: number
  answers: Record<string, boolean> // 참가자 이름 -> 정답 여부(협동 미션은 전원이 개별 제출)
  awarded: boolean // 팀워크 보너스 중복 지급 방지
}

export interface RelayTurnResult {
  role: RoleId
  bonus: boolean // 명확한 대사 전달 보너스(+30pt) 지급 여부
  method: 'stt' | 'manual' // 음성인식 통과 vs 미지원 기기의 수동 완료 버튼
}

export interface GroupRelayFinalQuiz {
  answered: boolean
  optionId: string | null
  correct: boolean | null
  awarded: boolean // 최종 의사결정 성공 보너스(+100pt) 중복 지급 방지
}

// 대응3단계: 5개 역할이 ROLE_ORDER 순서대로 돌아가며 대사를 소리 내어 읽는 릴레이.
// turnIndex가 ROLE_ORDER.length(5)에 도달하면 전원 완료, finishedAt이 채워진다.
export interface GroupRelayState {
  startedAt: number
  turnIndex: number
  turnResults: RelayTurnResult[]
  finishedAt: number | null
  timeBonusAwarded: boolean // 3분(180초) 내 완주 보너스(+50pt) 중복 지급 방지
  finalQuiz: GroupRelayFinalQuiz | null
}

export interface GroupDoc {
  id: string
  name: string
  diseaseId: string // 이 조가 훈련할 감염병 (조마다 다르게 배정 가능)
  members: Partial<Record<RoleId, string[]>> // roleId -> 참가자 이름 목록(역할당 여러 명 가능)
  score: number // 돌발 퀴즈·릴레이 누적 점수
  badge: boolean // 보너스를 한 번이라도 받았는지(달성 표시용)
  quizAnswer: GroupQuizAnswer | null // 스피드 퀴즈: 조 대표 답
  coopProgress: GroupCoopProgress | null // 협동 미션: 조원별 개별 응답 현황
  relay: GroupRelayState | null // 대응3단계 릴레이 낭독 + 최종 의사결정 퀴즈 진행 상태
  createdAt: number
}

export interface SubmissionAnswer {
  role: RoleId
  optionId: string
}

export interface SubmissionDoc {
  id: string // `${stage}_${groupId}`
  stage: StageId
  groupId: string
  groupName: string
  answers: SubmissionAnswer[]
  submitted: boolean
  submittedAt: number | null
}
