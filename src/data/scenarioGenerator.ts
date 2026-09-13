import type { DiseaseInfo, RoleQuestion, ScenarioStage } from '../types'
import { SCENARIO_CHICKENPOX } from './scenario_chickenpox'
import { getDiseaseById } from './diseases'

// PRD: "시나리오 하드코딩 대신 감염병 테이블 + 단계별 조치 템플릿 + 문항 테이블 조합으로 생성"
// 수두는 첨부 자료의 실제 서사를 그대로 사용하고, 그 외 감염병은 동일 절차 템플릿에
// 감염병 테이블 값(병명·잠복기·격리기간·밀접접촉자 파악 여부 등)을 치환해 생성한다.
function genericScenarioFor(disease: DiseaseInfo): ScenarioStage[] {
  const contactNote = disease.contactTracing
    ? '밀접접촉자(같은 학급 등)를 파악하고 관리한다.'
    : '이 감염병은 밀접접촉자 파악 대상이 아니므로 개인위생 수칙 준수 여부만 확인한다.'
  const maskNote = disease.maskRequired
    ? '마스크 착용을 확인·지도한다.'
    : '마스크 착용은 필수 대상이 아니므로 개인위생 수칙 준수를 지도한다.'

  const buildQuestions = (
    stagePrompts: Record<RoleQuestion['role'], { correct: string; wrong: string[]; rationale: string }>,
  ): RoleQuestion[] =>
    (Object.keys(stagePrompts) as RoleQuestion['role'][]).map((role) => {
      const cfg = stagePrompts[role]
      return {
        role,
        prompt: `해당 단계에서 이 역할이 취할 조치로 가장 적절한 것은? (대상 감염병: ${disease.name})`,
        options: [
          { id: `${role}_a`, text: cfg.correct, correct: true, rationale: cfg.rationale },
          ...cfg.wrong.map((text, i) => ({ id: `${role}_${i + 1}`, text, correct: false, rationale: '체크리스트·매뉴얼 기준 절차와 다르다.' })),
        ],
      }
    })

  return [
    {
      stage: 'prevention',
      title: '평상시 준비',
      narrative: `${disease.name} 유행 징후는 아직 없다. 학교는 평상시 감시체계와 예방 활동을 점검해야 한다. (잠복기: ${disease.incubationPeriod})`,
      questions: buildQuestions({
        surveillance: { correct: '각반에서 이상 증상을 수동감시하고 일시적 관찰실을 지정해 둔다.', wrong: ['결석 사유는 학기말에 한꺼번에 확인한다.'], rationale: '예방단계 체크리스트(발생감시팀)' },
        health: { correct: '예방접종 현황을 파악하고 가정통신문(안)을 미리 작성한다.', wrong: ['예방접종 현황은 유행 후에 확인한다.'], rationale: '예방단계 체크리스트(예방관리팀)' },
        academic: { correct: '수업 결손 대비 방안과 등교중지 학생 출결 기준을 미리 마련한다.', wrong: ['수업 결손 대책은 환자 발생 후 논의한다.'], rationale: '예방단계 체크리스트(학사관리팀)' },
        admin: { correct: '위생시설 관리와 방역·소독, 예산 지원을 상시 유지한다.', wrong: ['방역물품은 유행 후 구매한다.'], rationale: '예방단계 체크리스트(행정지원팀)' },
        principal: { correct: '예방 관리 계획을 수립하고 학생감염병관리조직을 구성한다.', wrong: ['관리조직은 환자 발생 후 구성한다.'], rationale: '예방단계 체크리스트(관리자)' },
      }),
    },
    {
      stage: 'response1',
      title: '의심환자 발생 (진단 전)',
      narrative: `학생이 ${disease.symptoms} 등 증상을 호소한다. 아직 진단 전이다.`,
      questions: buildQuestions({
        surveillance: { correct: '보건교사에게 즉시 연락하고 마스크를 씌워 보건실로 이동시키며 필요 시 관찰실로 격리한다.', wrong: ['증상이 가벼워 보이므로 계속 수업을 듣게 한다.'], rationale: '대응1단계 체크리스트(발생감시팀)' },
        health: { correct: `감염병 여부를 확인하고 ${maskNote}`, wrong: ['확진 전이므로 아무 조치도 하지 않는다.'], rationale: '대응1단계 체크리스트(예방관리팀)' },
        academic: { correct: '격리 담당교사 지정에 협조하고 이동·격리로 발생한 수업 공백을 조치한다.', wrong: ['수업 공백은 학기말에 정리한다.'], rationale: '대응1단계 체크리스트(학사관리팀)' },
        admin: { correct: '해당 학급 교실과 관찰실 소독을 지원한다.', wrong: ['소독은 다음 주로 미룬다.'], rationale: '대응1단계 체크리스트(행정지원팀)' },
        principal: { correct: '보고 체계를 유지하며 다음 단계 전환에 대비한다.', wrong: ['확진 전이므로 보고받지 않는다.'], rationale: '신속한 대응을 위한 상시 보고 체계' },
      }),
    },
    {
      stage: 'response2',
      title: '확진환자 발생',
      narrative: `학생이 ${disease.name}(으)로 확진되었다는 통보를 받았다. (등교중지 기간: ${disease.exclusionPeriod})`,
      questions: buildQuestions({
        surveillance: { correct: '능동감시 대상 학급 담임교사들에게 능동감시를 지시하고 결과를 보건교사에게 통보한다.', wrong: ['확진 사실을 학급에 알리지 않는다.'], rationale: '대응2단계 체크리스트(발생감시팀)' },
        health: { correct: '보건소·학교장·교육지원청에 보고하고 추가 의심환자를 파악한다.', wrong: ['확진자가 1명뿐이므로 보고하지 않는다.'], rationale: '대응2단계 체크리스트(예방관리팀)' },
        academic: { correct: `상황판을 작성하고 단체활동 자제 여부를 검토하며 등교중지 기간(${disease.exclusionPeriod}) 출결 기준을 안내한다.`, wrong: ['상황판 작성은 유행이 확산된 후에 한다.'], rationale: '대응2단계 체크리스트(학사관리팀)' },
        admin: { correct: '확진자 학급과 같은 층 전체 공간·보건실을 소독한다.', wrong: ['확진자 교실만 소독한다.'], rationale: '대응2단계 체크리스트(행정지원팀)' },
        principal: { correct: `의사 소견에 따라 등교중지 시행 여부를 결정한다. ${contactNote}`, wrong: ['보건교사 개인 판단에 맡긴다.'], rationale: '대응2단계 체크리스트(관리자)' },
      }),
    },
    {
      stage: 'response3',
      title: '경계 (추가 환자 발생)',
      narrative: `같은 학급에서 추가 학생이 ${disease.name} 확진을 받아 동일 질병 2명 이상 발생, 대응 제3단계(경계)로 전환한다.`,
      questions: buildQuestions({
        surveillance: { correct: '능동감시·보고체계를 가동해 매일 발생 추이를 모니터링하고 역학조사 대비 학생 명부를 작성한다.', wrong: ['담임교사는 관여하지 않는다.'], rationale: '대응3단계 체크리스트(발생감시팀)' },
        health: { correct: '보건소에 역학조사를 요청하고 고위험군을 파악해 관리 조치를 요청한다.', wrong: ['아직 역학조사를 요청할 단계가 아니다.'], rationale: '대응3단계 체크리스트(예방관리팀)' },
        academic: { correct: '수업 결손 대책·보충을 조정하고 역학조사 대비 교직원 명부·학사자료를 준비한다.', wrong: ['수업 결손 대책은 교육지원청이 마련하므로 대기한다.'], rationale: '대응3단계 체크리스트(학사관리팀)' },
        admin: { correct: '교실·보건실을 포함한 전체 시설을 소독한다.', wrong: ['확진 학급만 계속 소독한다.'], rationale: '대응3단계 체크리스트(행정지원팀)' },
        principal: { correct: '역학조사에 협조하고 보건소 신고·휴업 필요성을 검토한다.', wrong: ['아직 조치할 단계가 아니다.'], rationale: '대응3단계 체크리스트(관리자)' },
      }),
    },
    {
      stage: 'recovery',
      title: '복구 (유행종료)',
      narrative: `최대잠복기(${disease.incubationPeriod}) 동안 추가 환자가 없어 유행종료 시점으로 판단한다.`,
      questions: buildQuestions({
        surveillance: { correct: '추가 (의심)환자 발생이 없음을 최종 확인하고 감시체계를 평상시 수준으로 전환한다.', wrong: ['능동감시 강도를 계속 유지한다.'], rationale: '복구단계 체크리스트(발생감시팀)' },
        health: { correct: '발생 현황을 정리해 보고하고 유행종료 가정통신문(안)을 작성한다.', wrong: ['보고 없이 종료한다.'], rationale: '복구단계 체크리스트(예방관리팀)' },
        academic: { correct: '관리조직을 예방단계로 복귀시키고 수립된 수업 결손 대책에 따라 수업 보충을 지휘한다.', wrong: ['수업 보충 계획을 폐기한다.'], rationale: '복구단계 체크리스트(학사관리팀)' },
        admin: { correct: '방역물품을 점검하고 관련 예산을 확인·정리한다.', wrong: ['소독 강도를 계속 유지한다.'], rationale: '복구단계 체크리스트(행정지원팀)' },
        principal: { correct: '관리조직의 대응 활동을 중단하고 예방단계 복귀를 명령한다.', wrong: ['계속 비상 운영한다.'], rationale: '복구단계 체크리스트(관리자)' },
      }),
    },
  ]
}

export function getScenarioForDisease(diseaseId: string): ScenarioStage[] {
  if (diseaseId === 'chickenpox') return SCENARIO_CHICKENPOX
  return genericScenarioFor(getDiseaseById(diseaseId))
}
