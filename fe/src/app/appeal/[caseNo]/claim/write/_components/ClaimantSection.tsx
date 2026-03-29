'use client';

import { EditableInput } from '@/app/appeal/_components/FormInputs';

export default function ClaimantSection() {
  return (
    <>
      <tr>
        <td rowSpan={4} className="border border-black p-2 text-center text-lg tracking-widest">
          청구인
        </td>
        <td className="border border-black p-2 px-3">성명</td>
        <td colSpan={2} className="border border-black p-1.5 px-3">
          <EditableInput name="claimant.name" />
        </td>
      </tr>
      <tr>
        <td className="border border-black p-2 px-3">주소</td>
        <td colSpan={2} className="border border-black p-1.5 px-3">
          <EditableInput name="claimant.address" />
        </td>
      </tr>
      <tr>
        <td className="border border-black p-2 px-3 text-xs leading-tight">
          주민등록번호<br/>(외국인등록번호)
        </td>
        <td colSpan={2} className="border border-black p-1.5 px-3">
          <EditableInput name="claimant.residentNo" />
        </td>
      </tr>
      <tr>
        <td className="border border-black p-2 px-3">전화번호</td>
        <td colSpan={2} className="border border-black p-1.5 px-3">
          <EditableInput name="claimant.phone" />
        </td>
      </tr>
    </>
  );
}
