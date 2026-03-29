'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SupplementDocumentData } from '../../write/_types/document';

interface CopyFieldProps {
  label: string;
  value: string;
  rows?: number;
}

function CopyField({ label, value, rows = 5 }: CopyFieldProps) {
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
        <Button size="m" variant="outline" onClick={handleCopy}>
          {copied ? '복사됨!' : '복사하기'}
        </Button>
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
  data: SupplementDocumentData;
}

export default function SupplementPortalCopyTab({ data }: Props) {
  const contentText = data.submissionContent
    .map((s) => `${s.title}\n${s.content}`)
    .join('\n\n');

  const attachmentsText = data.attachments
    .map((att, idx) => `${idx + 1}. ${att}`)
    .join('\n');

  return (
    <div className="flex flex-col gap-6 w-full">
      <CopyField label="사건명" value={data.caseName} rows={2} />
      <CopyField label="제출 내용" value={contentText} rows={10} />
      <CopyField label="첨부서류" value={attachmentsText} rows={4} />

      <div className="flex justify-center pt-2">
        <a href="#" onClick={(e) => e.preventDefault()}>
          <Button variant="outline">온라인 행정심판 포털 이동하기</Button>
        </a>
      </div>
    </div>
  );
}
