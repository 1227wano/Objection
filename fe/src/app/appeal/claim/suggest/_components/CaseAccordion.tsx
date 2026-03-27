'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Scale } from 'lucide-react';
import { RepresentativePrecedent } from '../../report/types';

interface CaseAccordionProps {
  precedent: RepresentativePrecedent;
}

export default function CaseAccordion({ precedent }: CaseAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="shrink-0 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-gray-500" />
          <span className="font-bold text-sm text-gray-900">유사 판례</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="px-5 pb-5 flex flex-col gap-3 border-t border-gray-100 pt-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-400">사건명</span>
            <span className="text-sm font-bold text-gray-900">{precedent.precedentName}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-400">유사 포인트</span>
            <span className="text-sm text-gray-700 leading-relaxed">{precedent.matchReason}</span>
          </div>
        </div>
      )}
    </div>
  );
}
