import { SupplementDocumentData } from '../_types/document';
import { LegalIssue } from '../../../claim/_types/shared';

export const MOCK_SUPPLEMENT_DOC: SupplementDocumentData = {
  caseName: '영업정지처분 취소청구',
  caseNo: '2026-12345',
  claimantName: '홍길동',
  claimantPhone: '010-1234-5678',
  claimantAddress: '서울특별시 OOO구 OOO동 123-45',
  respondent: 'OOO구청장',
  documentType: '보충서면',
  submissionContent: [
    {
      title: '1. 피청구인 주장에 대한 반박',
      content:
        '피청구인은 청구인이 식품위생법 제44조를 위반하였다고 주장하나, 이는 사실관계의 오인에 기인한 것입니다. 사건 당일 청구인의 직원은 해당 손님에게 신분증 제시를 요구하였고, 제시된 신분증이 위조된 것임을 육안으로 식별하기 어려운 상황이었습니다.',
    },
    {
      title: '2. 처분의 비례성 원칙에 대한 반론',
      content:
        '설령 위반 사실이 인정되더라도, 영업정지 2개월의 처분은 비례의 원칙에 반하는 가혹한 처분입니다. 청구인은 동종 전과가 없는 초범이며, 사건 이후 전자신분증 인증기기를 도입하고 전 직원 대상 교육을 실시하는 등 재발 방지를 위한 적극적인 노력을 기울이고 있습니다.',
    },
    {
      title: '3. 결론',
      content:
        '이상의 사유를 종합할 때, 피청구인의 처분은 사실오인 및 비례의 원칙 위반에 해당하므로, 영업정지 기간의 감경 또는 처분의 취소를 구합니다.',
    },
  ],
  filingDate: '2026. 3. 24.',
  submitterName: '홍길동',
  committee: '서울특별시행정심판위원회',
  attachments: [
    '위조 신분증 감정 의뢰서 1부',
    '전자신분증 인증기기 도입 영수증 1부',
    '직원 교육 이수 증명서 1부',
    'CCTV 영상 캡처본 1부',
  ],
};

export const MOCK_SUPPLEMENT_ISSUES: LegalIssue[] = [
  {
    issueType: 'FACT_MISUNDERSTANDING',
    title: '고의성 부존재',
    description: '위조 신분증의 정교함으로 인해 통상적 주의의무 수준으로는 식별이 곤란했음을 입증해야 합니다.',
    lawBasis: '식품위생법 제44조',
    basisText: '직원이 신분증 확인 절차를 이행하였으나 위조 신분증임을 식별하기 어려웠습니다.',
    riskLevel: 'HIGH',
  },
  {
    issueType: 'PROPORTIONALITY',
    title: '비례의 원칙 위반',
    description: '초범 여부, 재발 방지 조치, 생계형 영업 등을 종합하면 영업정지 2개월은 과중합니다.',
    lawBasis: '행정심판법 제5조(비례의 원칙)',
    basisText: '사건 이후 전자신분증 인증기기 도입 및 직원 교육을 실시하였습니다.',
    riskLevel: 'MEDIUM',
  },
];
