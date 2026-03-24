import { EvidenceResponse } from '../../../claim/report/types';

export const MOCK_SUPPLEMENT_EVIDENCE: EvidenceResponse = {
  status: 'SUCCESS',
  message: '요청이 성공했습니다.',
  data: [
    {
      evidenceId: 1,
      evidenceType: '위조 신분증 감정 의뢰서',
      submitted: true,
      checkedAt: '2026-03-24T10:00:00',
    },
    {
      evidenceId: 2,
      evidenceType: '전자신분증 인증기기 도입 영수증',
      submitted: true,
      checkedAt: '2026-03-24T10:00:00',
    },
    {
      evidenceId: 3,
      evidenceType: '직원 교육 이수 증명서',
      submitted: false,
      checkedAt: null,
    },
    {
      evidenceId: 4,
      evidenceType: 'CCTV 영상 캡처본',
      submitted: false,
      checkedAt: null,
    },
    {
      evidenceId: 5,
      evidenceType: '당일 매장 혼잡도 증빙자료 (예약 내역, 영수증 등)',
      submitted: false,
      checkedAt: null,
    },
  ],
};
