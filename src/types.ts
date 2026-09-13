// 도메인 전반에서 사용하는 타입 정의

export type SchoolLevel = '초등학교' | '중학교' | '고등학교'

export type RoleId = 'homeroom' | 'health' | 'safetyHead' | 'admin' | 'principal'

// PRD: 담임·보건·생활부장·행정실장·관리자
export const ROLE_LABELS: Record<RoleId, string> = {
  homeroom: '담임교사',
  health: '보건교사',
  safetyHead: '생활부장(발생감시팀)',
  admin: '행정실장',
  principal: '관리자(교장·교감)',
}

export const ROLE_ORDER: RoleId[] = ['homeroom', 'health', 'safetyHead', 'admin', 'principal']

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
  grade: string // 법정감염병 등급
  symptoms: string
  infectiousPeriod: string
  exclusionPeriod: string // 등교중지(격리) 기간
  incubationPeriod: string // 잠복기
  contactTracing: boolean // 밀접접촉자 파악 필요 여부
  temporaryIsolation: boolean // 일시적 격리 필요 여부
  maskRequired: boolean // 마스크 착용 필요 여부
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
  homeroom: string
  health: string
  safetyHead: string
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
  diseaseId: string
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
