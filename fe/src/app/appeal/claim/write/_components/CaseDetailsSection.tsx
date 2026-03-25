'use client';

import { useFormContext } from 'react-hook-form';
import { EditableInput, EditableTextarea } from '@/app/appeal/_components/FormInputs';
import { DocumentData } from '../_types/document';

export default function CaseDetailsSection() {
  const { watch, setValue } = useFormContext<DocumentData>();
  const appealCommitteeType = watch('appealCommitteeType');
  const appealCommittee = watch('appealCommittee');
  const grievanceNotified = watch('grievanceNotified');

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
              <label key={type} className="flex items-center gap-1 cursor-pointer whitespace-nowrap">
                <span>[{appealCommitteeType === type ? 'V' : ' '}]</span>{' '}
                {type === '중앙' ? '중앙행정심판위원회' : type === '시도' ? 'OO시·도행정심판위원회' : '기타'}
                <input 
                  type="radio" 
                  name="appealCommitteeType"
                  value={type}
                  checked={appealCommitteeType === type}
                  onChange={() => setValue('appealCommitteeType', type)}
                  className="hidden"
                />
              </label>
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
            <label className="flex items-center gap-1 cursor-pointer">
              <span>[{grievanceNotified === true ? 'V' : ' '}]</span> 유
              <input type="radio" checked={grievanceNotified === true} onChange={() => setValue('grievanceNotified', true)} className="hidden" />
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <span>[{grievanceNotified === false ? 'V' : ' '}]</span> 무
              <input type="radio" checked={grievanceNotified === false} onChange={() => setValue('grievanceNotified', false)} className="hidden" />
            </label>
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
