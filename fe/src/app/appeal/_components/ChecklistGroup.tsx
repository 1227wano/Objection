'use client';

import { useState } from 'react';
import ChecklistItem from './ChecklistItem';
import { EvidenceItem } from '@/app/appeal/claim/report/types';

interface ChecklistGroupProps {
  items: EvidenceItem[];
  onChange?: (selectedIds: number[]) => void; // 추가된 속성
  hideHeader?: boolean;
}

export default function ChecklistGroup({ items, onChange, hideHeader = false }: ChecklistGroupProps) {
  const [checkedIds, setCheckedIds] = useState<Set<number>>(() => {
    const initialChecked = new Set<number>();
    items.forEach((item) => {
      if (item.submitted) initialChecked.add(item.evidenceId);
    });
    return initialChecked;
  });

  const toggle = (id: number) => {
    // 1. 기존 상태를 바탕으로 새로운 Set을 만듭니다.
    const next = new Set(checkedIds);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    // 2. ChecklistGroup 내부의 상태를 업데이트합니다.
    setCheckedIds(next);

    // 3. 상태 업데이트 함수(setState) 밖에서 부모의 onChange를 호출합니다.
    if (onChange) {
      onChange(Array.from(next));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {!hideHeader && (
        <div className="flex flex-col gap-1.5 mb-2">
          <h2 className="text-lg font-bold text-gray-900">준비해야 할 입증 서류 체크리스트</h2>
          <p className="text-sm text-gray-500">
            원활한 심판 진행을 위해 아래 서류들을 확인해 주세요.
            <br />
            준비 완료된 서류를 체크해 주세요.
          </p>
        </div>
      )}
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <ChecklistItem
            key={item.evidenceId}
            title={item.evidenceType}
            checked={checkedIds.has(item.evidenceId)}
            onToggle={() => toggle(item.evidenceId)}
          />
        ))}
      </div>
    </div>
  );
}
