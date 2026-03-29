'use client';

import { useFormContext } from 'react-hook-form';
import { EditableInput, EditableTextarea } from '@/app/appeal/_components/FormInputs';
import { DocumentData } from '../_types/document';

export default function CaseDetailsSection() {
  const { watch, setValue, getValues } = useFormContext<DocumentData>();
  const appealCommitteeType = watch('appealCommitteeType');
  const grievanceNotified = watch('grievanceNotified');

  const handleCommitteeTypeSelect = (type: '중앙' | '시도' | '기타') => {
    setValue('appealCommitteeType', type, { shouldDirty: true, shouldValidate: true });

    const currentVal = getValues('appealCommittee') || '';

    if (type === '중앙') {
      setValue('appealCommittee', '중앙행정심판위원회');
    } else if (type === '시도') {
      // 기존 값이 비어있거나, 중앙이거나, 기타였다면 시도 기본값으로 변경
      if (currentVal.includes('중앙') || currentVal === '기타' || currentVal.trim() === '') {
        setValue('appealCommittee', 'OO시·도행정심판위원회');
      }
    } else if (type === '기타') {
      // 기타를 선택했을 때 이전 값이 기본값들이었다면 텍스트를 비워줌
      if (currentVal.includes('중앙') || currentVal.includes('OO시·도') || currentVal.trim() === '') {
        setValue('appealCommittee', '');
      }
    }
  };

  const handleGrievanceSelect = (val: boolean) => {
    setValue('grievanceNotified', val, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <>
      {/* Row 10: 피청구인 */}
      <tr>
        <td className="border border-black p-2 text-center text-base tracking-widest">피청구인</td>
        <td colSpan={3} className="border border-black p-1.5 px-3">
          <EditableInput name="respondent" placeholder="예: OOO구청장, OOO경찰서장 등" />
        </td>
      </tr>

      {/* Row 11: 소관 행정심판위원회 (수정된 부분) */}
      <tr>
        <td className="border border-black p-2 text-center text-sm leading-tight">
          소관
          <br />
          행정심판위원회
        </td>
        <td colSpan={3} className="border border-black p-2 px-3">
          <div className="flex flex-col gap-2 w-full">
            
            {/* 1. 위원회 유형 선택 (체크박스) */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
              <button
                type="button"
                onClick={() => handleCommitteeTypeSelect('중앙')}
                className="flex items-center gap-1 cursor-pointer text-left hover:bg-gray-50 rounded px-0.5 -mx-0.5 transition-colors whitespace-nowrap"
              >
                <span className="w-5 text-center">[{appealCommitteeType === '중앙' ? 'V' : ' '}]</span>{' '}
                중앙행정심판위원회
              </button>
              
              <button
                type="button"
                onClick={() => handleCommitteeTypeSelect('시도')}
                className="flex items-center gap-1 cursor-pointer text-left hover:bg-gray-50 rounded px-0.5 -mx-0.5 transition-colors whitespace-nowrap"
              >
                <span className="w-5 text-center">[{appealCommitteeType === '시도' ? 'V' : ' '}]</span>{' '}
                시·도행정심판위원회
              </button>

              <button
                type="button"
                onClick={() => handleCommitteeTypeSelect('기타')}
                className="flex items-center gap-1 cursor-pointer text-left hover:bg-gray-50 rounded px-0.5 -mx-0.5 transition-colors whitespace-nowrap"
              >
                <span className="w-5 text-center">[{appealCommitteeType === '기타' ? 'V' : ' '}]</span>{' '}
                기타
              </button>
            </div>

            {/* 2. 실제 제출될 위원회명 (텍스트 입력창) */}
            <div className="flex items-center gap-2 mt-1 p-2 bg-blue-50/50 rounded border border-blue-100">
              <span className="text-xs font-bold text-blue-800 shrink-0">선택된 위원회명 :</span>
              <EditableInput 
                name="appealCommittee" 
                placeholder="제출할 위원회 이름을 정확히 입력해주세요 (예: 서울특별시행정심판위원회)" 
                className="flex-1 bg-transparent border-b border-blue-200 px-1 text-sm font-semibold text-gray-900" 
              />
            </div>

          </div>
        </td>
      </tr>

      {/* Row 12: 처분 내용 */}
      <tr>
        <td className="border border-black p-2 text-center text-sm leading-tight">
          처분 내용 또는
          <br />
          부작위 내용
        </td>
        <td colSpan={3} className="border border-black p-1.5 px-3">
          <EditableTextarea name="dispositionContent" rows={2} />
        </td>
      </tr>

      {/* Row 13: 안 날 */}
      <tr>
        <td className="border border-black p-2 text-center text-sm leading-tight">
          처분이 있음을
          <br />안 날
        </td>
        <td colSpan={3} className="border border-black p-1.5 px-3">
          <EditableInput name="dispositionKnownDate" />
        </td>
      </tr>

      {/* Row 14: 청구 취지 및 이유 */}
      <tr>
        <td className="border border-black p-2 text-center text-sm leading-tight">
          청구 취지 및<br />
          청구 이유
        </td>
        <td colSpan={3} className="border border-black p-4 text-center text-base tracking-widest">
          별지로 작성
        </td>
      </tr>

      {/* Row 15: 고지 유무 */}
      <tr>
        <td className="border border-black p-2 text-center text-sm leading-tight">
          처분청의
          <br />
          불복절차 고지 유무
        </td>
        <td colSpan={3} className="border border-black p-2 px-3">
          <div className="flex gap-8">
            <button
              type="button"
              onClick={() => handleGrievanceSelect(true)}
              className="flex items-center gap-1 cursor-pointer text-left hover:bg-gray-50 rounded px-0.5 -mx-0.5 transition-colors"
            >
              <span className="w-5 text-center">[{grievanceNotified === true ? 'V' : ' '}]</span> 유
            </button>
            <button
              type="button"
              onClick={() => handleGrievanceSelect(false)}
              className="flex items-center gap-1 cursor-pointer text-left hover:bg-gray-50 rounded px-0.5 -mx-0.5 transition-colors"
            >
              <span className="w-5 text-center">[{grievanceNotified === false ? 'V' : ' '}]</span>{' '}
              무
            </button>
          </div>
        </td>
      </tr>

      {/* Row 16: 고지 내용 */}
      <tr>
        <td className="border border-black p-2 text-center text-sm leading-tight">
          처분청의
          <br />
          불복절차 고지 내용
        </td>
        <td colSpan={3} className="border border-black p-1.5 px-3">
          <EditableTextarea name="grievanceContent" rows={2} />
        </td>
      </tr>
    </>
  );
}
