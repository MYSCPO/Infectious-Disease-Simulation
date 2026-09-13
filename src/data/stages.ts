import type { StageDef, StageId } from '../types'

// 총 훈련시간 20~30분 목표(예방 3 + 대응1 6 + 대응2 6 + 대응3 6 + 복구 2 = 23분, 준비·전환 시간 포함 20~30분 내)
// 단계 명칭은 매뉴얼 제3차 개정판(Ⅴ. 학교 내 감염병 발생 시 단계별 대응 절차) 표기를 따른다.
export const STAGES: StageDef[] = [
  {
    id: 'prevention',
    order: 0,
    label: '예방단계 (평상시)',
    shortLabel: '예방',
    description: '감염병 유행 여부 감시(수동 감시), 개인위생·마스크 착용 교육, 교실 소독/환기를 상시 운영하는 평상시 단계입니다.',
    minutes: 3,
  },
  {
    id: 'response1',
    order: 1,
    label: '대응 제1단계 (의심환자 발생 · 진단 전)',
    shortLabel: '대응1',
    description: '학생이 등교 후 의심 증상을 호소하는 단계. 병원 진료 권유와 일시적 관찰실 이동, 보호자 연락이 핵심입니다.',
    minutes: 6,
  },
  {
    id: 'response2',
    order: 2,
    label: '대응 제2단계 (확진환자 발생)',
    shortLabel: '대응2',
    description: '병원 진단으로 확진 사실이 통보된 단계. 능동감시체계 운영과 보고, 유증상자 확인이 핵심입니다.',
    minutes: 6,
  },
  {
    id: 'response3',
    order: 3,
    label: '대응 제3단계 (경계 · 추가 환자 발생)',
    shortLabel: '대응3',
    description: '동일 질병 2명 이상 발생. 학생 감염병 관리위원회(4개 팀)를 조직 운영하고 휴업 등 검토가 필요한 단계입니다.',
    minutes: 6,
  },
  {
    id: 'recovery',
    order: 4,
    label: '복구단계 (유행종료)',
    shortLabel: '복구',
    description: '최대잠복기 동안 추가 (의심)환자가 없어 유행이 종료된 단계. 종료 보고와 예방단계 복귀가 핵심입니다.',
    minutes: 2,
  },
]

export function getStage(id: StageId): StageDef {
  return STAGES.find((s) => s.id === id) ?? STAGES[0]
}

export function nextStage(id: StageId): StageId | null {
  const idx = STAGES.findIndex((s) => s.id === id)
  if (idx < 0 || idx >= STAGES.length - 1) return null
  return STAGES[idx + 1].id
}

export function prevStage(id: StageId): StageId | null {
  const idx = STAGES.findIndex((s) => s.id === id)
  if (idx <= 0) return null
  return STAGES[idx - 1].id
}
