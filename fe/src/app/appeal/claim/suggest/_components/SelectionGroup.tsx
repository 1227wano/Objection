'use client';

import { useState } from 'react';
import { AppealType, APPEAL_TYPE_MAP } from '../../report/types';
import SelectionCard from './SelectionCard';

interface SelectionGroupProps {
  recommended: AppealType;
  onSelect?: (type: AppealType) => void;
}

const SELECTION_OPTIONS: { type: AppealType; description: string }[] = [
  {
    type: 'INVALID',
    description:
      '행정처분의 효력이 처음부터 발생하지 않았음을 확인받는 절차입니다. 중대하고 명백한 하자가 있는 경우에 해당합니다.',
  },
  {
    type: 'CANCEL',
    description:
      '부당한 행정처분의 취소 또는 변경을 구하는 절차입니다. 행정심판 중 가장 일반적인 형태로, 처분의 위법성이나 부당성을 다툴 때 주로 활용됩니다.',
  },
];

export default function SelectionGroup({ recommended, onSelect }: SelectionGroupProps) {
  const [selected, setSelected] = useState<AppealType>(recommended);

  const handleSelect = (type: AppealType) => {
    setSelected(type);
    onSelect?.(type);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {SELECTION_OPTIONS.map((opt) => (
        <SelectionCard
          key={opt.type}
          label={APPEAL_TYPE_MAP[opt.type]}
          description={opt.description}
          isSelected={selected === opt.type}
          isRecommended={opt.type === recommended}
          onSelect={() => handleSelect(opt.type)}
        />
      ))}
    </div>
  );
}
