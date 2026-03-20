import React from 'react';
import { ReportData } from './types';
import ReportHeader from './_components/ReportHeader';
import StrategySummary from './_components/StrategySummary';
import AiJudgment from './_components/AiJudgment';
import DetailAccordion from './_components/DetailAccordion';
import UrgentNotice from './_components/UrgentNotice';
import PrecedentList from './_components/PrecedentList';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const mockReportData: ReportData = {
  appealType: 'CANCEL',
  possibility: 'h',
  summation: '본 사안은 청소년 주류 제공으로 인한 영업정지 2개월 처분에 대한 취소를 구하는 건입니다.\nCCTV 영상 및 관련자 진술을 종합해 볼 때, 해당 청소년이 정교하게 위조된 타인의 신분증을 제시하였고 그 기만성이 상당하여 청구인이 일반적인 주의 의무를 다하였음에도 이를 식별하기 어려웠을 것으로 판단됩니다.\n과도한 처분으로 인한 청구인의 회복하기 어려운 경제적 손해가 예상되므로 재량권 일탈 및 남용이 인정될 가능성이 높습니다.',
  reasons: [
    {
      title: '법 위반의 고의성 및 과실 여부',
      cause: '청구인은 점포 입구 및 계산대에서 신분증을 강도 높게 검사했으나, 청소년들이 성인인 친형의 신분증을 도용함.',
      opinion: '육안으로 구별이 어려운 타인 신분증 도용 사례이므로, 청구인 측의 과실을 전적으로 묻기 어려워 식품위생법상 면책 또는 감경 사유에 해당할 여지가 상당함.'
    },
    {
      title: '처분의 비례의 원칙(재량권 일탈·남용)',
      cause: '영업정지 2개월 처분이 그대로 집행될 경우 임대료 밀림 등 회복 불가능한 손실 발생 우려',
      opinion: '과거 위반 시정명령 이력이 전혀 없는 점, 사건 당일 CCTV에 철저하게 관리한 정황이 찍힌 점 등을 고려할 때 2개월 정지는 비례의 원칙에 반합니다.'
    }
  ],
  stayOfExecution: true,
  precedents: [
    {
      caseName: '2023행심123 영업정지처분 취소청구',
      point: '위조 신분증에 속아 주류를 제공한 경우, 업주의 주의의무 이행 정도와 행정처분 감경',
      result: '일부 인용 (영업정지 2개월 -> 1개월 감경)'
    },
    {
      caseName: '2022행심456 영업정지처분 및 과징금 부과처분 취소청구',
      point: '종업원의 신분증 확인 절차 이행과 과도한 처분에 대한 재량권 일탈·남용',
      result: '전부 인용 (처분 취소)'
    }
  ],
  evidences: [
    { title: '사건 당일 매장 내부 CCTV 영상 (신분증 검사 장면 명확히 식별 가능)' },
    { title: '수사기관(경찰)의 내사 종결서 또는 불기소 처분 관련 서류' },
    { title: '청구인이 평상시 직원들을 대상으로 실시한 미성년자 출입 단속 교육 일지 일체' }
  ]
};

export default function ReportPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center p-4 py-12 md:py-24">
      
      <div className="w-full flex flex-col gap-8">
        
        {/* 1. 헤더 */}
        <div className="flex flex-col gap-6">
          <ReportHeader />
          {/* 2. 전략 요약 */}
          <StrategySummary 
            appealType={mockReportData.appealType} 
            possibility={mockReportData.possibility} 
          />
        </div>

        <div className="w-full h-px bg-gray-100 my-1"></div>

        {/* 3. 긴급 권고 */}
        <UrgentNotice stayOfExecution={mockReportData.stayOfExecution} />

        {/* 4. AI 판단 요약 */}
        <AiJudgment summation={mockReportData.summation} />

        {/* 5. 상세 아코디언 */}
        <DetailAccordion 
          reasons={mockReportData.reasons} 
          evidences={mockReportData.evidences} 
        />

        {/* 6. 유사 판례 */}
        <PrecedentList precedents={mockReportData.precedents} />

        {/* 하단 이동 버튼 */}
        <div className="flex justify-end pt-8">
          <Link href="#">
            <Button>다음 단계로 이동하기</Button>
          </Link>
        </div>

      </div>

    </div>
  );
}
