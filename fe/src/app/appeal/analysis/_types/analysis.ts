// 설계도 (Type)
export interface Eligibility {
  id: number;
  title: string;
  status: 'pass' | 'warning' | 'fail';
  description: string;
}

export interface AnalysisData {
  summary: string;
  originalText: string;
  deadline: string;
  eligibility: Eligibility[];
  details?: { label: string; value: string }[];
}

export const ANALYSIS_MOCK_DATA : AnalysisData = {
  summary: "본 사건은 음주운전으로 인한 운전면허 취소 처분에 대한 건으로, 혈중알코올농도 0.081% 상태에서 운전 중 적발되었습니다. 청구인은 운전의 필수성과 생계 유지의 어려움을 주장하고 있습니다.",
  originalText: "행정처분 통지서 내용 전문... (생략)",
  deadline: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // D-Day 계산용 (현재일 기준 5일 뒤)
  eligibility: [
    { id: 1, title: "청구인 적격", status: "pass", description: "처분의 직접 상대방으로서 청구인 자격이 충분합니다." },
    { id: 2, title: "대상 적격", status: "pass", description: "행정심판의 대상이 되는 행정처분에 해당합니다." },
  ],
};