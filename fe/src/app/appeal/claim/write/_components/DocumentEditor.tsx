'use client';

import { useFormContext } from 'react-hook-form';
import { DocumentData } from '../_types/document';
import ClaimantSection from './ClaimantSection';
import RepresentativeSection from './RepresentativeSection';
import CaseDetailsSection from './CaseDetailsSection';
import EvidenceAndRequestSection from './EvidenceAndRequestSection';
import ClaimReasonSection from './ClaimReasonSection';

export default function DocumentEditor() {
  const { watch } = useFormContext<DocumentData>();
  
  const filingDate = watch('filingDate') || '';
  const claimantName = watch('claimant.name') || '';
  const appealCommittee = watch('appealCommittee') || '';

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-10 md:p-12 max-w-[850px] mx-auto text-black font-medium leading-relaxed">
      <div className="flex justify-between items-start mb-6">
        <div className="text-xs tracking-tighter">
          ■ 행정심판법 시행규칙 [별지 제30호서식]
        </div>
      </div>

      <h1 className="text-3xl font-bold text-center mb-2 tracking-[0.5em] ml-[0.5em]">행정심판 청구서</h1>
      <div className="text-right text-xs mb-1">(앞쪽)</div>

      <table className="w-full border-collapse border border-black text-sm mb-4 table-fixed">
        <colgroup>
          <col className="w-[16%]" />
          <col className="w-[24%]" />
          <col className="w-[16%]" />
          <col className="w-[44%]" />
        </colgroup>
        <tbody>
          {/* Row 1 */}
          <tr className="bg-gray-300">
            <td className="border border-black p-1.5 text-center font-semibold">접수번호</td>
            <td className="border border-black p-1.5 relative h-8">
              <span className="text-red-500 text-[10px] absolute top-1 right-1">.</span>
            </td>
            <td className="border border-black p-1.5 text-center font-semibold">접수일</td>
            <td className="border border-black p-1.5 relative h-8">
               <span className="text-red-500 text-[10px] absolute top-1 right-1">.</span>
            </td>
          </tr>

          <ClaimantSection />
          <RepresentativeSection />
          <CaseDetailsSection />
          <EvidenceAndRequestSection />
        </tbody>
      </table>

      {/* Footer Text */}
      <div className="mt-4 mb-8 text-sm">
        <p className="indent-4 mb-8 tracking-tighter">
          「행정심판법」 제28조 및 같은 법 시행령 제20조에 따라 위와 같이 행정심판을 청구합니다.
        </p>
        {/* Date and Signature grouped on the right side */}
        <div className="flex flex-col items-end gap-6 mr-[15%]">
          {filingDate && filingDate.split('.').length >= 3 ? (
            <p className="tracking-widest">
              {filingDate.split('.')[0].trim()} 년{' '}
              {filingDate.split('.')[1].trim().padStart(2, ' ')} 월{' '}
              {filingDate.split('.')[2].trim().padStart(2, ' ')} 일
            </p>
          ) : (
             <p className="tracking-widest">년 월 일</p>
          )}
          <p className="text-base">
            <span className="tracking-widest mr-4">청구인</span>
            <span className="inline-block border-b border-black w-32 text-center pb-0.5 relative top-1">
              {claimantName}
            </span>
            <span className="ml-2 text-sm tracking-tighter text-gray-600">(서명 또는 인)</span>
          </p>
        </div>
        <p className="text-2xl font-bold mt-10 tracking-widest ml-[10%]">
          {appealCommittee} 귀중
        </p>
      </div>

      {/* Attachment info table */}
      <table className="w-full border-collapse border border-black mb-16 text-xs">
        <colgroup>
          <col className="w-[20%]" />
          <col className="w-[60%]" />
          <col className="w-[20%]" />
        </colgroup>
        <tbody>
          <tr>
            <td className="border border-black p-2 text-center font-semibold text-sm">첨부서류</td>
            <td className="border border-black p-2 leading-tight">
              1. 대표자, 관리인, 선정대표자 또는 대리인의 자격을 소명하는 서류(대표자, 관리인, 선정대표자 또는 대리인을 선임하는 경우에만 제출합니다)<br/>
              2. 주장을 뒷받침하는 증거서류나 증거물
            </td>
            <td className="border border-black p-2 text-center font-semibold text-sm">수수료<br/>없음</td>
          </tr>
        </tbody>
      </table>

      <ClaimReasonSection />
    </div>
  );
}
