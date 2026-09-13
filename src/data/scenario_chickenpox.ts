import type { ScenarioStage } from '../types'

// 출처: 학교 감염병 대응 모의훈련 연수자료 Ⅵ. 모의훈련 시나리오(수두 유행) 및 Ⅴ. 단계별 대응 절차
// 시나리오 단계1~4(PDF)를 앱의 대응1~복구 단계에 매핑하고, 예방단계는 평상시 준비 문항을 추가했다.
export const SCENARIO_CHICKENPOX: ScenarioStage[] = [
  {
    stage: 'prevention',
    title: '평상시 준비',
    narrative:
      '새 학기가 시작되었다. 아직 감염병 유행 징후는 없지만, 학교는 평상시 감시체계와 예방 활동을 점검해야 한다.',
    questions: [
      {
        role: 'homeroom',
        prompt: '평상시(예방단계)에 담임교사가 가장 먼저 챙겨야 할 조치는?',
        options: [
          {
            id: 'p_hr_a',
            text: '학급 내 감염병 예방 교육을 실시하고 수동감시체계를 운영한다.',
            correct: true,
            rationale: '체크리스트(예방단계·담임교사): 감염병 예방 교육 실시 / 수동감시체계 운영',
          },
          { id: 'p_hr_b', text: '학생 결석 사유는 학기말에 한꺼번에 확인한다.', correct: false, rationale: '결석·조퇴·지각 사유는 평소에도 상시 확인하는 것이 수동감시의 핵심이다.' },
          { id: 'p_hr_c', text: '감염병 관리는 보건교사 소관이므로 담임교사는 특별히 할 일이 없다.', correct: false, rationale: '담임교사도 평상시 수동감시체계 운영 주체 중 하나다.' },
        ],
      },
      {
        role: 'health',
        prompt: '예방단계에서 보건교사의 역할로 옳은 것은?',
        options: [
          {
            id: 'p_he_a',
            text: '예방접종 현황을 파악하고 가정통신문(안)을 미리 작성해 둔다.',
            correct: true,
            rationale: '체크리스트(예방단계·보건교사): 예방접종 현황 파악 / 가정통신문(안) 작성',
          },
          { id: 'p_he_b', text: '예방접종 현황은 유행이 시작된 뒤에 확인한다.', correct: false, rationale: '예방접종 현황 파악은 평상시 상시 업무다.' },
          { id: 'p_he_c', text: '감염병 예방 교육은 훈련 직전에만 실시한다.', correct: false, rationale: '예방 교육과 수동감시체계 운영은 상시 실시해야 한다.' },
        ],
      },
      {
        role: 'safetyHead',
        prompt: '예방단계에서 부장교사(생활부장)가 상시 관리해야 하는 것은?',
        options: [
          {
            id: 'p_sh_a',
            text: '수업 및 출결 관리를 통해 학생 이상 징후를 조기에 파악한다.',
            correct: true,
            rationale: '체크리스트(예방단계·부장교사): 수업 및 출결 관리',
          },
          { id: 'p_sh_b', text: '감염병 예방은 유행이 시작된 뒤부터 신경쓰면 된다.', correct: false, rationale: '평상시 출결 관리가 조기 발견의 기반이다.' },
          { id: 'p_sh_c', text: '출결 관리는 전적으로 담임교사 업무이므로 부장교사와 무관하다.', correct: false, rationale: '부장교사도 학사관리팀 소속으로 출결 관리에 관여한다.' },
        ],
      },
      {
        role: 'admin',
        prompt: '예방단계에서 행정실장이 상시 수행할 업무는?',
        options: [
          {
            id: 'p_ad_a',
            text: '위생시설 관리, 방역·소독 활동과 관련 예산·행정을 상시 지원한다.',
            correct: true,
            rationale: '체크리스트(예방단계·행정실장): 위생시설 관리 / 방역·소독 활동 / 예산 및 행정 지원',
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
            text: '학생 감염병 예방 관리 계획을 수립하고 학생감염병관리조직을 구성해 둔다.',
            correct: true,
            rationale: '체크리스트(예방단계·교장 및 교감): 학생 감염병 예방 관리 계획 수립 / [학생감염병관리조직] 구성',
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
      '구도시 소재 OO고등학교는 1학년 6학급(2층), 2학년 7학급(4층), 3학년 6학급(3층)으로 총 13학급, 총 학생수 700명이다. 4월 28일 1학년 1반 길OO 학생이 등교 후 학급교사에게 두통, 발열, 얼굴 발진 등을 호소하며 조퇴하였다.',
    questions: [
      {
        role: 'homeroom',
        prompt: '두통·발열·얼굴 발진을 호소하는 길OO 학생을 발견한 담임교사가 가장 먼저 취해야 할 조치는?',
        options: [
          {
            id: 'r1_hr_a',
            text: '보건교사에게 유선으로 상태를 전달하고 교실을 환기·소독하며, 보호자에게 연락해 병원 진료를 안내한다.',
            correct: true,
            rationale: '시나리오 단계1(담임교사): 보건교사 통보 / 교실 환기·소독 / 보호자 연락·병원 진료 안내',
          },
          { id: 'r1_hr_b', text: '증상이 가벼워 보이므로 계속 수업을 듣게 한다.', correct: false, rationale: '즉시 병원 진료를 권유하고, 어려운 경우 일시적 관찰실로 이동시켜야 한다.' },
          { id: 'r1_hr_c', text: '보호자에게 알리지 않고 담임 재량으로 조퇴만 처리한다.', correct: false, rationale: '보호자 연락과 병원 진료 안내는 필수 조치다.' },
        ],
      },
      {
        role: 'health',
        prompt: '유증상자 발생 소식을 들은 보건교사가 해야 할 일은?',
        options: [
          {
            id: 'r1_he_a',
            text: '감염병 여부를 확인하고 예방수칙·위생교육을 실시하며 유사 증상자를 모니터링한다.',
            correct: true,
            rationale: '시나리오 단계1(보건교사): 감염병 여부 확인 / 예방수칙·위생교육 / 유사환자 모니터링',
          },
          { id: 'r1_he_b', text: '아직 확진 전이므로 아무 조치도 하지 않고 기다린다.', correct: false, rationale: '진단 전이라도 관찰실 이동, 증상 확인 등 즉각 대응이 필요하다.' },
          { id: 'r1_he_c', text: '증상 확인 없이 즉시 전교생 등교를 중지시킨다.', correct: false, rationale: '의심환자 1명 단계에서는 과잉대응이며 절차상 근거가 없다.' },
        ],
      },
      {
        role: 'safetyHead',
        prompt: '대응 제1단계(진단 전 유증상자 발생)에서 생활부장(부장교사)이 취할 조치로 가장 적절한 것은?',
        options: [
          {
            id: 'r1_sh_a',
            text: '아직 확진 전 단계이므로 별도 지시 없이 담임·보건교사의 대응 상황을 파악하며 대기한다.',
            correct: true,
            rationale: '체크리스트상 대응 제1단계에는 부장교사 항목이 없으며, 능동감시 지시는 대응 제2단계부터 시작된다.',
          },
          { id: 'r1_sh_b', text: '즉시 전교 휴업을 건의한다.', correct: false, rationale: '의심환자 1명 단계에서 휴업 검토는 시기상조이며 과잉대응이다.' },
          { id: 'r1_sh_c', text: '학급 담임에게 능동감시 실시를 지시한다.', correct: false, rationale: '능동감시 지시는 확진 이후인 대응 제2단계의 조치다.' },
        ],
      },
      {
        role: 'admin',
        prompt: '대응 제1단계에서 행정실이 지원할 사항은?',
        options: [
          { id: 'r1_ad_a', text: '1학년 1반 교실 소독을 지원한다.', correct: true, rationale: '시나리오 단계1(행정실): 1학년 1반 교실 소독 지원' },
          { id: 'r1_ad_b', text: '방역물품 예산 편성은 다음 학기에 검토한다.', correct: false, rationale: '해당 학급 소독 지원은 즉시 이루어져야 한다.' },
          { id: 'r1_ad_c', text: '소독은 보건교사가 직접 하므로 행정실은 관여하지 않는다.', correct: false, rationale: '교실 소독 지원은 행정실의 역할이다.' },
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
    narrative: '4월 29일, 1학년 1반 담임교사는 길OO 학생이 수두로 확진된 사실을 통보받았다.',
    questions: [
      {
        role: 'homeroom',
        prompt: '길OO 학생의 수두 확진 통보를 받은 담임교사의 조치는?',
        options: [
          {
            id: 'r2_hr_a',
            text: '전염력이 없어질 때까지 휴식하도록 안내(출석인정)하고, 예방교육과 능동감시(결석·조퇴·지각 사유 확인)를 실시해 매일 1회 보건교사에게 통보한다.',
            correct: true,
            rationale: '시나리오 단계2(담임교사): 출석인정 안내 / 예방교육 / 능동감시 및 매일 1회 보건교사 통보',
          },
          { id: 'r2_hr_b', text: '확진 사실을 학급 학생들에게 알리지 않는다.', correct: false, rationale: '학급 학생 대상 예방교육과 증상 관찰을 위해 상황 공유가 필요하다.' },
          { id: 'r2_hr_c', text: '능동감시는 유행이 더 확산된 후부터 시작한다.', correct: false, rationale: '확진 통보 즉시 능동감시를 시작해야 한다.' },
        ],
      },
      {
        role: 'health',
        prompt: '확진 통보 후 보건교사가 우선 처리할 일은?',
        options: [
          {
            id: 'r2_he_a',
            text: '관리자 보고 및 보건소 유선 보고, NEIS를 통한 교육지원청 보고를 하고 같은 반 고위험군·추가 의심환자를 파악한다.',
            correct: true,
            rationale: '시나리오 단계2(보건교사): 관리자·보건소 보고 / NEIS 보고 / 고위험군 확인 / 추가 의심환자 파악',
          },
          { id: 'r2_he_b', text: '확진자가 1명뿐이므로 보고 없이 자체적으로 관리한다.', correct: false, rationale: '확진 즉시 관리자·보건소·교육지원청에 보고해야 한다.' },
          { id: 'r2_he_c', text: '다음 정기 보고일까지 기다린다.', correct: false, rationale: '확진 사실은 즉시 보고 대상이다.' },
        ],
      },
      {
        role: 'safetyHead',
        prompt: '대응 제2단계에서 생활부장(부장교사)이 지시할 사항은?',
        options: [
          { id: 'r2_sh_a', text: '능동감시 대상 학급 담임교사들에게 능동감시를 지시한다.', correct: true, rationale: '체크리스트(대응2단계·부장교사): 능동감시 대상 학급 담임교사들에게 능동감시를 지시' },
          { id: 'r2_sh_b', text: '확진자가 1명이므로 아직 조치할 필요가 없다.', correct: false, rationale: '확진 즉시 능동감시 지시가 필요하다.' },
          { id: 'r2_sh_c', text: '전체 학년 휴업을 단독으로 결정한다.', correct: false, rationale: '휴업 검토는 교장의 권한이며 대응 제3단계 이후 사항이다.' },
        ],
      },
      {
        role: 'admin',
        prompt: '대응 제2단계에서 행정실이 수행할 소독 범위는?',
        options: [
          { id: 'r2_ad_a', text: '1학년 1반과 같은 층(2층) 모든 공간과 보건실의 환기·소독을 실시한다.', correct: true, rationale: '시나리오 단계2(행정실): 2층 모든 공간·보건실 환기 및 소독' },
          { id: 'r2_ad_b', text: '확진자 교실만 소독하고 나머지는 다음 주에 한다.', correct: false, rationale: '같은 층 전체 공간으로 소독 범위를 확대해야 한다.' },
          { id: 'r2_ad_c', text: '소독은 전체 시설을 대상으로만 실시하며 층별 구분은 하지 않는다.', correct: false, rationale: '이 단계에서는 해당 층 중심 소독이며, 전체 시설 소독은 대응 제3단계에서 확대 실시한다.' },
        ],
      },
      {
        role: 'principal',
        prompt: '대응 제2단계에서 교장·교감이 지시할 사항은?',
        options: [
          { id: 'r2_pr_a', text: '발생감시팀에 추가 환자 파악을 위한 능동감시 실시를 지시하고 보건교사에게 통보를 요청한다.', correct: true, rationale: '시나리오 단계2(교장·교감): 능동감시 실시 지시 및 보건교사 통보 요청' },
          { id: 'r2_pr_b', text: '신고 및 능동감시는 보건교사 개인 판단에 맡긴다.', correct: false, rationale: '관리자가 발생감시팀에 능동감시 실시를 직접 지시해야 한다.' },
          { id: 'r2_pr_c', text: '확진자가 1명이므로 관리조직을 가동하지 않는다.', correct: false, rationale: '확진 발생 시점부터 능동감시체계를 가동해야 한다.' },
        ],
      },
    ],
  },
  {
    stage: 'response3',
    title: '경계 (추가 환자 발생)',
    narrative:
      '4월 29일 오전, 같은 학급(1학년 1반) 박OO 학생이 수두 의심 증상으로 보건실을 방문했다. 당일 오후 박OO 학생 보호자로부터 수두 확진을 받았다는 연락이 왔다. 동일 질병 확진자가 2명이 되어 대응 제3단계(경계)로 전환한다.',
    questions: [
      {
        role: 'homeroom',
        prompt: '대응 제3단계에서 담임교사가 수행할 조치로 옳은 것은?',
        options: [
          {
            id: 'r3_hr_a',
            text: '반 확진 학생을 파악하고 결석·조퇴·지각 사유를 확인하며, 매일 1교시 전 학년부장을 통해 보건교사에게 보고하고 의심 학생은 진료 후 등교중지 조치한다.',
            correct: true,
            rationale: '시나리오 단계3(담임교사): 확진 학생 파악 / 결석 사유 확인 / 매일 보고 / 등교중지 조치',
          },
          { id: 'r3_hr_b', text: '확진자가 늘었으니 담임교사는 학년부장에게 모든 업무를 위임한다.', correct: false, rationale: '담임교사는 학급 단위 파악·보고·생활지도를 계속 수행해야 한다.' },
          { id: 'r3_hr_c', text: '등교중지 학생은 별도 생활지도 없이 방치한다.', correct: false, rationale: '등교중지 학생에게 생활지도와 행정조치 안내를 실시해야 한다.' },
        ],
      },
      {
        role: 'health',
        prompt: '대응 제3단계에서 보건교사의 핵심 조치는?',
        options: [
          {
            id: 'r3_he_a',
            text: '유행 의심 상황을 학교장과 도교육청(NEIS)에 보고하고, 고위험군 노출자를 즉시 의료기관 진료로 안내하며 일일 현황을 집계한다.',
            correct: true,
            rationale: '시나리오 단계3(보건교사): 유행 의심 보고 / 고위험군 안내 / 일일 현황 집계',
          },
          { id: 'r3_he_b', text: '확진자가 2명뿐이므로 아직 보고할 단계가 아니다.', correct: false, rationale: '동일 질병 2명 이상 발생은 대응 제3단계(경계) 보고 기준에 해당한다.' },
          { id: 'r3_he_c', text: '고위험군 관리는 학부모에게 전적으로 맡긴다.', correct: false, rationale: '보건교사가 고위험군 명단을 활용해 직접 안내해야 한다.' },
        ],
      },
      {
        role: 'safetyHead',
        prompt: '대응 제3단계에서 생활부장(발생감시팀 총괄)이 수행할 업무는?',
        options: [
          {
            id: 'r3_sh_a',
            text: '능동감시체계 운영을 총괄 지휘하고, 등교중지 학생의 수업 결손 대책을 마련해 수업 보충을 지휘한다.',
            correct: true,
            rationale: '체크리스트(대응3단계·부장교사): 능동감시체계 총괄 지휘 / 수업 결손 대책 마련 및 보충 지휘',
          },
          { id: 'r3_sh_b', text: '능동감시는 보건교사 혼자 담당하도록 하고 관여하지 않는다.', correct: false, rationale: '생활부장이 능동감시체계 운영을 총괄해야 한다.' },
          { id: 'r3_sh_c', text: '수업 결손 대책은 교육지원청이 마련하므로 학교는 대기한다.', correct: false, rationale: '수업 결손 대책 수립과 지휘는 학교(생활부장)의 책임이다.' },
        ],
      },
      {
        role: 'admin',
        prompt: '대응 제3단계에서 행정실의 소독 범위는?',
        options: [
          { id: 'r3_ad_a', text: '교실, 보건실을 포함한 전체 시설을 소독한다.', correct: true, rationale: '시나리오 단계3(행정실): 교실·보건실 등 환기 및 소독 / 전체 시설 소독' },
          { id: 'r3_ad_b', text: '확진자가 나온 학급만 계속 소독한다.', correct: false, rationale: '2명 이상 발생 시 전체 시설로 소독 범위를 확대해야 한다.' },
          { id: 'r3_ad_c', text: '예산 문제로 소독 범위를 늘리지 않는다.', correct: false, rationale: '유행 확산 방지를 위해 전체 시설 소독이 필요하다.' },
        ],
      },
      {
        role: 'principal',
        prompt: '대응 제3단계에서 교장·교감이 검토해야 할 사항은?',
        options: [
          {
            id: 'r3_pr_a',
            text: '학생 감염병 관리조직을 활성화하고, 관할 보건소 신고 여부·단축수업 및 자체 휴업 필요성·단체 활동 제한 여부를 검토한다.',
            correct: true,
            rationale: '시나리오 단계3(교장·교감): 관리조직 활성화 / 보건소 신고 / 휴업 검토 / 단체활동 제한 검토',
          },
          { id: 'r3_pr_b', text: '확진자가 2명이므로 아직 조직을 가동할 단계가 아니다.', correct: false, rationale: '동일 질병 2명 이상 발생은 대응 제3단계 발동 기준이다.' },
          { id: 'r3_pr_c', text: '보건소 신고는 상황이 더 심각해진 후에 고려한다.', correct: false, rationale: '신고가 필요한 경우 관할 보건소장에게 즉시 신고해야 한다.' },
        ],
      },
    ],
  },
  {
    stage: 'recovery',
    title: '복구 (유행종료)',
    narrative:
      '지속적으로 모니터링해 온 발생감시팀은 4월 29일 이후 5월 20일 현재까지 더 이상의 추가 환자 발생이 없음을 확인하였다. 최대잠복기 동안 신규 환자가 없어 유행종료 시점으로 판단한다.',
    questions: [
      {
        role: 'homeroom',
        prompt: '복구단계에서 담임교사가 수행할 조치는?',
        options: [
          { id: 'rc_hr_a', text: '수두 유행 종료 가정통신문을 배부하고, 결석했던 학생들의 수업결손을 지원한다.', correct: true, rationale: '시나리오 단계4(담임교사): 유행종료 가정통신문 배부 / 수업결손 지원' },
          { id: 'rc_hr_b', text: '유행이 끝났으므로 결손 수업은 보충하지 않는다.', correct: false, rationale: '결석 학생의 수업결손 지원은 복구단계에서도 필요하다.' },
          { id: 'rc_hr_c', text: '가정통신문 배부는 보건교사가 전담하므로 담임은 관여하지 않는다.', correct: false, rationale: '유행종료 가정통신문 배부는 담임교사의 조치 사항이다.' },
        ],
      },
      {
        role: 'health',
        prompt: '복구단계에서 보건교사가 마무리해야 할 업무는?',
        options: [
          {
            id: 'rc_he_a',
            text: '발생 현황과 조치사항을 정리해 학교장과 교육청에 보고하고, 유행종료 가정통신문(안)을 작성한다.',
            correct: true,
            rationale: '시나리오 단계4(보건교사): 발생현황 정리·보고 / 유행종료 가정통신문 작성',
          },
          { id: 'rc_he_b', text: '유행 종료 여부는 보건소가 알아서 판단하므로 보고하지 않는다.', correct: false, rationale: '보건교사가 발생 현황을 정리해 학교장과 교육청에 보고해야 한다.' },
          { id: 'rc_he_c', text: '기록 정리는 다음 학기로 미룬다.', correct: false, rationale: '유행종료 시점에 즉시 정리·보고해야 한다.' },
        ],
      },
      {
        role: 'safetyHead',
        prompt: '복구단계에서 생활부장이 지휘할 사항은?',
        options: [
          { id: 'rc_sh_a', text: '대응 제3단계에서 수립한 수업 결손 대책에 따라 수업 보충을 지휘한다.', correct: true, rationale: '체크리스트(복구단계·부장교사): 수업 결손 대책에 따른 수업 보충 지휘' },
          { id: 'rc_sh_b', text: '유행이 끝났으니 수업 보충 계획을 폐기한다.', correct: false, rationale: '이미 수립한 수업 결손 대책은 계속 이행해야 한다.' },
          { id: 'rc_sh_c', text: '수업 보충은 담임교사 개인 재량에 전적으로 맡긴다.', correct: false, rationale: '생활부장이 수업 보충을 지휘하는 역할을 맡는다.' },
        ],
      },
      {
        role: 'admin',
        prompt: '복구단계에서 행정실의 조치는?',
        options: [
          { id: 'rc_ad_a', text: '전체 시설 소독 활동을 종료 정리한다.', correct: true, rationale: '체크리스트(복구단계·행정실장): 전체 시설 소독 종료' },
          { id: 'rc_ad_b', text: '유행 종료와 무관하게 소독 강도를 계속 유지한다.', correct: false, rationale: '유행종료 시점에 맞춰 소독 활동을 정리한다.' },
          { id: 'rc_ad_c', text: '시설 소독 기록은 폐기한다.', correct: false, rationale: '소독 기록은 결과 보고와 증빙을 위해 보관해야 한다.' },
        ],
      },
      {
        role: 'principal',
        prompt: '복구단계에서 교장·교감이 명령할 사항은?',
        options: [
          {
            id: 'rc_pr_a',
            text: '학생감염병관리조직의 유행 대응 활동을 중단하고 예방단계로 복귀할 것을 명령한다.',
            correct: true,
            rationale: '체크리스트(복구단계·교장 및 교감): 관리조직 대응 활동 중단·예방단계 복귀 명령',
          },
          { id: 'rc_pr_b', text: '관리조직은 해체하지 않고 계속 비상 운영한다.', correct: false, rationale: '유행종료가 확인되면 예방단계로 복귀해야 한다.' },
          { id: 'rc_pr_c', text: '예방단계 복귀는 다음 학기 초에 결정한다.', correct: false, rationale: '유행종료 확인 즉시 예방단계로 복귀해야 한다.' },
        ],
      },
    ],
  },
]
