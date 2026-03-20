import { AppealType, PossibilityType, APPEAL_TYPE_MAP, POSSIBILITY_MAP } from '../types';

interface StrategySummaryProps {
  appealType: AppealType;
  possibility: PossibilityType;
}

export default function StrategySummary({ appealType, possibility }: StrategySummaryProps) {
  const strategyText = APPEAL_TYPE_MAP[appealType];
  const possInfo = POSSIBILITY_MAP[possibility];

  return (
    <div className="flex flex-col md:flex-row bg-white border border-gray-100/80 rounded-2xl shadow-sm overflow-hidden text-left w-full h-full">
      {/* 최적의 전략 */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-100/80">
        <span className="text-slate-400 text-sm font-semibold mb-1.5">최적의 전략</span>
        <span className="text-[26px] md:text-[28px] font-extrabold text-[#2C3342] tracking-tight">{strategyText}</span>
      </div>
      
      {/* 인용 가능성 */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
        <span className="text-slate-400 text-sm font-semibold mb-1.5">인용 가능성</span>
        <div className="flex items-baseline gap-2.5">
          <span className={`text-[26px] md:text-[28px] font-extrabold ${possInfo.color} tracking-tight`}>{possInfo.text}</span>
          <span className={`text-sm font-semibold ${possInfo.color} opacity-60`}>{possInfo.en}</span>
        </div>
      </div>
    </div>
  );
}
