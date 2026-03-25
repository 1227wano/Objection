'use client';

import { useState, useEffect } from 'react';

import { useFormContext } from 'react-hook-form';
import { EditableInput, EditableTextarea } from '@/app/appeal/_components/FormInputs';
import { DocumentData } from '../_types/document';

export default function CaseDetailsSection() {
  const { watch, setValue } = useFormContext<DocumentData>();
  const appealCommitteeType = watch('appealCommitteeType');
  const appealCommittee = watch('appealCommittee');
  const grievanceNotified = watch('grievanceNotified');

  const [selectedCommitteeType, setSelectedCommitteeType] = useState<'중앙' | '시도' | '기타' | null>(appealCommitteeType ?? null);
  const [selectedGrievance, setSelectedGrievance] = useState<boolean | null>(grievanceNotified ?? null);

  useEffect(() => {
    setSelectedCommitteeType(appealCommitteeType ?? null);
  }, [appealCommitteeType]);

  useEffect(() => {
    setSelectedGrievance(grievanceNotified ?? null);
  }, [grievanceNotified]);

  const handleCommitteeTypeSelect = (type: '중앙' | '시도' | '기타') => {
    setSelectedCommitteeType(type);
    setValue('appealCommitteeType', type, { shouldDirty: true, shouldValidate: true });
  };

  const handleGrievanceSelect = (val: boolean) => {
    setSelectedGrievance(val);
    setValue('grievanceNotified', val, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <>
      {/* Row 10: 피청구인 */}
      <tr>
        <td className="border border-black p-2 text-center text-base tracking-widest">
          피청구인
        </td>
        <td colSpan={3} className="border border-black p-1.5 px-3">
          <EditableInput name="respondent" />
        </td>
      </tr>

      {/* Row 11: 소관 행정심판위원회 */}
      <tr>
        <td className="border border-black p-2 text-center text-sm leading-tight">
          소관<br/>행정심판위원회
        </td>
        <td colSpan={3} className="border border-black p-2 px-3">
          <div className="flex flex-wrap gap-x-6 gap-y-2 items-center w-full">
            {(['중앙', '시도', '기타'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleCommitteeTypeSelect(type)}
                className="flex items-center gap-1 cursor-pointer text-left hover:bg-gray-50 rounded px-0.5 -mx-0.5 transition-colors whitespace-nowrap"
              >
                <span className="w-5 text-center">[{selectedCommitteeType === type ? 'V' : ' '}]</span>{' '}
                {type === '중앙' ? '중앙행정심판위원회' : type === '시도' ? 'OO시·도행정심판위원회' : '기타'}
              </button>
            ))}
          </div>
          {appealCommitteeType !== '중앙' && (
            <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
              선택된 위원회:{' '}
              <span className="text-black font-semibold">{appealCommittee}</span>
            </div>
          )}
        </td>
      </tr>

      {/* Row 12: 처분 내용 */}
      <tr>
        <td className="border border-black p-2 text-center text-sm leading-tight">
          처분 내용 또는<br/>부작위 내용
        </td>
        <td colSpan={3} className="border border-black p-1.5 px-3">
          <EditableTextarea name="dispositionContent" rows={2} />
        </td>
      </tr>

      {/* Row 13: 안 날 */}
      <tr>
        <td className="border border-black p-2 text-center text-sm leading-tight">
          처분이 있음을<br/>안 날
        </td>
        <td colSpan={3} className="border border-black p-1.5 px-3">
          <EditableInput name="dispositionKnownDate" />
        </td>
      </tr>

      {/* Row 14: 청구 취지 및 이유 */}
      <tr>
        <td className="border border-black p-2 text-center text-sm leading-tight">
          청구 취지 및<br/>청구 이유
        </td>
        <td colSpan={3} className="border border-black p-4 text-center text-base tracking-widest">
          별지로 작성
        </td>
      </tr>

      {/* Row 15: 고지 유무 */}
      <tr>
        <td className="border border-black p-2 text-center text-sm leading-tight">
          처분청의<br/>불복절차 고지 유무
        </td>
        <td colSpan={3} className="border border-black p-2 px-3">
          <div className="flex gap-8">
            <button
              type="button"
              onClick={() => handleGrievanceSelect(true)}
              className="flex items-center gap-1 cursor-pointer text-left hover:bg-gray-50 rounded px-0.5 -mx-0.5 transition-colors"
            >
              <span className="w-5 text-center">[{selectedGrievance === true ? 'V' : ' '}]</span> 유
            </button>
            <button
              type="button"
              onClick={() => handleGrievanceSelect(false)}
              className="flex items-center gap-1 cursor-pointer text-left hover:bg-gray-50 rounded px-0.5 -mx-0.5 transition-colors"
            >
              <span className="w-5 text-center">[{selectedGrievance === false ? 'V' : ' '}]</span> 무
            </button>
          </div>
        </td>
      </tr>

      {/* Row 16: 고지 내용 */}
      <tr>
        <td className="border border-black p-2 text-center text-sm leading-tight">
          처분청의<br/>불복절차 고지 내용
        </td>
        <td colSpan={3} className="border border-black p-1.5 px-3">
          <EditableTextarea name="grievanceContent" rows={2} />
        </td>
      </tr>
    </>
  );
}
