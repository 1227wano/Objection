'use client';

import { useFormContext } from 'react-hook-form';
import { EditableInput } from './FormInputs';
import { DocumentData } from '../_types/document';

export default function EvidenceAndRequestSection() {
  const { watch, setValue } = useFormContext<DocumentData>();
  const evidenceList = watch('evidenceList') || [];
  const publicDefenderRequest = watch('publicDefenderRequest');
  const oralHearingRequest = watch('oralHearingRequest');

  return (
    <>
      {/* Row 17: 증거 서류 */}
      <tr>
        <td className="border border-black p-2 text-center text-sm">증거 서류</td>
        <td colSpan={3} className="border border-black p-1.5 px-3">
          <div className="flex flex-col gap-1 py-1">
            {evidenceList.map((_: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span className="w-4 shrink-0">{idx + 1}.</span>
                <EditableInput name={`evidenceList.${idx}`} />
              </div>
            ))}
          </div>
        </td>
      </tr>

      {/* Row 18: 국선대리인 */}
      <tr>
        <td className="border border-black p-2 text-center text-sm leading-tight">
          국선대리인<br/>선임 신청 여부
        </td>
        <td colSpan={3} className="border border-black p-2 px-3">
          <div className="flex gap-8 mb-1">
            <label className="flex items-center gap-1 cursor-pointer">
               <span>[{publicDefenderRequest === true ? 'V' : ' '}]</span> 여
               <input type="radio" checked={publicDefenderRequest === true} onChange={() => setValue('publicDefenderRequest', true)} className="hidden" />
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
               <span>[{publicDefenderRequest === false ? 'V' : ' '}]</span> 부
               <input type="radio" checked={publicDefenderRequest === false} onChange={() => setValue('publicDefenderRequest', false)} className="hidden" />
            </label>
          </div>
          <div className="text-[11px] leading-tight text-gray-700 tracking-tight">
            ※ 국선대리인 선임을 신청하는 경우에는 「행정심판법 시행규칙」 별지 제27호의2서식에 따른 국선대리인 선임 신청서를 별도로 첨부하시기 바랍니다.
          </div>
        </td>
      </tr>

      {/* Row 19: 구술심리 */}
      <tr>
        <td className="border border-black p-2 text-center text-sm leading-tight">
          구술심리 신청<br/>여부
        </td>
        <td colSpan={3} className="border border-black p-2 px-3">
          <div className="flex gap-8 mb-1">
            <label className="flex items-center gap-1 cursor-pointer">
               <span>[{oralHearingRequest === true ? 'V' : ' '}]</span> 여
               <input type="radio" checked={oralHearingRequest === true} onChange={() => setValue('oralHearingRequest', true)} className="hidden" />
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
               <span>[{oralHearingRequest === false ? 'V' : ' '}]</span> 부
               <input type="radio" checked={oralHearingRequest === false} onChange={() => setValue('oralHearingRequest', false)} className="hidden" />
            </label>
          </div>
          <div className="text-[11px] leading-tight text-gray-700 tracking-tight">
            ※ 구술심리를 신청하는 경우에는 「행정심판법 시행규칙」 별지 제39호서식에 따른 구술심리 신청서를 별도로 첨부하시기 바랍니다.
          </div>
        </td>
      </tr>
    </>
  );
}
