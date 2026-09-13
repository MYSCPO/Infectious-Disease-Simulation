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

export const ROLE_ORDER: RoleId[] = ['surveillance', 'health', 'academic', 'admin', 'principal']

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
  prevention: string[] // 예방수칙
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

export interface SessionDoc {
  code: string
  schoolName: string
  schoolLevel: SchoolLevel
  diseaseId: string // 조 생성 시 기본으로 적용되는 감염병(조별로 다르게 재지정 가능)
  orgChart: SessionOrgChart
  gaps: SessionGaps
  currentStage: StageId
  revealed: boolean
  activeWildcardId: string | null
  attendeeCount: number
  createdAt: number
  updatedAt: number
}

export interface GroupDoc {
  id: string
  name: string
  diseaseId: string // 이 조가 훈련할 감염병 (조마다 다르게 배정 가능)
  members: Partial<Record<RoleId, string>> // roleId -> 참가자 이름
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
