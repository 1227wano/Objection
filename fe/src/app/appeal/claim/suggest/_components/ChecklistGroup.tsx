'use client';

import { useState } from 'react';
import ChecklistItem from './ChecklistItem';
import { EvidenceItem } from '../../report/types';

interface ChecklistGroupProps {
  items: EvidenceItem[];
}

export default function ChecklistGroup({ items }: ChecklistGroupProps) {
  const [checkedIds, setCheckedIds] = useState<Set<number>>(() => {
    // submitted가 true인 항목을 초기 체크 상태로 설정
    const initialChecked = new Set<number>();
    items.forEach((item) => {
      if (item.submitted) initialChecked.add(item.evidenceId);
    });
    return initialChecked;
  });

  const toggle = (id: number) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5 mb-2">
        <h2 className="text-lg font-bold text-gray-900">준비해야 할 입증 서류 체크리스트</h2>
        <p className="text-sm text-gray-500">
          원활한 심판 진행을 위해 아래 서류들을 확인해 주세요.
          <br />
          준비 완료된 서류를 체크해 주세요.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <ChecklistItem
            key={item.evidenceId}
            title={item.evidenceType}
            checked={checkedIds.has(item.evidenceId)}
            checkedAt={item.checkedAt}
            onToggle={() => toggle(item.evidenceId)}
          />
        ))}
      </div>
    </div>
  );
}
