export type { RiskLevel, IssueType, LegalIssue } from '../../_types/shared';

export type HighlightType = 'keyword' | 'block' | 'none';

// 대표자/관리인/선정대표자/대리인 유형
export type RepresentativeType = '대표자' | '관리인' | '선정대표자' | '대리인' | null;

// 소관 행정심판위원회 유형
export type CommitteeType = '중앙' | '시도' | '기타';

export interface ClaimantInfo {
  name: string;
  address: string;
  residentNo: string; // 주민등록번호(외국인등록번호) ← 추가
  phone: string;
}

// 대표자/관리인/선정대표자/대리인 정보 ← 추가
export interface RepresentativeInfo {
  type: RepresentativeType;
  name: string;
  address: string;
  residentNo: string;
  phone: string;
}

export interface ArgumentItem {
  title: string;
  content: string;
  highlightType: HighlightType;
  relatedIssueType: IssueType;
}

export interface ClaimReason {
  background: string;
  arguments: ArgumentItem[];
}


export interface DocumentData {
  caseNo: string;
  caseTitle: string;

  // 청구인
  claimant: ClaimantInfo;

  // 대표자/관리인/선정대표자/대리인 ← 추가
  representative: RepresentativeInfo;

  // 피청구인
  respondent: string;

  // 소관 행정심판위원회 ← 수정 (체크박스 + 이름)
  appealCommitteeType: CommitteeType;
  appealCommittee: string;

  // 처분 내용 또는 부작위 내용 ← 추가 (기존엔 없었음)
  dispositionContent: string;

  // 처분이 있음을 안 날
  dispositionKnownDate: string;

  // 청구 취지 및 청구 이유
  claimPurpose: string;
  claimReason: ClaimReason;

  // 처분청의 불복절차 고지 유무 ← 추가
  grievanceNotified: boolean;

  // 처분청의 불복절차 고지 내용 ← 추가
  grievanceContent: string;

  // 증거 서류
  evidenceList: string[];

  // 국선대리인 선임 신청 여부 ← 추가
  publicDefenderRequest: boolean;

  // 구술심리 신청 여부 ← 추가
  oralHearingRequest: boolean;

  // 제출일
  filingDate: string;

  // 아래는 내부용 (서식에 직접 안 나오지만 다른 곳에서 참조)
  dispositionDate: string;
}
