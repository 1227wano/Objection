import { AnalysisResponse, EvidenceResponse } from '../types';

export const MOCK_ANALYSIS_DATA: AnalysisResponse = {
  status: 'SUCCESS',
  message: 'AI 법리 분석 및 전략 수립이 완료되었습니다.',
  data: {
    // 1. 심판 유형 및 인용 가능성
    claimType: 'CANCEL',
    appealPossibility: 'HIGH',

    // 2. AI 분석 요약 (Summary)
    legalIssueSummary:
      '이 사건은 위조 신분증 제시에 따른 사실오인 가능성과 처분 비례성 원칙 위반 여부가 핵심 쟁점입니다.',
    strategySummary:
      '사실오인과 처분의 과중성을 중심으로 주장하며, 집행정지 신청을 병행하여 영업 피해를 최소화하는 전략이 필요합니다.',

    // 3. 유사 판례 (대표 판례 하나)
    representativePrecedent: {
      precedentNo: 'P-1001',
      precedentName: '2023행심123 청소년 주류제공 관련 감경 사례',
      matchReason: '신분증 위조 및 업주의 주의의무 이행 정황이 본 사안과 매우 유사합니다.',
      usagePoint: '사실오인 및 주의의무 이행 주장 근거로 활용 가능',
      result: '일부 인용 (영업정지 2개월 → 1개월 감경)',
    },

    // 4. legalIssues 목록 (쟁점 및 의견)
    legalIssues: [
      {
        issueType: 'FACT_MISUNDERSTANDING',
        title: '사실오인',
        description:
          '위조 신분증 제시 여부와 업주의 주의의무 이행 정도가 충분히 반영되지 않았을 가능성이 있습니다.',
        lawBasis: '식품위생법 제44조',
        basisText: '직원이 신분증 검사를 했으나 손님이 위조 신분증을 제시한 것으로 보입니다.',
        riskLevel: 'HIGH',
      },
      {
        issueType: 'PROPORTIONALITY',
        title: '비례의 원칙',
        description: '영업정지 2개월 처분이 구체적 사정이나 업체 규모에 비해 과중할 수 있습니다.',
        lawBasis: '행정법 일반원칙 (재량권 일탈·남용)',
        basisText: '업주로서 최선을 다했으며 생계형 영업임을 고려할 때 과도한 처분입니다.',
        riskLevel: 'MEDIUM',
      },
    ],
    mainPoints: [
      {
        point: '위조 신분증 제시로 인한 사실오인',
        reason: '업주의 주의의무 이행 여부를 중심으로 방어할 수 있습니다.',
        sourceText: '직원이 신분증 검사를 했으나 손님이 위조 신분증을 제시한 것으로 보입니다.',
      },
      {
        point: '처분의 비례성 원칙 위반',
        reason: '과거 위반 이력이 없고 생계형 영업임을 고려할 때 2개월은 과중합니다.',
        sourceText: '업주로서 최선을 다했는데 과도한 처분이라고 생각합니다.',
      },
    ],
  },
};

export const MOCK_EVIDENCE_DATA: EvidenceResponse = {
  status: 'SUCCESS',
  message: '요청이 성공했습니다.',
  data: [
    {
      evidenceId: 1,
      evidenceType: '영업허가증 사본',
      submitted: true,
      checkedAt: '2026-03-13T11:00:00',
    },
    {
      evidenceId: 2,
      evidenceType: '최근 3개월 매출 증빙자료',
      submitted: false,
      checkedAt: null,
    },
    {
      evidenceId: 3,
      evidenceType: 'CCTV 영상 및 캡처본',
      submitted: false,
      checkedAt: null,
    },
    {
      evidenceId: 4,
      evidenceType: '직원 교육일지 및 매뉴얼',
      submitted: false,
      checkedAt: null,
    },
  ],
};
