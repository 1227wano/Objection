'use client';

import { useFormContext } from 'react-hook-form';
import { EditableInput, EditableTextarea } from '@/app/appeal/claim/write/_components/FormInputs';
import { SupplementDocumentData } from '../_types/document';

export default function SupplementEditor() {
  const { watch } = useFormContext<SupplementDocumentData>();

  const filingDate = watch('filingDate') || '';
  const submitterName = watch('submitterName') || '';
  const committee = watch('committee') || '';
  const sections = watch('submissionContent') || [];
  const attachments = watch('attachments') || [];

  const dateParts = filingDate.split('.');
  const hasDate = dateParts.length >= 3;

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-10 md:p-12 max-w-[850px] mx-auto text-black font-medium leading-relaxed">
      {/* 제목 */}
      <h1 className="text-3xl font-bold text-center mb-6 tracking-[0.5em] ml-[0.5em]">
        보 충 서 면
      </h1>

      {/* 접수번호 / 접수일 (회색, 읽기전용) */}
      <table className="w-full border-collapse border border-black text-sm table-fixed">
        <colgroup>
          <col className="w-[25%]" />
          <col className="w-[25%]" />
          <col className="w-[25%]" />
          <col className="w-[25%]" />
        </colgroup>
        <tbody>
          <tr className="bg-gray-300">
            <td className="border border-black p-1.5 text-center font-semibold">접수번호</td>
            <td className="border border-black p-1.5 h-8" />
            <td className="border border-black p-1.5 text-center font-semibold">접수일</td>
            <td className="border border-black p-1.5 h-8" />
          </tr>
        </tbody>
      </table>

      {/* 본문 테이블 */}
      <table className="w-full border-collapse border border-black text-sm mb-4 table-fixed">
        <colgroup>
          <col className="w-[18%]" />
          <col className="w-[15%]" />
          <col className="w-[67%]" />
        </colgroup>
        <tbody>
          {/* 사건명 + 사건번호 */}
          <tr>
            <td className="border border-black p-2 text-center font-semibold">사건명</td>
            <td className="border border-black p-1.5">
              <EditableInput name="caseName" />
            </td>
            <td className="border border-black p-1.5">
              사건번호 : <EditableInput name="caseNo" className="inline-block w-40" />
            </td>
          </tr>

          {/* 청구인 - 성명 + 연락처 */}
          <tr>
            <td rowSpan={2} className="border border-black p-2 text-center font-semibold">
              청구인
            </td>
            <td className="border border-black p-1.5">성명</td>
            <td className="border border-black p-1.5">
              <EditableInput name="claimantName" />
              <span className="ml-4 text-gray-500">(연락처)</span>
              <EditableInput name="claimantPhone" className="inline-block w-36 ml-2" />
            </td>
          </tr>
          {/* 청구인 - 주소 */}
          <tr>
            <td className="border border-black p-1.5">주소</td>
            <td className="border border-black p-1.5">
              <EditableInput name="claimantAddress" />
            </td>
          </tr>

          {/* 피청구인 */}
          <tr>
            <td className="border border-black p-2 text-center font-semibold">피청구인</td>
            <td colSpan={2} className="border border-black p-1.5">
              <EditableInput name="respondent" />
            </td>
          </tr>

          {/* 구분 */}
          <tr>
            <td className="border border-black p-2 text-center font-semibold">구분</td>
            <td colSpan={2} className="border border-black p-1.5">
              <EditableInput name="documentType" />
            </td>
          </tr>

          {/* 제출 내용 */}
          <tr>
            <td className="border border-black p-2 text-center font-semibold align-top">
              제출 내용
            </td>
            <td colSpan={2} className="border border-black p-4">
              <div className="flex flex-col gap-6">
                {sections.map((_, idx) => (
                  <div key={idx}>
                    <p className="font-bold text-sm mb-2">
                      <EditableInput name={`submissionContent.${idx}.title`} />
                    </p>
                    <EditableTextarea name={`submissionContent.${idx}.content`} rows={4} />
                  </div>
                ))}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 법적 근거 문구 */}
      <p className="text-sm indent-4 mb-8 tracking-tighter">
        「행정심판법」 제33조제1항에 따라 위와 같이 보충서면을 제출합니다.
      </p>

      {/* 날짜 + 서명 */}
      <div className="flex flex-col items-end gap-6 mr-[15%] text-sm">
        {hasDate ? (
          <p className="tracking-widest">
            {dateParts[0].trim()} 년 {dateParts[1].trim().padStart(2, ' ')} 월{' '}
            {dateParts[2].trim().padStart(2, ' ')} 일
          </p>
        ) : (
          <p className="tracking-widest">년 월 일</p>
        )}
        <p className="text-base">
          <span className="tracking-widest mr-4">제출인</span>
          <span className="inline-block border-b border-black w-32 text-center pb-0.5 relative top-1">
            {submitterName}
          </span>
          <span className="ml-2 text-sm tracking-tighter text-gray-600">(서명 또는 인)</span>
        </p>
      </div>

      {/* 수신처 */}
      <p className="text-2xl font-bold mt-10 tracking-widest ml-[10%]">{committee} 귀중</p>

      {/* 안내 문구 */}
      <p className="text-xs text-gray-500 mt-10 mb-6">
        ※ 보충서면은 다른 당사자의 수 만큼 부본을 함께 제출하시기 바랍니다.
      </p>

      {/* 첨부서류 */}
      <table className="w-full border-collapse border border-black mb-8 text-xs">
        <colgroup>
          <col className="w-[20%]" />
          <col className="w-[60%]" />
          <col className="w-[20%]" />
        </colgroup>
        <tbody>
          <tr>
            <td className="border border-black p-2 text-center font-semibold text-sm">첨부서류</td>
            <td className="border border-black p-2 leading-tight">
              {attachments.map((att, idx) => (
                <span key={idx}>
                  {idx + 1}. {att}
                  {idx < attachments.length - 1 && <br />}
                </span>
              ))}
            </td>
            <td className="border border-black p-2 text-center font-semibold text-sm">
              수수료
              <br />
              없음
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
