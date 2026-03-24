import SectionHeader from '../../_components/SectionHeader';
import AiJudgment from '../../claim/report/_components/AiJudgment';
import NextStepCards from './_components/NextStepCards';
import { MOCK_DECISION_DATA } from './_mock/mockdata';

const d = MOCK_DECISION_DATA;

export default function RulingAnalysisPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col p-4 py-12 md:py-16 animate-in fade-in duration-500">
      <div className="w-full flex flex-col gap-8">
        {/* 헤더 */}
        <SectionHeader
          title="재결서 분석 완료!"
          description="AI가 분석한 재결서의 핵심 내용을 확인해보세요."
          descriptionColor="text-blue-600"
        />

        {/* 재관 요지 */}
        <AiJudgment label="재관 요지" summation={d.summary} />

        {/* 결과 수용 / 결과 불복 */}
        <NextStepCards />
      </div>
    </div>
  );
}
