'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DocumentData } from '../../write/_types/document';

const KO_ALPHA = ['가', '나', '다', '라', '마'];

interface CopyFieldProps {
  label: string;
  value: string;
  showCount?: boolean;
  rows?: number;
}

function CopyField({ label, value, showCount, rows = 5 }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-sm text-gray-700">{label}</label>
        <div className="flex items-center gap-2">
          {showCount && (
            <span className="text-xs text-gray-400">
              {value.length.toLocaleString()}/4000
            </span>
          )}
          <Button size="m" variant="outline" onClick={handleCopy}>
            {copied ? '복사됨!' : '복사하기'}
          </Button>
        </div>
      </div>
      <textarea
        readOnly
        value={value}
        rows={rows}
        className="w-full border border-gray-200 rounded-lg p-3 text-sm bg-gray-50 text-gray-700 resize-none leading-relaxed"
      />
    </div>
  );
}

interface Props {
  data: DocumentData;
}

export default function PortalCopyTab({ data }: Props) {
  const dispositionSummary = `피청구인은 ${data.dispositionDate} 청구인에 대하여 ${data.caseTitle}의 처분을 하였습니다. 청구인은 ${data.dispositionKnownDate} 해당 처분을 통지받았습니다.`;

  const claimReasonText = [
    `1. 처분의 경위`,
    data.claimReason.background,
    ``,
    `2. 이 사건 처분의 부당성`,
    ...data.claimReason.arguments.map(
      (a, i) => `${KO_ALPHA[i]}. ${a.title}\n${a.content}`,
    ),
  ].join('\n');

  return (
    <div className="flex flex-col gap-6 w-full">
      <CopyField label="처분내용 요약" value={dispositionSummary} rows={3} />
      <CopyField label="청구취지" value={data.claimPurpose} rows={4} />
      <CopyField label="청구원인" value={claimReasonText} showCount rows={8} />

      <div className="flex justify-center pt-2">
        <a href="#" onClick={(e) => e.preventDefault()}>
          <Button variant="outline">온라인 행정심판 포털 이동하기</Button>
        </a>
      </div>
    </div>
  );
}
