'use client';

import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { DocumentData } from '../_types/document';

interface ChecklistItemConfig {
  id: string;
  label: string;
  description: string;
  /** 폼 값 기반 자동 체크 함수. null이면 수동 전용 항목 */
  autoCheck: ((data: DocumentData) => boolean) | null;
}

const CHECKLIST_ITEMS: ChecklistItemConfig[] = [
  {
    id: 'party-info',
    label: '당사자 정보 일치',
    description: '청구인의 이름, 주소, 연락처가 정확한가요?',
    autoCheck: (data) =>
      !!(
        data.claimant?.name?.trim() &&
        data.claimant?.address?.trim() &&
        data.claimant?.phone?.trim()
      ),
  },
  {
    id: 'respondent-date',
    label: '처분청 및 날짜',
    description: '피청구인(관공서)과 처분 일자가 통지서와 똑같이 맞나요?',
    autoCheck: (data) => !!(data.respondent?.trim() && data.dispositionKnownDate?.trim()),
  },
  {
    id: 'typo-blank',
    label: '오타 및 여백',
    description: '서명란이나 빈칸이 남아있지 않은지 확인해 주세요.',
    autoCheck: null, // 수동 전용
  },
];

interface ChecklistCardProps {
  title?: string;
}

export default function ChecklistCard({ title = '청구서 제출 전 필수 확인' }: ChecklistCardProps) {
  const { watch } = useFormContext<DocumentData>();
  const formValues = watch();

  // 자동 체크 값 계산
  const autoChecked: Record<string, boolean> = {};
  for (const item of CHECKLIST_ITEMS) {
    autoChecked[item.id] = item.autoCheck ? item.autoCheck(formValues) : false;
  }

  // 사용자 수동 오버라이드 상태 (null = 오버라이드 없음, 자동값 사용)
  const [overrides, setOverrides] = useState<Record<string, boolean | null>>(
    Object.fromEntries(CHECKLIST_ITEMS.map((item) => [item.id, null])),
  );

  // 자동 체크값이 바뀌면 오버라이드 리셋 (자동 항목만)
  useEffect(() => {
    setOverrides((prev) => {
      const next = { ...prev };
      for (const item of CHECKLIST_ITEMS) {
        if (item.autoCheck !== null) {
          // 자동값과 오버라이드가 같아지면 오버라이드 해제
          if (next[item.id] === autoChecked[item.id]) {
            next[item.id] = null;
          }
        }
      }
      return next;
    });
  }, [JSON.stringify(autoChecked)]);

  const getChecked = (id: string): boolean => {
    if (overrides[id] !== null && overrides[id] !== undefined) {
      return overrides[id] as boolean;
    }
    return autoChecked[id] ?? false;
  };

  const toggle = (id: string) => {
    const current = getChecked(id);
    setOverrides((prev) => ({ ...prev, [id]: !current }));
  };

  const isAutoItem = (id: string) =>
    CHECKLIST_ITEMS.find((item) => item.id === id)?.autoCheck !== null;

  const isOverridden = (id: string) => overrides[id] !== null && overrides[id] !== undefined;

  const completedCount = CHECKLIST_ITEMS.filter((item) => getChecked(item.id)).length;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm text-gray-900">{title}</h3>
        <span className="text-xs text-gray-400">
          {completedCount}/{CHECKLIST_ITEMS.length}
        </span>
      </div>

      {/* 진행 바 */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${(completedCount / CHECKLIST_ITEMS.length) * 100}%` }}
        />
      </div>

      <div className="flex flex-col gap-4">
        {CHECKLIST_ITEMS.map((item) => {
          const checked = getChecked(item.id);
          const auto = isAutoItem(item.id);
          const overridden = isOverridden(item.id);

          return (
            <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(item.id)}
                className="mt-0.5 accent-first w-4 h-4 shrink-0 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm font-semibold transition-colors ${
                      checked ? 'line-through text-gray-400' : 'text-gray-800'
                    }`}
                  >
                    {item.label}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
