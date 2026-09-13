import type { ScenarioStage } from '../types'

// 출처: 「2025년도 학생 감염병 대응 모의훈련 워크북」(수두·홍길동 사례) Ⅵ. 모의훈련 시나리오 및 Ⅴ. 단계별 대응 절차.
// 시나리오 원문의 팀 단위(발생감시팀/예방관리팀/학사관리팀/행정지원팀/관리자)를 그대로 역할로 사용한다.
export const SCENARIO_CHICKENPOX: ScenarioStage[] = [
  {
    stage: 'prevention',
    title: '평상시 준비',
    narrative:
      '새 학기가 시작되었다. 아직 감염병 유행 징후는 없지만, 학교는 평상시 감시체계와 예방 활동을 점검해야 한다.',
    questions: [
      {
        role: 'surveillance',
        prompt: '평상시(예방단계)에 발생감시팀(담임교사·학년부장 등)이 가장 먼저 챙겨야 할 조치는?',
        options: [
          {
            id: 'p_su_a',
            text: '각반·돌봄교실 등에서 발진·미열 등 의심 증상을 수동감시하고, 일시적 관찰실을 미리 지정해 둔다.',
            correct: true,
            rationale: '워크북(예방단계·발생감시팀): 수동감시체계 운영 / 일시적 관찰실 지정',
          },
          { id: 'p_su_b', text: '학생 결석 사유는 학기말에 한꺼번에 확인한다.', correct: false, rationale: '결석·조퇴·지각 사유는 평소에도 상시 확인하는 것이 수동감시의 핵심이다.' },
          { id: 'p_su_c', text: '감염병 관리는 보건교사 소관이므로 발생감시팀은 특별히 할 일이 없다.', correct: false, rationale: '발생감시팀(담임교사·학년부장 등)도 평상시 수동감시체계 운영 주체다.' },
        ],
      },
      {
        role: 'health',
        prompt: '예방단계에서 예방관리팀(보건교사)의 역할로 옳은 것은?',
        options: [
          {
            id: 'p_he_a',
            text: '예방접종 현황을 파악하고, 학교 감염병 예방·관리 계획을 수립하며 방역물품을 비축한다.',
            correct: true,
            rationale: '워크북(예방단계·예방관리팀): 예방접종 현황 파악 / 예방·관리 계획 수립 / 방역물품 비축',
          },
          { id: 'p_he_b', text: '예방접종 현황은 유행이 시작된 뒤에 확인한다.', correct: false, rationale: '예방접종 현황 파악은 평상시 상시 업무다.' },
          { id: 'p_he_c', text: '방역물품은 유행이 발생한 뒤에 구매를 시작한다.', correct: false, rationale: '방역물품 비축과 정기소독은 상시 실시해야 한다.' },
        ],
      },
      {
        role: 'academic',
        prompt: '예방단계에서 학사관리팀(교무부장)이 미리 준비해야 하는 것은?',
        options: [
          {
            id: 'p_ac_a',
            text: '감염병 발생 시 수업 결손에 대비한 방안과 등교중지 학생의 출결 처리 기준을 미리 마련해 둔다.',
            correct: true,
            rationale: '워크북(예방단계·학사관리팀): 수업 결손 대비 방안 마련 / 등교중지 학생 출결 안내',
          },
          { id: 'p_ac_b', text: '수업 결손 대책은 실제 환자가 발생한 뒤에 논의하면 된다.', correct: false, rationale: '수업 결손 대비 방안은 평상시에 미리 마련해 두어야 한다.' },
          { id: 'p_ac_c', text: '출결 처리 기준은 담임교사가 그때그때 알아서 정하면 된다.', correct: false, rationale: '출결 처리 기준은 학사관리팀이 사전에 안내해야 한다.' },
        ],
      },
      {
        role: 'admin',
        prompt: '예방단계에서 행정지원팀이 상시 수행할 업무는?',
        options: [
          {
            id: 'p_ad_a',
            text: '위생시설 관리, 방역·소독 활동과 관련 예산·행정을 상시 지원한다.',
            correct: true,
            rationale: '워크북(예방단계·행정지원팀): 예산·행정 지원 / 정기 방역활동 협조 및 위생시설 관리',
          },
          { id: 'p_ad_b', text: '방역물품은 유행이 발생한 뒤에 구매를 시작한다.', correct: false, rationale: '평상시 방역 활동과 예산 지원이 선행되어야 한다.' },
          { id: 'p_ad_c', text: '소독은 학기 중 1회만 실시하면 충분하다.', correct: false, rationale: '위생시설 관리와 방역·소독은 상시 활동이다.' },
        ],
      },
      {
        role: 'principal',
        prompt: '예방단계에서 관리자(교장·교감)가 준비해야 할 것은?',
        options: [
          {
            id: 'p_pr_a',
            text: '학생 감염병 예방·관리 계획과 학생감염병관리조직 구성을 승인하고, 대책위원회 지휘체계를 점검한다.',
            correct: true,
            rationale: '워크북(예방단계·관리자): 예방·관리 계획 및 관리조직 구성 승인·총괄',
          },
          { id: 'p_pr_b', text: '감염병 관리조직은 실제 환자가 발생한 뒤에 구성한다.', correct: false, rationale: '관리조직은 평상시에 미리 구성해 두어야 신속 대응이 가능하다.' },
          { id: 'p_pr_c', text: '예방 관리 계획 수립은 교육청의 업무이므로 학교는 준비하지 않는다.', correct: false, rationale: '학교장은 자체 예방 관리 계획을 수립할 책임이 있다.' },
        ],
      },
    ],
  },
  {
    stage: 'response1',
    title: '의심환자 발생 (진단 전)',
    narrative:
      'A학교 2학년 1반 홍길동은 4월 5일부터 미열, 두통, 식욕부진, 기침, 발진이 있어 집에서 종합감기약을 복용하였으나 증상이 나아지지 않았고, 4월 6일 수업 중 전날 증상과 함께 피부 물집이 생기고 가려움이 심해져 담임교사에게 증상을 호소하였다.',
    questions: [
      {
        role: 'surveillance',
        prompt: '미열·두통·식욕부진·기침과 함께 피부 물집을 호소하는 홍길동 학생을 발견한 담임교사가 가장 먼저 취해야 할 조치는?',
        options: [
          {
            id: 'r1_su_a',
            text: '보건교사에게 유선으로 상태를 전달하고, 마스크를 씌운 뒤 학생과 함께 보건실로 이동한다.',
            correct: true,
            rationale: '워크북 대응1단계(발생감시팀): 보건교사 유선 통보 / 마스크 착용 후 보건실 이동',
          },
          { id: 'r1_su_b', text: '증상이 가벼워 보이므로 계속 수업을 듣게 한다.', correct: false, rationale: '즉시 보건교사에게 알리고 보건실로 이동시켜야 한다.' },
          { id: 'r1_su_c', text: '보호자에게 알리지 않고 담임 재량으로 조퇴만 처리한다.', correct: false, rationale: '보건교사 통보와 이후 보호자 연락·병원 진료 안내는 필수 조치다.' },
        ],
      },
      {
        role: 'health',
        prompt: '보건실로 온 홍길동 학생을 진찰한 보건교사가 해야 할 일은?',
        options: [
          {
            id: 'r1_he_a',
            text: '체온을 측정하고 증상·징후를 관찰해 수두 의심 여부를 확인한 뒤, 교무부장에게 격리 담당교사 지정을 요청한다.',
            correct: true,
            rationale: '워크북 대응1단계(예방관리팀): 체온측정·증상관찰로 의심 여부 확인 / 격리 담당교사 지정 요청',
          },
          { id: 'r1_he_b', text: '아직 확진 전이므로 아무 조치도 하지 않고 기다린다.', correct: false, rationale: '진단 전이라도 증상 확인, 격리 조치 요청 등 즉각 대응이 필요하다.' },
          { id: 'r1_he_c', text: '증상 확인 없이 즉시 전교생 등교를 중지시킨다.', correct: false, rationale: '의심환자 1명 단계에서는 과잉대응이며 절차상 근거가 없다.' },
        ],
      },
      {
        role: 'academic',
        prompt: '보건교사로부터 격리 담당교사 지정을 요청받은 학사관리팀(교무부장)이 취할 조치는?',
        options: [
          {
            id: 'r1_ac_a',
            text: '격리 담당교사를 지정하고, 담임교사의 이동·격리로 발생하는 수업 공백에 대한 조치를 취한다.',
            correct: true,
            rationale: '워크북 대응1단계(학사관리팀): 격리 담당교사 지정 협조 / 교사 결원에 따른 수업 공백 조치',
          },
          { id: 'r1_ac_b', text: '격리 담당교사 지정은 보건교사가 알아서 할 일이므로 관여하지 않는다.', correct: false, rationale: '격리 담당교사 지정 요청에 응하는 것은 학사관리팀(교무부장)의 역할이다.' },
          { id: 'r1_ac_c', text: '수업 공백은 학기말에 한꺼번에 정리한다.', correct: false, rationale: '수업 공백 조치는 상황 발생 즉시 이루어져야 한다.' },
        ],
      },
      {
        role: 'admin',
        prompt: '대응 제1단계에서 행정지원팀이 지원할 사항은?',
        options: [
          { id: 'r1_ad_a', text: '홍길동 학생이 이동한 일시적 관찰실의 환기와 소독을 실시한다.', correct: true, rationale: '워크북 대응1단계(행정지원팀): 일시적 관찰실 환기 및 소독 실시' },
          { id: 'r1_ad_b', text: '방역물품 예산 편성은 다음 학기에 검토한다.', correct: false, rationale: '관찰실 환기·소독 지원은 즉시 이루어져야 한다.' },
          { id: 'r1_ad_c', text: '소독은 보건교사가 직접 하므로 행정지원팀은 관여하지 않는다.', correct: false, rationale: '관찰실 환기·소독 지원은 행정지원팀의 역할이다.' },
        ],
      },
      {
        role: 'principal',
        prompt: '대응 제1단계에서 관리자(교장·교감)의 역할은?',
        options: [
          {
            id: 'r1_pr_a',
            text: '보건교사로부터 상황을 보고받고, 필요 시 즉각 대응할 수 있도록 준비 태세를 유지한다.',
            correct: true,
            rationale: '진단 전 단계에서도 보고 체계는 유지되어야 다음 단계로의 전환이 신속하다.',
          },
          { id: 'r1_pr_b', text: '확진 전이므로 보고받을 필요가 없다.', correct: false, rationale: '평상시 보고 체계를 유지해야 대응 지연을 막을 수 있다.' },
          { id: 'r1_pr_c', text: '즉시 언론에 상황을 배포한다.', correct: false, rationale: '의심환자 1명 단계에서 대외 홍보는 시기상조다.' },
        ],
      },
    ],
  },
  {
    stage: 'response2',
    title: '확진환자 발생',
    narrative:
      '4월 6일, 홍길동 학생은 병원 진료 결과 수두 확진 판정을 받았다. 의사는 약을 처방하고 피부의 가피가 모두 떨어질 때까지 자가 격리하며 등교하면 안 된다는 권고를 하였고, 보호자는 담임교사에게 이 사실을 전하였다.',
    questions: [
      {
        role: 'surveillance',
        prompt: '홍길동 학생의 수두 확진 소식을 접한 발생감시팀(생활담당부장급 교사)이 취할 조치는?',
        options: [
          {
            id: 'r2_su_a',
            text: '능동감시 대상 학급 담임교사들에게 능동감시 실시를 지시하고, 결과를 보건교사에게 통보하도록 한다.',
            correct: true,
            rationale: '워크북 대응2단계(발생감시팀): 생활담당부장급 교사의 능동감시 지시, 담임교사는 결과를 보건교사에 통보',
          },
          { id: 'r2_su_b', text: '확진자가 1명뿐이므로 아직 조치할 필요가 없다.', correct: false, rationale: '확진 즉시 능동감시 지시가 필요하다.' },
          { id: 'r2_su_c', text: '능동감시는 보건교사가 전담하므로 발생감시팀은 관여하지 않는다.', correct: false, rationale: '능동감시 지시와 실시는 발생감시팀(생활담당부장급 교사·담임교사)의 역할이다.' },
        ],
      },
      {
        role: 'health',
        prompt: '확진 통보 후 예방관리팀(보건교사)이 우선 처리할 일은?',
        options: [
          {
            id: 'r2_he_a',
            text: '관할 보건소에 신고하고 학교장·NEIS·교육청에 보고한 뒤, 교직원 핫라인을 구성해 현황을 공유한다.',
            correct: true,
            rationale: '워크북 대응2단계(예방관리팀): 보건소 신고(법정감염병 2급은 24시간 이내) / 학교장·NEIS·교육청 보고 / 핫라인 구성',
          },
          { id: 'r2_he_b', text: '확진자가 1명뿐이므로 보고 없이 자체적으로 관리한다.', correct: false, rationale: '확진 즉시 보건소·학교장·교육청에 보고해야 한다.' },
          { id: 'r2_he_c', text: '다음 정기 보고일까지 기다린다.', correct: false, rationale: '확진 사실은 즉시 보고 대상이다.' },
        ],
      },
      {
        role: 'academic',
        prompt: '확진에 따라 학사관리팀(교무부장)이 해야 할 일은?',
        options: [
          {
            id: 'r2_ac_a',
            text: '상황판을 작성하고, 수학여행 등 단체활동 자제 여부를 검토하며 등교중지 학생의 출결 처리 기준을 안내한다.',
            correct: true,
            rationale: '워크북 대응2단계(학사관리팀): 상황판 작성 / 단체활동 자제 검토(수두는 원칙적으로 휴업 비권장)',
          },
          { id: 'r2_ac_b', text: '수두 확진이 나온 즉시 전교 휴업을 결정한다.', correct: false, rationale: '수두의 경우 원칙적으로 휴업·휴교를 권장하지 않는다.' },
          { id: 'r2_ac_c', text: '상황판 작성은 유행이 확산된 이후에 한다.', correct: false, rationale: '상황판은 확진 시점부터 바로 작성·관리해야 한다.' },
        ],
      },
      {
        role: 'admin',
        prompt: '대응 제2단계에서 행정지원팀이 수행할 소독 범위는?',
        options: [
          { id: 'r2_ad_a', text: '보건실, 교실, 일시적 관찰실 등을 환기·소독하고 필요 시 학교장과 협의해 범위를 정한다.', correct: true, rationale: '워크북 대응2단계(행정지원팀): 보건실·교실·관찰실 환기 및 소독 지원' },
          { id: 'r2_ad_b', text: '확진자 교실만 소독하고 나머지는 다음 주에 한다.', correct: false, rationale: '보건실 등 관련 공간 전체로 소독 범위를 넓혀야 한다.' },
          { id: 'r2_ad_c', text: '소독은 전체 시설을 대상으로만 실시하며 범위는 정하지 않는다.', correct: false, rationale: '소독 범위·담당자는 학교장과 협의해 구체적으로 정해야 한다.' },
        ],
      },
      {
        role: 'principal',
        prompt: '대응 제2단계에서 관리자(교장·교감)가 판단할 사항은?',
        options: [
          { id: 'r2_pr_a', text: '의사 소견(자가격리 권고)에 따라 등교중지 시행 여부를 결정하고, 완치 후 출석인정 여부를 확인한다.', correct: true, rationale: '워크북 대응2단계: 교장은 확진에 따른 등교중지 시행, 완치 후 출석인정 가능 여부 판단' },
          { id: 'r2_pr_b', text: '신고 및 능동감시는 보건교사 개인 판단에 맡긴다.', correct: false, rationale: '관리자가 등교중지 여부를 최종 판단해야 한다.' },
          { id: 'r2_pr_c', text: '확진자가 1명이므로 관리조직을 가동하지 않는다.', correct: false, rationale: '확진 발생 시점부터 관리조직과 능동감시체계를 가동해야 한다.' },
        ],
      },
    ],
  },
  {
    stage: 'response3',
    title: '경계 (추가 환자 발생)',
    narrative:
      '수두로 치료 중인 홍길동의 담임교사 및 해당 학년의 담임교사는 4월 6일부터 4월 20일까지 같은 반 학생 4명에게도 미열, 발진, 기침 등의 증상이 있음을 확인하였다. 동일 질병 확진자가 2명 이상이 되어 대응 제3단계(경계)로 전환한다.',
    questions: [
      {
        role: 'surveillance',
        prompt: '대응 제3단계에서 발생감시팀이 수행할 조치는?',
        options: [
          {
            id: 'r3_su_a',
            text: '생활담당부장급 교사가 능동감시·보고체계를 가동해 매일 발생 추이를 모니터링하고, 담임교사는 역학조사 대비 학생 명부를 작성한다.',
            correct: true,
            rationale: '워크북 대응3단계(발생감시팀): 능동감시·보고체계 가동, 매일 모니터링, 역학조사 대비 학생 명부 작성',
          },
          { id: 'r3_su_b', text: '확진자가 늘었으니 담임교사는 학년부장에게 모든 업무를 위임한다.', correct: false, rationale: '담임교사는 학급 단위 파악·명부 작성을 계속 수행해야 한다.' },
          { id: 'r3_su_c', text: '능동감시는 2단계에서 끝났으므로 3단계에서는 하지 않는다.', correct: false, rationale: '3단계에서도 능동감시·보고체계는 매일 계속 가동되어야 한다.' },
        ],
      },
      {
        role: 'health',
        prompt: '대응 제3단계에서 예방관리팀(보건교사)의 핵심 조치는?',
        options: [
          {
            id: 'r3_he_a',
            text: '보건소에 역학조사를 요청하고 협조 자료를 제공하며, 고위험군(면역저하자 등)을 파악해 관리 조치를 요청한다.',
            correct: true,
            rationale: '워크북 대응3단계(예방관리팀): 역학조사 요청·협조자료 제공 / 고위험군 파악 및 관리 요청',
          },
          { id: 'r3_he_b', text: '확진자가 4명뿐이므로 아직 역학조사를 요청할 단계가 아니다.', correct: false, rationale: '동일 질병 2명 이상 발생은 대응 제3단계(경계)의 역학조사 요청 기준에 해당한다.' },
          { id: 'r3_he_c', text: '고위험군 관리는 학부모에게 전적으로 맡긴다.', correct: false, rationale: '보건교사가 고위험군을 직접 파악하고 관리 조치를 요청해야 한다.' },
        ],
      },
      {
        role: 'academic',
        prompt: '대응 제3단계에서 학사관리팀(교무부장)이 담당할 업무는?',
        options: [
          {
            id: 'r3_ac_a',
            text: '역학조사 및 등교중지 학생 관련 수업 결손 대책·보충을 조정하고, 역학조사 대비 교직원 명부와 학사자료를 준비한다.',
            correct: true,
            rationale: '워크북 대응3단계(학사관리팀): 수업 결손 대책·보충 조정 / 역학조사 대비 자료(교직원 명부, 학사일정표 등) 준비',
          },
          { id: 'r3_ac_b', text: '수업 결손 대책은 교육지원청이 마련하므로 학교는 대기한다.', correct: false, rationale: '수업 결손 대책 수립·조정은 학교(학사관리팀)의 책임이다.' },
          { id: 'r3_ac_c', text: '역학조사 대비 자료 준비는 보건교사의 업무이므로 관여하지 않는다.', correct: false, rationale: '교직원 명부·학사일정표 준비는 학사관리팀의 역할이다.' },
        ],
      },
      {
        role: 'admin',
        prompt: '대응 제3단계에서 행정지원팀의 소독 범위는?',
        options: [
          { id: 'r3_ad_a', text: '교실·보건실·일시적 관찰실을 주기적으로 환기·소독하고, 역학조사 대비 학교 시설 자료를 준비한다.', correct: true, rationale: '워크북 대응3단계(행정지원팀): 주기적 환기·소독 / 역학조사 대비 시설 자료 준비' },
          { id: 'r3_ad_b', text: '확진자가 나온 학급만 계속 소독한다.', correct: false, rationale: '2명 이상 발생 시 관련 공간 전체로 소독 범위를 넓혀야 한다.' },
          { id: 'r3_ad_c', text: '예산 문제로 소독 범위를 늘리지 않는다.', correct: false, rationale: '유행 확산 방지를 위해 소독 범위 확대가 필요하다.' },
        ],
      },
      {
        role: 'principal',
        prompt: '대응 제3단계에서 관리자(교장·교감)가 검토해야 할 사항은?',
        options: [
          {
            id: 'r3_pr_a',
            text: '역학조사에 적극 협조(대상 명단 보건소 제공 지시)하고, 의사 소견에 따른 등교중지·휴업 필요성을 검토한다.',
            correct: true,
            rationale: '워크북 대응3단계: 역학조사 협조 지시 / 등교중지 판단 / 휴업·휴교 필요성 검토',
          },
          { id: 'r3_pr_b', text: '확진자가 4명이므로 아직 조치할 단계가 아니다.', correct: false, rationale: '동일 질병 2명 이상 발생은 대응 제3단계 발동 기준이다.' },
          { id: 'r3_pr_c', text: '보건소 신고는 상황이 더 심각해진 후에 고려한다.', correct: false, rationale: '역학조사 협조와 등교중지 판단은 이 단계에서 즉시 이루어져야 한다.' },
        ],
      },
    ],
  },
  {
    stage: 'recovery',
    title: '복구 (유행종료)',
    narrative:
      '홍길동 학생의 수두 확진에 따라 시행한 접촉자 대상 수두 검진 결과, 추가 수두 발병은 확인되지 않았다. 홍길동 학생은 약 복용 및 치료 후 피부 가피가 모두 떨어져 의사의 격리기간 해제에 따라 등교 복귀하였다.',
    questions: [
      {
        role: 'surveillance',
        prompt: '복구단계에서 발생감시팀이 확인할 사항은?',
        options: [
          {
            id: 'rc_su_a',
            text: '추가 (의심)환자 발생이 없음을 최종 확인하고, 감시체계를 평상시 수준(수동감시)으로 전환한다.',
            correct: true,
            rationale: '워크북 복구단계: 추가 (의심)환자 미발생 확인 후 평상시 체계로 전환',
          },
          { id: 'rc_su_b', text: '복구단계에서도 능동감시 강도를 계속 유지한다.', correct: false, rationale: '유행종료가 확인되면 평상시 수동감시 수준으로 전환한다.' },
          { id: 'rc_su_c', text: '추가 환자 발생 여부는 확인하지 않고 종료한다.', correct: false, rationale: '유행종료 판단을 위해 추가 발생 여부를 반드시 확인해야 한다.' },
        ],
      },
      {
        role: 'health',
        prompt: '복구단계에서 예방관리팀(보건교사)이 마무리해야 할 업무는?',
        options: [
          {
            id: 'rc_he_a',
            text: '발생 현황과 조치사항을 정리해 학교장과 교육청에 보고하고, NEIS에 완치 보고 및 유행종료 가정통신문(안)을 작성한다.',
            correct: true,
            rationale: '워크북 복구단계(예방관리팀): 발생현황 정리·보고 / NEIS 완치보고 / 유행종료 가정통신문 작성',
          },
          { id: 'rc_he_b', text: '유행 종료 여부는 보건소가 알아서 판단하므로 보고하지 않는다.', correct: false, rationale: '보건교사가 발생 현황을 정리해 학교장과 교육청에 보고해야 한다.' },
          { id: 'rc_he_c', text: '기록 정리는 다음 학기로 미룬다.', correct: false, rationale: '유행종료 시점에 즉시 정리·보고해야 한다.' },
        ],
      },
      {
        role: 'academic',
        prompt: '복구단계에서 학사관리팀이 수행할 조치는?',
        options: [
          { id: 'rc_ac_a', text: '학생감염병관리조직을 예방단계로 복귀시키고, 수업결손 대책에 따라 수업보충 대상 학생의 보충수업을 지휘한다.', correct: true, rationale: '워크북 복구단계(학사관리팀): 예방단계 복귀 / 수업보충 지휘' },
          { id: 'rc_ac_b', text: '유행이 끝났으니 수업 보충 계획을 폐기한다.', correct: false, rationale: '이미 수립한 수업 결손 대책에 따라 수업 보충을 계속 이행해야 한다.' },
          { id: 'rc_ac_c', text: '관리조직 복귀는 다음 학기 초에 결정한다.', correct: false, rationale: '유행종료 확인 즉시 예방단계로 복귀해야 한다.' },
        ],
      },
      {
        role: 'admin',
        prompt: '복구단계에서 행정지원팀의 조치는?',
        options: [
          { id: 'rc_ad_a', text: '방역물품을 점검하고 관련 예산을 확인·정리한다.', correct: true, rationale: '워크북 복구단계(행정지원팀): 방역물품 점검 및 예산 확인' },
          { id: 'rc_ad_b', text: '유행 종료와 무관하게 소독 강도를 계속 유지한다.', correct: false, rationale: '유행종료 시점에 맞춰 소독 활동을 정리한다.' },
          { id: 'rc_ad_c', text: '방역물품 점검은 다음 유행 시작 시점에 한다.', correct: false, rationale: '방역물품 점검·정리는 복구단계에서 바로 실시한다.' },
        ],
      },
      {
        role: 'principal',
        prompt: '복구단계에서 관리자(교장·교감)가 명령할 사항은?',
        options: [
          {
            id: 'rc_pr_a',
            text: '학생감염병관리조직의 유행 대응 활동을 중단하고 예방단계로 복귀할 것을 명령한다.',
            correct: true,
            rationale: '워크북 복구단계: 관리조직 대응 활동 중단·예방단계 복귀 명령',
          },
          { id: 'rc_pr_b', text: '관리조직은 해체하지 않고 계속 비상 운영한다.', correct: false, rationale: '유행종료가 확인되면 예방단계로 복귀해야 한다.' },
          { id: 'rc_pr_c', text: '예방단계 복귀는 다음 학기 초에 결정한다.', correct: false, rationale: '유행종료 확인 즉시 예방단계로 복귀해야 한다.' },
        ],
      },
    ],
  },
]
