'use client';

import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { EditableInput } from '@/app/appeal/_components/FormInputs';
import { DocumentData, RepresentativeType } from '../_types/document';

const REP_TYPES: RepresentativeType[] = ['대표자', '관리인', '선정대표자', '대리인'];

export default function RepresentativeSection() {
  const { watch, setValue } = useFormContext<DocumentData>();
  const repType = watch('representative.type');
  const [selected, setSelected] = useState<RepresentativeType>(repType ?? null);

  // 폼 값이 외부에서 바뀌면 로컬 상태도 동기화
  useEffect(() => {
    setSelected(repType ?? null);
  }, [repType]);

  const handleSelect = (type: RepresentativeType) => {
    const newValue = selected === type ? null : type;
    setSelected(newValue);
    setValue('representative.type', newValue, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <>
      <tr>
        <td rowSpan={4} className="border border-black p-2 pt-3 align-top">
          <div className="flex flex-col gap-1 mb-2 text-xs">
            {REP_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleSelect(type)}
                className="flex items-center gap-1 cursor-pointer text-left hover:bg-gray-50 rounded px-0.5 -mx-0.5 transition-colors"
              >
                <span className="w-5 text-center">[{selected === type ? 'V' : ' '}]</span> {type}
              </button>
            ))}
          </div>
          <div className="text-[10px] leading-tight break-keep text-gray-700 mt-2">
            ※ 해당사항이 있는 경우 하나의 [ ]만 작성합니다.
          </div>
        </td>
        <td className="border border-black p-2 px-3">성명</td>
        <td colSpan={2} className="border border-black p-1.5 px-3">
          <EditableInput name="representative.name" />
        </td>
      </tr>
      <tr>
        <td className="border border-black p-2 px-3">주소</td>
        <td colSpan={2} className="border border-black p-1.5 px-3">
          <EditableInput name="representative.address" />
        </td>
      </tr>
      <tr>
        <td className="border border-black p-2 px-3 text-xs leading-tight">
          주민등록번호
          <br />
          (외국인등록번호)
        </td>
        <td colSpan={2} className="border border-black p-1.5 px-3">
          <EditableInput name="representative.residentNo" />
        </td>
      </tr>
      <tr>
        <td className="border border-black p-2 px-3">전화번호</td>
        <td colSpan={2} className="border border-black p-1.5 px-3">
          <EditableInput name="representative.phone" />
        </td>
      </tr>
    </>
  );
}
