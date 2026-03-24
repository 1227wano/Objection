'use client';

import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ChevronLeft,
  FileStack,
  FileText,
  FileUp,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type EntryType = 'claim' | 'answer' | 'ruling';

type DocumentSlot = {
  id: string;
  label: string;
  required: boolean;
  helperText?: string;
};

const ACCEPTED_FILE_TYPES = '.pdf,.hwp,.doc,.docx';

const PAGE_CONFIG: Record<
  EntryType,
  {
    stageLabel: string;
    title: string;
    submitLabel: string;
    nextHref: string;
    requiredDocuments: DocumentSlot[];
  }
> = {
  claim: {
    stageLabel: '처음부터 시작하기',
    title: '이미 진행 중인 행정심판이신가요?',
    submitLabel: '청구서 작성 계속하기',
    nextHref: '/appeal/claim/incident',
    requiredDocuments: [],
  },
  answer: {
    stageLabel: '답변서 등록부터 시작하기',
    title: '이미 진행 중인 행정심판이신가요?',
    submitLabel: '답변서 분석 진행하기',
    nextHref: '/appeal/answer/report',
    requiredDocuments: [
      { id: 'claim', label: '행정심판 청구서', required: true },
      { id: 'answer', label: '답변서', required: true, helperText: '제출 가이드' },
    ],
  },
  ruling: {
    stageLabel: '재결서 등록부터 시작하기',
    title: '이미 진행 중인 행정심판이신가요?',
    submitLabel: '재결서 분석 진행하기',
    nextHref: '/appeal/ruling/analysis',
    requiredDocuments: [{ id: 'ruling', label: '재결서', required: true }],
  },
};

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)}MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))}KB`;
}

interface UploadSlotCardProps {
  slot: DocumentSlot;
  file: File | null;
  onSelectFile: (slotId: string, file: File | null) => void;
}

function UploadSlotCard({ slot, file, onSelectFile }: UploadSlotCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(fileToSave: File | null) {
    if (!fileToSave) {
      return;
    }

    onSelectFile(slot.id, fileToSave);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0] ?? null);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    handleFile(event.target.files?.[0] ?? null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-slate-900">{slot.label}</h2>
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
              slot.required
                ? 'border border-first/20 bg-first text-white'
                : 'border border-slate-200 bg-slate-50 text-slate-500'
            }`}
          >
            {slot.required ? '필수' : '선택'}
          </span>
        </div>
        {slot.helperText ? (
          <p className="whitespace-pre-line text-sm font-medium text-first/45">{slot.helperText}</p>
        ) : null}
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`rounded-[28px] border-2 p-8 transition-all ${
            file
              ? 'border-first/70 bg-white shadow-[0_14px_30px_rgba(15,15,112,0.10)]'
            : isDragging
              ? 'border-first/45 bg-first/5'
              : 'border-dashed border-[#d9e3f5] bg-[linear-gradient(180deg,#fcfdff_0%,#f8fbff_100%)]'
        }`}
      >
        {file ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4 rounded-[22px] border border-first/18 bg-[#fbfcff] px-4 py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-first/10 text-first">
                <FileText className="h-7 w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[20px] font-bold tracking-[-0.02em] text-slate-900">
                  {file.name}
                </p>
                <p className="mt-1 text-sm text-slate-400">{formatFileSize(file.size)} · 업로드 완료</p>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectFile(slot.id, null);
                  if (inputRef.current) {
                    inputRef.current.value = '';
                  }
                }}
                className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label={`${slot.label} 파일 제거`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[17px] font-semibold text-first">
              <CheckCircle2 className="h-5 w-5" />
              <span>분석 준비가 완료되었습니다.</span>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FileUp className="h-10 w-10" />
            </div>
            <p className="mt-6 text-[26px] font-bold tracking-[-0.03em] text-slate-800">
              파일을 드래그하거나 클릭하여 업로드
            </p>
            <p className="mt-2 text-[16px] text-slate-400">PDF, HWP, DOCX (최대 20MB)</p>
            <Button
              type="button"
              className="mt-6 rounded-2xl bg-first px-6 hover:bg-first/90"
              onClick={(event) => {
                event.stopPropagation();
                inputRef.current?.click();
              }}
            >
              <Upload className="mr-2 h-4 w-4" />
              파일 선택
            </Button>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}

export default function AppealDocumentsPage() {
  const router = useRouter();
  const [entry, setEntry] = useState<EntryType>('claim');
  const page = PAGE_CONFIG[entry];
  const [files, setFiles] = useState<Record<string, File | null>>({});

  const isReady = useMemo(
    () => page.requiredDocuments.every((slot) => files[slot.id]),
    [files, page.requiredDocuments],
  );

  function handleSelectFile(slotId: string, file: File | null) {
    setFiles((current) => ({ ...current, [slotId]: file }));
  }

  function handleChangeEntry(nextEntry: EntryType) {
    setEntry(nextEntry);
    setFiles({});
  }

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#f7f9ff_0%,#ffffff_28%,#f7faff_100%)] px-5 py-10 md:px-8 xl:px-10">
      <div className="mx-auto w-full max-w-[980px]">
        <div className="rounded-[34px] border border-first/10 bg-white px-6 py-8 shadow-[0_18px_56px_rgba(15,15,112,0.07)] md:px-10 md:py-10">
          <div className="text-center">
            <h1 className="text-[34px] font-extrabold tracking-[-0.04em] text-slate-950 md:text-[44px]">
              {page.title}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl whitespace-pre-line break-keep text-[17px] leading-8 text-second">
              진행 중인 단계에 맞는 서류를 먼저 올려주시면, 현재 절차에 맞춰 바로 이어서 도와드릴게요.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-first/8 text-first">
                <FileStack className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-[22px] font-bold tracking-[-0.02em] text-slate-900">
                  어디서부터 시작할까요?
                </h2>
                <p className="mt-1 whitespace-pre-line text-sm text-slate-500">
                  시작 단계를 고르면 아래에 필요한 서류가 자동으로 바뀝니다.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {(Object.keys(PAGE_CONFIG) as EntryType[]).map((option) => {
                const isSelected = entry === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleChangeEntry(option)}
                    className={`min-h-[132px] rounded-[24px] border p-6 text-left transition-all ${
                      isSelected
                        ? 'border-first/35 bg-[linear-gradient(180deg,#eef2ff_0%,#dfe6ff_100%)] shadow-[0_8px_18px_rgba(15,15,112,0.07)]'
                        : 'border-slate-200 bg-white hover:border-first/20 hover:bg-first/3'
                    }`}
                  >
                    <p className="text-[18px] font-bold tracking-[-0.02em] text-slate-900">
                      {PAGE_CONFIG[option].stageLabel}
                    </p>
                    <p className="mt-2 whitespace-pre-line break-keep text-sm leading-6 text-slate-500">
                      {PAGE_CONFIG[option].requiredDocuments.length > 0
                        ? `필수 서류 ${PAGE_CONFIG[option].requiredDocuments.length}건 준비`
                        : '추가 서류 없이 바로 진행 가능'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-10 space-y-10">
            {page.requiredDocuments.length > 0 ? (
              page.requiredDocuments.map((slot) => (
                <UploadSlotCard
                  key={slot.id}
                  slot={slot}
                  file={files[slot.id] ?? null}
                  onSelectFile={handleSelectFile}
                />
              ))
            ) : (
              <div className="rounded-[28px] border border-first/12 bg-[linear-gradient(180deg,#fbfcff_0%,#f5f8ff_100%)] p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-first/10 text-first">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-[22px] font-bold tracking-[-0.02em] text-slate-900">
                      추가 필수 서류 없이 바로 진행할 수 있어요
                    </p>
                    <p className="mt-3 whitespace-pre-line break-keep text-[15px] leading-7 text-slate-500">
                      설문에서 입력한 내용을 바탕으로 사건 경위 작성 단계로 이동합니다. 별도 업로드
                      없이 바로 다음 단계로 넘어갈 수 있어요.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Button
              type="button"
              variant="ghost"
              className="justify-start px-0 text-slate-500 hover:bg-transparent hover:text-slate-900"
              asChild
            >
              <Link href="/appeal/survey">
                <ChevronLeft className="mr-1 h-4 w-4" />
                이전 단계
              </Link>
            </Button>

            <div className="flex flex-col items-end gap-4">
              <p className="text-sm text-slate-400">
                {isReady
                  ? '모든 필수 서류가 준비되었습니다. 이제 다음 단계로 진행할 수 있어요.'
                  : '필수 서류를 모두 업로드해야 다음 단계로 넘어갈 수 있어요.'}
              </p>
              <Button
                type="button"
                disabled={!isReady}
                onClick={() => router.push(page.nextHref)}
                className="h-14 rounded-[20px] px-9 text-base font-semibold shadow-[0_14px_32px_rgba(15,15,112,0.14)]"
              >
                {page.submitLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
