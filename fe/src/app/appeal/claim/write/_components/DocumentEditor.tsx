'use client';

import { useState } from 'react';
import { DocumentData, RepresentativeType, CommitteeType } from '../_types/document';

interface Props {
  data: DocumentData;
}

function EditableInput({
  value,
  onChange,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`bg-transparent w-full outline-none focus:ring-1 focus:ring-blue-400 px-1 py-0.5 ${className}`}
    />
  );
}

function EditableTextarea({
  id,
  value,
  onChange,
  rows = 4,
  className = '',
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className={`w-full bg-transparent outline-none focus:ring-1 focus:ring-blue-400 p-1 resize-y leading-relaxed ${className}`}
    />
  );
}

const KO_ALPHA = ['가', '나', '다', '라', '마'];

export default function DocumentEditor({ data }: Props) {
  const [caseNo, setCaseNo] = useState(data.caseNo);
  const [caseTitle, setCaseTitle] = useState(data.caseTitle);
  
  const [claimantName, setClaimantName] = useState(data.claimant.name);
  const [claimantAddress, setClaimantAddress] = useState(data.claimant.address);
  const [claimantResidentNo, setClaimantResidentNo] = useState(data.claimant.residentNo);
  const [claimantPhone, setClaimantPhone] = useState(data.claimant.phone);

  const [repType, setRepType] = useState<RepresentativeType>(data.representative.type);
  const [repName, setRepName] = useState(data.representative.name);
  const [repAddress, setRepAddress] = useState(data.representative.address);
  const [repResidentNo, setRepResidentNo] = useState(data.representative.residentNo);
  const [repPhone, setRepPhone] = useState(data.representative.phone);

  const [respondent, setRespondent] = useState(data.respondent);

  const [appealCommitteeType, setAppealCommitteeType] = useState<CommitteeType>(data.appealCommitteeType);
  const [appealCommittee, setAppealCommittee] = useState(data.appealCommittee);

  const [dispositionContent, setDispositionContent] = useState(data.dispositionContent);
  const [dispositionKnownDate, setDispositionKnownDate] = useState(data.dispositionKnownDate);

  const [claimPurpose, setClaimPurpose] = useState(data.claimPurpose);
  const [background, setBackground] = useState(data.claimReason.background);
  const [args, setArgs] = useState(data.claimReason.arguments);

  const [grievanceNotified, setGrievanceNotified] = useState<boolean>(data.grievanceNotified);
  const [grievanceContent, setGrievanceContent] = useState(data.grievanceContent);

  const [evidenceList, setEvidenceList] = useState(data.evidenceList);
  
  const [publicDefenderRequest, setPublicDefenderRequest] = useState<boolean>(data.publicDefenderRequest);
  const [oralHearingRequest, setOralHearingRequest] = useState<boolean>(data.oralHearingRequest);

  const updateArgContent = (idx: number, content: string) => {
    setArgs((prev) => prev.map((a, i) => (i === idx ? { ...a, content } : a)));
  };

  const updateEvidence = (idx: number, value: string) => {
    setEvidenceList((prev) => prev.map((e, i) => (i === idx ? value : e)));
  };

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

          {/* Row 2-5: 청구인 */}
          <tr>
            <td rowSpan={4} className="border border-black p-2 text-center text-lg tracking-widest">
              청구인
            </td>
            <td className="border border-black p-2 px-3">성명</td>
            <td colSpan={2} className="border border-black p-1.5 px-3">
              <EditableInput value={claimantName} onChange={setClaimantName} />
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 px-3">주소</td>
            <td colSpan={2} className="border border-black p-1.5 px-3">
              <EditableInput value={claimantAddress} onChange={setClaimantAddress} />
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 px-3 text-xs leading-tight">
              주민등록번호<br/>(외국인등록번호)
            </td>
            <td colSpan={2} className="border border-black p-1.5 px-3">
              <EditableInput value={claimantResidentNo} onChange={setClaimantResidentNo} />
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 px-3">전화번호</td>
            <td colSpan={2} className="border border-black p-1.5 px-3">
              <EditableInput value={claimantPhone} onChange={setClaimantPhone} />
            </td>
          </tr>

          {/* Row 6-9: 대리인 */}
          <tr>
            <td rowSpan={4} className="border border-black p-2 pt-3 align-top">
              <div className="flex flex-col gap-1 mb-2 text-xs">
                <label className="flex items-center gap-1 cursor-pointer">
                  <span className="w-5 text-center">[{repType === '대표자' ? 'V' : ' '}]</span> 대표자
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <span className="w-5 text-center">[{repType === '관리인' ? 'V' : ' '}]</span> 관리인
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <span className="w-5 text-center">[{repType === '선정대표자' ? 'V' : ' '}]</span> 선정대표자
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <span className="w-5 text-center">[{repType === '대리인' ? 'V' : ' '}]</span> 대리인
                </label>
              </div>
              <div className="text-[10px] leading-tight break-keep text-gray-700 mt-2">
                ※ 해당사항이 있는 경우 하나의 [ ]만 작성합니다.
              </div>
            </td>
            <td className="border border-black p-2 px-3">성명</td>
            <td colSpan={2} className="border border-black p-1.5 px-3">
              <EditableInput value={repName} onChange={setRepName} />
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 px-3">주소</td>
            <td colSpan={2} className="border border-black p-1.5 px-3">
              <EditableInput value={repAddress} onChange={setRepAddress} />
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 px-3 text-xs leading-tight">
              주민등록번호<br/>(외국인등록번호)
            </td>
            <td colSpan={2} className="border border-black p-1.5 px-3">
              <EditableInput value={repResidentNo} onChange={setRepResidentNo} />
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 px-3">전화번호</td>
            <td colSpan={2} className="border border-black p-1.5 px-3">
              <EditableInput value={repPhone} onChange={setRepPhone} />
            </td>
          </tr>

          {/* Row 10: 피청구인 */}
          <tr>
            <td className="border border-black p-2 text-center text-base tracking-widest">
              피청구인
            </td>
            <td colSpan={3} className="border border-black p-1.5 px-3">
              <EditableInput value={respondent} onChange={setRespondent} />
            </td>
          </tr>

          {/* Row 11: 소관 행정심판위원회 */}
          <tr>
            <td className="border border-black p-2 text-center text-sm leading-tight">
              소관<br/>행정심판위원회
            </td>
            <td colSpan={3} className="border border-black p-2 px-3">
              <div className="flex flex-wrap gap-x-6 gap-y-2 items-center w-full">
                <label className="flex items-center gap-1 cursor-pointer whitespace-nowrap">
                  <span>[{appealCommitteeType === '중앙' ? 'V' : ' '}]</span> 중앙행정심판위원회
                </label>
                <label className="flex items-center gap-1 cursor-pointer whitespace-nowrap">
                  <span>[{appealCommitteeType === '시도' ? 'V' : ' '}]</span> OO시·도행정심판위원회
                </label>
                <label className="flex items-center gap-1 cursor-pointer whitespace-nowrap">
                  <span>[{appealCommitteeType === '기타' ? 'V' : ' '}]</span> 기타
                </label>
              </div>
              {appealCommitteeType !== '중앙' && (
                <div className="mt-2 text-sm text-gray-500">
                  선택된 위원회: <span className="text-black font-semibold">{appealCommittee}</span>
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
              <EditableTextarea value={dispositionContent} onChange={setDispositionContent} rows={2} />
            </td>
          </tr>

          {/* Row 13: 안 날 */}
          <tr>
            <td className="border border-black p-2 text-center text-sm leading-tight">
              처분이 있음을<br/>안 날
            </td>
            <td colSpan={3} className="border border-black p-1.5 px-3">
              <EditableInput value={dispositionKnownDate} onChange={setDispositionKnownDate} />
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
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <span>[{grievanceNotified === false ? 'V' : ' '}]</span> 무
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
              <EditableTextarea value={grievanceContent} onChange={setGrievanceContent} rows={2} />
            </td>
          </tr>

          {/* Row 17: 증거 서류 */}
          <tr>
            <td className="border border-black p-2 text-center text-sm">증거 서류</td>
            <td colSpan={3} className="border border-black p-1.5 px-3">
              <div className="flex flex-col gap-1 py-1">
                {evidenceList.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="w-4 shrink-0">{idx + 1}.</span>
                    <EditableInput value={item} onChange={(v) => updateEvidence(idx, v)} />
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
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                   <span>[{publicDefenderRequest === false ? 'V' : ' '}]</span> 부
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
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                   <span>[{oralHearingRequest === false ? 'V' : ' '}]</span> 부
                </label>
              </div>
              <div className="text-[11px] leading-tight text-gray-700 tracking-tight">
                ※ 구술심리를 신청하는 경우에는 「행정심판법 시행규칙」 별지 제39호서식에 따른 구술심리 신청서를 별도로 첨부하시기 바랍니다.
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footer Text */}
      <div className="mt-4 mb-8 text-sm">
        <p className="indent-4 mb-8 tracking-tighter">
          「행정심판법」 제28조 및 같은 법 시행령 제20조에 따라 위와 같이 행정심판을 청구합니다.
        </p>
        {/* Date and Signature grouped on the right side */}
        <div className="flex flex-col items-end gap-6 mr-[15%]">
          {data.filingDate && data.filingDate.split('.').length >= 3 ? (
            <p className="tracking-widest">
              {data.filingDate.split('.')[0].trim()} 년{' '}
              {data.filingDate.split('.')[1].trim().padStart(2, ' ')} 월{' '}
              {data.filingDate.split('.')[2].trim().padStart(2, ' ')} 일
            </p>
          ) : (
             <p className="tracking-widest">년 월 일</p>
          )}
          <p className="text-base">
            <span className="tracking-widest mr-4">청구인</span>
            <span className="inline-block border-b border-black w-32 text-center pb-0.5 relative top-1">
              {claimantName}
            </span>
            <span className="ml-2 text-sm tracking-tighter text-gray-600">(서명 또는 인)</span>
          </p>
        </div>
        <p className="text-2xl font-bold mt-10 tracking-widest ml-[10%]">
          {appealCommittee} 귀중
        </p>
      </div>

      {/* Attachment info table */}
      <table className="w-full border-collapse border border-black mb-16 text-xs">
        <colgroup>
          <col className="w-[20%]" />
          <col className="w-[60%]" />
          <col className="w-[20%]" />
        </colgroup>
        <tbody>
          <tr>
            <td className="border border-black p-2 text-center font-semibold text-sm">첨부서류</td>
            <td className="border border-black p-2 leading-tight">
              1. 대표자, 관리인, 선정대표자 또는 대리인의 자격을 소명하는 서류(대표자, 관리인, 선정대표자 또는 대리인을 선임하는 경우에만 제출합니다)<br/>
              2. 주장을 뒷받침하는 증거서류나 증거물
            </td>
            <td className="border border-black p-2 text-center font-semibold text-sm">수수료<br/>없음</td>
          </tr>
        </tbody>
      </table>

      {/* 별지 Area */}
      <div className="mt-20 border-t border-dashed border-gray-400 pt-16 px-4">
        <h2 className="text-2xl font-bold text-center mb-10 tracking-widest">[별지] 청구 취지 및 청구 이유</h2>
        
        <div className="mb-10 text-sm">
          <h3 className="font-bold text-lg mb-4">1. 청구취지</h3>
          <EditableTextarea value={claimPurpose} onChange={setClaimPurpose} rows={3} />
        </div>

        <div className="mb-8 text-sm">
          <h3 className="font-bold text-lg mb-6">2. 청구원인 (이유)</h3>

          <div className="mb-6 pl-2">
            <h4 className="font-bold text-base mb-3">가. 처분의 경위</h4>
            <EditableTextarea value={background} onChange={setBackground} rows={4} />
          </div>

          <div className="pl-2">
            <h4 className="font-bold text-base mb-4">나. 이 사건 처분의 위법·부당성</h4>
            <div className="flex flex-col gap-6 pl-4">
              {args.map((arg, idx) => (
                <div key={idx}>
                  <p className="font-bold text-sm mb-2">
                    {idx + 1}.{' '}
                    {arg.highlightType === 'keyword' ? (
                      <span className="text-blue-600 font-semibold underline underline-offset-4">
                        {arg.title}
                      </span>
                    ) : (
                      arg.title
                    )}
                  </p>
                  {arg.highlightType === 'block' ? (
                    <div className="bg-yellow-100/60 px-3 py-2 rounded">
                      <EditableTextarea
                        id={`arg-${arg.relatedIssueType}`}
                        value={arg.content}
                        onChange={(v) => updateArgContent(idx, v)}
                        rows={4}
                        className="bg-transparent border-0 focus:border-0 focus:ring-0"
                      />
                    </div>
                  ) : (
                    <EditableTextarea
                      id={`arg-${arg.relatedIssueType}`}
                      value={arg.content}
                      onChange={(v) => updateArgContent(idx, v)}
                      rows={4}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
