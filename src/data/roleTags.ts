import type { RoleId, StageId } from '../types'

// 역할별 대응 체크리스트 미리보기 화면에서 카드가 접혀 있을 때도 핵심 동작을
// 한눈에 파악할 수 있도록 붙이는 짧은 태그. 감염병과 무관하게 단계·역할의
// 본질적인 업무(ROLE_CHECKLISTS와 동일한 근거)를 기준으로 했다.
export const ROLE_TAGS: Record<StageId, Record<RoleId, string[]>> = {
  prevention: {
    surveillance: ['#수동감시체계', '#관찰실지정'],
    health: ['#예방접종파악', '#가정통신문'],
    academic: ['#수업결손대비', '#출결기준안내'],
    admin: ['#위생시설관리', '#방역예산지원'],
    principal: ['#예방계획수립', '#관리조직구성'],
  },
  response1: {
    surveillance: ['#보건교사통보', '#격리이동'],
    health: ['#의심여부확인', '#격리교사요청'],
    academic: ['#수업공백조치', '#출석서류안내'],
    admin: ['#관찰실소독'],
    principal: ['#보고체계유지'],
  },
  response2: {
    surveillance: ['#능동감시지시', '#학급모니터링'],
    health: ['#보건소신고', '#핫라인구성'],
    academic: ['#상황판작성', '#단체활동검토'],
    admin: ['#공간소독확대'],
    principal: ['#등교중지결정'],
  },
  response3: {
    surveillance: ['#매일모니터링', '#학생명부작성'],
    health: ['#역학조사요청', '#고위험군관리'],
    academic: ['#수업보충조정', '#명부자료준비'],
    admin: ['#주기적소독', '#시설자료준비'],
    principal: ['#역학조사협조', '#휴업필요성검토'],
  },
  recovery: {
    surveillance: ['#추가환자없음확인', '#감시체계전환'],
    health: ['#완치보고', '#유행종료안내'],
    academic: ['#예방단계복귀', '#수업보충지휘'],
    admin: ['#방역물품점검'],
    principal: ['#대응활동중단'],
  },
}
