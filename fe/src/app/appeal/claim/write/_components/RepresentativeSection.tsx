'use client';

import { useFormContext } from 'react-hook-form';
import { EditableInput } from '@/app/appeal/_components/FormInputs';

export default function RepresentativeSection() {
  const { watch, setValue } = useFormContext();
  const repType = watch('representative.type');

  return (
    <>
      <tr>
        <td rowSpan={4} className="border border-black p-2 pt-3 align-top">
          <div className="flex flex-col gap-1 mb-2 text-xs">
            {['대표자', '관리인', '선정대표자', '대리인'].map((type) => (
              <label key={type} className="flex items-center gap-1 cursor-pointer">
                <span className="w-5 text-center">[{repType === type ? 'V' : ' '}]</span> {type}
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={repType === type}
                  onChange={() => setValue('representative.type', repType === type ? null : type)}
                />
              </label>
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
          주민등록번호<br/>(외국인등록번호)
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
