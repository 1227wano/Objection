'use client';

import { useState, useEffect } from 'react';
import ChecklistItem from './ChecklistItem';
import { Evidence } from '@/app/appeal/[caseNo]/claim/suggest/_types/evidence';


interface ChecklistGroupProps {
  items: Evidence[]; // 공통 Evidence 타입으로 변경
  onChange?: (selectedIds: number[]) => void;
  hideHeader?: boolean;
  disabled?: boolean; // 읽기 전용 처리를 위한 속성 추가
}

export default function ChecklistGroup({
  items,
  onChange,
  hideHeader = false,
  disabled = false,
}: ChecklistGroupProps) {
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());

  // API에서 데이터를 받아오거나 items 배열이 변경될 때 상태를 동기화
  useEffect(() => {
    const initialChecked = new Set<number>();
    items.forEach((item) => {
      if (item.submitted) initialChecked.add(item.evidenceId);
    });

    setCheckedIds(initialChecked);

    if (onChange) {
      onChange(Array.from(initialChecked));
    }
  }, [items, onChange]);

  const toggle = (id: number) => {
    if (disabled) return; // 비활성화 상태이면 클릭 무시

    const next = new Set(checkedIds);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    setCheckedIds(next);

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
            // ChecklistItem 컴포넌트 내부에 disabled 처리 로직이 있다면 아래 주석을 해제하여 사용합니다.
            // disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
