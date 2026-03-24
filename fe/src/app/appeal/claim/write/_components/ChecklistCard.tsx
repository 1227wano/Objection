'use client';

import { useState } from 'react';

const DEFAULT_CHECKLIST_ITEMS = [
  {
    id: 'party-info',
    label: '당사자 정보 일치',
    description: '청구인의 이름, 주소, 연락처가 정확한가요?',
    defaultChecked: true,
  },
  {
    id: 'respondent-date',
    label: '처분청 및 날짜',
    description: '피청구인(관공서)과 처분 일자가 통지서와 똑같이 맞나요?',
    defaultChecked: false,
  },
  {
    id: 'typo-blank',
    label: '오타 및 여백',
    description: '서명란이나 빈칸이 남아있지 않은지 확인해 주세요.',
    defaultChecked: false,
  },
];

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}

interface ChecklistCardProps {
  title?: string;
  items?: ChecklistItem[];
}

export default function ChecklistCard({
  title = '청구서 제출 전 필수 확인',
  items = DEFAULT_CHECKLIST_ITEMS,
}: ChecklistCardProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(items.map((item) => [item.id, item.defaultChecked])),
  );

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="font-bold text-sm text-gray-900 mb-4">{title}</h3>
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={checked[item.id]}
              onChange={() => toggle(item.id)}
              className="mt-0.5 accent-first w-4 h-4 shrink-0 cursor-pointer"
            />
            <div>
              <p
                className={`text-sm font-semibold transition-colors ${
                  checked[item.id] ? 'line-through text-gray-400' : 'text-gray-800'
                }`}
              >
                {item.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
