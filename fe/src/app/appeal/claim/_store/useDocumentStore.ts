import { create } from 'zustand';

export interface ContentJson {
  committeeType: string;
  dispositionContent: string;
  claimPurpose: string;
  claimReason: string;
  grievanceContent: string;
  grievanceNotified: boolean;
}

export interface PersonalInfo {
  name: string;
  address: string;
  residentNo: string;
  phone: string;
}

export interface RepresentativeInfo {
  type: string | null; // null이면 해당사항 없음
  name: string;
  address: string;
  residentNo: string;
  phone: string;
}

interface DocumentStoreData {
  contentJson: ContentJson | null;
  // 민감정보 — 서버에 보내지 않음, 프론트에서만 사용
  personalInfo: PersonalInfo | null;
  representative: RepresentativeInfo | null;
  // 기타 문서 필드 — 서버에 보내지 않음
  respondent: string;
  appealCommittee: string;
  dispositionKnownDate: string;
  evidenceList: string[];
  grievanceNotified: boolean;
  publicDefenderRequest: boolean;
  oralHearingRequest: boolean;
  filingDate: string;
}

interface DocumentStoreState extends DocumentStoreData {
  setDocumentData: (data: Partial<DocumentStoreData>) => void;
  clear: () => void;
  hasData: () => boolean;
}

const initialData: DocumentStoreData = {
  contentJson: null,
  personalInfo: null,
  representative: null,
  respondent: '',
  appealCommittee: '',
  dispositionKnownDate: '',
  evidenceList: [],
  grievanceNotified: false,
  publicDefenderRequest: false,
  oralHearingRequest: false,
  filingDate: '',
};

export const useDocumentStore = create<DocumentStoreState>()((set, get) => ({
  ...initialData,
  setDocumentData: (data) => set((state) => ({ ...state, ...data })),
  clear: () => set(initialData),
  hasData: () => get().contentJson !== null,
}));
