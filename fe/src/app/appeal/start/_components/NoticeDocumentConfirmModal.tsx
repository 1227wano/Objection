'use client';

import { AlertTriangle, BadgeCheck } from 'lucide-react';
import ModalFrame from '@/components/ui/ModalFrame';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NoticeDocumentConfirmModalProps {
  fileName: string;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

interface GuidePanelProps {
  title: string;
  description: string;
  tone: 'warning' | 'success';
}

function PreNoticePreview() {
  return (
    <div className="relative h-[560px] overflow-hidden rounded-3xl border border-rose-200 bg-white shadow-[0_18px_40px_rgba(15,15,112,0.10)]">
      <div className="flex h-[210px] flex-col border-b border-slate-200 px-8 py-7">
        <div className="flex items-start justify-between gap-4 text-[11px] text-slate-400">
          <div className="h-2 w-16 rounded-full bg-slate-200" />
          <div className="h-2 w-10 rounded-full bg-slate-100" />
        </div>

        <div className="mt-8 flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-[34px] font-black tracking-[0.28em] text-slate-900">
            행정처분 사전통지서
          </p>
          <p className="mt-4 min-h-[40px] text-sm font-semibold text-rose-500">
            제목에 &apos;사전&apos;이 포함되면 최종 처분 전 단계일 가능성이 큽니다
          </p>
        </div>
      </div>

      <div className="space-y-0 px-8 pb-10 pt-6">
        <div className="grid grid-cols-[132px_1fr] border-x border-t border-slate-200">
          <div className="border-r border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-700">
            예정 처분 제목
          </div>
          <div className="px-4 py-4">
            <div className="h-3 w-[82%] rounded-full bg-slate-200" />
          </div>
        </div>
        <div className="grid grid-cols-[132px_1fr] border-x border-t border-slate-200">
          <div className="border-r border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-700">
            당사자
          </div>
          <div className="space-y-3 px-4 py-4">
            <div className="grid grid-cols-[110px_1fr] gap-3">
              <div className="h-3 rounded-full bg-slate-200" />
              <div className="h-3 rounded-full bg-slate-100" />
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100" />
          </div>
        </div>
        <div className="grid grid-cols-[132px_1fr] border border-slate-200">
          <div className="border-r border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-700">
            처분의 원인이 되는 사실
          </div>
          <div className="space-y-3 px-4 py-4">
            <div className="h-3 w-full rounded-full bg-slate-200" />
            <div className="h-3 w-[92%] rounded-full bg-slate-200" />
            <div className="h-3 w-[68%] rounded-full bg-slate-100" />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.92)_52%,#ffffff_100%)]" />
    </div>
  );
}

function DispositionPreview() {
  return (
    <div className="relative h-[560px] overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-[0_18px_40px_rgba(15,15,112,0.10)]">
      <div className="flex h-[210px] flex-col border-b border-slate-200 px-8 py-7">
        <div className="flex items-start justify-between gap-4 text-[11px] text-slate-400">
          <div className="h-2 w-16 rounded-full bg-slate-200" />
          <div className="h-2 w-12 rounded-full bg-slate-100" />
        </div>

        <div className="mt-8 flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-[34px] font-black tracking-[0.24em] text-slate-900">행정처분명령서</p>
          <p className="mt-4 min-h-[40px] text-sm font-semibold text-emerald-600">
            제목에 &apos;사전&apos;이 없고 처분 내용과 기간이 적혀 있으면 최종 처분서일 수 있습니다
          </p>
        </div>
      </div>

      <div className="space-y-0 px-8 pb-10 pt-6">
        <div className="grid grid-cols-[110px_1fr] border-x border-t border-slate-200">
          <div className="border-r border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-700">
            업소명
          </div>
          <div className="px-4 py-4">
            <div className="h-3 w-[72%] rounded-full bg-slate-200" />
          </div>
        </div>
        <div className="grid grid-cols-[110px_1fr] border-x border-t border-slate-200">
          <div className="border-r border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-700">
            위반사항
          </div>
          <div className="space-y-3 px-4 py-4">
            <div className="h-3 w-[88%] rounded-full bg-slate-200" />
            <div className="h-3 w-full rounded-full bg-slate-200" />
          </div>
        </div>
        <div className="grid grid-cols-[110px_1fr] border border-slate-200">
          <div className="border-r border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-700">
            처분내용
          </div>
          <div className="space-y-3 px-4 py-4">
            <div className="h-3 w-36 rounded-full bg-slate-200" />
            <div className="h-3 w-[76%] rounded-full bg-slate-100" />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.92)_52%,#ffffff_100%)]" />
    </div>
  );
}

function GuidePanel({ title, description, tone }: GuidePanelProps) {
  const isWarning = tone === 'warning';

  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-3xl border p-6 md:p-7',
        isWarning
          ? 'border-rose-200 bg-[linear-gradient(180deg,#fffafb_0%,#fff5f6_100%)]'
          : 'border-emerald-200 bg-[linear-gradient(180deg,#f8fffc_0%,#f2fbf7_100%)]',
      )}
    >
      <div className="flex min-h-[80px] items-start gap-3 text-left">
        <div
          className={cn(
            'mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
            isWarning ? 'bg-rose-100 text-rose-500' : 'bg-emerald-100 text-emerald-600',
          )}
        >
          {isWarning ? <AlertTriangle className="h-5 w-5" /> : <BadgeCheck className="h-5 w-5" />}
        </div>
        <div className="flex min-h-[80px] flex-1 flex-col">
          <h3 className="text-[24px] font-extrabold tracking-[-0.03em] text-slate-900">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>

      <div className="mt-2 flex-1">{isWarning ? <PreNoticePreview /> : <DispositionPreview />}</div>
    </div>
  );
}

export default function NoticeDocumentConfirmModal({
  fileName,
  onClose,
  onConfirm,
  isSubmitting = false,
}: NoticeDocumentConfirmModalProps) {
  const includesPreNotice = fileName.includes('사전');

  return (
    <ModalFrame onClose={onClose} maxWidth="max-w-7xl">
      <div className="overflow-hidden rounded-3xl bg-[linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)]">
        <div className="border-b border-slate-100 px-8 py-7 md:px-12 md:py-7">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mt-5 text-[32px] font-extrabold tracking-[-0.02em] text-slate-900 md:text-[38px]">
              문서 제목에 &apos;사전&apos;이 있는지 먼저 확인해 주세요
            </h2>
            <p className="mt-4 break-keep text-[17px] leading-8 text-slate-500">
              가장 중요한 구분은 문서 제목입니다. &apos;사전&apos;이 있으면 사전통지서, 없으면 최종
              처분서일 가능성이 큽니다.
            </p>

            <div
              className={cn(
                'mt-4 rounded-2xl border px-5 py-4 text-left',
                includesPreNotice
                  ? 'border-amber-200 bg-amber-50 text-amber-900'
                  : 'border-slate-200 bg-slate-50 text-slate-700',
              )}
            >
              <p className="text-xs font-semibold tracking-[0.14em] text-slate-400">
                업로드한 파일
              </p>
              <p className="mt-2 break-all text-[16px] font-semibold">{fileName}</p>
              <p className="mt-2 text-sm leading-6">
                {includesPreNotice
                  ? "파일명에 '사전'이 포함되어 있어요. 사전통지서인지 먼저 확인해 주세요."
                  : "파일명에 '사전'이 보이지 않아요. 최종 처분서라면 그대로 분석을 시작하시면 됩니다."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 px-8 py-6 md:grid-cols-2 md:px-12 md:py-7">
          <GuidePanel
            tone="warning"
            title="처분 사전통지서"
            description="제목에 '사전'이 보이면 최종 처분 전 단계일 가능성이 큽니다."
          />
          <GuidePanel
            tone="success"
            title="행정처분명령서"
            description="제목에 '사전'이 없으면 최종 처분서일 가능성이 큽니다."
          />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-white/80 px-8 py-6 md:flex-row md:justify-end md:px-12">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-2xl px-7"
            disabled={isSubmitting}
          >
            다시 확인할게요
          </Button>
          <Button
            onClick={onConfirm}
            className="rounded-2xl px-7 shadow-[0_10px_24px_rgba(15,15,112,0.18)]"
            disabled={isSubmitting}
          >
            {isSubmitting ? '업로드 중...' : '확인했습니다'}
          </Button>
        </div>
      </div>
    </ModalFrame>
  );
}
