'use client';

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type MouseEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, FileText, FileUp, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NoticeDocumentConfirmModal from './NoticeDocumentConfirmModal';
import OcrLoadingScreen from '@/app/appeal/_components/OcrLoadingScreen';

const ACCEPTED_FILE_TYPES = '.pdf,.jpg,.jpeg,.png';

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)}MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))}KB`;
}

function getSourceType(file: File) {
  return file.type.startsWith('image/') ? 'IMAGE' : 'FILE';
}

function persistGovDocNo(caseNo: string, documentType: string, govDocNo: string) {
  const key = `govDocNo_${caseNo}_${documentType}`;
  window.sessionStorage.setItem(key, govDocNo);
  window.localStorage.setItem(key, govDocNo);
}

function resolveCaseNo(searchCaseNo: string | null) {
  return searchCaseNo;
}

interface SelectedFileSummaryProps {
  fileName: string;
  fileSizeLabel: string;
  onClear: (event: MouseEvent<HTMLButtonElement>) => void;
}

interface UploadNoticeDocumentResponse {
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message: string;
  data?: {
    govDocNo?: number;
    documentType?: string;
  } | null;
}

function SelectedFileSummary({ fileName, fileSizeLabel, onClear }: SelectedFileSummaryProps) {
  return (
    <div className="mt-2 flex w-full justify-center">
      <div className="w-full max-w-[360px] rounded-2xl border border-first/15 bg-white px-5 py-4 text-left shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-first">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-slate-900">{fileName}</p>
            <p className="mt-1 text-sm text-slate-400">{fileSizeLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="업로드 파일 제거"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UploadStartCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cardStep, setCardStep] = useState<'idle' | 'selected' | 'uploading'>('idle');
  const isCompleted = !!selectedFile;
  const caseNoFromQuery = searchParams.get('caseNo');

  useEffect(() => {
    // caseNo is now purely from URL search params; no localStorage persist needed
  }, [caseNoFromQuery]);

  function handleSelectFile(file: File | null) {
    if (!file || isUploading) {
      return;
    }

    setSelectedFile(file);
    setCardStep('selected');
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
    if (isUploading) {
      return;
    }

    setSelectedFile(null);
    setCardStep('idle');

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  async function handleConfirmUpload() {
    if (!selectedFile || isUploading) {
      return;
    }

    const caseNo = resolveCaseNo(caseNoFromQuery);
    if (!caseNo) {
      alert('사건 번호를 찾지 못했습니다. 새 케이스를 먼저 생성한 뒤 다시 시도해 주세요.');
      return;
    }

    setIsUploading(true);
    setCardStep('uploading');

    try {
      const formData = new FormData();
      formData.append('documentType', 'NOTICE');
      formData.append('sourceType', getSourceType(selectedFile));
      formData.append('file', selectedFile);

      const response = await fetch(`/api/cases/${caseNo}/gov-documents`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const result = (await response.json().catch(() => null)) as UploadNoticeDocumentResponse | null;

      if (!response.ok) {
        throw new Error(result?.message || '처분서 업로드에 실패했습니다. 다시 시도해 주세요.');
      }

      if (result?.data?.govDocNo) {
        const nextGovDocNo = String(result.data.govDocNo);
        persistGovDocNo(caseNo, 'NOTICE', nextGovDocNo);
      }

      router.push(`/appeal/${caseNo}/analysis`);
    } catch (error) {
      setCardStep('selected');
      alert(error instanceof Error ? error.message : '처분서 업로드 중 문제가 발생했습니다.');
    } finally {
      setIsUploading(false);
      setIsConfirmModalOpen(false);
    }
  }

  if (cardStep === 'uploading') {
    return (
      <div className="flex h-[460px] flex-col rounded-3xl border border-first/12 bg-white items-center justify-center shadow-[0_10px_28px_rgba(15,15,112,0.06)]">
        <OcrLoadingScreen />
      </div>
    );
  }

  return (
    <div
      role={isCompleted ? undefined : 'button'}
      tabIndex={isCompleted ? undefined : 0}
      onClick={() => {
        if (!isCompleted && !isUploading) {
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        if (isCompleted || isUploading) {
          return;
        }

        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => {
        if (!isCompleted && !isUploading) {
          setIsDragging(false);
        }
      }}
      onDrop={(event) => {
        if (isCompleted || isUploading) {
          return;
        }

        handleDrop(event);
      }}
      onKeyDown={(event) => {
        if (isCompleted || isUploading) {
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={`flex h-[460px] flex-col rounded-3xl px-10 ${
        isCompleted ? 'py-12' : 'py-16'
      } text-center shadow-[0_10px_28px_rgba(15,15,112,0.06)] transition-colors ${
        isDragging
          ? 'border border-first bg-first/5'
          : isCompleted
            ? 'border border-first/12 bg-white'
            : 'border border-dashed border-first/25 bg-white'
      }`}
    >
      <div
        className={`flex h-full flex-1 flex-col items-center text-center ${isCompleted ? 'justify-center pb-1 pt-4' : ''}`}
      >
        <div
          className={`mx-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] ${
            isCompleted ? 'bg-first/8 text-first' : 'bg-first text-white'
          }`}
        >
          {isCompleted ? <CheckCircle2 className="h-8 w-8" /> : <FileUp className="h-8 w-8" />}
        </div>

        <h2
          className={`${isCompleted ? 'mt-3' : 'mt-5'} min-h-[44px] text-[30px] font-extrabold tracking-[-0.04em] text-slate-900`}
        >
          {isCompleted ? '업로드 완료' : '처분서 업로드'}
        </h2>

        <p
          className={`${isCompleted ? 'mt-2' : 'mt-4'} min-h-[48px] max-w-[520px] whitespace-pre-line break-keep text-[16px] leading-8 text-slate-500`}
        >
          {isCompleted
            ? '업로드한 파일을 확인하고 바로 다음 단계로 진행할 수 있어요.'
            : '파일을 드래그하거나 버튼을 눌러 처분서를 업로드해 주세요.'}
        </p>

        {isCompleted && selectedFile ? (
          <SelectedFileSummary
            fileName={selectedFile.name}
            fileSizeLabel={formatFileSize(selectedFile.size)}
            onClear={(event) => {
              event.stopPropagation();
              handleClearFile();
            }}
          />
        ) : (
          <p className="mt-0 min-h-[24px] text-[14px] font-medium text-slate-400">
            PDF, JPEG, PNG (최대 20MB)
          </p>
        )}

        <div
          className={`${isCompleted ? 'mt-4' : 'mt-6'} flex min-h-[48px] items-center justify-center`}
        >
          {!isCompleted ? (
            <Button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                inputRef.current?.click();
              }}
              className="rounded-2xl bg-first hover:bg-first/90"
              disabled={isUploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              파일 선택
            </Button>
          ) : (
            <Button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsConfirmModalOpen(true);
              }}
              className="rounded-2xl bg-first hover:bg-first/90"
              disabled={isUploading}
            >
              분석 시작하기
            </Button>
          )}
        </div>

        {!isCompleted ? (
          <p className="mt-4 min-h-[28px] text-sm font-medium text-first/70">선택한 파일이 없습니다</p>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        className="hidden"
        onChange={handleInputChange}
      />

      {isConfirmModalOpen && selectedFile ? (
        <NoticeDocumentConfirmModal
          fileName={selectedFile.name}
          onClose={() => {
            if (!isUploading) {
              setIsConfirmModalOpen(false);
            }
          }}
          onConfirm={() => {
            void handleConfirmUpload();
          }}
          isSubmitting={isUploading}
        />
      ) : null}
    </div>
  );
}
