import { DocumentData } from '../_types/document';
import type { LegalIssue } from '../../_types/shared';

export const MOCK_DOCUMENT_DATA: DocumentData = {
  caseNo: '2026-12345',
  caseTitle: '영업정지처분 취소청구',

  // ── 청구인 ──
  claimant: {
    name: '홍길동',
    address: '서울특별시 OOO구 OOO동 123-45',
    residentNo: '900101-1******', // 추가
    phone: '010-1234-5678',
  },

  // ── 대표자/관리인/선정대표자/대리인 ── 추가
  representative: {
    type: null, // null이면 해당사항 없음
    name: '',
    address: '',
    residentNo: '',
    phone: '',
  },

  // ── 피청구인 ──
  respondent: 'OOO구청장',

  // ── 소관 행정심판위원회 ── 수정
  appealCommitteeType: '시도', // 체크: [ ] 중앙  [✓] 시도  [ ] 기타
  appealCommittee: '서울특별시행정심판위원회',

  // ── 처분 내용 또는 부작위 내용 ── 추가
  dispositionContent:
    '피청구인은 2025. 12. 15. 청구인이 식품위생법 제44조를 위반하였다는 이유로 2026. 1. 1.자로 영업정지 1개월의 처분을 하였음',

  // ── 처분이 있음을 안 날 ──
  dispositionKnownDate: '2026. 1. 5.',

  // ── 청구 취지 ──
  claimPurpose:
    '피청구인이 2026. 1. 1. 청구인에 대하여 한 영업정지 1개월의 처분은 이를 취소한다.\n행정심판 비용은 피청구인의 부담으로 한다.',

  // ── 청구원인 (별지로 작성) ──
  claimReason: {
    background:
      "청구인은 2020. 1. 1.부터 서울특별시 OOO구에서 'OO식당'을 운영해오고 있습니다. 피청구인은 2025. 12. 15.경 청구인이 식품위생법을 위반하였다는 이유로 2026. 1. 1. 영업정지 1개월의 처분을 하였습니다.",
    arguments: [
      {
        title: '사실관계의 오인',
        content:
          '먼저, 본 사건 처분은 사실관계의 오인에 기인한 것입니다. 사건 당일 청구인은 신분증 확인 절차를 거쳤으나, 위조된 신분증임을 육안으로 식별하기 어려운 상황이었습니다.',
        highlightType: 'keyword',
        relatedIssueType: 'FACT_MISUNDERSTANDING',
      },
      {
        title: '비례의 원칙 위반',
        content:
          '비례의 원칙에 반하는 가혹한 처분입니다. 청구인은 동종 전과가 없는 초범이며, 영세 사업자로서 한 달간의 영업 중단은 생계에 치명적인 타격을 입힙니다.',
        highlightType: 'block',
        relatedIssueType: 'PROPORTIONALITY',
      },
    ],
  },

  // ── 처분청의 불복절차 고지 ── 추가
  grievanceNotified: true,
  grievanceContent:
    '이 처분에 불복하는 경우 처분이 있음을 안 날부터 90일 이내에 행정심판을 청구할 수 있습니다.',

  // ── 증거 서류 ──
  evidenceList: ['CCTV 영상 1건', '직원 교육일지 1부', '매장 운영 매뉴얼 1부', '매출 자료 1부'],

  // ── 국선대리인 / 구술심리 ── 추가
  publicDefenderRequest: false,
  oralHearingRequest: false,

  // ── 제출일 ──
  filingDate: '2026. 3. 23.',

  // ── 내부 참조용 ──
  dispositionDate: '2026. 1. 1.',
};

export const MOCK_LEGAL_ISSUES: LegalIssue[] = [
  {
    issueType: 'FACT_MISUNDERSTANDING',
    title: '사실오인',
    description:
      '위조 신분증 제시 여부와 업주의 주의의무 이행 정도가 충분히 반영되지 않았을 가능성이 있습니다.',
    lawBasis: '',
    basisText: '',
    riskLevel: 'HIGH',
  },
  {
    issueType: 'PROPORTIONALITY',
    title: '비례의 원칙',
    description: '영업정지 1개월 처분이 구체적 사정이나 업체 규모에 비해 과중할 수 있습니다.',
    lawBasis: '',
    basisText: '',
    riskLevel: 'MEDIUM',
  },
];
