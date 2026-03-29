import { AlertTriangle } from 'lucide-react';

interface UrgentNoticeProps {
  stayOfExecution: boolean;
}

export default function UrgentNotice({ stayOfExecution }: UrgentNoticeProps) {
  if (!stayOfExecution) return null;

  return (
    <div className="flex items-start gap-3.5 bg-orange-50 border border-orange-200/80 p-5 rounded-2xl shadow-sm">
      <div className="p-2 bg-white rounded-full text-red-500 shadow-sm border border-orange-100 flex-shrink-0">
        <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <div className="flex flex-col gap-1.5 pt-0.5">
        <h3 className="font-bold text-red-600 md:text-lg">긴급 권고: 집행정지 신청 🚨</h3>
        <p className="text-[14.5px] md:text-[15px] text-orange-900/90 leading-relaxed">
          행정심판 결과가 나올 때까지 영업을 계속하시려면 <strong>집행정지 신청</strong>이 
          반드시 필요합니다. 기한 내에 신청하지 않을 경우 처분의 효력이 정지되지 않으므로 
          신속한 조치가 요구됩니다.
        </p>
      </div>
    </div>
  );
}
