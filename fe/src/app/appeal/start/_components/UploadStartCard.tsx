'use client';

import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, FileText, FileUp, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ACCEPTED_FILE_TYPES = '.pdf,.jpg,.jpeg,.png';

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)}MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))}KB`;
}

export default function UploadStartCard() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleSelectFile(file: File | null) {
    if (!file) {
      return;
    }

    setSelectedFile(file);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleSelectFile(event.target.files?.[0] ?? null);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleSelectFile(event.dataTransfer.files?.[0] ?? null);
  }

  function handleClearFile() {
    setSelectedFile(null);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  function handleStart() {
    router.push('/appeal/analysis');
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={`flex h-full min-h-[360px] flex-col rounded-[28px] border p-8 text-center shadow-[0_10px_28px_rgba(15,15,112,0.06)] transition-colors ${
        isDragging
          ? 'border-first bg-first/5'
          : selectedFile
            ? 'border-solid border-first/25 bg-white'
            : 'border-dashed border-first/25 bg-white'
      }`}
    >
      <div className="flex flex-1 flex-col items-center text-center">
        {selectedFile ? (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-first/10 text-first">
            <CheckCircle2 className="h-8 w-8" />
          </div>
        ) : (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-first text-white">
            <FileUp className="h-8 w-8" />
          </div>
        )}

        <h2 className="mt-5 text-[30px] font-extrabold tracking-[-0.04em] text-slate-900">
          {selectedFile ? '업로드 완료' : '처분서 업로드'}
        </h2>

          <p className="mt-4 min-h-[96px] max-w-[520px] break-keep text-[16px] leading-8 text-slate-500">
            {selectedFile
              ? '파일을 확인했어요. 아래 정보로 분석을 시작할 수 있습니다.'
              : '파일을 끌어다 놓거나 버튼을 눌러 처분서를 올려주세요.'}
          </p>

          <p className="mt-3 min-h-10 text-[14px] font-medium text-slate-400">
            {selectedFile ? '업로드한 파일을 확인해 주세요' : 'PDF, JPEG, PNG (최대 20MB)'}
          </p>

        <div className="mt-6 flex min-h-[48px] items-center justify-center">
          {!selectedFile ? (
            <Button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                inputRef.current?.click();
              }}
              className="rounded-2xl bg-first hover:bg-first/90"
            >
              <Upload className="mr-2 h-4 w-4" />
              파일 선택
            </Button>
          ) : null}
        </div>

        <div className="mt-4 flex min-h-[72px] w-full items-start justify-center">
          {selectedFile ? (
            <div className="w-full max-w-[360px] rounded-[20px] border border-first/15 bg-white px-5 py-4 text-left shadow-[0_8px_18px_rgba(15,15,112,0.04)]">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-first">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-slate-900">
                    {selectedFile.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleClearFile();
                  }}
                  className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  aria-label="업로드 파일 삭제"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm font-medium text-first/70">선택된 파일이 없습니다</p>
          )}
        </div>

        {!selectedFile ? <div className="h-[48px]" /> : null}
      </div>

      {selectedFile ? (
        <div className="pt-4">
          <Button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleStart();
            }}
            className="w-full justify-center rounded-2xl"
          >
            분석 시작하기
          </Button>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
