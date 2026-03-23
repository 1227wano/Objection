'use client';

import { useFormContext } from 'react-hook-form';
import { EditableTextarea } from './FormInputs';
import { DocumentData } from '../_types/document';

export default function ClaimReasonSection() {
  const { watch } = useFormContext<DocumentData>();
  const args = watch('claimReason.arguments') || [];

  return (
    <div className="mt-20 border-t border-dashed border-gray-400 pt-16 px-4">
      <h2 className="text-2xl font-bold text-center mb-10 tracking-widest">[별지] 청구 취지 및 청구 이유</h2>
      
      <div className="mb-10 text-sm">
        <h3 className="font-bold text-lg mb-4">1. 청구취지</h3>
        <EditableTextarea name="claimPurpose" rows={3} />
      </div>

      <div className="mb-8 text-sm">
        <h3 className="font-bold text-lg mb-6">2. 청구원인 (이유)</h3>

        <div className="mb-6 pl-2">
          <h4 className="font-bold text-base mb-3">가. 처분의 경위</h4>
          <EditableTextarea name="claimReason.background" rows={4} />
        </div>

        <div className="pl-2">
          <h4 className="font-bold text-base mb-4">나. 이 사건 처분의 위법·부당성</h4>
          <div className="flex flex-col gap-6 pl-4">
            {args.map((arg, idx) => (
              <div key={idx}>
                <p className="font-bold text-sm mb-2">
                  {idx + 1}. {arg.title}
                </p>
                <EditableTextarea
                  id={`arg-${arg.relatedIssueType}`}
                  name={`claimReason.arguments.${idx}.content`}
                  rows={4}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
