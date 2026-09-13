import type { WildcardCard } from '../types'

// PRD: "돌발 상황 카드: 학부모 민원, 추가 유증상자 등. 진행자가 필요 시 발동. 채점 없이 조별 답변 공유"
export const WILDCARDS: WildcardCard[] = [
  {
    id: 'parent_complaint',
    title: '학부모 민원 발생',
    description:
      '"우리 아이 반에 확진자가 있다는데 왜 학교는 아무 조치를 안 하나요?"라는 항의성 민원 전화가 걸려왔다. 학부모는 즉시 학급 전체 등교중지를 요구하고 있다.',
    discussionPrompt: '이 민원에 대해 누가, 어떤 절차로 응대해야 할까요? 학급 전체 등교중지 요구는 어떻게 판단해야 할까요?',
    applicableStages: ['response2', 'response3'],
  },
  {
    id: 'extra_symptomatic',
    title: '추가 유증상자 동시 발생',
    description: '같은 시각, 다른 학년 학급에서도 유사한 증상을 보이는 학생이 동시에 발견되었다는 연락이 왔다.',
    discussionPrompt: '서로 다른 학년에서 동시에 발생한 유증상자를 어떻게 파악하고 조율할까요? 보고 체계는 어떻게 달라질까요?',
    applicableStages: ['response1', 'response2', 'response3'],
  },
  {
    id: 'sibling_case',
    title: '형제자매 감염 확인',
    description: '확진 학생의 형제자매가 다니는 다른 학급(또는 인근 학교)에서도 유사 증상이 확인되었다는 소식이 전해졌다.',
    discussionPrompt: '형제자매를 통한 가정 내 전파 가능성을 어떻게 관리하고, 어느 부서가 무엇을 확인해야 할까요?',
    applicableStages: ['response2', 'response3'],
  },
  {
    id: 'media_inquiry',
    title: '언론·지역 커뮤니티 문의',
    description: '지역 맘카페와 언론사에서 학교 내 감염병 유행 여부를 문의하는 연락이 왔다.',
    discussionPrompt: '대외 홍보·언론 대응은 누구의 책임이며, 어떤 원칙으로 답변해야 할까요?',
    applicableStages: ['response3'],
  },
  {
    id: 'teacher_absence',
    title: '담임교사 격리로 인한 공백',
    description: '확진 학급의 담임교사 본인도 감염 의심 증상을 보여 일시적으로 격리·조퇴하게 되었다.',
    discussionPrompt: '담임 공백 시 수업·학급 관리는 누가 대체하며, 우리 학교의 대체 체계는 마련되어 있나요?',
    applicableStages: ['response2', 'response3'],
  },
  {
    id: 'weekend_report',
    title: '주말 사이 증상 발생',
    description: '금요일 하교 후 주말 동안 확진 판정을 받은 학생의 보호자가 담임교사 개인 연락처로 연락을 시도했으나 닿지 않았다.',
    discussionPrompt: '주말·휴일 중 감염병 관련 연락은 어떤 체계로 받아야 할까요? 우리 학교의 주말 비상연락망은 무엇인가요?',
    applicableStages: ['response2', 'response3', 'recovery'],
  },
]
