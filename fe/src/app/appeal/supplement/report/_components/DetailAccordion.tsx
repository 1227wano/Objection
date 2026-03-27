'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MainPoint } from '../types';
import MainPointCard from '@/app/appeal/_components/MainPointCard';

interface DetailAccordionProps {
  mainPoints?: MainPoint[];
}

export default function DetailAccordion({ mainPoints }: DetailAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors focus:outline-none"
      >
        <span className="font-semibold text-gray-900 text-base">핵심 쟁점 상세 보기</span>
        <div className="p-1.5 bg-gray-50 rounded-full text-gray-500">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 border-t border-gray-100 bg-gray-50/50">
          {mainPoints && mainPoints.length > 0 && (
            <MainPointCard points={mainPoints} title="핵심 쟁점" />
          )}
        </div>
      )}
    </div>
  );
}
