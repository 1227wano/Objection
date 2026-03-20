'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Reason, Evidence } from '../types';

interface DetailAccordionProps {
  reasons: Reason[];
  evidences: Evidence[];
}

export default function DetailAccordion({ reasons, evidences }: DetailAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors focus:outline-none"
      >
        <span className="font-semibold text-gray-900 text-base">
          AI 사안 및 법리 검토 상세 보기
        </span>
        <div className="p-1.5 bg-gray-50 rounded-full text-gray-500">
          {isOpen ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 border-t border-gray-100 flex flex-col gap-8 bg-gray-50/50">
          
          {/* 법리 검토 (Reasons) */}
          {reasons && reasons.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-gray-900 text-[15px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                법리 검토
              </h3>
              <div className="flex flex-col gap-4">
                {reasons.map((reason, idx) => (
                  <div key={idx} className="bg-white border border-gray-100 p-5 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col gap-3.5">
                    <h4 className="font-bold text-blue-700 text-[15px]">{reason.title}</h4>
                    
                    <div className="flex flex-col gap-1.5 text-[15px]">
                      <span className="font-semibold text-gray-900">원인 (Cause)</span>
                      <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-50">{reason.cause}</p>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 text-[15px]">
                      <span className="font-semibold text-gray-900">의견 (Opinion)</span>
                      <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-50">{reason.opinion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 필요 증거 (Evidences) */}
          {evidences && evidences.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-gray-900 text-[15px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                관련 증거
              </h3>
              <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <ul className="list-none space-y-3">
                  {evidences.map((evidence, idx) => (
                    <li key={idx} className="flex gap-3 text-[15px] text-gray-700 relative">
                      <span className="text-blue-500 font-bold shrink-0">{idx + 1}.</span>
                      <span className="leading-relaxed">{evidence.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
        </div>
      )}
    </div>
  );
}
