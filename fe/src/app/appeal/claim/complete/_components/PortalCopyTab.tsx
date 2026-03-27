'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

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
            <span className="text-xs text-gray-400">{value.length.toLocaleString()}/4000</span>
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

interface PortalCopyTabProps {
  dispositionContent: string;
  claimPurpose: string;
  claimReason: string;
}

export default function PortalCopyTab({
  dispositionContent,
  claimPurpose,
  claimReason,
}: PortalCopyTabProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <CopyField label="처분내용" value={dispositionContent} rows={3} />
      <CopyField label="청구취지" value={claimPurpose} rows={4} />
      <CopyField label="청구원인" value={claimReason} showCount rows={8} />

      <div className="flex justify-center pt-2">
        <a
          href="https://simpan.go.kr/com/zz/999/main.do?cmnMenuCd=main"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline">온라인 행정심판 포털 이동하기</Button>
        </a>
      </div>
    </div>
  );
}
