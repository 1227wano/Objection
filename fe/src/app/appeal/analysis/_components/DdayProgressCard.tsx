'use client';

import { AlertCircle, AlertTriangle, Clock } from 'lucide-react';

interface DdayProgressCardProps {
  deadline?: string;
}

export default function DdayProgressCard({ deadline }: DdayProgressCardProps) {
  const totalDays = 90;

  let timeRemaining = 15;
  let timeElapsed = 75;
  let percentage = 83.3;
  let timeRemainingText = 'D-15';

  if (deadline) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);

    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      timeRemaining = diffDays;
      timeRemainingText = `D-${diffDays}`;
    } else if (diffDays === 0) {
      timeRemaining = 0;
      timeRemainingText = 'D-Day';
    } else {
      timeRemaining = 0;
      timeRemainingText = `D+${Math.abs(diffDays)}`;
    }

    timeElapsed = Math.min(totalDays, Math.max(0, totalDays - timeRemaining));
    percentage = Math.min(100, Math.max(0, (timeElapsed / totalDays) * 100));
  }

  // 3단계 기한 표시: 양호(>30일), 주의(<=30일), 경고(<=15일)
  let statusMode = 'good';
  if (timeRemaining <= 15) {
    statusMode = 'danger';
  } else if (timeRemaining <= 30) {
    statusMode = 'warning';
  }

  const getStatusColors = (mode: string) => {
    switch (mode) {
      case 'danger':
        return {
          border: 'border-[#fecaca]',
          bg: 'bg-[#fef2f2]',
          iconBg: 'bg-[#fee2e2]',
          iconText: 'text-[#dc2626]',
          titleText: 'text-[#991b1b]',
          subtitleText: 'text-[#b91c1c]',
          titleStr: '경고 : 청구 기한이 임박했습니다!',
          subtitleStr: '서둘러 행정 심판 청구를 준비해주세요.',
        };
      case 'warning':
        return {
          border: 'border-point',
          bg: 'bg-[#fffdf2]',
          iconBg: 'bg-[#fff5cc]',
          iconText: 'text-[#d97706]',
          titleText: 'text-[#b45309]',
          subtitleText: 'text-[#d97706]',
          titleStr: '주의 : 청구 기한이 다가오고 있습니다.',
          subtitleStr: '필요한 서류와 절차를 미리 점검해 주세요.',
        };
      case 'good':
      default:
        return {
          border: 'border-[#bbf7d0]',
          bg: 'bg-[#f0fdf4]',
          iconBg: 'bg-[#dcfce7]',
          iconText: 'text-[#16a34a]',
          titleText: 'text-[#166534]',
          subtitleText: 'text-[#15803d]',
          titleStr: '양호 : 청구 기한까지 여유가 있습니다.',
          subtitleStr: '남은 기간 동안 꼼꼼하게 심판 청구를 준비할 수 있습니다.',
        };
    }
  };

  const statusColors = getStatusColors(statusMode);

  return (
    <div className="mb-12">
      <h2 className="text-lg font-extrabold text-[#111827] mb-4 flex items-center">
        <span className="text-first font-extrabold mr-3 text-[24px]">03</span>
        행정 심판 청구까지 남은 날짜
      </h2>

      <div className={`border rounded-2xl shadow-sm overflow-hidden ${statusColors.border}`}>
        {/* Banner Header */}
        <div
          className={`px-6 md:px-8 py-5 flex flex-col justify-center border-b ${statusColors.border} ${statusColors.bg}`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className={`flex items-center justify-center ${statusColors.iconText}`}>
              {statusMode === 'danger' && <AlertCircle className="w-5 h-5" strokeWidth={2.5} />}
              {statusMode === 'warning' && <AlertTriangle className="w-5 h-5" strokeWidth={2.5} />}
              {statusMode === 'good' && <Clock className="w-5 h-5" strokeWidth={2.5} />}
            </div>
            <h3 className={`text-[17px] font-extrabold tracking-tight ${statusColors.titleText}`}>
              {statusColors.titleStr}
            </h3>
          </div>
          <p
            className={`text-[13.5px] ml-[28px] font-medium leading-relaxed ${statusColors.subtitleText}`}
          >
            {statusColors.subtitleStr}
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-[#fffcfc] px-6 py-8 md:px-10 md:py-10">
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="text-[12.5px] text-gray-400 font-bold mb-1.5 tracking-wider">
                남은 기간
              </div>
              <div
                className={`text-[56px] font-extrabold tracking-tighter leading-none ${statusMode === 'danger' ? 'text-[#ef4444]' : statusMode === 'warning' ? 'text-[#f59e0b]' : 'text-[#22c55e]'}`}
              >
                {timeRemainingText}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[12.5px] text-gray-400 font-bold mb-1.5 tracking-wider">
                처분일로부터
              </div>
              <div className="text-[40px] font-extrabold text-[#111827] tracking-tighter leading-none">
                {timeElapsed}
                <span className="text-[20px] text-[#111827] font-extrabold ml-1">일</span>
              </div>
            </div>
          </div>

          <div className="relative h-2 w-full bg-gray-200 rounded-full mb-3 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out relative`}
              style={{
                width: `${percentage}%`,
                background:
                  statusMode === 'danger'
                    ? 'linear-gradient(to right, #a3e635, #ef4444)'
                    : statusMode === 'warning'
                      ? 'linear-gradient(to right, #a3e635, var(--point-color))'
                      : 'linear-gradient(to right, #a3e635, #22c55e)',
              }}
            >
              {/* Point Indicator */}
              <div
                className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-[18px] h-[18px] rounded-full bg-white border-[4px] ${statusMode === 'danger' ? 'border-[#ef4444]' : statusMode === 'warning' ? 'border-point' : 'border-[#22c55e]'} shadow-sm`}
              ></div>
            </div>
          </div>

          <div className="flex justify-between mt-4 text-[12px] font-bold tracking-wider">
            <span className="text-gray-400">처분일</span>
            <span
              className={
                statusMode === 'danger'
                  ? 'text-[#ef4444]'
                  : statusMode === 'warning'
                    ? 'text-[#f59e0b]'
                    : 'text-[#22c55e]'
              }
            >
              청구 기한
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
