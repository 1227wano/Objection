'use client';

import { useRef, useState } from 'react';
import { FileText, X, UploadCloud } from 'lucide-react';

interface UploadFormProps {
  onFileSelect: (file: File) => void | Promise<void>;
  onFileRemove?: () => void;
  selectedFile?: File | null;
  acceptedTypes?: string;
}

export default function UploadForm({
  onFileSelect,
  onFileRemove,
  selectedFile,
  acceptedTypes = '.pdf, .jpg, .png',
}: UploadFormProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentFile = selectedFile !== undefined ? selectedFile : null;
  const currentFileName = currentFile ? currentFile.name : fileName;
  const currentFileSizeMB = currentFile ? (currentFile.size / (1024 * 1024)).toFixed(2) : null;

  // 파일이 드롭존 위로 올라왔을 때
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isUploading) setIsDragging(true);
  };

  // 파일이 드롭존 밖으로 나갔을 때
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // 파일 형식(확장자, MIME 타입) 유효성 검사 함수
  const isValidFile = (file: File) => {
    if (acceptedTypes === '*/*') return true;
    const types = acceptedTypes.split(',').map((t) => t.trim().toLowerCase());
    return types.some((type) => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type);
      } else if (type.endsWith('/*')) {
        const baseMimeType = type.replace('/*', '');
        return file.type.startsWith(baseMimeType);
      }
      return file.type === type;
    });
  };

  // 파일을 드롭했을 때
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files.length > 1) {
        alert('단일 파일만 업로드 가능합니다.');
        e.dataTransfer.clearData();
        return;
      }

      const file = e.dataTransfer.files[0];

      if (!isValidFile(file)) {
        alert(`지원하지 않는 파일 형식입니다.\n지원 형식: ${acceptedTypes}`);
        e.dataTransfer.clearData();
        return;
      }

      setFileName(file.name);
      setIsUploading(true);
      try {
        await onFileSelect(file);
      } finally {
        setIsUploading(false);
      }
      e.dataTransfer.clearData();
    }
  };

  // 클릭해서 파일 탐색기에서 파일을 선택했을 때
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!isValidFile(file)) {
        alert(`지원하지 않는 파일 형식입니다.\n지원 형식: ${acceptedTypes}`);
        e.target.value = ''; // input 초기화
        return;
      }

      setFileName(file.name);
      setIsUploading(true);
      try {
        await onFileSelect(file);
      } finally {
        setIsUploading(false);
      }
      // 동일한 파일 재업로드 가능하도록 input 초기화
      e.target.value = '';
    }
  };

  // 드롭존 클릭 시 숨겨진 input을 대신 클릭하도록 처리
  const handleClick = () => {
    if (!isUploading && !currentFileName) {
      inputRef.current?.click();
    }
  };

  return (
    <div
      className={`relative flex h-80 w-full flex-col items-center justify-center px-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
        isDragging
          ? 'border-gray-400 bg-gray-50'
          : 'border-gray-300 bg-transparent hover:bg-gray-50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      {/* 실제 동작하지만 화면에는 보이지 않는 input */}
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        accept={acceptedTypes}
        className="hidden"
      />

      {/* 화면에 보여지는 UI */}
      <div className="w-full h-full flex flex-col items-center justify-center text-center pointer-events-none">
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-24 h-24 mb-5">
              <span className="block text-6xl">⏳</span>
            </div>
            <p className="font-semibold text-2xl text-blue-600">파일 검증중...</p>
            <p className="text-lg mt-3 text-gray-500">잠시만 기다려주세요.</p>
          </div>
        ) : currentFileName ? (
          <div className="pointer-events-auto flex flex-col items-center justify-center">
            {/* 연한 보라색 파일 아이콘 */}
            <FileText className="w-16 h-16 text-purple-300 mb-5" strokeWidth={1.5} />
            
            {/* 파일명 및 용량 */}
            <p className="text-lg font-semibold text-gray-800 px-6 truncate max-w-[320px] md:max-w-lg">{currentFileName}</p>
            <p className="text-base text-gray-400 mt-2">{currentFileSizeMB ? `${currentFileSizeMB} MB` : ''}</p>
            
            {/* 삭제 버튼 - 흐름과 무관하게 우측 상단으로 이동 */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onFileRemove) onFileRemove();
                setFileName(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
              파일 삭제
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <UploadCloud className="w-10 h-10 text-gray-500" strokeWidth={1.5} />
            </div>
            
            <p className="text-xl font-medium text-gray-700">여기로 파일을 드래그 하거나, 클릭해서 업로드해주세요</p>
            <p className="text-lg mt-3 text-gray-400">지원 형식: {acceptedTypes === '*/*' ? '모든 파일' : acceptedTypes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
