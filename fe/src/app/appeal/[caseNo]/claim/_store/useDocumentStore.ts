import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ... (인터페이스 정의 생략 — 기존과 동일)
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
  type: string | null;
  name: string;
  address: string;
  residentNo: string;
  phone: string;
}

interface DocumentStoreData {
  contentJson: ContentJson | null;
  personalInfo: PersonalInfo | null;
  representative: RepresentativeInfo | null;
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

export const useDocumentStore = create<DocumentStoreState>()(
  persist(
    (set, get) => ({
      ...initialData,
      setDocumentData: (data) => set((state) => ({ ...state, ...data })),
      clear: () => set(initialData),
      hasData: () => get().contentJson !== null,
    }),
    {
      name: 'document-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
