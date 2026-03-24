import { Eligibility } from '../_types/analysis';
import { Check, X } from 'lucide-react';

interface EligibilityCardProps {
  eligibility?: Eligibility[];
}

export default function EligibilityCard({ eligibility }: EligibilityCardProps) {
  const getStatusConfig = (status: Eligibility['status']) => {
    switch (status) {
      case 'pass':
        return {
          badgeText: '가능',
          badgeClass: 'bg-green-100 text-green-600',
          dotClass: 'bg-green-600',
        };
      case 'warning':
        return {
          badgeText: '주의',
          badgeClass: 'bg-amber-50 text-amber-600',
          dotClass: 'bg-point',
        };
      case 'fail':
        return {
          badgeText: '불가',
          badgeClass: 'bg-red-100 text-red-600',
          dotClass: 'bg-red-600',
        };
      default:
        return {
          badgeText: '알림',
          badgeClass: 'bg-gray-100 text-gray-500',
          dotClass: 'bg-gray-500',
        };
    }
  };

  const hasPass = eligibility?.some((item) => item.status === 'pass' || item.status === 'warning');

  return (
    <div className="mb-14">
      <h2 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center">
        <span className="text-first font-extrabold mr-3 text-[24px]">02</span>
        행정 심판 적격성 검토
      </h2>

      <div
        className={`border rounded-2xl shadow-sm overflow-hidden ${hasPass ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
      >
        <div className="px-6 py-6 md:px-8 flex items-start gap-4">
          <div
            className={`mt-0.5 flex items-center justify-center w-7 h-7 rounded-full shadow-sm text-white ${hasPass ? 'bg-green-600' : 'bg-red-600'}`}
          >
            {hasPass ? (
              <Check className="w-4 h-4" strokeWidth={3} />
            ) : (
              <X className="w-4 h-4" strokeWidth={3} />
            )}
          </div>
          <div>
            <h3
              className={`text-[19px] font-extrabold tracking-tight ${hasPass ? 'text-green-600' : 'text-red-600'}`}
            >
              {hasPass ? '행정 심판 진행 가능' : '행정 심판 진행 불가'}
            </h3>
            <p className="text-[13px] mt-1 text-gray-400">
              아래의 세부 판단 요건들을 확인해보세요.
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 md:px-8 md:pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eligibility && eligibility.length > 0 ? (
              eligibility.map((item) => {
                const config = getStatusConfig(item.status);
                return (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-100 p-6 md:p-7 rounded-2xl shadow-sm"
                  >
                    <div className="flex items-center mb-2">
                      <h3 className="font-extrabold text-gray-900 text-[15px]">{item.title}</h3>
                      <div
                        className={`px-2 py-0.5 rounded-full text-[11px] ml-2 font-bold tracking-wide flex items-center gap-1.5 ${config.badgeClass}`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`}></div>
                        {config.badgeText}
                      </div>
                    </div>
                    <p className="text-[13px] text-gray-500 leading-relaxed min-h-[30px] break-keep">
                      {item.description}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="col-span-1 md:col-span-2 text-center py-8 text-gray-500 text-sm bg-white border border-gray-100 rounded-xl">
                적격성 판단 결과가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
