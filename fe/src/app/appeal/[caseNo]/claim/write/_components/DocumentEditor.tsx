'use client';



import ClaimantSection from './ClaimantSection';
import RepresentativeSection from './RepresentativeSection';
import CaseDetailsSection from './CaseDetailsSection';
import EvidenceAndRequestSection from './EvidenceAndRequestSection';
import ClaimReasonSection from './ClaimReasonSection';
import { EditableInput } from '@/app/appeal/_components/FormInputs';

export default function DocumentEditor() {

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
          <div className="tracking-widest flex items-center gap-1">
            <EditableInput name="filingDate" className="text-center tracking-widest w-48" />
          </div>
          <div className="text-base flex items-center gap-2">
            <span className="tracking-widest">청구인</span>
            <span className="inline-block border-b border-black w-32 pb-0.5 relative top-0.5">
              <EditableInput name="claimant.name" className="text-center w-full" />
            </span>
            <span className="text-sm tracking-tighter text-gray-600">(서명 또는 인)</span>
          </div>
        </div>
      </div>

      <ClaimReasonSection />
    </div>
  );
}
