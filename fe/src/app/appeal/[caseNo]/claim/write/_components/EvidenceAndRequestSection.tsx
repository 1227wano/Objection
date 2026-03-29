'use client';

import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { EditableInput } from '@/app/appeal/_components/FormInputs';
import { DocumentData } from '../_types/document';
import { useEvidence } from '@/app/appeal/[caseNo]/claim/suggest/_hook/useEvidence';


const analysisNo = 1;

export default function EvidenceAndRequestSection() {
  const { watch, setValue } = useFormContext<DocumentData>();
  const evidenceList = watch('evidenceList') || [];
  const publicDefenderRequest = watch('publicDefenderRequest');
  const oralHearingRequest = watch('oralHearingRequest');

  const [selectedPublicDefender, setSelectedPublicDefender] = useState<boolean | null>(publicDefenderRequest ?? null);
  const [selectedOralHearing, setSelectedOralHearing] = useState<boolean | null>(oralHearingRequest ?? null);

  const { evidences } = useEvidence(analysisNo);

  // submitted=true인 항목만 폼에 반영
  useEffect(() => {
    const submitted = evidences.filter((e) => e.submitted).map((e) => e.evidenceType);
    if (submitted.length > 0) {
      setValue('evidenceList', submitted);
    }
  }, [evidences, setValue]);

  useEffect(() => {
    setSelectedPublicDefender(publicDefenderRequest ?? null);
  }, [publicDefenderRequest]);

  useEffect(() => {
    setSelectedOralHearing(oralHearingRequest ?? null);
  }, [oralHearingRequest]);

  const handlePublicDefenderSelect = (val: boolean) => {
    setSelectedPublicDefender(val);
    setValue('publicDefenderRequest', val, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleOralHearingSelect = (val: boolean) => {
    setSelectedOralHearing(val);
    setValue('oralHearingRequest', val, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

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
          국선대리인
          <br />
          선임 신청 여부
        </td>
        <td colSpan={3} className="border border-black p-2 px-3">
          <div className="flex gap-8 mb-1">
            <button
              type="button"
              onClick={() => handlePublicDefenderSelect(true)}
              className="flex items-center gap-1 cursor-pointer text-left hover:bg-gray-50 rounded px-0.5 -mx-0.5 transition-colors"
            >
              <span className="w-5 text-center">[{selectedPublicDefender === true ? 'V' : ' '}]</span> 여
            </button>
            <button
              type="button"
              onClick={() => handlePublicDefenderSelect(false)}
              className="flex items-center gap-1 cursor-pointer text-left hover:bg-gray-50 rounded px-0.5 -mx-0.5 transition-colors"
            >
              <span className="w-5 text-center">[{selectedPublicDefender === false ? 'V' : ' '}]</span> 부
            </button>
          </div>
          <div className="text-[11px] leading-tight text-gray-700 tracking-tight">
            ※ 국선대리인 선임을 신청하는 경우에는 「행정심판법 시행규칙」 별지 제27호의2서식에 따른
            국선대리인 선임 신청서를 별도로 첨부하시기 바랍니다.
          </div>
        </td>
      </tr>

      {/* Row 19: 구술심리 */}
      <tr>
        <td className="border border-black p-2 text-center text-sm leading-tight">
          구술심리 신청
          <br />
          여부
        </td>
        <td colSpan={3} className="border border-black p-2 px-3">
          <div className="flex gap-8 mb-1">
            <button
              type="button"
              onClick={() => handleOralHearingSelect(true)}
              className="flex items-center gap-1 cursor-pointer text-left hover:bg-gray-50 rounded px-0.5 -mx-0.5 transition-colors"
            >
              <span className="w-5 text-center">[{selectedOralHearing === true ? 'V' : ' '}]</span> 여
            </button>
            <button
              type="button"
              onClick={() => handleOralHearingSelect(false)}
              className="flex items-center gap-1 cursor-pointer text-left hover:bg-gray-50 rounded px-0.5 -mx-0.5 transition-colors"
            >
              <span className="w-5 text-center">[{selectedOralHearing === false ? 'V' : ' '}]</span> 부
            </button>
          </div>
          <div className="text-[11px] leading-tight text-gray-700 tracking-tight">
            ※ 구술심리를 신청하는 경우에는 「행정심판법 시행규칙」 별지 제39호서식에 따른 구술심리
            신청서를 별도로 첨부하시기 바랍니다.
          </div>
        </td>
      </tr>
    </>
  );
}
